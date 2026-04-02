#!/usr/bin/env node

'use strict'

const ACCENT_FIXES = {
  'nao': 'não', 'entao': 'então', 'tambem': 'também', 'codigo': 'código',
  'pagina': 'página', 'unico': 'único', 'analise': 'análise', 'modulo': 'módulo',
  'numero': 'número', 'especifico': 'específico', 'diretorio': 'diretório',
  'padrao': 'padrão', 'configuracao': 'configuração', 'validacao': 'validação',
  'implementacao': 'implementação', 'descricao': 'descrição', 'opcao': 'opção',
  'sessao': 'sessão', 'secao': 'seção', 'funcao': 'função', 'acao': 'ação',
  'informacao': 'informação', 'versao': 'versão', 'conexao': 'conexão',
  'excecao': 'exceção', 'condicao': 'condição', 'operacao': 'operação',
  'autenticacao': 'autenticação', 'migracao': 'migração', 'integracao': 'integração',
}

const AI_PATTERNS = [
  /\bvale ressaltar\b/gi, /\be importante destacar\b/gi,
  /\bnesse sentido\b/gi, /\bdiante disso\b/gi,
  /\bem suma\b/gi, /\bpor fim\b/gi,
  /\brobusto\b/gi, /\babrangente\b/gi,
  /\binovador\b/gi, /\bestrategico\b/gi,
  /\bholistic[oa]\b/gi, /\balem disso\b/gi,
]

function fixAccents(text) {
  if (typeof text !== 'string' || !text) return text
  let output = text
  for (const [wrong, right] of Object.entries(ACCENT_FIXES)) {
    output = output.replace(new RegExp(`\\b${wrong}\\b`, 'gi'), (match) => {
      if (match === match.toUpperCase()) return right.toUpperCase()
      if (match[0] === match[0].toUpperCase()) return right[0].toUpperCase() + right.slice(1)
      return right
    })
  }
  return output
}

function detectAIPatterns(text) {
  if (!text) return { count: 0, matches: [] }
  const haystack = Array.isArray(text) ? text.join('\n') : String(text)
  const matches = []
  let count = 0
  for (const pattern of AI_PATTERNS) {
    const found = haystack.match(pattern)
    if (found) {
      count += found.length
      matches.push({ pattern: pattern.source, count: found.length })
    }
  }
  return { count, matches }
}

function buildTaskDescription(task) {
  const sections = []

  // Descrição principal (texto livre, sem header)
  if (task.description) sections.push(task.description)

  // Seções estruturadas — headers H3, sem emojis, português com acentos
  if (task.context) sections.push(`### Contexto\n${task.context}`)
  if (task.steps?.length) sections.push(`### Como fazer\n${task.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`)
  if (task.businessRules?.length) sections.push(`### Regras de Negócio\n${task.businessRules.map((r) => `\`${r}\``).join(' · ')}`)
  if (task.files?.length) sections.push(`### Arquivos\n${task.files.map((f) => `- \`${f}\``).join('\n')}`)
  if (task.dependencies?.length) sections.push(`### Dependências\n${task.dependencies.map((d) => `- ${d}`).join('\n')}`)
  if (task.acceptanceCriteria?.length) sections.push(`### Critérios de Aceite\n${task.acceptanceCriteria.map((a) => `- [ ] ${a}`).join('\n')}`)
  if (task.ref) sections.push(`### Referência\n${task.ref}`)
  if (task.technicalNotes) sections.push(`### Notas Técnicas\n${task.technicalNotes}`)
  if (task.dod) sections.push(`### Definition of Done\n${task.dod}`)

  // Primeira seção (descrição) separada das demais por ---
  if (sections.length > 1) {
    return sections[0] + '\n\n---\n\n' + sections.slice(1).join('\n\n')
  }
  return sections.join('\n\n')
}


function scoreCompleteness(task) {
  let score = 0
  const suggestions = []

  if (task.description && task.description.length > 50) {
    score += 20
  } else if (task.description) {
    score += 5
    suggestions.push(`Descricao muito curta (${task.description.length} chars).`)
  } else {
    suggestions.push('Sem descricao.')
  }

  if (task.acceptanceCriteria?.length >= 2 && task.acceptanceCriteria.every((a) => a.length > 20)) {
    score += 25
  } else if (task.acceptanceCriteria?.length) {
    score += 10
    suggestions.push(`ACs insuficientes (${task.acceptanceCriteria.length} item(ns)).`)
  } else {
    suggestions.push('Sem criterios de aceite.')
  }

  if (task.steps?.length || task.subtasks?.length) score += 15
  else suggestions.push('Sem steps de implementacao.')

  if (task.files?.length) score += 10
  else suggestions.push('Sem arquivos listados.')

  if (task.points && task.points >= 1 && task.points <= 13) score += 10
  else suggestions.push('Sem story points validos.')

  if (task.dependencies?.length >= 0) score += 5

  if (task.context || task.businessRules?.length) score += 10
  else suggestions.push('Sem contexto de negocio.')

  if (task.dod || task.acceptanceCriteria?.some((a) => /\b(dado|quando|entao|given|when|then)\b/i.test(a))) score += 5
  else suggestions.push('Sem Definition of Done explicito.')

  return { score, suggestions }
}

function sanitizeTaskTexts(task) {
  const copy = { ...task }
  let aiPatternCount = 0
  const textFields = ['description', 'context', 'technicalNotes', 'dod', 'title', 'name', 'ref']
  const arrayFields = ['acceptanceCriteria', 'steps', 'businessRules', 'dependencies', 'files']

  for (const field of textFields) {
    if (typeof copy[field] === 'string') {
      copy[field] = fixAccents(copy[field])
      aiPatternCount += detectAIPatterns(copy[field]).count
    }
  }

  for (const field of arrayFields) {
    if (Array.isArray(copy[field])) {
      copy[field] = copy[field].map((item) => {
        if (typeof item !== 'string') return item
        const fixed = fixAccents(item)
        aiPatternCount += detectAIPatterns(fixed).count
        return fixed
      })
    }
  }

  const completeness = scoreCompleteness(copy)
  const description = buildTaskDescription(copy)
  return {
    task: {
      ...copy,
      completenessScore: completeness.score,
      completenessSuggestions: completeness.suggestions,
      aiPatternCount,
      description,
    },
    aiPatternCount,
    completenessScore: completeness.score,
    completenessSuggestions: completeness.suggestions,
    description,
  }
}

function processPayload(payload) {
  if (Array.isArray(payload)) {
    return { tasks: payload.map((task) => sanitizeTaskTexts(task).task) }
  }
  if (payload && Array.isArray(payload.tasks)) {
    return { ...payload, tasks: payload.tasks.map((task) => sanitizeTaskTexts(task).task) }
  }
  if (payload && typeof payload === 'object') {
    return sanitizeTaskTexts(payload).task
  }
  return payload
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => { data += chunk })
    process.stdin.on('end', () => resolve(data))
    process.stdin.on('error', reject)
  })
}

async function main() {
  if (!process.argv.includes('--json')) {
    console.error(JSON.stringify({ error: 'Use --json and provide JSON via stdin' }))
    process.exit(1)
  }

  const input = await readStdin()
  let parsed
  try {
    parsed = input.trim() ? JSON.parse(input) : {}
  } catch (error) {
    console.error(JSON.stringify({ error: `Invalid JSON input: ${error.message}` }))
    process.exit(1)
  }

  const output = processPayload(parsed)
  process.stdout.write(JSON.stringify(output, null, 2) + '\n')
}

if (require.main === module) {
  main().catch((error) => {
    console.error(JSON.stringify({ error: error.message }))
    process.exit(1)
  })
}

module.exports = {
  fixAccents,
  detectAIPatterns,
  scoreCompleteness,
  buildTaskDescription,
  sanitizeTaskTexts,
  processPayload,
}
