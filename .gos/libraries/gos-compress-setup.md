# gos-compress Setup Guide

> Setup unico do compressor LLMLingua-2 (sandeco). Roda 1x por maquina.

## Pre-requisitos

- Python 3.10+
- Disco livre: ~1.5GB (modelo + venv)
- (Opcional) GPU CUDA para acelerar — detectada automaticamente

## Setup

```bash
cd <projeto>/.gos/skills/gos-compress
python scripts/setup.py
```

Setup automatico:
1. Cria `.venv/` na pasta da skill
2. Atualiza pip
3. Instala `llmlingua` + `anthropic`
4. Baixa modelo HuggingFace `microsoft/llmlingua-2-xlm-roberta-large-meetingbank` (~1GB)
5. Salva cache em `~/.cache/huggingface/`

Primeira execucao: 5-15 minutos (download).
Execucoes seguintes: instantaneo (cache reusado).

## Validar

```bash
"<skill-dir>/.venv/Scripts/python.exe" "<skill-dir>/scripts/compress.py" --text "teste de compressao" --rate 0.5
```

Output esperado: texto comprimido + stats (origin_tokens, compressed_tokens, ratio).

## Variaveis de ambiente

- `ANTHROPIC_API_KEY` — apenas se usar `--ask` para enviar contexto comprimido ao Claude.

## Troubleshooting

### "ModuleNotFoundError: llmlingua"
Setup nao rodou. Rodar `python scripts/setup.py` na pasta da skill.

### "CUDA out of memory"
Forcar CPU: `export CUDA_VISIBLE_DEVICES=""` antes de rodar.

### "HF download lento"
Mirror: `export HF_ENDPOINT=https://hf-mirror.com` antes de rodar setup.

### "permission denied .venv"
Windows: rodar shell como admin OU usar `python -m venv .venv` manualmente.

## Distribuicao

`.venv` e modelo NAO sao commitados/distribuidos. Cada usuario roda setup local. Adicionar ao `.gitignore` da skill:

```
.venv/
__pycache__/
*.pyc
```
