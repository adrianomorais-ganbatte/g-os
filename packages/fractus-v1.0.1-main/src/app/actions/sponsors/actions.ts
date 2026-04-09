'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/supabase'

type Patrocinador = Database['public']['Tables']['patrocinadores']['Row']

/**
 * Busca todos os patrocinadores
 */
export async function getSponsors(): Promise<Patrocinador[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('patrocinadores')
    .select('*')
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar patrocinadores:', error.message)
    return []
  }

  return data || []
}

/**
 * Busca patrocinadores de um programa específico
 */
export async function getSponsorsByProgram(programaId: string): Promise<Patrocinador[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('programa_patrocinadores')
    .select('patrocinador_id, patrocinadores(*)')
    .eq('programa_id', programaId)

  if (error) {
    console.error('Erro ao buscar patrocinadores do programa:', error.message)
    return []
  }

  return (data?.map((d: any) => d.patrocinadores).filter(Boolean) as Patrocinador[]) || []
}

/**
 * Cria um novo patrocinador
 */
export async function createSponsor(input: { nome: string; logo?: string }) {
  if (!input.nome || input.nome.length < 2) {
    return { error: 'Nome deve ter pelo menos 2 caracteres' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('patrocinadores')
    .insert({
      nome: input.nome,
      logo: input.logo,
    })
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao criar patrocinador: ' + error.message }
  }

  revalidatePath('/dashboard/patrocinadores')
  return { success: true, data }
}

/**
 * Atualiza um patrocinador
 */
export async function updateSponsor(id: string, input: { nome?: string; logo?: string }) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('patrocinadores')
    .update({
      nome: input.nome,
      logo: input.logo,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao atualizar patrocinador: ' + error.message }
  }

  revalidatePath('/dashboard/patrocinadores')
  return { success: true, data }
}

/**
 * Deleta um patrocinador
 */
export async function deleteSponsor(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('patrocinadores').delete().eq('id', id)

  if (error) {
    return { error: 'Erro ao deletar patrocinador: ' + error.message }
  }

  revalidatePath('/dashboard/patrocinadores')
  return { success: true }
}
