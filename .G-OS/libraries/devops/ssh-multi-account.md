# SSH Multi-Account — Git/GitHub

**Origem:** `docs/sources/devops/ssh-multi-account.md`

---

## Conceito

Usar aliases SSH para alternar entre multiplas contas GitHub na mesma maquina. Cada alias aponta para uma chave SSH diferente.

---

## Configuracao `~/.ssh/config`

```bash
# Conta principal
Host github-imdouglas
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_imdouglas
  IdentitiesOnly yes

# Conta secundaria
Host github-gabriel
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_gabriel
  IdentitiesOnly yes
```

**Regra:** Um bloco `Host` por conta, cada um com `IdentitiesOnly yes` para evitar conflitos.

---

## Uso

```bash
# Clone com alias
git clone git@github-imdouglas:imdouglasoliveira/meu-repo.git

# Alterar remote existente
git remote set-url origin git@github-imdouglas:imdouglasoliveira/meu-repo.git
```

---

## Gerar chave

```bash
ssh-keygen -t ed25519 -C "email@exemplo.com" -f ~/.ssh/id_ed25519_alias
```

Adicionar chave publica no GitHub: Settings > SSH and GPG keys.

---

## Configurar identidade por repositorio

```bash
cd meu-repo
git config user.name "Douglas Oliveira"
git config user.email "douglas@exemplo.com"
```

---

## Troubleshooting

| Problema | Causa | Solucao |
|----------|-------|---------|
| "Repository not found" | Usando `github.com` em vez do alias | Usar `git@github-alias:user/repo.git` |
| "Permission denied (publickey)" | Chave nao carregada ou errada | Verificar ssh-agent e chave |
| "Could not resolve hostname" | Alias nao configurado | Adicionar bloco ao `~/.ssh/config` |
| "Bad owner or permissions" | Permissoes do config erradas | `chmod 600 ~/.ssh/config && chmod 700 ~/.ssh` |
| Commit com conta errada | user.name/email global | Configurar per-repo |
| ssh-agent nao iniciado | Agente nao rodando | `eval $(ssh-agent -s) && ssh-add ~/.ssh/id_ed25519_alias` |
| Remote e HTTPS | URL incorreta | `git remote set-url origin git@github-alias:user/repo.git` |

---

## Diagnostico

```bash
# Verificar config
cat ~/.ssh/config | grep -A 5 "github-alias"

# Verificar chaves
ls -la ~/.ssh/id_ed25519_*

# Verificar ssh-agent
ssh-add -l

# Testar conexao
ssh -T git@github-alias        # Esperado: "Hi user!..."

# Debug verbose
ssh -vT git@github-alias
```
