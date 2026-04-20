# Plano de correcao ganbatte-os v0.2.23

## Escopo

Corrigir os 6 bugs documentados em [ganbatte-os-test-report-2026-04-20.md](./ganbatte-os-test-report-2026-04-20.md) em um unico ciclo de release (v0.2.23).

## Alteracoes consolidadas (single commit em dev)

### A. package.json
- Trocar `"files": [".gos/"]` por padrao glob explicito `[".gos/**/*", "AGENTS.md", "CLAUDE.md", "GEMINI.md", "README.md", "LICENSE"]` (Bug 1)
- Remover entry `"ganbatte-os"` de `bin`, manter apenas `"gos"` (Bug 2)
- Opcional: remover scripts `ganbatte-os:*` mantendo apenas `gos:*`

### B. .gos/scripts/cli/gos-cli.js
- Linha 22: `VERSION = require(package.json).version` lido dinamicamente (Bug 4)
- Linhas 216, 234, 431, 447, 550: paths `scripts/integrations/...` → `.gos/scripts/integrations/...` (Bug 3)
- Linha 322: check `.git` antes de `git remote add`, so tenta se repo existe (Bug 5)

### C. README.md
- Remover mencoes a `npx ganbatte-os` como comando direto (Bug 2)
- Documentar que `.agent/` e criada por integracoes de IDE especificas (Bug 6)

### D. .github/workflows/publish.yml
- Ja corrigido em v0.2.22 com validacao pre e pos publish. Sem mudanca.

## Sequencia de execucao

1. Aplicar todas as alteracoes em A, B, C localmente
2. `npm pack --dry-run` local — verificar 220+ arquivos, `.gos/scripts/cli/gos-cli.js` presente
3. Rodar `node .gos/scripts/cli/gos-cli.js doctor` para smoke test
4. Commit unico em `dev`: `fix(v0.2.23): bugs 1-6 (files glob, bin, CLI paths, versao, git check, docs)`
5. Push → automerge `dev → beta` → merge manual `beta → main` → publish automatico v0.2.23
6. Pos-publish: validar `npm view ganbatte-os@0.2.23 bin --json` retorna `{"gos":"..."}`
7. Re-executar checklist da secao 8 do relatorio de testes

## Criterios de aceite (pos v0.2.23)

- [ ] `npm view ganbatte-os@0.2.23 bin --json` nao-vazio
- [ ] `npm view ganbatte-os@0.2.23 files --json` contem `.gos/**/*`
- [ ] `npx ganbatte-os` em pasta limpa executa (apos cache clean)
- [ ] `npm install -g ganbatte-os` cria shim `gos`
- [ ] `gos install --force` em pasta de teste NAO emite "setup-ide-adapters nao encontrado"
- [ ] `gos version` imprime `0.2.23`
- [ ] `gos install` em pasta sem `.git` nao cospe erro do git
- [ ] README nao menciona `npx ganbatte-os`

## Rollback

Se v0.2.23 quebrar algo, `npm deprecate ganbatte-os@0.2.23 "use 0.2.22"` e reverter commit em main.
