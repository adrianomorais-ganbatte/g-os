'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { dealSchema, type DealInput } from '@/lib/validations/deal'
import { Database } from '@/types/supabase'

type Deal = Database['public']['Tables']['negocios']['Row']

/**
 * Busca todos os negócios / oportunidades CRM
 */
export async function getDeals(): Promise<Deal[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('negocios')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar negócios:', error.message)
    return []
  }

  return data || []
}

/**
 * Cria um novo negócio no CRM
 */
export async function createDeal(formData: DealInput) {
  // Valida com Zod
  const validation = dealSchema.safeParse(formData)

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('negocios')
    .insert({
      nome: validation.data.nome,
      descricao: validation.data.descricao,
      empresa: validation.data.empresa,
      valor: validation.data.valor,
      probabilidade: validation.data.probabilidade,
      status: validation.data.status,
      responsavel: validation.data.responsavel,
      data_abertura: validation.data.dataAbertura.toISOString().split('T')[0],
      data_fechamento: validation.data.dataFechamento?.toISOString().split('T')[0],
      observacoes: validation.data.observacoes,
    })
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao salvar negócio: ' + error.message }
  }

  revalidatePath('/dashboard/negocios')
  revalidatePath('/dashboard') // Revalida dashboard geral para KPIS
  
  return { success: true, data }
}

/**
 * Vincula um participante a um negócio
 */
export async function linkParticipantToDeal(participantId: string, dealId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('participante_negocios')
    .insert({ participante_id: participantId, negocio_id: dealId })

  if (error) {
    return { error: 'Erro ao vincular participante: ' + error.message }
  }

  return { success: true }
}
