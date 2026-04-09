'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { nanoid } from 'nanoid'
import { sessionSchema, type SessionInput } from '@/lib/validations/session'
import { Database } from '@/types/supabase'

type Session = Database['public']['Tables']['sessoes']['Row']
type Attendance = Database['public']['Tables']['presencas']['Insert']

/**
 * Busca sessões de um programa
 */
export async function getSessionsByProgram(programId: string): Promise<Session[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sessoes')
    .select('*')
    .eq('programa_id', programId)
    .order('data', { ascending: false })

  if (error) {
    console.error('Erro ao buscar sessões:', error.message)
    return []
  }

  return data || []
}

/**
 * Cria uma nova sessão com validação Zod
 */
export async function createSession(formData: SessionInput) {
  // Valida com Zod
  const validation = sessionSchema.safeParse(formData)

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors }
  }

  const supabase = await createClient()

  // If NPS is enabled, create a satisfaction instance automatically
  let instanciaSatisfacaoId: string | undefined
  let templateSatisfacaoId: string | undefined

  if (validation.data.comNps && validation.data.templateSatisfacaoId) {
    templateSatisfacaoId = validation.data.templateSatisfacaoId

    // Get template tipo
    const { data: template } = await supabase
      .from('templates')
      .select('tipo')
      .eq('id', templateSatisfacaoId)
      .single()

    const linkId = nanoid(12)
    const { data: instancia, error: instError } = await supabase
      .from('instancias')
      .insert({
        template_id: templateSatisfacaoId,
        programa_id: validation.data.programaId,
        tipo: template?.tipo || 'satisfacao_nps',
        status: 'publicado',
        link_compartilhavel: linkId,
        published_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (instError) {
      console.error('Erro ao criar instância de satisfação:', instError.message)
    } else {
      instanciaSatisfacaoId = instancia.id
    }
  }

  const { data, error } = await supabase
    .from('sessoes')
    .insert({
      nome: validation.data.nome,
      data: validation.data.data.toISOString(),
      tipo: validation.data.tipo,
      programa_id: validation.data.programaId,
      tags_filtro: validation.data.tagsFiltro,
      instancia_satisfacao_id: instanciaSatisfacaoId,
      template_satisfacao_id: templateSatisfacaoId,
    })
    .select()
    .single()

  if (error) {
    return { error: 'Ocorreu um erro ao salvar a sessão: ' + error.message }
  }

  revalidatePath(`/dashboard/programas/${validation.data.programaId}`)
  revalidatePath('/dashboard/templates')

  return { success: true, data }
}

/**
 * Registra presença em massa dos participantes de uma sessão
 */
export async function recordAttendance(attendances: Attendance[]) {
  if (attendances.length === 0) return { success: true }

  const supabase = await createClient()

  const { error } = await supabase
    .from('presencas')
    .upsert(attendances, { onConflict: 'sessao_id,participante_id' })

  if (error) {
    return { error: 'Erro ao registrar presenças: ' + error.message }
  }

  // IMPORTANTE: DISPARAR REVALIDAÇÕES
  revalidatePath('/dashboard/participantes')
  revalidatePath('/dashboard')
  
  return { success: true }
}

/**
 * Busca presença de uma sessão específica
 */
export async function getSessionAttendance(sessionId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('presencas')
    .select('*, participantes(*)')
    .eq('sessao_id', sessionId)

  if (error) {
    console.error('Erro ao buscar lista de presença:', error.message)
    return []
  }

  return data || []
}
