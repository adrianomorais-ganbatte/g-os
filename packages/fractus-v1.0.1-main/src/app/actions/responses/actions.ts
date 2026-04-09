'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/supabase'

type Resposta = Database['public']['Tables']['respostas']['Row']

/**
 * Busca respostas de uma instância
 */
export async function getResponsesByInstance(instanciaId: string): Promise<Resposta[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('respostas')
    .select('*')
    .eq('instancia_id', instanciaId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar respostas:', error.message)
    return []
  }

  return data || []
}

/**
 * Busca respostas de um participante
 */
export async function getResponsesByParticipant(participanteId: string): Promise<Resposta[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('respostas')
    .select('*')
    .eq('participante_id', participanteId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar respostas:', error.message)
    return []
  }

  return data || []
}

/**
 * Submete uma resposta (formulário público)
 */
export async function submitResponse(input: {
  instanciaId: string
  participanteId: string
  templateId: string
  programaId: string
  respostas: Record<string, string | number | string[]>
  versaoTemplate: number
}) {
  const supabase = await createClient()

  // Check if participant already responded (unless template allows multiple)
  const { data: existingResponse } = await supabase
    .from('respostas')
    .select('id')
    .eq('instancia_id', input.instanciaId)
    .eq('participante_id', input.participanteId)
    .single()

  // Check if template allows multiple responses
  const { data: template } = await supabase
    .from('templates')
    .select('permitir_multiplas_respostas')
    .eq('id', input.templateId)
    .single()

  if (existingResponse && !template?.permitir_multiplas_respostas) {
    return { error: 'Você já respondeu este formulário.' }
  }

  const { data, error } = await supabase
    .from('respostas')
    .upsert({
      instancia_id: input.instanciaId,
      participante_id: input.participanteId,
      template_id: input.templateId,
      programa_id: input.programaId,
      respostas: input.respostas as any,
      versao_template: input.versaoTemplate,
      data_envio: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    }, {
      onConflict: 'instancia_id,participante_id',
    })
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao salvar resposta: ' + error.message }
  }

  // If this is a diagnostico_inicial response, update participant status
  const { data: instancia } = await supabase
    .from('instancias')
    .select('tipo')
    .eq('id', input.instanciaId)
    .single()

  if (instancia?.tipo === 'diagnostico_inicial') {
    await supabase
      .from('participantes')
      .update({
        respondeu_diagnostico_inicial: true,
        status: 'ativo',
      })
      .eq('id', input.participanteId)
      .eq('status', 'selecionado') // Only transition from selecionado → ativo
  }

  return { success: true, data }
}

/**
 * Salva rascunho de resposta (auto-save)
 */
export async function saveDraftResponse(input: {
  instanciaId: string
  participanteId: string
  templateId: string
  programaId: string
  rascunho: Record<string, string | number | string[]>
  versaoTemplate: number
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('respostas')
    .upsert({
      instancia_id: input.instanciaId,
      participante_id: input.participanteId,
      template_id: input.templateId,
      programa_id: input.programaId,
      respostas: {} as any,
      rascunho: input.rascunho as any,
      versao_template: input.versaoTemplate,
    }, {
      onConflict: 'instancia_id,participante_id',
    })
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao salvar rascunho: ' + error.message }
  }

  return { success: true, data }
}
