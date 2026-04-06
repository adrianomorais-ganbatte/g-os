# Feature Development Playbook

**Purpose:** Desenvolvimento guiado de features com exploracao profunda do codebase, perguntas de clarificacao, design de arquitetura com multiplas opcoes, implementacao e revisao de qualidade -- tudo usando agentes paralelos para velocidade.

**Success Criteria:**
- Feature entendida completamente antes de codar
- Codebase explorado com agentes paralelos
- Todas as ambiguidades resolvidas com o usuario
- Arquitetura desenhada com trade-offs claros
- Implementacao seguindo patterns do projeto
- Revisao de qualidade com multiplas perspectivas
- Resumo documentado do que foi feito

---

## Overview

This playbook implements a 7-phase feature development workflow that uses parallel agents at key stages to maximize throughput while maintaining quality. The human stays in the loop at every decision point.

**Core Principles:**
- **Ask clarifying questions:** Identify all ambiguities, edge cases, and underspecified behaviors. Ask specific, concrete questions rather than making assumptions. Wait for user answers before proceeding.
- **Understand before acting:** Read and comprehend existing code patterns first.
- **Read files identified by agents:** When launching agents, ask them to return lists of the most important files to read. After agents complete, read those files to build detailed context.
- **Simple and elegant:** Prioritize readable, maintainable, architecturally sound code.
- **Use TodoWrite:** Track all progress throughout.

---

## Phase 1: Discovery

**Goal:** Understand what needs to be built.

**Input:** Feature description from user (or `$ARGUMENTS`).

**Actions:**
1. Create TodoWrite with all 7 phases
2. If the feature is unclear, ask the user:
   - What problem are they solving?
   - What should the feature do?
   - Any constraints or requirements?
3. Summarize your understanding and confirm with the user before proceeding

**Exit criteria:** Clear, confirmed understanding of what needs to be built.

---

## Phase 2: Codebase Exploration (parallel agents)

**Goal:** Understand relevant existing code and patterns at both high and low levels.

**Actions:**
1. Launch 2-3 code-explorer agents in parallel. Each agent should:
   - Trace through the code comprehensively and focus on getting a thorough understanding of abstractions, architecture, and flow of control
   - Target a different aspect of the codebase
   - Return a list of 5-10 key files to read

   **Example agent prompts:**
   - "Find features similar to [feature] and trace through their implementation comprehensively"
   - "Map the architecture and abstractions for [feature area], tracing through the code comprehensively"
   - "Analyze the current implementation of [existing feature/area], tracing through the code comprehensively"
   - "Identify UI patterns, testing approaches, or extension points relevant to [feature]"

2. Once agents return, read ALL files identified by agents to build deep understanding
3. Present comprehensive summary of findings and patterns discovered to the user

**Exit criteria:** Deep understanding of codebase patterns, conventions, and relevant code.

---

## Phase 3: Clarifying Questions

**Goal:** Fill in gaps and resolve ALL ambiguities before designing.

**CRITICAL: This is one of the most important phases. DO NOT SKIP.**

**Actions:**
1. Review the codebase findings and original feature request together
2. Identify underspecified aspects:
   - Edge cases and error handling
   - Integration points with existing code
   - Scope boundaries (what is IN and OUT)
   - Design preferences (UI/UX, API shape)
   - Backward compatibility requirements
   - Performance needs and constraints
3. **Present all questions to the user in a clear, organized list**
4. **Wait for answers before proceeding to architecture design**

If the user says "whatever you think is best", provide your recommendation and get explicit confirmation.

**Exit criteria:** All ambiguities resolved. No assumptions remaining.

---

## Phase 4: Architecture Design (parallel agents)

**Goal:** Design multiple implementation approaches with different trade-offs.

**Actions:**
1. Launch 2-3 code-architect agents in parallel, each with a different focus:
   - **Minimal changes:** Smallest change, maximum reuse of existing code
   - **Clean architecture:** Maintainability, elegant abstractions, future-proof
   - **Pragmatic balance:** Speed + quality, best fit for the specific context

2. Review all approaches and form your opinion on which fits best for this specific task. Consider:
   - Is this a small fix or a large feature?
   - How urgent is it?
   - How complex is the domain?
   - What is the team context?

3. Present to user:
   - Brief summary of each approach
   - Trade-offs comparison (table format works well)
   - **Your recommendation with reasoning**
   - Concrete implementation differences (what files, what patterns)

4. **Ask user which approach they prefer**

**Exit criteria:** Architecture approach chosen and approved by user.

---

## Phase 4.1: Guias Frontend/UX (quando houver UI/React/RN)

**Goal:** Travar padrões de performance e UX antes de codar.**

- Consulte skills de apoio:
  - `react-best-practices` — evitar waterfalls, reduzir bundle, otimizar rendering (React/Next).
  - `composition-patterns` — arquitetura de componentes, evitar props booleanas, compound components.
  - `web-design-guidelines` — checklist de UI/acessibilidade via Web Interface Guidelines.
  - `react-native-skills` — listas/animações/navegação em RN/Expo.
- Registre no plano quais guias serão aplicados e onde (componentes/rotas/telas).

**Exit criteria:** Padrões de UI/perf selecionados e anotados.

---

## Phase 5: Implementation

**Goal:** Build the feature.

**DO NOT START WITHOUT USER APPROVAL of the chosen architecture.**

**Actions:**
1. Wait for explicit user approval
2. Read all relevant files identified in previous phases
3. Implement following the chosen architecture
4. Follow codebase conventions strictly (check CLAUDE.md, existing patterns)
5. Write clean, well-documented code
6. Update TodoWrite as you progress
7. Use TDD patterns where applicable (see `tdd` skill)

**For complex implementations:** Consider using `subagent-driven-development` skill to dispatch fresh subagents per task with two-stage review.

**Exit criteria:** Feature implemented, all planned files created/modified.

---

## Phase 6: Quality Review (parallel agents)

**Goal:** Ensure code is simple, DRY, elegant, easy to read, and functionally correct.

**Actions:**
1. Launch 3 code-reviewer agents in parallel with different focuses:
   - **Simplicity/DRY/Elegance:** Is the code clean? Any duplication? Could it be simpler?
   - **Bugs/Functional correctness:** Will it work? Edge cases handled? Error handling complete?
   - **Project conventions/Abstractions:** Does it follow existing patterns? Are abstractions appropriate?

2. Consolidate findings and identify highest severity issues
3. **Present findings to user and ask what they want to do:**
   - Fix now
   - Fix later (create follow-up task)
   - Proceed as-is (acknowledge known limitations)

4. Address issues based on user decision

**For deeper verification:** Use `verification-patterns` skill to verify implementations are real, not stubs.

**Exit criteria:** Code reviewed from multiple perspectives, issues addressed per user decision.

---

## Phase 7: Summary

**Goal:** Document what was accomplished.

**Actions:**
1. Mark all TodoWrite items complete
2. Present summary:
   - **What was built:** Feature description and scope
   - **Key decisions made:** Architecture choices, trade-offs accepted
   - **Files modified:** List of all created/modified files with brief description
   - **Suggested next steps:** Testing, deployment, follow-up tasks, known limitations
   - Se deploy para Vercel for solicitado: apontar skill `deploy-to-vercel` e default preview (prod só se pedido)

**Exit criteria:** User has clear picture of what was done and what comes next.

---

## Escalation Points

| Situation | Action |
|-----------|--------|
| Feature requirements unclear after Phase 1 | Ask user for more context, do not proceed |
| Codebase too complex to understand | Break into smaller exploration agents, ask user for guidance |
| Too many ambiguities in Phase 3 | Prioritize questions, ask in batches |
| No architecture approach fits well | Discuss constraints with user, consider hybrid approach |
| Implementation blocked by dependency | Report to user, suggest workaround or pause |
| Quality review finds critical issues | Fix before proceeding, do not skip |

---

## Model Guidance

| Phase | Recommended Model |
|-------|-------------------|
| Phase 1: Discovery | sonnet |
| Phase 2: Code explorer agents | sonnet |
| Phase 3: Clarifying questions | sonnet |
| Phase 4: Architect agents | sonnet or opus for complex domains |
| Phase 5: Implementation | sonnet (or subagent-driven-development) |
| Phase 6: Reviewer agents | sonnet (simplicity, conventions) + opus (bugs) |
| Phase 7: Summary | sonnet |

---

## Related Skills and Playbooks

- **writing-plans** -- Create implementation plan before Phase 5
- **subagent-driven-development** -- Execute Phase 5 with fresh subagents and two-stage review
- **tdd** -- Test-driven development patterns for Phase 5
- **verification-patterns** -- Verify implementations in Phase 6
- **verification-before-completion** -- Final validation before Phase 7
- **dispatching-parallel-agents** -- General pattern for Phases 2, 4, 6
- **dev-implementation-playbook** -- More structured playbook for story-based development

---

*Version:* 1.0
*Created:* 2026-03-11
