# Guia — Conectar ClickUp MCP ao Antigravity (e Claude Desktop)

Este guia configura o ClickUp MCP Server no Antigravity via `mcp-remote` (ponte stdio → HTTP), usando API token pessoal. Funciona igual para Claude Desktop.

## Pré-requisitos

- Antigravity instalado (ou Claude Desktop)
- Node.js ≥ 18 no PATH (`node --version` deve responder)
- ClickUp API token pessoal

## 1. Obter o API token do ClickUp

1. Acesse https://app.clickup.com/settings/apps
2. Seção **"API Token"** → copie o token (começa com `pk_`)
3. Referência: https://developer.clickup.com/docs/connect-an-ai-assistant-to-clickups-mcp-server-1

## 2. Salvar o token em `.env` do projeto

Nos repositórios que usam o token (G-OS, Ganbatte), adicione:

```env
CLICKUP_API_KEY=pk_<seu_token_aqui>
```

Arquivos gitignored já cobrem `.env` — confira antes de commitar.

Template em `.env-example`:

```env
# ClickUp personal API token. Get yours at:
# https://app.clickup.com/settings/apps
CLICKUP_API_KEY=
```

## 3. Configurar o MCP no Antigravity

O Antigravity lê o config MCP em:

```
C:\Users\<seu_user>\AppData\Roaming\Antigravity\User\Claude\claude_desktop_config.json
```

Adicione a entry `clickup` em `mcpServers`:

```json
{
  "mcpServers": {
    "clickup": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.clickup.com/mcp",
        "--header",
        "Authorization:${AUTH_HEADER}"
      ],
      "env": {
        "AUTH_HEADER": "Bearer pk_<seu_token_aqui>"
      },
      "type": "stdio"
    }
  }
}
```

Notas:
- `mcp-remote` é a ponte de stdio (exigido pelo Antigravity) para HTTP streaming (expected pelo servidor ClickUp). Package: https://www.npmjs.com/package/mcp-remote
- O prefixo `Bearer ` é obrigatório no header `Authorization`
- Usamos `${AUTH_HEADER}` (não `${CLICKUP_API_KEY}`) porque mcp-remote avalia a variável no momento do spawn e o valor precisa conter o `Bearer ` inteiro

## 4. Reiniciar o Antigravity

Fechar completamente (tray + processo no Task Manager) e reabrir. O MCP server inicia via `npx` na primeira invocação de ferramenta ClickUp.

## 5. Validar

Dentro do Antigravity chat, pedir:

> liste as últimas 5 tasks do meu workspace no ClickUp

Se o MCP estiver OK, a IA usa `clickup_filter_tasks` ou `clickup_search` e retorna dados reais.

## Troubleshooting

### Erro "Unauthorized" na UI

- Token errado ou expirado → gerar novo em https://app.clickup.com/settings/apps
- `Bearer` faltando no `AUTH_HEADER` → header precisa ser literal `Bearer <token>`

### MCP server não conecta

- Rodar localmente para ver logs:
  ```bash
  npx -y mcp-remote https://mcp.clickup.com/mcp --header "Authorization:Bearer pk_<token>"
  ```
  Se falhar aqui, é problema de rede/token, não do Antigravity

### Comando `npx` não encontrado

- Node.js não está no PATH. Verificar `node -v` no mesmo terminal que roda o Antigravity
- No Windows: reinstalar Node.js com a opção "Add to PATH" marcada

### Múltiplos workspaces

- O MCP usa automaticamente o workspace detectado pela API token
- Para forçar um workspace específico, passar `workspace_id` nas chamadas de ferramentas

## Outras IDEs / clientes

Mesmo padrão funciona em qualquer client MCP com suporte a stdio:

- **Claude Desktop** — `%AppData%\Claude\claude_desktop_config.json`
- **Cursor** — `.cursor/mcp.json` (por projeto) ou `~/.cursor/mcp.json` (global)
- **Claude Code (CLI)** — `~/.claude/settings.json` (seção `mcpServers`)
- **Gemini CLI / Kilo Code** — checar docs da IDE específica

Em clients que suportam HTTP direto (Claude Code via OAuth), pode-se pular o `mcp-remote` e conectar direto a `https://mcp.clickup.com/mcp` com OAuth — mas o token pessoal via mcp-remote é mais simples e funciona universalmente.

## Segurança

- `.env` e `claude_desktop_config.json` do Antigravity ficam na máquina, nunca commitados
- Rotacionar token se for exposto (ex: pasted em chat): https://app.clickup.com/settings/apps → revogar + gerar novo
- Scope do token é equivalente ao do usuário — qualquer ação da IA no ClickUp é registrada com o nome do dono do token
