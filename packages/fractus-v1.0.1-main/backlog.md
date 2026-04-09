# 🛠️ Fractus Platform - Gaps & Backlog

Este documento registra as funcionalidades e melhorias técnicas identificadas para as próximas iterações do ecossistema Fractus.

## 🏗️ Core & Infraestrutura
- [ ] **Real-time Engine**: Implementar `supabase-realtime` nas listagens de programas e presença para atualizações instantâneas no dashboard do coordenador.
- [ ] **Storage Management**: Configurar buckets no Supabase e implementar componentes de upload para documentos (Contratos de Participantes e Comprovantes de Chamada).
- [ ] **Type-Safety Refactoring**: Eliminar o uso de `as any` nos formulários genéricos do React Hook Form + Zod, criando wrappers tipados mais precisos.

## 🛡️ Segurança (Auth & Permissões)
- [ ] **RBAC (Role Based Access Control)**: Diferenciar visões entre `Administrador` (vê CRM), `Coordenador` (vê Programas) e `Instrutor` (vê apenas Sessões/Chamada).
- [ ] **Password Reset Flow**: Implementar o fluxo completo de "Esqueci minha senha" usando Supabase Auth.
- [ ] **Audit Trail**: Tabela de logs para alterações críticas em Negócios (CRM) e Status de Participantes.

## 📱 UX/UI (Presença & Dashboard)
- [ ] **App Mobile (Opcional/PWA)**: Melhorar a responsividade da página de chamada para uso em smartphones no campo (offline-first básico).
- [ ] **Gráficos Avançados**: Substituir barras de progresso simples por gráficos de linha (Recharts/Chart.js) na Home para mostrar evolução de retenção e pipeline ao longo do tempo.
- [ ] **Filtros Avançados**: Implementar busca e filtros complexos em todas as tabelas (Data-tables com ordenação e paginação real no server-side).

## 🧩 Integrações
- [ ] **WhatsApp/Email API**: Notificações automáticas para participantes quando uma nova sessão for criada ou quando houver ausência persistente.
- [ ] **Exportação de Dados**: Botão para exportar relatórios de presença e CRM em CSV/Excel para prestação de contas.

---
*Atualizado em: 30 de Março de 2026*
