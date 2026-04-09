'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/supabase'

type Template = Database['public']['Tables']['templates']['Row']
type CampoTemplate = Database['public']['Tables']['campo_templates']['Row']

export type TemplateWithCampos = Template & {
  campo_templates: CampoTemplate[]
}

/**
 * Busca todos os templates com contagem de campos
 */
export async function getTemplates(): Promise<TemplateWithCampos[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('templates')
    .select('*, campo_templates(*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar templates:', error.message)
    return []
  }

  return (data as TemplateWithCampos[]) || []
}

/**
 * Busca um template por ID com seus campos
 */
export async function getTemplateById(id: string): Promise<TemplateWithCampos | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('templates')
    .select('*, campo_templates(*)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar template:', error.message)
    return null
  }

  return data as TemplateWithCampos
}

/**
 * Cria um novo template com seus campos
 */
export async function createTemplate(input: {
  nome: string
  descricao?: string
  tipo: Database['public']['Enums']['tipo_template']
  workspaceId?: string
  permitirMultiplasRespostas?: boolean
  campos: {
    tipo: Database['public']['Enums']['tipo_campo']
    label: string
    obrigatorio?: boolean
    opcoes?: string[]
    escalaMin?: number
    escalaMax?: number
    escalaLabelMin?: string
    escalaLabelMax?: string
    isIndicador?: boolean
    nomeIndicador?: string
    ordem: number
  }[]
}) {
  if (!input.nome || input.nome.length < 3) {
    return { error: 'Nome deve ter pelo menos 3 caracteres' }
  }

  if (!input.campos || input.campos.length === 0) {
    return { error: 'Template deve ter pelo menos 1 campo' }
  }

  // Validate individual fields
  for (const campo of input.campos) {
    if (campo.tipo === 'escala' && (campo.escalaMin === undefined || campo.escalaMax === undefined)) {
      return { error: `Campo "${campo.label}" do tipo escala exige escalaMin e escalaMax` }
    }
    if ((campo.tipo === 'escolha_unica' || campo.tipo === 'multipla_escolha') && (!campo.opcoes || campo.opcoes.length === 0)) {
      return { error: `Campo "${campo.label}" do tipo escolha exige pelo menos 1 opção` }
    }
  }

  const supabase = await createClient()

  const { data: template, error: templateError } = await supabase
    .from('templates')
    .insert({
      nome: input.nome,
      descricao: input.descricao,
      tipo: input.tipo,
      workspace_id: input.workspaceId,
      permitir_multiplas_respostas: input.permitirMultiplasRespostas ?? false,
    })
    .select()
    .single()

  if (templateError) {
    return { error: 'Erro ao criar template: ' + templateError.message }
  }

  // Insert campos
  const camposToInsert = input.campos.map((campo) => ({
    template_id: template.id,
    tipo: campo.tipo,
    label: campo.label,
    obrigatorio: campo.obrigatorio ?? true,
    opcoes: campo.opcoes,
    escala_min: campo.escalaMin,
    escala_max: campo.escalaMax,
    escala_label_min: campo.escalaLabelMin,
    escala_label_max: campo.escalaLabelMax,
    is_indicador: campo.isIndicador ?? false,
    nome_indicador: campo.nomeIndicador,
    ordem: campo.ordem,
  }))

  const { error: camposError } = await supabase
    .from('campo_templates')
    .insert(camposToInsert)

  if (camposError) {
    console.error('Erro ao criar campos do template:', camposError.message)
    // Rollback: delete template if campos fail
    await supabase.from('templates').delete().eq('id', template.id)
    return { error: 'Erro ao criar campos do template: ' + camposError.message }
  }

  revalidatePath('/dashboard/templates')
  return { success: true, data: template }
}

/**
 * Atualiza um template (apenas metadados, não campos)
 */
export async function updateTemplate(id: string, input: {
  nome?: string
  descricao?: string
  permitirMultiplasRespostas?: boolean
  ativo?: boolean
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('templates')
    .update({
      nome: input.nome,
      descricao: input.descricao,
      permitir_multiplas_respostas: input.permitirMultiplasRespostas,
      ativo: input.ativo,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: 'Erro ao atualizar template: ' + error.message }
  }

  revalidatePath('/dashboard/templates')
  revalidatePath(`/dashboard/templates/${id}`)
  return { success: true, data }
}

/**
 * Desativa um template (soft delete — templates com respostas não podem ser deletados)
 */
export async function deactivateTemplate(id: string) {
  const supabase = await createClient()

  // Check if template has responses
  const { count } = await supabase
    .from('respostas')
    .select('*', { count: 'exact', head: true })
    .eq('template_id', id)

  if (count && count > 0) {
    // Soft delete: deactivate instead
    const { error } = await supabase
      .from('templates')
      .update({ ativo: false })
      .eq('id', id)

    if (error) {
      return { error: 'Erro ao desativar template: ' + error.message }
    }

    revalidatePath('/dashboard/templates')
    return { success: true, deactivated: true }
  }

  // Hard delete if no responses
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: 'Erro ao deletar template: ' + error.message }
  }

  revalidatePath('/dashboard/templates')
  return { success: true, deleted: true }
}
