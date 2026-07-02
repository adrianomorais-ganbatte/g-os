#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

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

function readState(sessionId) {
  const statePath = path.join(STATE_DIR, `${sessionId}.json`);
  if (!fs.existsSync(statePath)) {
    return { statePath, state: null };
  }
  try {
    return {
      statePath,
      state: JSON.parse(fs.readFileSync(statePath, "utf8")),
    };
  } catch {
    return { statePath, state: null };
  }
}

function safeUnlink(filePath) {
  try {
    fs.unlinkSync(filePath);
  } catch {
    // ignore cleanup issues
  }
}

function runNpm(args, options = {}) {
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  return execFileSync(npmCmd, args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
    timeout: options.timeout || 120000,
  });
}

function getGitStatusMap(paths) {
  const map = new Map();
  if (!Array.isArray(paths) || paths.length === 0) return map;

  try {
    const output = execFileSync("git", ["status", "--porcelain", "--", ...paths], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 15000,
    });

    for (const line of output.split(/\r?\n/)) {
      if (!line.trim()) continue;
      const status = line.slice(0, 2);
      const filePath = line.slice(3).trim().replace(/\\/g, "/");
      map.set(filePath, status);
    }
  } catch {
    // ignore git issues
  }

  return map;
}

function anyPathMatches(paths, matcher) {
  return paths.some((filePath) => matcher.test(filePath));
}

function anyCreatedOrRemoved(statusMap, matcher) {
  for (const [filePath, status] of statusMap.entries()) {
    if (!matcher.test(filePath)) continue;
    if (status.includes("A") || status.includes("D") || status.includes("R") || status === "??") {
      return true;
    }
  }
  return false;
}

function main() {
  const payload = parsePayload();
  const sessionId = getSessionId(payload);
  const { statePath, state } = readState(sessionId);

  if (!state || !state.significantAction) {
    safeUnlink(statePath);
    return;
  }

  const touchedFiles = Array.isArray(state.touchedFiles) ? state.touchedFiles : [];
  const statusMap = getGitStatusMap(touchedFiles);
  const summary = [];
  const syncMatcher = /^(\.gos|\.claude|data|README\.md|CLAUDE\.md|AGENTS\.md|GEMINI\.md)/;

  if (anyPathMatches(touchedFiles, syncMatcher)) {
    try {
      runNpm(["run", "sync:ides"], { timeout: 180000 });
      summary.push("sync:ides OK");

      if (anyCreatedOrRemoved(statusMap, /^(\.gos|\.claude)\//)) {
        runNpm(["run", "doctor"], { timeout: 180000 });
        summary.push("doctor OK");
      }
    } catch (error) {
      const message = error.stderr || error.stdout || error.message || "falha no sync";
      summary.push(`sync:ides falhou (${String(message).split(/\r?\n/)[0]})`);
    }
  }

  safeUnlink(statePath);

  if (summary.length > 0) {
    process.stdout.write(`${summary.join("; ")}\n`);
  }
}

try {
  main();
} catch {
  // observation hook: never block
}
