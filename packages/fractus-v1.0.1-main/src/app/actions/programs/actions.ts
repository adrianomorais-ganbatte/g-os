'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { programSchema, type ProgramInput } from '@/lib/validations/program'
import { Database } from '@/types/supabase'

type Program = Database['public']['Tables']['programas']['Row']

/**
 * Busca todos os programas do banco
 */
export async function getPrograms(): Promise<Program[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('programas')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar programas:', error.message)
    return []
  }

  return data || []
}

/**
 * Cria um novo programa com validação Zod
 */
export async function createProgram(formData: ProgramInput) {
  // Valida com Zod
  const validation = programSchema.safeParse(formData)

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('programas')
    .insert({
      nome: validation.data.nome,
      descricao: validation.data.descricao,
      data_inicio: validation.data.dataInicio.toISOString(),
      data_fim: validation.data.dataFim.toISOString(),
      total_inscritos: validation.data.totalInscritos,
      quantidade_vagas: validation.data.quantidadeVagas,
    })
    .select()
    .single()

  if (error) {
    return { error: 'Ocorreu um erro no servidor ao salvar o programa: ' + error.message }
  }

  // Vincular patrocinadores ao programa (N:N)
  if (validation.data.patrocinadorIds && validation.data.patrocinadorIds.length > 0 && data) {
    const links = validation.data.patrocinadorIds.map((patrocinadorId) => ({
      programa_id: data.id,
      patrocinador_id: patrocinadorId,
    }))
    const { error: linkError } = await supabase
      .from('programa_patrocinadores')
      .insert(links)

    if (linkError) {
      console.error('Erro ao vincular patrocinadores:', linkError.message)
    }
  }

  revalidatePath('/dashboard/programas')
  return { success: true, data }
}

/**
 * Deleta um programa
 */
export async function deleteProgram(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('programas').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/programas')
  return { success: true }
}
