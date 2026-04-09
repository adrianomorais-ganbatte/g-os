'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { nanoid } from 'nanoid'
import { Database } from '@/types/supabase'

type Instancia = Database['public']['Tables']['instancias']['Row']

/**
 * Busca todas as instâncias de um programa
 */
export async function getInstancesByProgram(programaId: string): Promise<Instancia[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('instancias')
    .select('*')
    .eq('programa_id', programaId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar instâncias:', error.message)
    return []
  }

  return data || []
}

/**
 * Busca todas as instâncias (geral)
 */
export async function getInstances(): Promise<Instancia[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('instancias')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar instâncias:', error.message)
    return []
  }

  return data || []
}

/**
 * Busca instância por link compartilhável (para formulário público)
 */
export async function getInstanceByLink(linkId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('instancias')
    .select('*, templates(*, campo_templates(*))')
    .eq('link_compartilhavel', linkId)
    .eq('status', 'publicado')
    .single()

  if (error) {
    return null
  }

  return data
}

/**
 * Cria uma nova instância
 */
export async function createInstance(input: {
  templateId: string
  programaId: string
  tipo: Database['public']['Enums']['tipo_template']
  prazoValidade?: string
  mensagemPersonalizada?: string
  tagsFiltro?: Record<string, string[]>
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('instancias')
    .insert({
      template_id: input.templateId,
      programa_id: input.programaId,
      tipo: input.tipo,
      prazo_validade: input.prazoValidade,
      mensagem_personalizada: input.mensagemPersonalizada,
      tags_filtro: input.tagsFiltro,
      status: 'rascunho',
    })
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao criar instância: ' + error.message }
  }

  revalidatePath('/dashboard/templates')
  return { success: true, data }
}

/**
 * Publica uma instância (gera link compartilhável)
 */
export async function publishInstance(id: string) {
  const linkId = nanoid(12)
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('instancias')
    .update({
      status: 'publicado',
      link_compartilhavel: linkId,
      published_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao publicar instância: ' + error.message }
  }

  revalidatePath('/dashboard/templates')
  return { success: true, data, linkId }
}

/**
 * Despublica uma instância (volta para rascunho)
 */
export async function unpublishInstance(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('instancias')
    .update({
      status: 'rascunho',
    })
    .eq('id', id)

  if (error) {
    return { error: 'Erro ao despublicar instância: ' + error.message }
  }

  revalidatePath('/dashboard/templates')
  return { success: true }
}

/**
 * Deleta uma instância (e suas respostas em cascata)
 */
export async function deleteInstance(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('instancias').delete().eq('id', id)

  if (error) {
    return { error: 'Erro ao deletar instância: ' + error.message }
  }

  revalidatePath('/dashboard/templates')
  return { success: true }
}
