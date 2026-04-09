import { z } from 'zod'

export const programSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  descricao: z.string().optional(),
  dataInicio: z.date(),
  dataFim: z.date(),
  totalInscritos: z.number().int().min(0, "Total de inscritos não pode ser negativo"),
  quantidadeVagas: z.number().int().min(1, "Quantidade de vagas deve ser no mínimo 1").optional(),
  patrocinadorIds: z.array(z.string().uuid()).optional(),
}).refine((data) => data.dataFim > data.dataInicio, {
  message: "A data de término deve ser após a data de início",
  path: ["dataFim"],
})

export type ProgramInput = z.infer<typeof programSchema>
