#!/usr/bin/env node

// slack-notify.js — Slack notification tool (zero-dep)
// Usage: node slack-notify.js <command> [--options]
// Auth:
//   - Webhook commands (send, task-done, sprint-summary): SLACK_WEBHOOK_URL
//   - Web API commands (fetch-thread, find-thread): SLACK_BOT_TOKEN

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL
const BOT_TOKEN = process.env.SLACK_BOT_TOKEN

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

const WEBHOOK_COMMANDS = new Set(['send', 'task-done', 'sprint-summary'])
const API_COMMANDS = new Set(['fetch-thread', 'find-thread'])

if (WEBHOOK_COMMANDS.has(cmd) && !WEBHOOK_URL) {
  console.log(JSON.stringify({ skipped: true, reason: 'SLACK_WEBHOOK_URL not set' }))
  process.exit(0)
}

if (API_COMMANDS.has(cmd) && !BOT_TOKEN) {
  console.log(JSON.stringify({ error: 'SLACK_BOT_TOKEN not set (required for Web API commands)' }))
  process.exit(0)
}

async function sendWebhook(payload) {
  if (args['dry-run']) {
    return { _dry_run: true, url: WEBHOOK_URL.replace(/\/[^/]{6,}$/, '/***'), payload }
  }

  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const text = await res.text()
  if (res.ok) {
    return { sent: true, status: res.status }
  }
  return { sent: false, status: res.status, body: text }
}

async function slackApi(method, params) {
  if (args['dry-run']) {
    return { _dry_run: true, method, params: { ...params, token: '***' } }
  }
  const body = new URLSearchParams(params).toString()
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${BOT_TOKEN}`,
    },
    body,
  })
  return res.json()
}

function escapeSlack(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildTaskDonePayload(taskId, commit, author, extra = {}) {
  const sprint = extra.sprint || ''
  const track = extra.track || ''
  const message = extra.message || ''

  const lines = [`*:white_check_mark: Task Concluída*`]
  lines.push(`>*Task:* ${escapeSlack(taskId)}${message ? ` — ${escapeSlack(message)}` : ''}`)
  if (sprint) lines.push(`>*Sprint:* ${escapeSlack(sprint)}`)
  if (track) lines.push(`>*Track:* ${escapeSlack(track)}`)
  lines.push(`>*Commit:* \`${escapeSlack(commit.slice(0, 7))}\`${message ? ` — ${escapeSlack(message)}` : ''}`)
  lines.push(`>*Author:* ${escapeSlack(author)}`)

  return { text: lines.join('\n') }
}

function buildSprintSummaryPayload(data) {
  const summary = data.summary || data
  const name = data.sprint?.name || data.name || 'Sprint'
  const now = Math.floor(Date.now() / 1000)

  return {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `:bar_chart: ${name} — Status Update` }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Total:*\n${summary.totalTasks || 0} tasks` },
          { type: 'mrkdwn', text: `*Done:*\n${summary.done || 0} (${summary.completionPct || 0}%)` }
        ]
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*In Progress:*\n${summary.inProgress || 0}` },
          { type: 'mrkdwn', text: `*Blocked:*\n${summary.blocked || 0}` }
        ]
      },
      { type: 'divider' },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `Updated: <!date^${now}^{date_short} {time}|${new Date().toISOString()}>` }
        ]
      }
    ]
  }
}

async function main() {
  let result

  switch (cmd) {
    case 'send': {
      if (args.text) {
        result = await sendWebhook({ text: args.text })
      } else if (args['blocks-file']) {
        const { readFileSync } = require('node:fs')
        try {
          const payload = JSON.parse(readFileSync(args['blocks-file'], 'utf-8'))
          result = await sendWebhook(payload)
        } catch (e) {
          result = { error: `Failed to read ${args['blocks-file']}: ${e.message}` }
        }
      } else {
        result = { error: '--text or --blocks-file required' }
      }
      break
    }

    case 'task-done': {
      if (!args.task || !args.commit || !args.author) {
        result = { error: '--task, --commit, and --author required' }; break
      }
      const payload = buildTaskDonePayload(args.task, args.commit, args.author, {
        sprint: args.sprint,
        track: args.track,
        message: args.message,
      })
      result = await sendWebhook(payload)
      break
    }

    case 'sprint-summary': {
      if (!args.file) { result = { error: '--file (sprint status JSON) required' }; break }
      const { readFileSync } = require('node:fs')
      try {
        const data = JSON.parse(readFileSync(args.file, 'utf-8'))
        const payload = buildSprintSummaryPayload(data)
        result = await sendWebhook(payload)
      } catch (e) {
        result = { error: `Failed to read ${args.file}: ${e.message}` }
      }
      break
    }

    case 'fetch-thread': {
      const channel = args['channel-id'] || process.env.SLACK_CHANNEL_ID_WEEKLY
      const ts = args['thread-ts'] || args.ts
      if (!channel || !ts) {
        result = { error: '--channel-id (or SLACK_CHANNEL_ID_WEEKLY) and --thread-ts required' }
        break
      }
      const limit = args.limit || '100'
      const api = await slackApi('conversations.replies', { channel, ts, limit })
      if (!api.ok) {
        result = { ok: false, error: api.error, needed: api.needed }
        break
      }
      const messages = (api.messages || []).map(m => ({
        user: m.user,
        ts: m.ts,
        text: m.text || '',
        reply_count: m.reply_count,
      }))
      result = { ok: true, count: messages.length, messages }
      break
    }

    case 'find-thread': {
      const channel = args['channel-id'] || process.env.SLACK_CHANNEL_ID_WEEKLY
      const pattern = args.pattern
      if (!channel || !pattern) {
        result = { error: '--channel-id (or SLACK_CHANNEL_ID_WEEKLY) and --pattern required' }
        break
      }
      const api = await slackApi('conversations.history', { channel, limit: args.limit || '50' })
      if (!api.ok) {
        result = { ok: false, error: api.error, needed: api.needed }
        break
      }
      const re = new RegExp(pattern, 'i')
      const match = (api.messages || []).find(m => re.test(m.text || ''))
      if (!match) {
        result = { found: false }
        break
      }
      result = {
        found: true,
        ts: match.ts,
        text_preview: (match.text || '').slice(0, 200),
      }
      break
    }

    default:
      result = {
        error: cmd ? `Unknown command: ${cmd}` : 'No command provided',
        usage: {
          send: 'send --text "Hello *bold* _italic_" | send --blocks-file payload.json',
          'task-done': 'task-done --task T-001 --commit abc1234 --author "Name" [--sprint "S01"] [--track backend] [--message "feat: ..."]',
          'sprint-summary': 'sprint-summary --file sprint-status.json',
          'fetch-thread': 'fetch-thread --channel-id C... --thread-ts 1234567890.123456 [--limit 100]',
          'find-thread': 'find-thread --channel-id C... --pattern "regex" [--limit 50]',
        },
        auth: {
          webhook_commands: 'send, task-done, sprint-summary — require SLACK_WEBHOOK_URL',
          api_commands: 'fetch-thread, find-thread — require SLACK_BOT_TOKEN (scopes: groups:history for private channels)',
        },
        formatting: {
          bold: '*text*',
          italic: '_text_',
          strike: '~text~',
          code: '`code`',
          codeBlock: '```multi-line```',
          quote: '>quoted text',
          link: '<url|display text>',
          mention: '<@USER_ID>',
          channel: '<#CHANNEL_ID>',
          date: '<!date^UNIX_TS^{date_short} {time}|fallback>',
        },
        flags: {
          '--dry-run': 'Show payload without sending',
        }
      }
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch(err => {
  console.error(JSON.stringify({ error: err.message }))
  process.exit(0) // Always exit 0 — notification failure should never block
})
