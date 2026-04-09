import { z } from 'zod'

export const sessionSchema = z.object({
  nome: z.string().min(3, 'O nome da sessão deve ter pelo menos 3 caracteres'),
  data: z.date().default(() => new Date()),
  tipo: z.string().min(2, 'Informe o tipo de sessão (ex: Aula, Workshop)').default('Aula'),
  programaId: z.string().uuid('ID de programa inválido'),
  tagsFiltro: z.any().optional().nullable(),
  comNps: z.boolean().default(false),
  templateSatisfacaoId: z.string().uuid().optional(),
}).refine((data) => {
  if (data.comNps && !data.templateSatisfacaoId) {
    return false
  }
  return true
}, {
  message: 'Selecione um template de satisfação quando NPS está ativado',
  path: ['templateSatisfacaoId'],
})

export type SessionInput = z.infer<typeof sessionSchema>
