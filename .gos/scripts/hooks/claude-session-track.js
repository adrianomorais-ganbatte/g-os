#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "../../..");
const STATE_DIR = path.join(ROOT, ".claude", ".hook-state");

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function parsePayload() {
  const raw = readStdin().trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function getSessionId(payload) {
  return (
    payload.session_id ||
    payload.sessionId ||
    payload.conversation_id ||
    payload.conversationId ||
    "default"
  );
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function statePathFor(sessionId) {
  return path.join(STATE_DIR, `${sessionId}.json`);
}

function readState(statePath, sessionId) {
  if (!fs.existsSync(statePath)) {
    return {
      sessionId,
      touchedFiles: [],
      commands: [],
      gitCommit: false,
      lastCommitMessage: "",
      taskRefs: [],
      significantAction: false,
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    return JSON.parse(fs.readFileSync(statePath, "utf8"));
  } catch {
    return {
      sessionId,
      touchedFiles: [],
      commands: [],
      gitCommit: false,
      lastCommitMessage: "",
      taskRefs: [],
      significantAction: false,
      updatedAt: new Date().toISOString(),
    };
  }
}

function uniquePush(list, value) {
  if (!value || list.includes(value)) return;
  list.push(value);
}

function normalizePath(candidate) {
  if (typeof candidate !== "string" || !candidate.trim()) return null;
  const trimmed = candidate.trim();
  const absolute = path.isAbsolute(trimmed) ? trimmed : path.join(ROOT, trimmed);
  const normalized = path.normalize(absolute);
  if (!normalized.startsWith(ROOT)) return null;
  return path.relative(ROOT, normalized).replace(/\\/g, "/");
}

function collectPaths(payload) {
  const args = payload.args || payload.arguments || {};
  const candidates = [
    args.file_path,
    args.path,
    args.target_file,
    args.new_file_path,
    payload.file_path,
    payload.path,
  ];

  const result = [];
  for (const candidate of candidates) {
    const normalized = normalizePath(candidate);
    if (normalized) uniquePush(result, normalized);
  }
  return result;
}

function extractCommand(payload) {
  const args = payload.args || payload.arguments || {};
  return (
    args.command ||
    args.cmd ||
    payload.command ||
    payload.cmd ||
    ""
  ).trim();
}

function main() {
  const payload = parsePayload();
  const sessionId = getSessionId(payload);
  const statePath = statePathFor(sessionId);

  ensureDir(STATE_DIR);
  const state = readState(statePath, sessionId);

  for (const filePath of collectPaths(payload)) {
    uniquePush(state.touchedFiles, filePath);
  }

  const toolName = String(payload.tool || payload.tool_name || payload.matcher || "");
  if (/Bash/i.test(toolName)) {
    const command = extractCommand(payload);
    if (command) {
      uniquePush(state.commands, command);
      if (/\bgit\s+commit\b/i.test(command)) {
        state.gitCommit = true;
        const msgMatch = command.match(/-m\s+["']([^"']+)["']/);
        if (msgMatch) {
          const message = msgMatch[1].trim();
          state.lastCommitMessage = message;
          const refs = message.match(/\bT-\d{3}\b/g);
          if (refs) state.taskRefs = [...new Set(refs)];
        }
      }
    }
  }

  if (state.touchedFiles.length > 0 || state.commands.length > 0) {
    state.significantAction = true;
  }

  state.updatedAt = new Date().toISOString();
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

try {
  main();
} catch {
  // observation hook: never block
}
