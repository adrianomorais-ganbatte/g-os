---
name: "git-ssh-setup"
description: >
  Configura identidade SSH para o workspace atual. Detecta aliases SSH existentes,
  valida conexao, grava arquivo local de identidade e seta git user.name/email.
  Use quando precisar configurar ou reconfigurar a identidade SSH do projeto.
argument-hint: "[ssh-alias-name] ou 'detect' para auto-descoberta"
use-when:
  - ao clonar ou inicializar um novo workspace/repositorio
  - quando git push falha com erro de autenticacao SSH
  - ao trocar de conta GitHub para o projeto
  - quando o safe-commit detecta que nao ha ssh-identity.json
do-not-use-for:
  - fazer commits ou push (use commit-dev)
  - gerar chaves SSH do zero (use playbook ssh-multi-account-setup)
  - operacoes git genericas (use commit-dev ou finishing-branch)
metadata:
  category: workflow-automation
---

# Skill: Git SSH Setup

## When to Use this skill
- Ao inicializar um workspace novo e precisar vincular a conta GitHub correta.
- Quando push falha com "Permission denied (publickey)".
- Ao trocar de conta GitHub para um projeto especifico.
- Quando a skill commit-dev avisa que nao ha `ssh-identity.json`.

## Do not use
- Para fazer commits ou push — use `commit-dev`.
- Para gerar chaves SSH do zero — siga o playbook `ssh-multi-account-setup`.

## Instructions

### Passo 1: Detectar framework

Verificar qual framework esta ativo:
- Se `.gos-local/` existe ou `package.json` tem `name: "g-os"` → **G-OS**. Local dir: `.gos-local/`
- Se `.a8z/` existe → **.a8z-OS**. Local dir: `.a8z/local/`
- Se nenhum: informar ao usuario que o workspace nao pertence a nenhum framework.

### Passo 2: Verificar config existente

Ler `<local-dir>/ssh-identity.json` se existir:
```json
{
  "version": "1.0.0",
  "sshAlias": "<host-alias>",
  "gitUser": { "name": "Nome", "email": "user@noreply.github.com" },
  "remote": "origin",
  "validated": true,
  "lastValidated": "2026-04-01T10:00:00Z"
}
```

Se ja existe e `validated: true`: informar que ja esta configurado (mascarar alias como `[configured-ssh-identity]`). Perguntar se quer reconfigurar.

### Passo 3: Descobrir alias via remote URL

```bash
git remote get-url origin
```

Extrair o host da URL (parte entre `@` e `:`).
- Se formato `git@<alias>:<org>/<repo>.git` → o `<alias>` e o host SSH.
- Se formato `https://github.com/...` → avisar que o remote usa HTTPS e perguntar qual alias SSH usar.

### Passo 4: Validar conexao

```bash
ssh -T git@<alias> 2>&1
```

Verificar se retorna "successfully authenticated". Reportar resultado SEM mostrar o alias real:
- Sucesso: "Conexao SSH validada com [configured-ssh-identity]."
- Falha: "Falha na conexao SSH. Verifique se a chave esta carregada no ssh-agent."

### Passo 5: Configurar git identity local

```bash
git config user.name "<nome>"
git config user.email "<email>"
```

Perguntar ao usuario qual nome e email usar para este workspace.

### Passo 6: Gravar ssh-identity.json

Garantir que `<local-dir>/` existe (criar se nao). Escrever `ssh-identity.json`:

```json
{
  "version": "1.0.0",
  "sshAlias": "<alias-detectado>",
  "gitUser": {
    "name": "<nome-configurado>",
    "email": "<email-configurado>"
  },
  "remote": "origin",
  "validated": true,
  "lastValidated": "<ISO-timestamp>"
}
```

### Passo 7: Confirmacao

Exibir resumo mascarado:
```
SSH Identity configurada:
  Framework: G-OS / .a8z-OS
  Remote: origin
  Identity: [configured-ssh-identity]
  Git user: <nome> <email>
  Validado: sim
```

## Regras de Seguranca

1. **NUNCA** imprimir o valor real de `sshAlias` em output, logs, PRs ou documentacao.
2. Usar `[configured-ssh-identity]` como placeholder em toda comunicacao.
3. Se o usuario pedir para ver o alias, orientar a ler o arquivo diretamente:
   - G-OS: `cat .gos-local/ssh-identity.json`
   - .a8z-OS: `cat .a8z/local/ssh-identity.json`
4. Nunca incluir o alias em commit messages, PR descriptions ou changelogs.

## Examples

### Exemplo 1: Setup inicial de workspace G-OS
```
Usuario diz: "configurar ssh para este projeto"
Acoes:
  1. Detectar G-OS (existe .gos-local/)
  2. git remote get-url origin → git@github-xxx:org/repo.git
  3. ssh -T git@<alias> → autenticado
  4. Perguntar nome/email
  5. Gravar .gos-local/ssh-identity.json
Resultado: "SSH Identity configurada para [configured-ssh-identity]."
```

### Exemplo 2: Remote usa HTTPS
```
Usuario diz: "configurar ssh"
Acoes:
  1. git remote get-url origin → https://github.com/org/repo.git
  2. Perguntar: "Qual alias SSH usar? (ex: github-<conta>)"
  3. Validar conexao com alias fornecido
  4. git remote set-url origin git@<alias>:org/repo.git
  5. Gravar config
Resultado: "Remote convertido de HTTPS para SSH. Identity configurada."
```

## Troubleshooting

### Erro: "Permission denied (publickey)"
- **Causa**: Chave SSH nao carregada no ssh-agent ou alias incorreto.
- **Solucao**: Verificar `ssh-add -l`. Se vazio, carregar: `ssh-add ~/.ssh/id_ed25519_<key>`.

### Erro: "Could not resolve hostname"
- **Causa**: Alias nao existe em `~/.ssh/config`.
- **Solucao**: Adicionar entrada no `~/.ssh/config`. Ver playbook `ssh-multi-account-setup`.

### Erro: ".gos-local/ nao existe"
- **Causa**: Workspace nao inicializado.
- **Solucao**: Rodar `npm run gos:init` (G-OS) ou `a8z init` (.a8z-OS).
