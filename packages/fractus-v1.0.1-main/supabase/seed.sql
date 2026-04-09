-- =============================================================================
-- Fractus Seed Data
-- Dados realistas em português para ambiente de desenvolvimento
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Patrocinadores
-- -----------------------------------------------------------------------------
INSERT INTO patrocinadores (id, nome, logo) VALUES
  ('a1b2c3d4-1111-4000-8000-000000000001', 'Instituto Nexus', 'https://placeholders.fractus.dev/logos/instituto-nexus.svg'),
  ('a1b2c3d4-1111-4000-8000-000000000002', 'Fundação Raízes', 'https://placeholders.fractus.dev/logos/fundacao-raizes.svg'),
  ('a1b2c3d4-1111-4000-8000-000000000003', 'Grupo Evolução', 'https://placeholders.fractus.dev/logos/grupo-evolucao.svg');

-- -----------------------------------------------------------------------------
-- Programas
-- -----------------------------------------------------------------------------
INSERT INTO programas (id, nome, descricao, data_inicio, data_fim, total_inscritos, quantidade_vagas) VALUES
  (
    'b2c3d4e5-2222-4000-8000-000000000001',
    'Aceleração Digital 2026',
    'Programa de capacitação em transformação digital para empreendedores de comunidades periféricas. Inclui mentorias individuais, oficinas práticas e acesso a ferramentas digitais.',
    '2026-02-01T09:00:00-03:00',
    '2026-07-31T18:00:00-03:00',
    142,
    60
  ),
  (
    'b2c3d4e5-2222-4000-8000-000000000002',
    'Empreende Mulher',
    'Programa voltado para mulheres empreendedoras com foco em gestão financeira, marketing digital e liderança. Parceria com a rede SEBRAE.',
    '2026-05-01T09:00:00-03:00',
    '2026-11-30T18:00:00-03:00',
    89,
    40
  );

-- -----------------------------------------------------------------------------
-- Programa ↔ Patrocinadores
-- -----------------------------------------------------------------------------
INSERT INTO programa_patrocinadores (programa_id, patrocinador_id) VALUES
  ('b2c3d4e5-2222-4000-8000-000000000001', 'a1b2c3d4-1111-4000-8000-000000000001'),
  ('b2c3d4e5-2222-4000-8000-000000000001', 'a1b2c3d4-1111-4000-8000-000000000003'),
  ('b2c3d4e5-2222-4000-8000-000000000002', 'a1b2c3d4-1111-4000-8000-000000000002'),
  ('b2c3d4e5-2222-4000-8000-000000000002', 'a1b2c3d4-1111-4000-8000-000000000003');

-- -----------------------------------------------------------------------------
-- Workspaces
-- -----------------------------------------------------------------------------
INSERT INTO workspaces (id, nome, descricao) VALUES
  ('c3d4e5f6-3333-4000-8000-000000000001', 'Fractus Principal', 'Workspace central para gestão de programas sociais e acompanhamento de impacto.');

-- -----------------------------------------------------------------------------
-- Templates
-- -----------------------------------------------------------------------------
INSERT INTO templates (id, nome, descricao, tipo, workspace_id, permitir_multiplas_respostas, versao, ativo) VALUES
  (
    'd4e5f6a7-4444-4000-8000-000000000001',
    'Diagnóstico Inicial — Aceleração Digital',
    'Formulário de diagnóstico aplicado no início do programa para mapear o nível de maturidade digital dos participantes.',
    'diagnostico_inicial',
    'c3d4e5f6-3333-4000-8000-000000000001',
    false,
    1,
    true
  ),
  (
    'd4e5f6a7-4444-4000-8000-000000000002',
    'Diagnóstico Final — Aceleração Digital',
    'Formulário aplicado ao término do programa para medir a evolução dos participantes.',
    'diagnostico_final',
    'c3d4e5f6-3333-4000-8000-000000000001',
    false,
    1,
    true
  ),
  (
    'd4e5f6a7-4444-4000-8000-000000000003',
    'Satisfação NPS — Sessão',
    'Pesquisa rápida de satisfação aplicada após cada sessão presencial.',
    'satisfacao_nps',
    'c3d4e5f6-3333-4000-8000-000000000001',
    true,
    2,
    true
  );

-- -----------------------------------------------------------------------------
-- Campos do Template: Diagnóstico Inicial (5 campos)
-- -----------------------------------------------------------------------------
INSERT INTO campo_templates (id, template_id, tipo, label, obrigatorio, opcoes, escala_min, escala_max, escala_label_min, escala_label_max, is_indicador, nome_indicador, ordem) VALUES
  (
    'e5f6a7b8-5555-4000-8000-000000000001',
    'd4e5f6a7-4444-4000-8000-000000000001',
    'texto',
    'Descreva brevemente o seu negócio e o principal produto ou serviço oferecido.',
    true,
    NULL, NULL, NULL, NULL, NULL,
    false, NULL,
    1
  ),
  (
    'e5f6a7b8-5555-4000-8000-000000000002',
    'd4e5f6a7-4444-4000-8000-000000000001',
    'escala',
    'Como você avalia seu conhecimento em ferramentas digitais?',
    true,
    NULL, 1, 10, 'Nenhum conhecimento', 'Domínio completo',
    true, 'maturidade_digital',
    2
  ),
  (
    'e5f6a7b8-5555-4000-8000-000000000003',
    'd4e5f6a7-4444-4000-8000-000000000001',
    'escolha_unica',
    'Seu negócio possui presença online (site, redes sociais ou marketplace)?',
    true,
    ARRAY['Sim, site próprio', 'Apenas redes sociais', 'Apenas marketplace', 'Não possui presença online'],
    NULL, NULL, NULL, NULL,
    true, 'presenca_online',
    3
  ),
  (
    'e5f6a7b8-5555-4000-8000-000000000004',
    'd4e5f6a7-4444-4000-8000-000000000001',
    'multipla_escolha',
    'Quais canais de venda você utiliza atualmente?',
    true,
    ARRAY['Loja física', 'WhatsApp', 'Instagram', 'Facebook Marketplace', 'Mercado Livre', 'Shopee', 'Site próprio', 'Outros'],
    NULL, NULL, NULL, NULL,
    false, NULL,
    4
  ),
  (
    'e5f6a7b8-5555-4000-8000-000000000005',
    'd4e5f6a7-4444-4000-8000-000000000001',
    'escala',
    'Qual o seu nível de confiança para gerenciar as finanças do seu negócio?',
    true,
    NULL, 1, 10, 'Muito inseguro(a)', 'Totalmente confiante',
    true, 'confianca_financeira',
    5
  );

-- -----------------------------------------------------------------------------
-- Campos do Template: Diagnóstico Final (5 campos)
-- -----------------------------------------------------------------------------
INSERT INTO campo_templates (id, template_id, tipo, label, obrigatorio, opcoes, escala_min, escala_max, escala_label_min, escala_label_max, is_indicador, nome_indicador, ordem) VALUES
  (
    'e5f6a7b8-5555-4000-8000-000000000011',
    'd4e5f6a7-4444-4000-8000-000000000002',
    'escala',
    'Como você avalia seu conhecimento em ferramentas digitais agora?',
    true,
    NULL, 1, 10, 'Nenhum conhecimento', 'Domínio completo',
    true, 'maturidade_digital_final',
    1
  ),
  (
    'e5f6a7b8-5555-4000-8000-000000000012',
    'd4e5f6a7-4444-4000-8000-000000000002',
    'escolha_unica',
    'Seu negócio possui presença online agora?',
    true,
    ARRAY['Sim, site próprio', 'Apenas redes sociais', 'Apenas marketplace', 'Não possui presença online'],
    NULL, NULL, NULL, NULL,
    true, 'presenca_online_final',
    2
  ),
  (
    'e5f6a7b8-5555-4000-8000-000000000013',
    'd4e5f6a7-4444-4000-8000-000000000002',
    'escala',
    'Qual o seu nível de confiança para gerenciar as finanças do seu negócio agora?',
    true,
    NULL, 1, 10, 'Muito inseguro(a)', 'Totalmente confiante',
    true, 'confianca_financeira_final',
    3
  ),
  (
    'e5f6a7b8-5555-4000-8000-000000000014',
    'd4e5f6a7-4444-4000-8000-000000000002',
    'multipla_escolha',
    'Quais habilidades você desenvolveu durante o programa?',
    true,
    ARRAY['Marketing digital', 'Gestão financeira', 'Atendimento ao cliente', 'Precificação', 'Planejamento estratégico', 'Uso de ferramentas digitais', 'Liderança'],
    NULL, NULL, NULL, NULL,
    false, NULL,
    4
  ),
  (
    'e5f6a7b8-5555-4000-8000-000000000015',
    'd4e5f6a7-4444-4000-8000-000000000002',
    'texto',
    'O que você faria de diferente se pudesse recomeçar o programa?',
    false,
    NULL, NULL, NULL, NULL, NULL,
    false, NULL,
    5
  );

-- -----------------------------------------------------------------------------
-- Campos do Template: Satisfação NPS (3 campos)
-- -----------------------------------------------------------------------------
INSERT INTO campo_templates (id, template_id, tipo, label, obrigatorio, opcoes, escala_min, escala_max, escala_label_min, escala_label_max, is_indicador, nome_indicador, ordem) VALUES
  (
    'e5f6a7b8-5555-4000-8000-000000000021',
    'd4e5f6a7-4444-4000-8000-000000000003',
    'escala',
    'De 0 a 10, o quanto você recomendaria esta sessão para um(a) colega?',
    true,
    NULL, 0, 10, 'Não recomendaria', 'Recomendaria com certeza',
    true, 'nps_sessao',
    1
  ),
  (
    'e5f6a7b8-5555-4000-8000-000000000022',
    'd4e5f6a7-4444-4000-8000-000000000003',
    'escolha_unica',
    'O conteúdo abordado foi relevante para o seu negócio?',
    true,
    ARRAY['Muito relevante', 'Relevante', 'Pouco relevante', 'Irrelevante'],
    NULL, NULL, NULL, NULL,
    true, 'relevancia_conteudo',
    2
  ),
  (
    'e5f6a7b8-5555-4000-8000-000000000023',
    'd4e5f6a7-4444-4000-8000-000000000003',
    'texto',
    'Deixe um comentário ou sugestão sobre a sessão de hoje.',
    false,
    NULL, NULL, NULL, NULL, NULL,
    false, NULL,
    3
  );

-- -----------------------------------------------------------------------------
-- Participantes
-- -----------------------------------------------------------------------------
INSERT INTO participantes (id, nome, email, telefone, data_nascimento, programa_id, status, respondeu_diagnostico_inicial, percentual_presenca, faltas_consecutivas, data_vinculo) VALUES
  (
    'f6a7b8c9-6666-4000-8000-000000000001',
    'Ana Clara dos Santos',
    'anaclara.santos@email.com',
    '11987654321',
    '1992-03-15',
    'b2c3d4e5-2222-4000-8000-000000000001',
    'ativo',
    true, 87.5, 0,
    '2026-01-20T10:00:00-03:00'
  ),
  (
    'f6a7b8c9-6666-4000-8000-000000000002',
    'Carlos Eduardo Pereira',
    'carlos.pereira@email.com',
    '21976543210',
    '1988-07-22',
    'b2c3d4e5-2222-4000-8000-000000000001',
    'ativo',
    true, 93.0, 0,
    '2026-01-20T10:00:00-03:00'
  ),
  (
    'f6a7b8c9-6666-4000-8000-000000000003',
    'Mariana Oliveira Silva',
    'mariana.osilva@email.com',
    '31965432109',
    '1995-11-08',
    'b2c3d4e5-2222-4000-8000-000000000001',
    'desistente',
    true, 42.0, 4,
    '2026-01-20T10:00:00-03:00'
  ),
  (
    'f6a7b8c9-6666-4000-8000-000000000004',
    'João Victor Nascimento',
    'joao.nascimento@email.com',
    '41954321098',
    '1990-01-30',
    'b2c3d4e5-2222-4000-8000-000000000001',
    'concluinte',
    true, 100.0, 0,
    '2026-01-20T10:00:00-03:00'
  ),
  (
    'f6a7b8c9-6666-4000-8000-000000000005',
    'Fernanda Lima Costa',
    'fernanda.lcosta@email.com',
    '71943210987',
    '1997-06-12',
    'b2c3d4e5-2222-4000-8000-000000000001',
    'ativo',
    true, 75.0, 1,
    '2026-01-25T14:00:00-03:00'
  ),
  (
    'f6a7b8c9-6666-4000-8000-000000000006',
    'Roberto Almeida Filho',
    'roberto.almeida@email.com',
    '81932109876',
    '1985-09-03',
    'b2c3d4e5-2222-4000-8000-000000000001',
    'ativo',
    false, 68.0, 2,
    '2026-02-01T09:00:00-03:00'
  ),
  (
    'f6a7b8c9-6666-4000-8000-000000000007',
    'Beatriz Souza Mendes',
    'beatriz.mendes@email.com',
    '51921098765',
    '1993-12-25',
    'b2c3d4e5-2222-4000-8000-000000000002',
    'pre_selecionado',
    false, 0.0, 0,
    '2026-04-10T11:00:00-03:00'
  ),
  (
    'f6a7b8c9-6666-4000-8000-000000000008',
    'Luciana Ferreira Rocha',
    'luciana.frocha@email.com',
    '61910987654',
    '1991-04-18',
    'b2c3d4e5-2222-4000-8000-000000000002',
    'selecionado',
    false, 0.0, 0,
    '2026-04-15T09:30:00-03:00'
  ),
  (
    'f6a7b8c9-6666-4000-8000-000000000009',
    'Tatiane Ribeiro de Araújo',
    'tatiane.araujo@email.com',
    '85909876543',
    '1994-08-07',
    'b2c3d4e5-2222-4000-8000-000000000002',
    'selecionado',
    false, 0.0, 0,
    '2026-04-15T09:30:00-03:00'
  ),
  (
    'f6a7b8c9-6666-4000-8000-000000000010',
    'Patrícia Gomes Barbosa',
    'patricia.gbarbosa@email.com',
    '92998765432',
    '1989-02-14',
    'b2c3d4e5-2222-4000-8000-000000000002',
    'pre_selecionado',
    false, 0.0, 0,
    '2026-04-12T16:00:00-03:00'
  );

-- -----------------------------------------------------------------------------
-- Negócios
-- -----------------------------------------------------------------------------
INSERT INTO negocios (id, nome, empresa, descricao, valor, status, probabilidade, data_abertura, data_fechamento, responsavel, observacoes) VALUES
  (
    'a7b8c9d0-7777-4000-8000-000000000001',
    'Patrocínio Aceleração Digital 2026',
    'Grupo Evolução S.A.',
    'Proposta de patrocínio master para o programa Aceleração Digital com contrapartida de marca em todos os materiais.',
    150000.00,
    'fechado',
    100,
    '2025-10-15',
    '2025-12-20',
    'Douglas Oliveira',
    'Contrato assinado. Pagamento em 3 parcelas.'
  ),
  (
    'a7b8c9d0-7777-4000-8000-000000000002',
    'Empreende Mulher — Captação Fundação Raízes',
    'Fundação Raízes',
    'Negociação de aporte para o programa Empreende Mulher, incluindo bolsas para participantes.',
    85000.00,
    'negociacao',
    70,
    '2026-01-10',
    NULL,
    'Douglas Oliveira',
    'Aguardando aprovação do conselho. Reunião marcada para abril.'
  ),
  (
    'a7b8c9d0-7777-4000-8000-000000000003',
    'Consultoria em Impacto Social — Prefeitura de Recife',
    'Prefeitura de Recife',
    'Prestação de serviço de consultoria para estruturar programa municipal de empreendedorismo jovem.',
    220000.00,
    'prospeccao',
    30,
    '2026-03-05',
    NULL,
    'Douglas Oliveira',
    'Contato inicial via edital. Necessário apresentar proposta técnica até maio/2026.'
  );

-- -----------------------------------------------------------------------------
-- Instâncias
-- -----------------------------------------------------------------------------
INSERT INTO instancias (id, template_id, programa_id, tipo, status, link_compartilhavel, prazo_validade, mensagem_personalizada, tags_filtro, published_at) VALUES
  (
    'b8c9d0e1-8888-4000-8000-000000000001',
    'd4e5f6a7-4444-4000-8000-000000000001',
    'b2c3d4e5-2222-4000-8000-000000000001',
    'diagnostico_inicial',
    'publicado',
    'https://fractus.app/f/b8c9d0e1-8888-4000-8000-000000000001',
    '2026-03-15T23:59:59-03:00',
    'Olá! Por favor, responda este diagnóstico inicial para que possamos conhecer melhor o seu negócio. Leva cerca de 5 minutos.',
    '{"status": ["ativo"]}',
    '2026-02-01T09:00:00-03:00'
  ),
  (
    'b8c9d0e1-8888-4000-8000-000000000002',
    'd4e5f6a7-4444-4000-8000-000000000003',
    'b2c3d4e5-2222-4000-8000-000000000001',
    'satisfacao_nps',
    'rascunho',
    NULL,
    NULL,
    'Conte para nós como foi a sessão de hoje!',
    NULL,
    NULL
  );

-- -----------------------------------------------------------------------------
-- Sessões
-- -----------------------------------------------------------------------------
INSERT INTO sessoes (id, programa_id, data, nome, percentual_presenca, tipo, instancia_satisfacao_id, template_satisfacao_id, denominador, tags_filtro) VALUES
  (
    'c9d0e1f2-9999-4000-8000-000000000001',
    'b2c3d4e5-2222-4000-8000-000000000001',
    '2026-02-15T14:00:00-03:00',
    'Sessão 1 — Introdução ao Marketing Digital',
    83.3,
    'presencial',
    NULL,
    'd4e5f6a7-4444-4000-8000-000000000003',
    ARRAY['f6a7b8c9-6666-4000-8000-000000000001', 'f6a7b8c9-6666-4000-8000-000000000002', 'f6a7b8c9-6666-4000-8000-000000000003', 'f6a7b8c9-6666-4000-8000-000000000004', 'f6a7b8c9-6666-4000-8000-000000000005', 'f6a7b8c9-6666-4000-8000-000000000006']::UUID[],
    NULL
  ),
  (
    'c9d0e1f2-9999-4000-8000-000000000002',
    'b2c3d4e5-2222-4000-8000-000000000001',
    '2026-03-01T14:00:00-03:00',
    'Sessão 2 — Gestão Financeira para Pequenos Negócios',
    66.7,
    'presencial',
    NULL,
    'd4e5f6a7-4444-4000-8000-000000000003',
    ARRAY['f6a7b8c9-6666-4000-8000-000000000001', 'f6a7b8c9-6666-4000-8000-000000000002', 'f6a7b8c9-6666-4000-8000-000000000003', 'f6a7b8c9-6666-4000-8000-000000000004', 'f6a7b8c9-6666-4000-8000-000000000005', 'f6a7b8c9-6666-4000-8000-000000000006']::UUID[],
    NULL
  );
