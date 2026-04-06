#!/usr/bin/env node

// clickup.js — ClickUp API v2 CLI tool (zero-dep)
// Usage: node clickup.js <resource> <action> [--options]
// Auth: CLICKUP_API_KEY env var (personal token pk_*)

const API_KEY = process.env.CLICKUP_API_KEY
const BASE_URL = 'https://api.clickup.com/api/v2'

if (!API_KEY) {
  console.error(JSON.stringify({ error: 'CLICKUP_API_KEY environment variable required' }))
  process.exit(1)
}

function parseArgs(argv) {
  const result = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const next = argv[i + 1]
      if (next && !next.startsWith('--')) {
        result[key] = next
        i++
      } else {
        result[key] = true
      }
    } else {
      result._.push(arg)
    }
  }
  return result
}

const args = parseArgs(process.argv.slice(2))
const [cmd, sub, ...rest] = args._

let rateLimitRemaining = 100

async function api(method, path, body) {
  if (args['dry-run']) {
    return { _dry_run: true, method, url: `${BASE_URL}${path}`, headers: { Authorization: '***', 'Content-Type': 'application/json' }, body: body || undefined }
  }

  const maxRetries = 3
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (rateLimitRemaining <= 2 && attempt === 0) {
      await new Promise(r => setTimeout(r, 1000))
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const remaining = res.headers.get('x-ratelimit-remaining')
    if (remaining) rateLimitRemaining = parseInt(remaining, 10)

    if (res.status === 429 && attempt < maxRetries) {
      const reset = res.headers.get('x-ratelimit-reset')
      const waitMs = reset ? Math.max(0, parseInt(reset, 10) * 1000 - Date.now()) : (attempt + 1) * 2000
      await new Promise(r => setTimeout(r, Math.min(waitMs, 10000)))
      continue
    }

    const text = await res.text()
    try {
      return JSON.parse(text)
    } catch {
      return { status: res.status, body: text }
    }
  }
}

async function apiWithDelay(method, path, body, delayMs = 200) {
  const result = await api(method, path, body)
  if (!args['dry-run']) await new Promise(r => setTimeout(r, delayMs))
  return result
}

// --- Text Quality: Sanitize + AI Pattern Detection ---

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
  /\bvale ressaltar\b/gi, /\bé importante destacar\b/gi,
  /\bnesse sentido\b/gi, /\bdiante disso\b/gi,
  /\bem suma\b/gi, /\bpor fim\b/gi,
  /\brobusto\b/gi, /\babrangente\b/gi,
  /\binovador\b/gi, /\bestratégico\b/gi,
  /\bholístic[oa]\b/gi, /\balém disso\b/gi,
  /\badicionalmente\b/gi, /\bpor outro lado\b/gi,
]

function fixAccents(text) {
  if (!text) return text
  for (const [wrong, right] of Object.entries(ACCENT_FIXES)) {
    text = text.replace(new RegExp(`\\b${wrong}\\b`, 'gi'), (match) => {
      // Preserve capitalization: Nao → Não, NAO → NÃO, nao → não
      if (match === match.toUpperCase()) return right.toUpperCase()
      if (match[0] === match[0].toUpperCase()) return right[0].toUpperCase() + right.slice(1)
      return right
    })
  }
  return text
}

function countAiPatterns(text) {
  if (!text) return 0
  let count = 0
  for (const p of AI_PATTERNS) {
    const m = text.match(p)
    if (m) count += m.length
  }
  return count
}

function sanitizeTaskTexts(task) {
  const textFields = ['description', 'context', 'technicalNotes', 'dod']
  const arrayFields = ['acceptanceCriteria', 'steps']
  let aiPatternCount = 0

  for (const f of textFields) {
    if (task[f]) {
      task[f] = fixAccents(task[f])
      aiPatternCount += countAiPatterns(task[f])
    }
  }
  for (const f of arrayFields) {
    if (task[f]?.length) {
      task[f] = task[f].map(item => {
        item = fixAccents(item)
        aiPatternCount += countAiPatterns(item)
        return item
      })
    }
  }
  return { task, aiPatternCount }
}

// --- Rich Description Builder ---

function buildTaskDescription(task) {
  const sections = []

  if (task.description) {
    sections.push(`## O que\n${task.description}`)
  }
  if (task.context) {
    sections.push(`## Contexto\n${task.context}`)
  }
  if (task.steps?.length) {
    sections.push(`## Como fazer\n${task.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`)
  }
  if (task.acceptanceCriteria?.length) {
    sections.push(`## Critérios de Aceite\n${task.acceptanceCriteria.map(a => `- ${a}`).join('\n')}`)
  }
  if (task.businessRules?.length) {
    sections.push(`## Regras de Negócio\n${task.businessRules.map(r => `- ${r}`).join('\n')}`)
  }
  if (task.dependencies?.length) {
    sections.push(`## Dependências\n${task.dependencies.map(d => `- ${d}`).join('\n')}`)
  }
  if (task.files?.length) {
    sections.push(`## Arquivos\n${task.files.map(f => `- ${f}`).join('\n')}`)
  }
  if (task.ref) {
    sections.push(`## Referência\n${task.ref}`)
  }
  if (task.technicalNotes) {
    sections.push(`## Notas Técnicas\n${task.technicalNotes}`)
  }
  if (task.dod) {
    sections.push(`## Definition of Done\n${task.dod}`)
  }

  return sections.join('\n\n---\n\n')
}

// --- Task Completeness Validation ---

function validateTaskCompleteness(task) {
  let score = 0
  const suggestions = []

  // description (20 pts)
  if (task.description && task.description.length > 50) {
    score += 20
  } else if (task.description) {
    score += 5
    suggestions.push(`Descrição muito curta (${task.description.length} chars). Expandir com contexto e motivação.`)
  } else {
    suggestions.push('Sem descrição. Adicionar O QUE fazer e POR QUE.')
  }

  // acceptanceCriteria (25 pts)
  if (task.acceptanceCriteria?.length >= 2 && task.acceptanceCriteria.every(a => a.length > 20)) {
    score += 25
    if (task.acceptanceCriteria.some(a => /\b(dado|quando|então|given|when|then)\b/i.test(a))) {
      // bonus: using Given/When/Then
    } else {
      suggestions.push('ACs sem formato DADO/QUANDO/ENTÃO. Reescrever para verificabilidade.')
    }
  } else if (task.acceptanceCriteria?.length) {
    score += 10
    suggestions.push(`ACs insuficientes (${task.acceptanceCriteria.length} item(ns), min 2 com >20 chars).`)
  } else {
    suggestions.push('Sem critérios de aceite. Adicionar mínimo 2 ACs verificáveis.')
  }

  // steps or subtasks (15 pts)
  if (task.steps?.length || task.subtasks?.length) {
    score += 15
  } else {
    suggestions.push('Sem steps de implementação. Adicionar passo a passo (3-7 steps).')
  }

  // files (10 pts)
  if (task.files?.length) {
    score += 10
    if (task.files.some(f => f.endsWith('/'))) {
      suggestions.push('Files contém diretórios genéricos. Preferir paths específicos (ex: app/page.tsx).')
    }
  } else {
    suggestions.push('Sem arquivos listados. Adicionar paths dos arquivos envolvidos.')
  }

  // points (10 pts)
  if (task.points && task.points >= 1 && task.points <= 13) {
    score += 10
  } else {
    suggestions.push('Sem story points. Adicionar estimativa (1, 2, 3, 5, 8, 13).')
  }

  // dependencies (5 pts)
  if (task.dependencies?.length >= 0) {
    score += 5 // present even if empty means it was considered
  }

  // context or businessRules (10 pts)
  if (task.context || task.businessRules?.length) {
    score += 10
  } else {
    suggestions.push('Sem contexto de negócio. Adicionar motivação para leitor não-técnico.')
  }

  // dod or AC with Given/When/Then (5 pts)
  if (task.dod || task.acceptanceCriteria?.some(a => /\b(dado|quando|então|given|when|then)\b/i.test(a))) {
    score += 5
  } else {
    suggestions.push('Sem Definition of Done explícito.')
  }

  return { score, suggestions }
}

function validateAllTasks(tasks, skipValidation) {
  if (skipValidation) return true
  let hasErrors = false
  for (const task of tasks) {
    const { score, suggestions } = validateTaskCompleteness(task)
    if (score < 30) {
      console.error(`❌ ${task.id} "${task.title}" (score: ${score}/100) — requer enriquecimento`)
      suggestions.forEach(s => console.error(`   - ${s}`))
      hasErrors = true
    } else if (score < 50) {
      console.warn(`⚠ ${task.id} "${task.title}" (score: ${score}/100) — detalhamento insuficiente`)
      suggestions.forEach(s => console.warn(`   - ${s}`))
    } else if (suggestions.length > 0) {
      console.warn(`ℹ ${task.id} "${task.title}" (score: ${score}/100)`)
      suggestions.forEach(s => console.warn(`   - ${s}`))
    }
  }
  return !hasErrors
}

// --- Sprint Abstraction Layer ---

function sprintFolderName(id, name, start, end) {
  return `Sprint ${id} — ${name} (${start} to ${end})`
}

function parseSprintMeta(description) {
  try {
    const match = description?.match(/^---\n([\s\S]*?)\n---/)
    if (!match) return {}
    const lines = match[1].split('\n')
    const meta = {}
    for (const line of lines) {
      const [k, ...v] = line.split(':')
      if (k) meta[k.trim()] = v.join(':').trim()
    }
    return meta
  } catch { return {} }
}

function buildSprintDescription(meta) {
  const lines = Object.entries(meta).map(([k, v]) => `${k}: ${v}`)
  return `---\n${lines.join('\n')}\n---`
}

// --- Main ---

async function main() {
  let result

  switch (cmd) {
    // === WORKSPACE ===
    case 'workspace':
      switch (sub) {
        case 'list':
          result = await api('GET', '/team')
          break
        case 'members': {
          if (!args['team-id']) { result = { error: '--team-id required' }; break }
          const teamRes = await api('GET', `/team/${args['team-id']}`)
          const members = (teamRes.team?.members || []).map(m => ({
            id: m.user?.id,
            username: m.user?.username,
            email: m.user?.email,
            initials: m.user?.initials,
            role: m.role,
            roleName: m.role === 1 ? 'owner' : m.role === 2 ? 'admin' : m.role === 3 ? 'member' : 'guest',
          }))
          result = { teamId: args['team-id'], members, count: members.length }
          break
        }
        default:
          result = { error: 'Unknown workspace subcommand. Use: list, members' }
      }
      break

    // === SPACE ===
    case 'space':
      switch (sub) {
        case 'list': {
          if (!args['team-id']) { result = { error: '--team-id required' }; break }
          result = await api('GET', `/team/${args['team-id']}/space?archived=false`)
          break
        }
        case 'get': {
          if (!rest[0]) { result = { error: 'Space ID required' }; break }
          result = await api('GET', `/space/${rest[0]}`)
          break
        }
        default:
          result = { error: 'Unknown space subcommand. Use: list, get' }
      }
      break

    // === FOLDER ===
    case 'folder':
      switch (sub) {
        case 'list': {
          if (!args['space-id']) { result = { error: '--space-id required' }; break }
          result = await api('GET', `/space/${args['space-id']}/folder?archived=false`)
          break
        }
        case 'get': {
          if (!rest[0]) { result = { error: 'Folder ID required' }; break }
          result = await api('GET', `/folder/${rest[0]}`)
          break
        }
        case 'create': {
          if (!args['space-id'] || !args.name) { result = { error: '--space-id and --name required' }; break }
          result = await api('POST', `/space/${args['space-id']}/folder`, { name: args.name })
          break
        }
        default:
          result = { error: 'Unknown folder subcommand. Use: list, get, create' }
      }
      break

    // === LIST ===
    case 'list':
      switch (sub) {
        case 'list': {
          if (!args['folder-id']) { result = { error: '--folder-id required' }; break }
          result = await api('GET', `/folder/${args['folder-id']}/list?archived=false`)
          break
        }
        case 'create': {
          if (!args['folder-id'] || !args.name) { result = { error: '--folder-id and --name required' }; break }
          const body = { name: args.name }
          if (args.content) body.content = args.content
          if (args['due-date']) body.due_date = new Date(args['due-date']).getTime()
          result = await api('POST', `/folder/${args['folder-id']}/list`, body)
          break
        }
        default:
          result = { error: 'Unknown list subcommand. Use: list, create' }
      }
      break

    // === TASK ===
    case 'task':
      switch (sub) {
        case 'list': {
          if (!args['list-id']) { result = { error: '--list-id required' }; break }
          const params = new URLSearchParams()
          if (args.page) params.set('page', args.page)
          if (args.subtasks) params.set('subtasks', 'true')
          if (args.statuses) args.statuses.split(',').forEach(s => params.append('statuses[]', s))
          result = await api('GET', `/list/${args['list-id']}/task?${params}`)
          break
        }
        case 'get': {
          if (!rest[0]) { result = { error: 'Task ID required' }; break }
          const params = new URLSearchParams()
          if (args.subtasks) params.set('include_subtasks', 'true')
          result = await api('GET', `/task/${rest[0]}?${params}`)
          break
        }
        case 'create': {
          if (!args['list-id'] || !args.name) { result = { error: '--list-id and --name required' }; break }
          const body = { name: args.name }
          if (args.description) body.description = args.description
          if (args.status) body.status = args.status
          if (args.priority) body.priority = parseInt(args.priority, 10)
          if (args['due-date']) body.due_date = new Date(args['due-date']).getTime()
          if (args['start-date']) body.start_date = new Date(args['start-date']).getTime()
          if (args['time-estimate']) body.time_estimate = parseInt(args['time-estimate'], 10)
          if (args.parent) body.parent = args.parent
          if (args.tags) body.tags = args.tags.split(',')
          if (args.points) body.points = parseFloat(args.points)
          if (args.assignees) body.assignees = args.assignees.split(',').map(Number)
          result = await api('POST', `/list/${args['list-id']}/task`, body)
          break
        }
        case 'update': {
          if (!args['task-id']) { result = { error: '--task-id required' }; break }
          const body = {}
          if (args.name) body.name = args.name
          if (args.description) body.description = args.description
          if (args.status) body.status = args.status
          if (args.priority) body.priority = parseInt(args.priority, 10)
          if (args['due-date']) body.due_date = new Date(args['due-date']).getTime()
          if (args.parent) body.parent = args.parent
          if (args.points) body.points = parseFloat(args.points)
          if (args.assignees) body.assignees = args.assignees.split(',').map(Number)
          result = await api('PUT', `/task/${args['task-id']}`, body)
          break
        }
        case 'delete': {
          if (!rest[0]) { result = { error: 'Task ID required' }; break }
          result = await api('DELETE', `/task/${rest[0]}`)
          break
        }
        case 'enrich': {
          // Enrich existing ClickUp tasks with rich descriptions from a JSON file
          if (!args.file) { result = { error: '--file (enriched JSON path) required. Optionally --task-id for single task.' }; break }

          const { readFileSync } = require('node:fs')
          let enrichData
          try {
            enrichData = JSON.parse(readFileSync(args.file, 'utf-8'))
          } catch (e) {
            result = { error: `Failed to read/parse ${args.file}: ${e.message}` }; break
          }

          // Load registry for ID mapping
          const { resolve, join } = require('node:path')
          const { existsSync } = require('node:fs')
          const repoRoot = process.cwd()
          const registryPaths = [
            resolve(repoRoot, 'data/sprints/registry.json'),
            resolve(repoRoot, '.a8z/data/sprints/registry.json'),
          ]
          const registryPath = registryPaths.find(p => existsSync(p))
          let taskMap = {}
          if (registryPath) {
            try { taskMap = JSON.parse(readFileSync(registryPath, 'utf-8')).taskMap || {} } catch {}
          }

          const tasks = enrichData.tasks || [enrichData]
          const updated = []
          const enrichFailed = []

          for (const task of tasks) {
            // Resolve ClickUp task ID
            let clickupId = task.clickupTaskId || taskMap[task.id] || null
            if (args['task-id'] && tasks.length === 1) clickupId = args['task-id']
            if (!clickupId) {
              enrichFailed.push({ task: task.id, error: `No ClickUp ID found. Add clickupTaskId or ensure registry has mapping.` })
              continue
            }

            // Sanitize
            const { task: sanitized, aiPatternCount } = sanitizeTaskTexts({ ...task })
            if (aiPatternCount >= 3) {
              console.warn(`⚠ Task "${sanitized.title}": ${aiPatternCount} padrões de IA detectados.`)
            }

            // Build rich description and update
            const description = buildTaskDescription(sanitized)
            const updateBody = { description }
            if (sanitized.points) updateBody.points = sanitized.points
            if (sanitized.estimatedHours) updateBody.time_estimate = sanitized.estimatedHours * 3600000

            const res = await apiWithDelay('PUT', `/task/${clickupId}`, updateBody)
            if (res.id) {
              updated.push({ localId: sanitized.id, clickupId, name: sanitized.title })

              // Create Implementation Steps checklist if steps present
              if (sanitized.steps?.length > 0) {
                const stepsRes = await apiWithDelay('POST', `/task/${clickupId}/checklist`, { name: 'Implementation Steps' })
                if (stepsRes.checklist?.id) {
                  for (const step of sanitized.steps) {
                    await apiWithDelay('POST', `/checklist/${stepsRes.checklist.id}/checklist_item`, { name: step })
                  }
                }
              }

              // Create subtasks if present
              if (sanitized.subtasks?.length > 0) {
                // Need a list ID — get it from the task
                const taskDetail = await api('GET', `/task/${clickupId}`)
                const listId = taskDetail.list?.id
                if (listId) {
                  for (const st of sanitized.subtasks) {
                    const stBody = { name: st.title || st.name, parent: clickupId, description: st.description || '' }
                    await apiWithDelay('POST', `/list/${listId}/task`, stBody)
                  }
                }
              }
            } else {
              enrichFailed.push({ task: sanitized.id, error: res.error || res.err || 'unknown' })
            }
          }

          result = { enriched: updated.length, failed: enrichFailed.length, updated, errors: enrichFailed }
          break
        }
        default:
          result = { error: 'Unknown task subcommand. Use: list, get, create, update, delete, enrich' }
      }
      break

    // === SUBTASK (alias) ===
    case 'subtask':
      switch (sub) {
        case 'create': {
          if (!args['list-id'] || !args.name || !args.parent) { result = { error: '--list-id, --name, and --parent required' }; break }
          const body = { name: args.name, parent: args.parent }
          if (args.description) body.description = args.description
          if (args.status) body.status = args.status
          if (args.priority) body.priority = parseInt(args.priority, 10)
          if (args.points) body.points = parseFloat(args.points)
          if (args.assignees) body.assignees = args.assignees.split(',').map(Number)
          result = await api('POST', `/list/${args['list-id']}/task`, body)
          break
        }
        default:
          result = { error: 'Unknown subtask subcommand. Use: create' }
      }
      break

    // === FIELD ===
    case 'field':
      switch (sub) {
        case 'list': {
          if (!args['list-id']) { result = { error: '--list-id required' }; break }
          result = await api('GET', `/list/${args['list-id']}/field`)
          break
        }
        case 'set': {
          if (!args['task-id'] || !args['field-id'] || args.value === undefined) {
            result = { error: '--task-id, --field-id, and --value required' }; break
          }
          let value = args.value
          try { value = JSON.parse(value) } catch {}
          result = await api('POST', `/task/${args['task-id']}/field/${args['field-id']}`, { value })
          break
        }
        default:
          result = { error: 'Unknown field subcommand. Use: list, set' }
      }
      break

    // === TAG ===
    case 'tag':
      switch (sub) {
        case 'add': {
          if (!args['task-id'] || !args.tag) { result = { error: '--task-id and --tag required' }; break }
          result = await api('POST', `/task/${args['task-id']}/tag/${encodeURIComponent(args.tag)}`, {})
          break
        }
        default:
          result = { error: 'Unknown tag subcommand. Use: add' }
      }
      break

    // === COMMENT ===
    case 'comment':
      switch (sub) {
        case 'create': {
          if (!args['task-id'] || !args.text) { result = { error: '--task-id and --text required' }; break }
          result = await api('POST', `/task/${args['task-id']}/comment`, { comment_text: args.text })
          break
        }
        case 'list': {
          if (!args['task-id']) { result = { error: '--task-id required' }; break }
          result = await api('GET', `/task/${args['task-id']}/comment`)
          break
        }
        default:
          result = { error: 'Unknown comment subcommand. Use: create, list' }
      }
      break

    // === SPRINT (composite) ===
    case 'sprint':
      switch (sub) {
        case 'create': {
          if (!args['space-id'] || !args.name || !args.start || !args.end) {
            result = { error: '--space-id, --name, --start (YYYY-MM-DD), and --end (YYYY-MM-DD) required' }; break
          }
          const sprintId = args.id || `S${String(args.number || '01').padStart(2, '0')}`
          const tracks = (args.tracks || 'backend,frontend').split(',')
          const folderName = sprintFolderName(sprintId, args.name, args.start, args.end)
          const meta = { sprintId, name: args.name, start: args.start, end: args.end, tracks: tracks.join(','), status: 'planning' }
          const description = buildSprintDescription(meta)

          // Create folder
          const folder = await apiWithDelay('POST', `/space/${args['space-id']}/folder`, { name: folderName })
          if (folder.error || folder.err) { result = { error: 'Failed to create folder', details: folder }; break }

          // Create lists for each track
          const lists = []
          for (let i = 0; i < tracks.length; i++) {
            const listName = `${i + 1}-${tracks[i].charAt(0).toUpperCase() + tracks[i].slice(1)}`
            const list = await apiWithDelay('POST', `/folder/${folder.id}/list`, { name: listName, content: `Track: ${tracks[i]}` })
            lists.push({ track: tracks[i], id: list.id, name: listName })
          }

          result = {
            sprint: { id: sprintId, name: args.name, start: args.start, end: args.end },
            folder: { id: folder.id, name: folderName },
            lists,
            description
          }
          break
        }

        case 'status': {
          if (!args['folder-id']) { result = { error: '--folder-id required' }; break }

          // Get folder info
          const folder = await api('GET', `/folder/${args['folder-id']}`)
          if (folder.error || folder.err) { result = { error: 'Failed to get folder', details: folder }; break }

          // Get lists in folder
          const listsRes = await api('GET', `/folder/${args['folder-id']}/list?archived=false`)
          const lists = listsRes.lists || []

          // Aggregate tasks from all lists
          let totalTasks = 0, done = 0, inProgress = 0, blocked = 0, todo = 0
          const trackStats = []

          for (const list of lists) {
            const tasksRes = await apiWithDelay('GET', `/list/${list.id}/task?subtasks=true`)
            const tasks = tasksRes.tasks || []
            let lDone = 0, lInProgress = 0, lBlocked = 0, lTodo = 0

            for (const t of tasks) {
              const s = (t.status?.status || '').toLowerCase()
              if (s === 'complete' || s === 'closed' || s === 'done') lDone++
              else if (s === 'in progress' || s === 'in review') lInProgress++
              else if (s === 'blocked') lBlocked++
              else lTodo++
            }

            totalTasks += tasks.length
            done += lDone; inProgress += lInProgress; blocked += lBlocked; todo += lTodo
            trackStats.push({ list: list.name, listId: list.id, total: tasks.length, done: lDone, inProgress: lInProgress, blocked: lBlocked, todo: lTodo })
          }

          const meta = parseSprintMeta(folder.description || folder.content || '')
          const pct = totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0

          result = {
            sprint: { folderId: folder.id, name: folder.name, ...meta },
            summary: { totalTasks, done, inProgress, blocked, todo, completionPct: pct },
            tracks: trackStats
          }
          break
        }

        case 'get': {
          if (!args['folder-id']) { result = { error: '--folder-id required' }; break }

          // Get folder info
          const folder = await api('GET', `/folder/${args['folder-id']}`)
          if (folder.error || folder.err) { result = { error: 'Failed to get folder', details: folder }; break }

          // Get lists in folder
          const listsRes = await api('GET', `/folder/${args['folder-id']}/list?archived=false`)
          const sprintLists = listsRes.lists || []
          const meta = parseSprintMeta(folder.description || folder.content || '')

          const assigneeFilter = args.assignee ? args.assignee.toLowerCase() : null
          const statusFilter = args.status ? args.status.toLowerCase() : null

          let totalTasks = 0, totalDone = 0, totalInProgress = 0, totalBlocked = 0, totalTodo = 0
          const trackResults = []
          const assigneeSummary = {}

          for (const list of sprintLists) {
            const tasksRes = await apiWithDelay('GET', `/list/${list.id}/task?subtasks=true&include_closed=true`)
            const allTasks = tasksRes.tasks || []

            const trackTasks = []
            for (const t of allTasks) {
              const status = (t.status?.status || 'to do').toLowerCase()

              // Status filter
              if (statusFilter && !status.includes(statusFilter)) continue

              // Assignee info
              const assignees = (t.assignees || []).map(a => ({
                id: a.id,
                username: a.username,
                email: a.email,
                initials: a.initials,
              }))

              // Assignee filter
              if (assigneeFilter) {
                const match = assignees.some(a =>
                  (a.username || '').toLowerCase().includes(assigneeFilter) ||
                  (a.email || '').toLowerCase().includes(assigneeFilter)
                )
                if (!match && assignees.length > 0) continue
                // Include unassigned tasks too (they need assignment)
              }

              // Count stats
              if (status === 'complete' || status === 'closed' || status === 'done') totalDone++
              else if (status === 'in progress' || status === 'in review') totalInProgress++
              else if (status === 'blocked') totalBlocked++
              else totalTodo++
              totalTasks++

              // Track per-assignee stats
              const assigneeKey = assignees.length > 0 ? assignees.map(a => a.username || a.email).join(', ') : 'unassigned'
              if (!assigneeSummary[assigneeKey]) assigneeSummary[assigneeKey] = { total: 0, done: 0, inProgress: 0, blocked: 0, todo: 0 }
              assigneeSummary[assigneeKey].total++
              if (status === 'complete' || status === 'closed' || status === 'done') assigneeSummary[assigneeKey].done++
              else if (status === 'in progress' || status === 'in review') assigneeSummary[assigneeKey].inProgress++
              else if (status === 'blocked') assigneeSummary[assigneeKey].blocked++
              else assigneeSummary[assigneeKey].todo++

              // Subtasks
              const subtasks = (t.subtasks || []).map(st => ({
                id: st.id,
                name: st.name,
                status: st.status?.status,
              }))

              // Tags
              const tags = (t.tags || []).map(tg => tg.name)

              trackTasks.push({
                id: t.id,
                customId: t.custom_id,
                name: t.name,
                status: t.status?.status,
                priority: t.priority?.priority,
                points: t.points,
                assignees,
                tags,
                dueDate: t.due_date ? new Date(parseInt(t.due_date)).toISOString().slice(0, 10) : null,
                startDate: t.start_date ? new Date(parseInt(t.start_date)).toISOString().slice(0, 10) : null,
                subtaskCount: subtasks.length,
                subtasks: subtasks.length > 0 ? subtasks : undefined,
                url: t.url,
              })
            }

            trackResults.push({
              track: list.name,
              listId: list.id,
              taskCount: trackTasks.length,
              tasks: trackTasks,
            })
          }

          const pct = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0

          result = {
            sprint: { folderId: folder.id, name: folder.name, ...meta },
            summary: { totalTasks, done: totalDone, inProgress: totalInProgress, blocked: totalBlocked, todo: totalTodo, completionPct: pct },
            tracks: trackResults,
            byAssignee: assigneeSummary,
            filters: { assignee: assigneeFilter, status: statusFilter },
          }
          break
        }

        case 'import': {
          if (!args['folder-id'] || !args.file) { result = { error: '--folder-id and --file (JSON path) required' }; break }

          const { readFileSync, writeFileSync, existsSync } = require('node:fs')
          const { resolve } = require('node:path')
          let plan
          try {
            plan = JSON.parse(readFileSync(args.file, 'utf-8'))
          } catch (e) {
            result = { error: `Failed to read/parse ${args.file}: ${e.message}` }; break
          }

          // Resolve member map for assignees (name/email → userId)
          let memberMap = {}
          if (args['team-id']) {
            const teamRes = await api('GET', `/team/${args['team-id']}`)
            for (const m of (teamRes.team?.members || [])) {
              const u = m.user || {}
              if (u.username) memberMap[u.username.toLowerCase()] = u.id
              if (u.email) memberMap[u.email.toLowerCase()] = u.id
              if (u.initials) memberMap[u.initials.toLowerCase()] = u.id
            }
          }

          // Get lists in folder
          const listsRes = await api('GET', `/folder/${args['folder-id']}/list?archived=false`)
          const lists = listsRes.lists || []
          const listByTrack = {}
          for (const l of lists) {
            const trackMatch = l.name.match(/^\d+-(\w+)/)
            if (trackMatch) listByTrack[trackMatch[1].toLowerCase()] = l.id
          }

          const created = []
          const failed = []
          const tasks = plan.tasks || plan

          // Pre-import validation
          if (!validateAllTasks(tasks, args['skip-validation'])) {
            result = { error: 'Validação falhou. Tasks com score < 30 precisam de enriquecimento. Use --skip-validation para bypass.' }
            break
          }

          for (const task of tasks) {
            const track = (task.area || task.track || 'backend').toLowerCase()
            const listId = listByTrack[track] || lists[0]?.id
            if (!listId) { failed.push({ task: task.id, error: `No list for track: ${track}` }); continue }

            // Sanitize texts (accent fixes + AI pattern detection)
            const { task: sanitized, aiPatternCount } = sanitizeTaskTexts({ ...task })
            if (aiPatternCount >= 3) {
              console.warn(`⚠ Task "${sanitized.title}": ${aiPatternCount} padrões de IA detectados. Considere revisar com /humanizer.`)
            }

            const body = {
              name: sanitized.title || sanitized.name,
              description: buildTaskDescription(sanitized),
              tags: [sanitized.id, `track:${track}`].filter(Boolean),
            }
            if (sanitized.priority) {
              const pMap = { P0: 1, P1: 2, P2: 3 }
              body.priority = pMap[sanitized.priority] || 3
            }
            if (sanitized.points) body.points = sanitized.points
            if (sanitized.status) body.status = sanitized.status
            if (sanitized.estimatedHours) body.time_estimate = sanitized.estimatedHours * 3600000

            // Resolve assignees from task.assignee or task.assignees
            const rawAssignees = sanitized.assignees || (sanitized.assignee ? [sanitized.assignee] : [])
            if (rawAssignees.length > 0) {
              const ids = rawAssignees.map(a => {
                if (typeof a === 'number') return a
                return memberMap[String(a).toLowerCase()] || null
              }).filter(Boolean)
              if (ids.length > 0) body.assignees = ids
            }

            const res = await apiWithDelay('POST', `/list/${listId}/task`, body)
            if (res.id) {
              created.push({ localId: sanitized.id, clickupId: res.id, name: body.name, track })

              // Create subtasks if present
              if (sanitized.subtasks?.length) {
                for (const st of sanitized.subtasks) {
                  const stBody = {
                    name: st.title || st.name,
                    parent: res.id,
                    description: st.description || '',
                  }
                  const stAssignees = st.assignees || (st.assignee ? [st.assignee] : [])
                  if (stAssignees.length > 0) {
                    const stIds = stAssignees.map(a => typeof a === 'number' ? a : memberMap[String(a).toLowerCase()] || null).filter(Boolean)
                    if (stIds.length > 0) stBody.assignees = stIds
                  }
                  const stRes = await apiWithDelay('POST', `/list/${listId}/task`, stBody)
                  if (stRes.id) created.push({ localId: st.id, clickupId: stRes.id, name: stBody.name, parent: res.id })
                }
              }

              // Create checklist from acceptanceCriteria if present
              if (sanitized.acceptanceCriteria?.length > 0) {
                const clRes = await apiWithDelay('POST', `/task/${res.id}/checklist`, { name: 'Acceptance Criteria' })
                if (clRes.checklist?.id) {
                  for (const ac of sanitized.acceptanceCriteria) {
                    await apiWithDelay('POST', `/checklist/${clRes.checklist.id}/checklist_item`, { name: ac })
                  }
                }
              }

              // Create checklist from steps if present
              if (sanitized.steps?.length > 0) {
                const stepsRes = await apiWithDelay('POST', `/task/${res.id}/checklist`, { name: 'Implementation Steps' })
                if (stepsRes.checklist?.id) {
                  for (const step of sanitized.steps) {
                    await apiWithDelay('POST', `/checklist/${stepsRes.checklist.id}/checklist_item`, { name: step })
                  }
                }
              }
            } else {
              failed.push({ task: sanitized.id, error: res.error || res.err || 'unknown' })
            }
          }

          // Auto-populate sprint registry (G1)
          if (created.length > 0) {
            try {
              const repoRoot = process.cwd()
              const registryPaths = [
                resolve(repoRoot, 'data/sprints/registry.json'),
                resolve(repoRoot, '.a8z/data/sprints/registry.json'),
              ]
              const registryPath = registryPaths.find(p => existsSync(p)) || registryPaths[0]
              let registry = { version: '1.0', sprints: [], taskMap: {} }
              if (existsSync(registryPath)) {
                try { registry = JSON.parse(readFileSync(registryPath, 'utf-8')) } catch {}
              }

              // Update taskMap
              for (const c of created) {
                if (c.localId && !c.parent) registry.taskMap[c.localId] = c.clickupId
              }

              // Add sprint entry if plan has sprint metadata
              const sprintMeta = plan.sprint || {}
              if (sprintMeta.id || args['sprint-id']) {
                const sprintId = sprintMeta.id || args['sprint-id']
                const existing = registry.sprints.findIndex(s => s.id === sprintId)
                const entry = {
                  id: sprintId,
                  folderId: args['folder-id'],
                  name: sprintMeta.name || '',
                  start: sprintMeta.startDate || sprintMeta.start || '',
                  end: sprintMeta.endDate || sprintMeta.end || '',
                  importedAt: new Date().toISOString(),
                }
                if (existing >= 0) registry.sprints[existing] = entry
                else registry.sprints.push(entry)
              }

              writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n')
            } catch (regErr) {
              // Registry save is best-effort, don't fail the import
              result = { imported: created.length, failed: failed.length, created, errors: failed, registryWarning: regErr.message }
              break
            }
          }

          result = { imported: created.length, failed: failed.length, created, errors: failed, registrySaved: created.length > 0 }
          break
        }

        default:
          result = { error: 'Unknown sprint subcommand. Use: create, status, import' }
      }
      break

    // === CHECKLIST ===
    case 'checklist':
      switch (sub) {
        case 'create': {
          if (!args['task-id'] || !args.name) { result = { error: '--task-id and --name required' }; break }
          result = await api('POST', `/task/${args['task-id']}/checklist`, { name: args.name })
          break
        }
        case 'add-item': {
          if (!args['checklist-id'] || !args.name) { result = { error: '--checklist-id and --name required' }; break }
          result = await api('POST', `/checklist/${args['checklist-id']}/checklist_item`, { name: args.name })
          break
        }
        case 'list': {
          if (!args['task-id']) { result = { error: '--task-id required' }; break }
          const taskRes = await api('GET', `/task/${args['task-id']}`)
          const checklists = (taskRes.checklists || []).map(cl => ({
            id: cl.id,
            name: cl.name,
            items: (cl.items || []).map(it => ({
              id: it.id,
              name: it.name,
              resolved: it.resolved,
            })),
          }))
          result = { taskId: args['task-id'], checklists, count: checklists.length }
          break
        }
        default:
          result = { error: 'Unknown checklist subcommand. Use: create, add-item, list' }
      }
      break

    // === DEFAULT (help) ===
    default:
      result = {
        error: cmd ? `Unknown command: ${cmd}` : 'No command provided',
        usage: {
          workspace: 'workspace [list|members] --team-id <id>',
          space: 'space [list|get] [id] --team-id <id>',
          folder: 'folder [list|get|create] [id] --space-id <id> --name <name>',
          list: 'list [list|create] --folder-id <id> --name <name>',
          task: 'task [list|get|create|update|delete|enrich] [id] --list-id <id> --task-id <id> --name <name> [--assignees id1,id2] [--file enriched.json]',
          subtask: 'subtask create --list-id <id> --parent <id> --name <name>',
          field: 'field [list|set] --list-id <id> --task-id <id> --field-id <id> --value <val>',
          tag: 'tag add --task-id <id> --tag <name>',
          comment: 'comment [create|list] --task-id <id> --text <text>',
          checklist: 'checklist [create|add-item|list] --task-id <id> --checklist-id <id> --name <name>',
          sprint: {
            create: 'sprint create --space-id <id> --name <name> --start YYYY-MM-DD --end YYYY-MM-DD [--tracks backend,frontend] [--id S01]',
            get: 'sprint get --folder-id <id> [--assignee <name/email>] [--status <status>]',
            status: 'sprint status --folder-id <id>',
            import: 'sprint import --folder-id <id> --file <plan.json> [--team-id <id>] [--sprint-id S01] [--skip-validation]',
          },
        },
        flags: {
          '--dry-run': 'Show request without executing',
          '--skip-validation': 'Skip task completeness validation on sprint import',
        }
      }
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch(err => {
  console.error(JSON.stringify({ error: err.message }))
  process.exit(1)
})
