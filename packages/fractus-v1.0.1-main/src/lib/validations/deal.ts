import { z } from 'zod'

export const dealStatusEnum = z.enum([
  'prospeccao',
  'negociacao',
  'fechado',
  'perdido',
])

export const dealSchema = z.object({
  nome: z.string().min(3, 'O nome do negócio deve ter pelo menos 3 caracteres'),
  descricao: z.string().optional().nullable(),
  empresa: z.string().min(2, 'Informe o nome da empresa'),
  valor: z.number().min(0, 'Valor não pode ser negativo').default(0),
  probabilidade: z.number().min(0).max(100, 'Probabilidade deve estar entre 0 e 100').optional().nullable(),
  status: dealStatusEnum.default('prospeccao'),
  responsavel: z.string().optional().nullable(),
  dataAbertura: z.date().default(() => new Date()),
  dataFechamento: z.date().optional().nullable(),
  observacoes: z.string().optional().nullable(),
})

export type DealInput = z.infer<typeof dealSchema>
