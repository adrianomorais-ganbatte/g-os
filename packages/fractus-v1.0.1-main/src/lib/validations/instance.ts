import { z } from 'zod'

export const instanceSchema = z.object({
  templateId: z.string().uuid('ID de template inválido'),
  programaId: z.string().uuid('ID de programa inválido'),
  tipo: z.enum(['diagnostico_inicial', 'diagnostico_meio', 'diagnostico_final', 'satisfacao_nps']),
  prazoValidade: z.date().optional(),
  mensagemPersonalizada: z.string().optional(),
  tagsFiltro: z.any().optional(),
})

export type InstanceInput = z.infer<typeof instanceSchema>
