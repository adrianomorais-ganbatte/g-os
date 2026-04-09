import { z } from 'zod'

export const participantStatusEnum = z.enum([
  'pre_selecionado',
  'selecionado',
  'ativo',
  'desistente',
  'concluinte',
])

export const participantSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().optional().nullable(),
  dataNascimento: z.date().optional().nullable(),
  status: participantStatusEnum.default('pre_selecionado'),
  programaId: z.string().uuid('ID de programa inválido'),
})

export type ParticipantInput = z.infer<typeof participantSchema>
