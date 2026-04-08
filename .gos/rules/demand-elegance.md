---
paths: "**"
severity: INFO
---

# Demand Elegance

## Resumo

Agentes de IA devem buscar a solução mais elegante para problemas não-triviais, evitando soluções "hacky" ou excessivamente complexas. No entanto, deve haver um equilíbrio: para correções simples e óbvias, a velocidade e a simplicidade técnica prevalecem sobre o over-engineering.

## Princípios

1. **The Elegance Pause**: Para qualquer mudança que envolva decisões arquiteturais ou lógica complexa, o agente deve pausar internamente e perguntar: "Existe uma forma mais elegante de resolver isso?".
2. **Hacky vs. Elegant**: Se um fix parece "remendado" (hacky), o agente deve propor a implementação da solução robusta e elegante, mesmo que exija um pouco mais de esforço inicial.
3. **Over-engineering Guardrail**: Não crie abstrações desnecessárias para problemas simples. Se a solução óbvia é direta, use-a.
4. **Refactoring Mindset**: Trate cada tarefa como uma oportunidade de deixar o código ligeiramente mais limpo do que o encontrou (Regra do Escoteiro).

## Quando aplicar (The Elegance Gate)

| Contexto | Ação |
|----------|------|
| **Bug Fix Crítico** | Direto ao ponto, correção robusta mas sem abstrações complexas. |
| **Nova Feature** | Design elegante, modular e extensível por padrão. |
| **Refatoração** | Máxima elegância, seguindo padrões de projeto e princípios SOLID. |
| **Scripts Rápidos** | Funcionalidade sobre estética de código, desde que seguro. |

## Exemplos

### ❌ Inelegante (Hacky)
Usar `setTimeout` arbitrário para esperar uma condição de rede sem retry-policy ou tratamento de erro adequado.

### ✅ Elegante
Implementar um padrão de `backoff exponencial` ou um `subscription mechanism` que reaja ao estado real do recurso.

---

*Baseado nos Core Principles do .a8z-OS.*
