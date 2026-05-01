#!/usr/bin/env node
/**
 * plan-status — state machine para status de planos e tasks.
 *
 * Estados: pendente → em-andamento → validacao → concluido
 * Com flag --rollback, qualquer estado pode voltar para pendente.
 *
 * Uso:
 *   node plan-status.js validate <atual> <novo>
 *   node plan-status.js validate em-andamento concluido     # falha
 *   node plan-status.js validate em-andamento validacao     # ok
 */

const STATES = ['pendente', 'em-andamento', 'validacao', 'concluido'];

const VALID = {
  'pendente':       new Set(['em-andamento']),
  'em-andamento':   new Set(['validacao']),
  'validacao':      new Set(['concluido', 'em-andamento']), // permite voltar p/ ajustes
  'concluido':      new Set([]), // só com --rollback
};

function isValid(from, to, { rollback = false } = {}) {
  if (!STATES.includes(from)) return { ok: false, error: `estado inválido: ${from}` };
  if (!STATES.includes(to))   return { ok: false, error: `estado inválido: ${to}` };
  if (from === to) return { ok: true, noop: true };
  if (rollback && to === 'pendente') return { ok: true };
  if (VALID[from].has(to)) return { ok: true };
  return { ok: false, error: `transição inválida: ${from} → ${to}` };
}

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd !== 'validate') { console.error('uso: validate <from> <to> [--rollback]'); process.exit(2); }
  const [from, to] = rest;
  const rollback = rest.includes('--rollback');
  const result = isValid(from, to, { rollback });
  if (!result.ok) { console.error(result.error); process.exit(1); }
  console.log(result.noop ? 'noop' : 'ok');
}

if (require.main === module) main();

module.exports = { STATES, VALID, isValid };
