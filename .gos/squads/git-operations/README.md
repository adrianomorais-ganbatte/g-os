# Git Operations Squad

Squad para operacoes git seguras com validacao de identidade SSH e quality gate pre-commit.

## Agentes

| Agente | Papel |
|--------|-------|
| devops | SSH setup, validacao de remote, push seguro |
| dev | Quality gate (tsc + testes), staging, commit |

## Workflows

| Workflow | Fases |
|----------|-------|
| wf-ssh-setup | detect → key-check → configure → validate → identity |
| wf-safe-commit | validate → pre-check → stage → commit → safe-push |

## Triggers

- "configurar ssh" → devops (wf-ssh-setup)
- "commit e push" → dev (wf-safe-commit)
- "validar ssh" → devops

## Dependencias

- Skill: `git-ssh-setup` (configuracao SSH)
- Skill: `commit-dev` (commit com Conventional Commits)
- Script: `scripts/hooks/pre-commit-validate.js` (quality gate)
- Config local: `.gos-local/ssh-identity.json` ou `.a8z/local/ssh-identity.json`
