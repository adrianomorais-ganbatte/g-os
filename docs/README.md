# Documentação do .a8z-OS

Este diretório contém documentação distribuída para projetos que instalam
`@imdouglasoliveira/a8z-framework`.

## Índice

- [GUIA_INSTALACAO_POR_NECESSIDADE.md](./GUIA_INSTALACAO_POR_NECESSIDADE.md): fluxo curto de "instalei, e agora?" por cenário.
- [RUNTIME_README.md](./RUNTIME_README.md): visão geral do conteúdo instalado em `./.a8z/`.
- [ARCHITECTURE.md](./ARCHITECTURE.md): diagramas e visão arquitetural do framework.
- [PROPOSAL_GENERATOR_BOOTSTRAP.md](./PROPOSAL_GENERATOR_BOOTSTRAP.md): guia legado e status atual do bootstrap de propostas.
- [proposals/runtime-model.md](./proposals/runtime-model.md): modelo de runtime de propostas (`proposals:init|generate|update`).
- [proposals/migration-guide.md](./proposals/migration-guide.md): migração de `proposal-init` para `proposals:*`.
- [architecture/multi-ide-refactor-2026-03-01.md](./architecture/multi-ide-refactor-2026-03-01.md): diagnóstico e plano de refatoração multi-IDE/multi-LLM.
- [stack/base.txt](./stack/base.txt): referência de stack base.
- [prompts/claude-code.md](./prompts/claude-code.md): comandos e uso no Claude Code.
- [../integrations/README.md](../integrations/README.md): convenções multi-IDE/multi-LLM e adapters.
- [sources/README.md](./sources/README.md): catálogo interno de fontes curadas para artefatos do framework.
- [sources/pack-quickstart.md](./sources/pack-quickstart.md): entrada rápida por desafio com carga mínima.
- [sources/curation-registry.md](./sources/curation-registry.md): decisões de curadoria (manter x descartar) e rastreabilidade.

## Guias Operacionais

- [guides/glossario.md](./guides/glossario.md): glossário de conceitos do framework (Skill, Agent, Rule, Playbook, Squad, Hook, etc.)
- [guides/guia-skills.md](./guides/guia-skills.md): como usar, compor e criar skills (114 skills por categoria).
- [guides/guia-agents.md](./guides/guia-agents.md): sistema de agentes — 12 personas, hierarquia de delegação, quando usar cada um.
- [guides/guia-fluxo-frontend.md](./guides/guia-fluxo-frontend.md): fluxo de desenvolvimento frontend (5 cenários, 14 gaps, 13 regras).
- [guides/guia-plans-tasks-specs.md](./guides/guia-plans-tasks-specs.md): convenção `docs/{plans,tasks,specs,progress}/` para rastreio cross-tool.
- [guides/guia-clickup-dual-transport.md](./guides/guia-clickup-dual-transport.md): uso do ClickUp com dual-transport (`auto`, `mcp`, `api`) e preprocessamento de texto.

## Documentos do repositório-fonte (não instalados no runtime)

- `docs/REPOSITORY_ORGANIZATION.md`
- `docs/REPOSITORY_SETUP.md`
- `docs/guides/GITHUB_PACKAGES_SETUP.md`

## Notas

- Conteúdos temporários de migração e rascunhos não fazem parte da fonte de verdade instalável.
- A fonte de verdade instalável é a raiz do repositório, controlada por
  `manifests/install-manifest.json`.
- Perfis canônicos de agentes: `agents/profiles/`.
