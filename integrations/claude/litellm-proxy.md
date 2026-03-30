# LiteLLM Proxy — Modelos alternativos no Claude Code

**Origem:** `docs/sources/integrations/litellm-openrouter.md`

---

## Conceito

Usar o LiteLLM como proxy para rotear requests do Claude Code para modelos mais baratos ou gratuitos via OpenRouter.

---

## Setup

### 1. Instalar LiteLLM

```bash
python3 -m venv ~/litellm-env
source ~/litellm-env/bin/activate
pip install "litellm[proxy]"
```

### 2. Configurar OpenRouter

1. Criar conta em openrouter.ai
2. Gerar API key: Settings > Keys
3. Exportar:

```bash
export OPENROUTER_API_KEY=sk-or-v1-...
```

### 3. Rodar proxy

```bash
source ~/litellm-env/bin/activate
export OPENROUTER_API_KEY=sk-or-v1-sua-chave
litellm --model openrouter/z-ai/glm-5 --port 4000
```

### 4. Apontar Claude Code

```bash
export ANTHROPIC_BASE_URL=http://localhost:4000
claude
```

---

## Trocar modelo (reiniciar proxy)

```bash
# Modelo pago barato
litellm --model openrouter/minimax/minimax-m2.5 --port 4000

# Modelo gratuito
litellm --model openrouter/z-ai/glm-4.5-air:free --port 4000

# Modelo local via Ollama
ollama pull deepseek-coder-v3
litellm --model ollama/deepseek-coder-v3 --port 4000
```

---

## Tabela de custos

| Rota | Modelo | Input/M tokens |
|------|--------|----------------|
| Direto | claude-opus-4-6 | $15.00 |
| Direto | claude-sonnet-4-5 | $3.00 |
| OpenRouter | glm-5 | $0.75 |
| OpenRouter | minimax-m2.5 | $0.20 |
| OpenRouter | glm-4.5-air:free | $0.00 |
| Local (Ollama) | deepseek-coder-v3 | $0.00 |

---

## Verificacao

1. Fazer pergunta ao Claude Code → verificar resposta
2. Visitar openrouter.ai/activity → ver logs com custo
3. `/cost` no Claude Code mostra $0.00 (ja via proxy)

---

## Notas

- Oficialmente permitido pela Anthropic (`ANTHROPIC_BASE_URL` e documentado)
- Qualidade varia por modelo — Opus e premium por uma razao
- LiteLLM deve ficar rodando enquanto Claude Code estiver ativo
- Agent Teams funcionam (todos usam o mesmo proxy)
- **NAO recomendado** para: code review critico, arquitetura complexa, seguranca
