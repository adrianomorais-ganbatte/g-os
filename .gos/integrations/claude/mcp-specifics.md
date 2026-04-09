# MCP Configuration - Claude Code Specifics

> Este documento complementa `rules/mcp-usage.md` (governança genérica MCP)
> com configuração, seleção de ferramentas e troubleshooting específicos do Claude Code.

## MCP Configuration Architecture

G-OS usa **Docker MCP Toolkit** como infraestrutura principal para MCP.

### Global (~/.claude.json) — MCP_DOCKER

O gateway Docker MCP Toolkit é registrado globalmente no Claude Code:

```json
"MCP_DOCKER": {
  "command": "docker",
  "args": ["mcp", "gateway", "run"],
  "env": {
    "LOCALAPPDATA": "C:\\Users\\<user>\\AppData\\Local",
    "ProgramData": "C:\\ProgramData",
    "ProgramFiles": "C:\\Program Files"
  }
}
```

### Servers disponíveis via Docker MCP Toolkit

| MCP | Tools | Purpose |
|-----|-------|---------|
| **Playwright** | 22 | Browser automation, screenshots, web testing |
| **Context7** | 2 | Library documentation lookup (resolve-library-id + get-library-docs) |
| **Chroma** | 13 | Vector database para RAG/embeddings |
| **Sequential Thinking** | 1 | Raciocínio estruturado passo-a-passo |
| **Fetch** | 1 | Web fetch com markdown extraction |
| **MCP Gateway** | 5 | mcp-add, mcp-remove, mcp-find, mcp-exec, mcp-config-set |
| **Code Mode** | 1 | Combinar múltiplas tools em JavaScript |

**Total: 45 tools**

### Outros MCPs globais (opcionais)

| MCP | Purpose |
|-----|---------|
| **context7** (stdio) | Context7 direto via npx (alternativa ao Docker) |
| **g-os** (http) | G-OS framework API |

## CRITICAL: Tool Selection Priority

SEMPRE preferir native Claude Code tools sobre MCP servers:

| Task | USE THIS | NOT THIS |
|------|----------|----------|
| Read files | `Read` tool | MCP_DOCKER |
| Write files | `Write` / `Edit` tools | MCP_DOCKER |
| Run commands | `Bash` tool | MCP_DOCKER |
| Search files | `Glob` tool | MCP_DOCKER |
| Search content | `Grep` tool | MCP_DOCKER |
| List directories | `Bash(ls)` or `Glob` | MCP_DOCKER |

## Docker MCP Toolkit Usage

### ONLY use MCP_DOCKER tools when:
1. User explicitly asks for browser automation → **Playwright tools**
2. Task requires vector search/RAG → **Chroma tools**
3. Library documentation lookup → **Context7 tools**
4. Web page fetching → **Fetch tool**
5. Need to add/remove MCP servers dynamically → **MCP Gateway tools**
6. Complex multi-step reasoning → **Sequential Thinking**

### Managing servers via Docker MCP Toolkit

```bash
# List all tools available
docker mcp tools ls

# Inspect a specific tool
docker mcp tools inspect <tool-name>

# Test a tool
docker mcp tools call <tool-name>

# Find new servers in catalog (316+ available)
docker mcp gateway catalog

# Add a server from catalog
# Use Docker Desktop UI → MCP Toolkit → Catalog tab
```

## Known Issues

### Docker MCP Secrets Bug (Dec 2025)

**Issue:** Docker MCP Toolkit's secrets store and template interpolation do not work properly. Credentials set via `docker mcp secret set` are NOT passed to containers.

**Symptoms:**
- `docker mcp tools ls` shows "(N prompts)" instead of "(N tools)"
- MCP server starts but fails authentication
- Verbose output shows `-e ENV_VAR` without values

**Workaround:** Edit `~/.docker/mcp/catalogs/docker-mcp.yaml` directly with hardcoded env values:
```yaml
{mcp-name}:
  env:
    - name: API_TOKEN
      value: 'actual-token-value'
```

**Affected MCPs:** Any MCP requiring authentication (Apify, Notion, Slack, etc.)

### Docker not in PATH (Windows)

Se `docker` não estiver no PATH do shell do Claude Code, o gateway pode falhar.

**Fix:** Docker Desktop deve adicionar ao PATH automaticamente. Se não:
```
C:\Program Files\Docker\Docker\resources\bin
```

## Bootstrap para novos projetos

Ver: `docs/sources/mcp/docker-mcp-toolkit-setup.md`
