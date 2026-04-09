# ADR-008: Magic link para autenticação de participantes

**Status:** Aceita
**Data:** 2026-03-15
**Decisores:** Time Fractus

## Contexto

Participantes do Fractus não são usuários "frequentes" — recebem um link de formulário, respondem e saem. Exigir cadastro com senha criaria atrito desnecessário.

## Decisão

- **Gestores e patrocinadores:** login com email + senha (Supabase Auth)
- **Participantes:** login via **magic link** (Supabase Auth) — recebem email com link que autentica automaticamente

## Fluxo do participante

```
1. Gestor publica instância → gera linkCompartilhavel (nanoid)
2. Participante acessa /f/[linkId]
3. Sistema solicita email
4. Supabase envia magic link por email
5. Participante clica → callback autentica → redireciona ao formulário
6. Participante responde e envia
7. Sessão expira após inatividade
```

## Implementação

```tsx
// Enviar magic link
const { error } = await supabase.auth.signInWithOtp({
  email: participante.email,
  options: {
    emailRedirectTo: `${APP_URL}/auth/callback?next=/f/${linkId}`,
  },
});

// Callback (app/auth/callback/route.ts)
const { data } = await supabase.auth.exchangeCodeForSession(code);
// Redirecionar para o formulário
```

## Consequências

### Positivas
- Zero atrito — participante não precisa criar senha nem lembrar credenciais
- Email serve como verificação de identidade (único por participante)
- Supabase Auth gerencia tokens, expiração e rate limiting

### Negativas
- Dependência do email do participante estar correto
- Magic link expira (default: 1h) — participante pode precisar de novo link
- Se email cair na caixa de spam, participante fica travado

### Mitigações
- Validar email no import CSV e na criação manual
- Mensagem clara "verifique sua caixa de spam" na tela de espera
- Permitir reenvio de magic link

## Referências
- `docs/prompts/start-projeto.md` seção "Contexto Fractus" (perfil Participante)
- `docs/fractus/spec-desenvolvimento.md` seção 2.2 (Supabase Auth)
