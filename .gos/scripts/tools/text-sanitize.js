#!/usr/bin/env node

// text-sanitize.js — Sanitizador de texto pt-BR determinístico
// Zero-dep. Aplica subset de .gos/libraries/content/ai-writing-patterns.md + acentos.
//
// Uso:
//   node text-sanitize.js --text "texto aqui"
//   node text-sanitize.js --file path.md
//   node text-sanitize.js --text "..." --json
//
// Export:
//   const { sanitize } = require('./text-sanitize.js')
//   const { text, changes } = sanitize(input)

'use strict'

// ---------------------------------------------------------------------------
// Dicionários (word-boundary, case preservado no prefixo)
// ---------------------------------------------------------------------------

// P07 — vocabulário IA → equivalente natural pt-BR
const AI_VOCAB = {
  'aprimorar': 'melhorar',
  'aprimorando': 'melhorando',
  'aprimorada': 'melhorada',
  'aprimorado': 'melhorado',
  'fomentar': 'estimular',
  'fomentando': 'estimulando',
  'intrincado': 'complexo',
  'intrincada': 'complexa',
  'adicionalmente': 'além disso',
  'aprofundar': 'detalhar',
  'aprofundando': 'detalhando',
  'crucial': 'importante',
  'cruciais': 'importantes',
  'fundamental': 'essencial',
  'fundamentais': 'essenciais',
  'duradouro': 'permanente',
  'duradoura': 'permanente',
  'vibrante': 'ativo',
  'vibrantes': 'ativos',
  'renomado': 'conhecido',
  'renomada': 'conhecida',
  'deslumbrante': 'impressionante',
  'imperdivel': 'recomendado',
  'imperdível': 'recomendado',
  'testemunho': 'exemplo',
  'tapecaria': 'conjunto',
  'tapeçaria': 'conjunto',
  'sublimar': 'destacar',
}

// Acentos faltantes pt-BR — apenas adiciona acento, não muda palavra
const MISSING_ACCENTS = {
  'concluida': 'concluída', 'concluidas': 'concluídas', 'concluido': 'concluído', 'concluidos': 'concluídos',
  'atualizacao': 'atualização', 'atualizacoes': 'atualizações',
  'implementacao': 'implementação', 'implementacoes': 'implementações',
  'validacao': 'validação', 'validacoes': 'validações',
  'notificacao': 'notificação', 'notificacoes': 'notificações',
  'configuracao': 'configuração', 'configuracoes': 'configurações',
  'integracao': 'integração', 'integracoes': 'integrações',
  'migracao': 'migração', 'migracoes': 'migrações',
  'correcao': 'correção', 'correcoes': 'correções',
  'execucao': 'execução',
  'sessao': 'sessão', 'sessoes': 'sessões',
  'descricao': 'descrição', 'descricoes': 'descrições',
  'operacao': 'operação', 'operacoes': 'operações',
  'geracao': 'geração',
  'criacao': 'criação',
  'remocao': 'remoção',
  'revisao': 'revisão',
  'versao': 'versão', 'versoes': 'versões',
  'decisao': 'decisão', 'decisoes': 'decisões',
  'conexao': 'conexão', 'conexoes': 'conexões',
  'expressao': 'expressão', 'expressoes': 'expressões',
  'apos': 'após',
  'pos': 'pós',
  'ate': 'até',
  'tambem': 'também',
  'alem': 'além',
  'porem': 'porém',
  'ja': 'já',
  'nao': 'não',
  'sao': 'são',
  'pre': 'pré',
  'nivel': 'nível', 'niveis': 'níveis',
  'codigo': 'código', 'codigos': 'códigos',
  'usuario': 'usuário', 'usuarios': 'usuários',
  'relatorio': 'relatório', 'relatorios': 'relatórios',
  'diretorio': 'diretório', 'diretorios': 'diretórios',
  'arquivo': 'arquivo', // no-op control
  'servico': 'serviço', 'servicos': 'serviços',
  'pratica': 'prática', 'praticas': 'práticas',
  'basico': 'básico', 'basicos': 'básicos',
  'automatico': 'automático', 'automaticos': 'automáticos',
  'automatica': 'automática', 'automaticas': 'automáticas',
  'dinamico': 'dinâmico', 'dinamica': 'dinâmica',
  'estatico': 'estático', 'estatica': 'estática',
  'historico': 'histórico', 'historica': 'histórica',
  'pagina': 'página', 'paginas': 'páginas',
  'duvida': 'dúvida', 'duvidas': 'dúvidas',
  'area': 'área', 'areas': 'áreas',
  'apos': 'após',
  'proximo': 'próximo', 'proxima': 'próxima', 'proximos': 'próximos', 'proximas': 'próximas',
  'unico': 'único', 'unica': 'única', 'unicos': 'únicos', 'unicas': 'únicas',
  'publico': 'público', 'publica': 'pública',
  'pratico': 'prático', 'pratica': 'prática',
  'possivel': 'possível', 'possiveis': 'possíveis',
  'disponivel': 'disponível', 'disponiveis': 'disponíveis',
  'responsavel': 'responsável', 'responsaveis': 'responsáveis',
  'util': 'útil', 'uteis': 'úteis',
  'tres': 'três',
  'seculo': 'século', 'seculos': 'séculos',
  'hifen': 'hífen', 'hifens': 'hífens',
  'voce': 'você', 'voces': 'vocês',
  'portugues': 'português',
  'ingles': 'inglês',
  'contem': 'contém',
  'atencao': 'atenção',
  'instalacao': 'instalação',
  'organizacao': 'organização', 'organizacoes': 'organizações',
  'informacao': 'informação', 'informacoes': 'informações',
  'documentacao': 'documentação',
  'autenticacao': 'autenticação',
  'aplicacao': 'aplicação', 'aplicacoes': 'aplicações',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CODE_FENCE = /```[\s\S]*?```/g
const INLINE_CODE = /`[^`\n]+`/g
const COMMIT_HASH = /\b[0-9a-f]{7,40}\b/g
const TASK_ID = /\bT-\d{3}\b/g

function protectSpans(text) {
  const spans = []
  const replaced = text
    .replace(CODE_FENCE, (m) => { spans.push(m); return `\u0000${spans.length - 1}\u0000` })
    .replace(INLINE_CODE, (m) => { spans.push(m); return `\u0000${spans.length - 1}\u0000` })
  return { text: replaced, spans }
}

function restoreSpans(text, spans) {
  return text.replace(/\u0000(\d+)\u0000/g, (_, idx) => spans[Number(idx)])
}

function matchCase(original, replacement) {
  if (original === original.toUpperCase() && original.length > 1) return replacement.toUpperCase()
  if (original[0] === original[0].toUpperCase()) return replacement[0].toUpperCase() + replacement.slice(1)
  return replacement
}

function applyDict(text, dict, ruleName, changes) {
  // ordena por tamanho desc para evitar que "concluida" case com "concluidas"
  const keys = Object.keys(dict).sort((a, b) => b.length - a.length)
  for (const from of keys) {
    const to = dict[from]
    const re = new RegExp(`\\b${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    text = text.replace(re, (m) => {
      const out = matchCase(m, to)
      changes.push({ rule: ruleName, before: m, after: out })
      return out
    })
  }
  return text
}

// ---------------------------------------------------------------------------
// Transformações
// ---------------------------------------------------------------------------

function stripLeadingEmojis(text, changes) {
  const emojiAtLineStart = /^[ \t]*([\u2705\u274C\u26A0\u{1F680}\u2B50\u{1F3AF}\u{1F4A1}\u{1F527}\u{1F389}\u{1F525}\u{1F44D}\u{1F44C}])\s+/gmu
  return text.replace(emojiAtLineStart, (m, emoji) => {
    changes.push({ rule: 'P17-emoji-bullet', before: emoji, after: '' })
    return m.replace(emojiAtLineStart, '').replace(/^[ \t]+/, '') || ''
  })
}

function normalizeDashes(text, changes) {
  // em-dash entre palavras sem espaço de travessão legítimo → hyphen
  // Padrão travessão: " — " (espaço-dash-espaço) é legítimo; "word—word" não
  const re = /(\w)—(\w)/g
  return text.replace(re, (m, a, b) => {
    changes.push({ rule: 'P14-dash', before: '—', after: '-' })
    return `${a}-${b}`
  })
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

function sanitize(input) {
  if (!input || typeof input !== 'string') return { text: input || '', changes: [] }
  const changes = []
  const { text: protectedText, spans } = protectSpans(input)
  let out = protectedText
  out = stripLeadingEmojis(out, changes)
  out = normalizeDashes(out, changes)
  out = applyDict(out, MISSING_ACCENTS, 'spell-accent', changes)
  out = applyDict(out, AI_VOCAB, 'P07-ai-vocab', changes)
  out = restoreSpans(out, spans)
  return { text: out, changes }
}

module.exports = { sanitize, AI_VOCAB, MISSING_ACCENTS }

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (require.main === module) {
  const args = process.argv.slice(2)
  let input = ''
  let json = false
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--text') input = args[++i] || ''
    else if (a === '--file') {
      const fs = require('node:fs')
      input = fs.readFileSync(args[++i], 'utf8')
    } else if (a === '--json') json = true
    else if (a === '--stdin') {
      input = require('node:fs').readFileSync(0, 'utf8')
    }
  }
  if (!input) {
    try { input = require('node:fs').readFileSync(0, 'utf8') } catch { /* empty */ }
  }
  const result = sanitize(input)
  if (json) process.stdout.write(JSON.stringify(result, null, 2) + '\n')
  else process.stdout.write(result.text)
}
