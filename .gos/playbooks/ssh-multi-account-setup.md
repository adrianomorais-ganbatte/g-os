# SSH Multi-Account Setup Playbook

**Proposito:** Configurar acesso SSH para multiplas contas GitHub na mesma maquina, com alias dedicados e identidade por repositorio.

**Sucesso quando:**
- Chaves Ed25519 geradas para cada conta
- `~/.ssh/config` com alias por conta (IdentitiesOnly=yes)
- `ssh -T` valida todas as conexoes
- Cada workspace tem `ssh-identity.json` configurado via skill `git-ssh-setup`
- Nenhum alias real exposto em documentacao ou output de agentes

---

## Pre-requisitos

- [ ] Acesso SSH habilitado nas contas GitHub
- [ ] OpenSSH instalado (`ssh -V` retorna versao)
- [ ] Permissoes de escrita em `~/.ssh/`

---

## Phase 1: Key Generation

Gerar uma chave Ed25519 por conta. Usar nome descritivo no arquivo.

```bash
ssh-keygen -t ed25519 -C "<email-da-conta>" -f ~/.ssh/id_ed25519_<account-name>
```

Repetir para cada conta. Convencao de nomes:
- `id_ed25519_<account-name>` — nome curto, sem espacos, lowercase

Verificar que os arquivos foram criados:
```bash
ls -la ~/.ssh/id_ed25519_<account-name>*
# Deve mostrar: id_ed25519_<account-name> (privada) e id_ed25519_<account-name>.pub (publica)
```

**Regra de seguranca:** NUNCA compartilhar ou versionar a chave privada.

---

## Phase 2: SSH Config File

Editar `~/.ssh/config` (criar se nao existir). Adicionar uma entrada por conta:

```
Host github-<account-name>
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_<account-name>
  IdentitiesOnly yes
```

Repetir o bloco para cada conta, trocando `<account-name>` e o path da chave.

**Convencao de alias:** `github-<nome-curto>`. Exemplos: `github-personal`, `github-work`, `github-client`.

Permissoes corretas:
```bash
chmod 600 ~/.ssh/config
chmod 600 ~/.ssh/id_ed25519_*
```

---

## Phase 3: GitHub Key Registration

Para cada conta, copiar a chave publica e registrar no GitHub:

```bash
cat ~/.ssh/id_ed25519_<account-name>.pub
```

1. Acessar GitHub → Settings → SSH and GPG keys → New SSH key
2. Titulo: nome da maquina + proposito (ex: "Workstation - Personal")
3. Colar o conteudo da `.pub`
4. Salvar

---

## Phase 4: URL Rewrite Rules (Opcional)

Para que `git clone github.com/org/repo` use automaticamente o alias correto:

```bash
git config --global url."git@github-<account-name>:<github-username>/".insteadOf "https://github.com/<github-username>/"
```

Isso converte URLs HTTPS para SSH automaticamente durante clone/fetch/push.

**Nota:** So usar se uma unica conta domina os repos de um org/username. Para repos mistos, configurar remote manualmente.

---

## Phase 5: Connection Validation

Testar cada alias:

```bash
ssh -T git@github-<account-name>
```

Resposta esperada:
```
Hi <github-username>! You've successfully authenticated, but GitHub does not provide shell access.
```

Se falhar, diagnosticar:
```bash
# Verbose — mostra qual chave esta sendo usada
ssh -vT git@github-<account-name>

# Verificar chaves carregadas no agent
ssh-add -l

# Carregar chave no agent se necessario
ssh-add ~/.ssh/id_ed25519_<account-name>
```

---

## Phase 6: Workspace Configuration

Para cada repositorio, configurar a identidade SSH usando a skill `git-ssh-setup`:

```
/git-ssh-setup
```

Ou manualmente:

1. Verificar/ajustar remote URL:
```bash
git remote get-url origin
# Se HTTPS, converter:
git remote set-url origin git@github-<account-name>:<org>/<repo>.git
```

2. Configurar git identity local:
```bash
git config user.name "<nome>"
git config user.email "<email>@users.noreply.github.com"
```

3. Se usar framework .a8z-OS ou G-OS: o arquivo `ssh-identity.json` sera gravado automaticamente pela skill.

---

## Checklist Final

- [ ] Todas as chaves geradas e com permissoes 600
- [ ] `~/.ssh/config` com entradas para todas as contas
- [ ] `ssh -T` passa para todos os aliases
- [ ] Chaves publicas registradas no GitHub
- [ ] Cada workspace com remote URL usando alias correto
- [ ] Git user.name e user.email configurados localmente por repo
- [ ] Nenhuma chave privada versionada ou exposta

---

## Troubleshooting

### "Permission denied (publickey)"
1. Verificar se a chave esta carregada: `ssh-add -l`
2. Carregar: `ssh-add ~/.ssh/id_ed25519_<account-name>`
3. Se ssh-agent nao esta rodando: `eval $(ssh-agent -s)`

### "Could not resolve hostname github-xxx"
1. Verificar `~/.ssh/config` — o alias deve existir com `HostName github.com`
2. Verificar indentacao do config (espacos, nao tabs)

### "Repository not found" ao clonar
1. Verificar que esta usando o alias correto para a conta que tem acesso
2. Formato: `git clone git@github-<account-name>:<org>/<repo>.git`

### Commits com usuario errado
1. Verificar: `git config user.name` e `git config user.email`
2. Se retorna global ao inves de local: `git config user.name "<nome>"`
3. Usar flag `--local` para garantir: `git config --local user.email "<email>"`

---

**Versao:** 1.0
**Referencia:** Skill `git-ssh-setup` para configuracao automatizada por workspace.
