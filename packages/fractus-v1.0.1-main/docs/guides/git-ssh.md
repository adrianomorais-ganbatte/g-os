# Guia: Git e SSH

## Configuração SSH (multi-account)

Se o dev usa múltiplas contas GitHub, configurar em `~/.ssh/config`:

```
Host github-adriano
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_adriano

Host github-douglas
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_douglas
```

Testar:

```bash
ssh -T git@github-adriano
# Hi adriano! You've successfully authenticated...
```

## Convenção de branches

```
main                          # Produção
├── feat/S03-schema-sql       # Feature por sprint item
├── feat/S04-storybook-setup
├── fix/rls-patrocinador
└── chore/setup-vercel
```

Prefixos:
- `feat/` — nova funcionalidade
- `fix/` — correção de bug
- `chore/` — setup, config, infra
- `refactor/` — refatoração sem mudança de comportamento

## Convenção de commits

```
feat: criar schema SQL com 15 tabelas e 5 enums
fix: corrigir RLS policy de patrocinador
chore: configurar Storybook com compostos customizados
```

Formato: `tipo: descrição curta` (imperative mood, minúscula, sem ponto final).

## Workflow de PR

```bash
# Criar branch
git checkout -b feat/S03-schema-sql

# Trabalhar...
git add -A
git commit -m "feat: criar schema SQL com migrations"

# Push
git push -u origin feat/S03-schema-sql

# Criar PR (via GitHub CLI ou web)
gh pr create --title "feat: schema SQL + migrations" --body "..."
```

## Regras

- Nunca commitar `.env.local`, `.env`, credenciais
- Nunca force-push para `main`
- PR precisa de pelo menos 1 review antes de merge
- Manter branch atualizada com `main` (`git rebase main` ou merge)
