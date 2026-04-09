'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { participantSchema, type ParticipantInput } from '@/lib/validations/participant'
import { Database } from '@/types/supabase'

type Participant = Database['public']['Tables']['participantes']['Row']

/**
 * Busca participantes de um programa específico
 */
export async function getParticipantsByProgram(programId: string): Promise<Participant[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('participantes')
    .select('*')
    .eq('programa_id', programId)
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar participantes:', error.message)
    return []
  }

  return data || []
}

/**
 * Busca todos os participantes (Geral)
 */
export async function getAllParticipants(): Promise<Participant[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('participantes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar todos os participantes:', error.message)
    return []
  }

  return data || []
}

/**
 * Cria ou vincula um novo participante a um programa
 */
export async function createParticipant(formData: ParticipantInput) {
  // Valida com Zod
  const validation = participantSchema.safeParse(formData)

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('participantes')
    .insert({
      nome: validation.data.nome,
      email: validation.data.email,
      telefone: validation.data.telefone,
      data_nascimento: validation.data.dataNascimento?.toISOString().split('T')[0],
      status: validation.data.status,
      programa_id: validation.data.programaId,
      data_vinculo: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao salvar participante: ' + error.message }
  }

  revalidatePath('/dashboard/participantes')
  revalidatePath(`/dashboard/programas/${validation.data.programaId}`)
  
  return { success: true, data }
}

/**
 * Atualiza o status de um participante
 */
export async function updateParticipantStatus(id: string, status: Participant['status']) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('participantes')
    .update({ status })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/participantes')
  return { success: true }
}
