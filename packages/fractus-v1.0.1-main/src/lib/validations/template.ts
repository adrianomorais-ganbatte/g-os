import { z } from 'zod'

export const campoTemplateSchema = z.object({
  tipo: z.enum(['texto', 'escolha_unica', 'multipla_escolha', 'escala']),
  label: z.string().min(1, 'Label é obrigatório'),
  obrigatorio: z.boolean().default(true),
  opcoes: z.array(z.string()).optional(),
  escalaMin: z.number().int().optional(),
  escalaMax: z.number().int().optional(),
  escalaLabelMin: z.string().optional(),
  escalaLabelMax: z.string().optional(),
  isIndicador: z.boolean().default(false),
  nomeIndicador: z.string().optional(),
  ordem: z.number().int().default(0),
}).refine((data) => {
  if (data.tipo === 'escala') {
    return data.escalaMin !== undefined && data.escalaMax !== undefined
  }
  return true
}, {
  message: 'Campos do tipo escala exigem escalaMin e escalaMax',
  path: ['escalaMin'],
}).refine((data) => {
  if (data.tipo === 'escolha_unica' || data.tipo === 'multipla_escolha') {
    return data.opcoes && data.opcoes.length >= 1
  }
  return true
}, {
  message: 'Campos de escolha exigem pelo menos 1 opção',
  path: ['opcoes'],
})

export const templateSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  descricao: z.string().optional(),
  tipo: z.enum(['diagnostico_inicial', 'diagnostico_meio', 'diagnostico_final', 'satisfacao_nps']),
  workspaceId: z.string().uuid().optional(),
  permitirMultiplasRespostas: z.boolean().default(false),
  campos: z.array(campoTemplateSchema).min(1, 'Template deve ter pelo menos 1 campo'),
})

export type TemplateInput = z.infer<typeof templateSchema>
export type CampoTemplateInput = z.infer<typeof campoTemplateSchema>
