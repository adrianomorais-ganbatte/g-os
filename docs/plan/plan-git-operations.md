# Plan: Sistema de Git Operations com SSH Identity e Quality Gate

**Data:** 2026-04-01
**Status:** Implementado
**Escopo:** .a8z-OS + G-OS

## Problema

Dois problemas resolvidos:

1. **Identidade SSH** — Ao gerenciar multiplas contas GitHub via SSH aliases, agentes podem usar a identidade errada ou expor nomes de alias em output. Cada workspace precisa saber qual alias usar, e essa info tem que ficar local (gitignored).

2. **Quality Gate pre-commit** — Commits iam para o repo sem validacao de TypeScript (`tsc --noEmit`) ou testes. Agora o agente roda ambos antes de commitar, e se houver erro, corrige antes de prosseguir.

## Solucao

### Identidade SSH Local

Arquivo `ssh-identity.json` gravado em diretorio gitignored (`.gos-local/` ou `.a8z/local/`). Contem o alias SSH, git user e timestamp de validacao. Lido pela skill `commit-dev` antes de cada push.

### Quality Gate Pre-Commit

Script `scripts/hooks/pre-commit-validate.js` roda `tsc --noEmit` e testes do projeto. Integrado na skill `commit-dev` como passo obrigatorio antes do commit. Se falhar, o agente corrige e retenta (max 2 vezes).

### Mascaramento de alias

Alias SSH reais nao aparecem em nenhum output. Placeholder: `[configured-ssh-identity]`.

## Componentes criados

| Componente | Path | Tipo |
|-----------|------|------|
| git-ssh-setup | `skills/git-ssh-setup/SKILL.md` | Skill |
| pre-commit-validate | `scripts/hooks/pre-commit-validate.js` | Script |
| ssh-multi-account-setup | `playbooks/ssh-multi-account-setup.md` | Playbook |
| git-operations | `squads/git-operations/` | Squad |
| wf-ssh-setup | `squads/git-operations/workflows/wf-ssh-setup.yaml` | Workflow |
| wf-safe-commit | `squads/git-operations/workflows/wf-safe-commit.yaml` | Workflow |

## Componentes modificados

| Componente | Path | Mudanca |
|-----------|------|---------|
| commit-dev | `skills/git-commit/SKILL.md` | Quality gate + SSH validation + mascaramento |
| devops agent | `agents/profiles/devops.md` | Comando ssh-setup + principio SSH protection |
| registries | `skills/registry.json` | Entrada git-ssh-setup |
| manifestos | `manifests/*.json` | copyMap e modulos atualizados |

## Tasks detalhadas

Ver `docs/stacks/stack-git-operations.md`.
