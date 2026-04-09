export type RiskLevel = 'baixo' | 'medio' | 'alto' | 'critico'

export interface RiskFactors {
  status: string
  percentualPresenca: number
  respondeuDiagnosticoInicial: boolean
  faltasConsecutivas: number
  totalRespostas: number
}

export interface RiskResult {
  score: number
  level: RiskLevel
  factors: string[]
}

export function calculateRisk(factors: RiskFactors): RiskResult {
  const activeFactors: string[] = []

  // Status desistente = automatic 100
  if (factors.status === 'desistente') {
    return { score: 100, level: 'critico', factors: ['Status desistente'] }
  }

  let score = 0

  // Presença < 50% = +40
  if (factors.percentualPresenca < 50) {
    score += 40
    activeFactors.push('Presença abaixo de 50%')
  } else if (factors.percentualPresenca < 75) {
    // Presença 50-75% = +20
    score += 20
    activeFactors.push('Presença entre 50% e 75%')
  }

  // Não respondeu diagnóstico inicial = +30
  if (!factors.respondeuDiagnosticoInicial) {
    score += 30
    activeFactors.push('Não respondeu diagnóstico inicial')
  }

  // 3+ ausências consecutivas = +25
  if (factors.faltasConsecutivas >= 3) {
    score += 25
    activeFactors.push(`${factors.faltasConsecutivas} ausências consecutivas`)
  }

  // Zero respostas a avaliações = +20
  if (factors.totalRespostas === 0) {
    score += 20
    activeFactors.push('Nenhuma resposta a avaliações')
  }

  // Status selecionado (não iniciou) = +10
  if (factors.status === 'selecionado') {
    score += 10
    activeFactors.push('Status selecionado (não iniciou)')
  }

  // Cap at 100
  score = Math.min(100, score)

  // Determine level
  let level: RiskLevel
  if (score <= 25) level = 'baixo'
  else if (score <= 50) level = 'medio'
  else if (score <= 75) level = 'alto'
  else level = 'critico'

  return { score, level, factors: activeFactors }
}
