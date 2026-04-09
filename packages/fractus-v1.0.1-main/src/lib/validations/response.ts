import { z } from 'zod'

export const responseSchema = z.object({
  instanciaId: z.string().uuid('ID de instância inválido'),
  participanteId: z.string().uuid('ID de participante inválido'),
  templateId: z.string().uuid('ID de template inválido'),
  programaId: z.string().uuid('ID de programa inválido'),
  respostas: z.record(z.string(), z.any()),
  versaoTemplate: z.number().int().min(1),
  rascunho: z.boolean().default(false),
})

export type ResponseInput = z.infer<typeof responseSchema>
