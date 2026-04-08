#!/usr/bin/env node

// post-commit-notify.js — Post-commit hook: marks tasks done in ClickUp + notifies Slack
// Trigger: Claude Code Stop hook or git post-commit
// Rule: ALWAYS exit 0 (observation hook, never blocks)

const { execFileSync } = require('node:child_process')
const { existsSync, readFileSync } = require('node:fs')
const { resolve } = require('node:path')

// Find repo root
function findRepoRoot() {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf-8' }).trim()
  } catch {
    return process.cwd()
  }
}

// Parse last commit
function getLastCommit() {
  try {
    const log = execFileSync('git', ['log', '-1', '--format=%H|%s|%an'], { encoding: 'utf-8' }).trim()
    const sepIdx = log.indexOf('|')
    const hash = log.slice(0, sepIdx)
    const rest = log.slice(sepIdx + 1)
    const lastSep = rest.lastIndexOf('|')
    const message = rest.slice(0, lastSep)
    const author = rest.slice(lastSep + 1)
    return { hash, message, author }
  } catch {
    return null
  }
}

// Extract task refs from commit message (T-NNN pattern)
function extractTaskRefs(message) {
  const matches = message.match(/\bT-(\d{3})\b/g)
  return matches ? [...new Set(matches)] : []
}

// Load sprint registry to resolve local IDs -> ClickUp IDs
function loadRegistry(repoRoot) {
  const paths = [
    resolve(repoRoot, 'data/sprints/registry.json'),
    resolve(repoRoot, '.gos/data/sprints/registry.json'),
  ]
  for (const p of paths) {
    if (existsSync(p)) {
      try {
        return { data: JSON.parse(readFileSync(p, 'utf-8')), path: p }
      } catch { continue }
    }
  }
  return { data: { version: '1.0', sprints: [], taskMap: {}, taskSprintMap: {} }, path: paths[0] }
}

// Run a CLI tool safely (no shell injection)
function runTool(repoRoot, tool, toolArgs) {
  const toolPaths = [
    resolve(repoRoot, `.gos/scripts/tools/${tool}`),
    resolve(repoRoot, `scripts/tools/${tool}`),
  ]
  const toolPath = toolPaths.find(p => existsSync(p))
  if (!toolPath) return null

  try {
    const result = execFileSync('node', [toolPath, ...toolArgs], {
      encoding: 'utf-8',
      timeout: 15000,
      env: process.env,
    })
    return JSON.parse(result)
  } catch (e) {
    return { error: e.message }
  }
}

// Detect if commit implies task completion
function isCompletionCommit(message) {
  const completionPatterns = [
    /^feat[:(]/i,
    /^fix[:(]/i,
    /\b(close[sd]?|complete[sd]?|finish|done|resolve[sd]?)\b/i,
  ]
  return completionPatterns.some(p => p.test(message))
}

// Detect if commit is a start/WIP commit
function isStartCommit(message) {
  const startPatterns = [
    /^(wip|chore|progress|draft|start|refactor|test|docs|style)[:(]/i,
    /\b(wip|in.?progress|draft|start)\b/i,
  ]
  return startPatterns.some(p => p.test(message))
}

// Find sprint for a task reference
function findSprintForTask(registry, taskRef) {
  if (registry.taskSprintMap?.[taskRef]) {
    return registry.sprints.find(s => s.id === registry.taskSprintMap[taskRef]) || null
  }
  return registry.sprints.filter(s => !s.end || new Date(s.end) >= new Date())
    .sort((a, b) => new Date(b.start) - new Date(a.start))[0] || null
}

async function main() {
  const repoRoot = findRepoRoot()
  const commit = getLastCommit()
  if (!commit) return

  const taskRefs = extractTaskRefs(commit.message)
  if (taskRefs.length === 0) return

  const hasClickUp = !!process.env.CLICKUP_API_KEY
  const hasSlack = !!process.env.SLACK_WEBHOOK_URL
  if (!hasClickUp && !hasSlack) return

  const { data: registry } = loadRegistry(repoRoot)
  const shouldComplete = isCompletionCommit(commit.message)
  const shouldStart = isStartCommit(commit.message)

  for (const ref of taskRefs) {
    const clickupId = registry.taskMap?.[ref]

    // Update ClickUp task status
    if (hasClickUp && clickupId) {
      if (shouldComplete) {
        runTool(repoRoot, 'clickup.js', ['task', 'update', '--task-id', clickupId, '--status', 'complete'])
      } else if (shouldStart) {
        runTool(repoRoot, 'clickup.js', ['task', 'update', '--task-id', clickupId, '--status', 'in progress'])
      }
    }

    // Notify Slack
    if (hasSlack) {
      const status = shouldComplete ? 'concluida' : shouldStart ? 'em andamento' : 'atualizada'
      runTool(repoRoot, 'slack-notify.js', [
        'task-update',
        '--task', ref,
        '--status', status,
        '--commit', commit.hash,
        '--author', commit.author,
        '--message', commit.message,
      ])
    }

    // Sprint completion check (if task completed)
    if (shouldComplete) {
      const sprint = findSprintForTask(registry, ref)
      if (sprint) {
        const tasksInSprint = Object.entries(registry.taskSprintMap || {})
          .filter(([, sid]) => sid === sprint.id)
          .map(([tid]) => tid)
        const completedTasks = tasksInSprint.filter(tid => {
          const cuId = registry.taskMap?.[tid]
          if (!cuId) return false
          return true
        })
        if (tasksInSprint.length > 0 && completedTasks.length === tasksInSprint.length) {
          if (hasSlack) {
            runTool(repoRoot, 'slack-notify.js', [
              'sprint-complete',
              '--sprint', sprint.id,
              '--name', sprint.name,
              '--tasks', tasksInSprint.join(', '),
            ])
          }
        }
      }
    }
  }
}

main().catch(() => {}).finally(() => process.exit(0))
