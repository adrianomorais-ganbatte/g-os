-- Enums
CREATE TYPE status_participante AS ENUM (
  'pre_selecionado',
  'selecionado',
  'ativo',
  'desistente',
  'concluinte'
);

CREATE TYPE tipo_template AS ENUM (
  'diagnostico_inicial',
  'diagnostico_meio',
  'diagnostico_final',
  'satisfacao_nps'
);

CREATE TYPE tipo_campo AS ENUM (
  'texto',
  'escolha_unica',
  'multipla_escolha',
  'escala'
);

CREATE TYPE status_negocio AS ENUM (
  'prospeccao',
  'negociacao',
  'fechado',
  'perdido'
);

CREATE TYPE status_instancia AS ENUM (
  'rascunho',
  'publicado',
  'expirado'
);

-- Profiles / Usuarios
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL DEFAULT 'gestor', -- gestor | participante | patrocinador
  participante_id UUID, -- Se o usuário for participante
  patrocinador_id UUID, -- Se o usuário for patrocinador
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Patrocinadores
CREATE TABLE patrocinadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  logo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Programas
CREATE TABLE programas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ NOT NULL,
  total_inscritos INTEGER NOT NULL DEFAULT 0,
  quantidade_vagas INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Relacionamento Programa-Patrocinador
CREATE TABLE programa_patrocinadores (
  programa_id UUID REFERENCES programas(id) ON DELETE CASCADE,
  patrocinador_id UUID REFERENCES patrocinadores(id) ON DELETE CASCADE,
  PRIMARY KEY (programa_id, patrocinador_id)
);

-- Workspaces
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Templates
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo tipo_template NOT NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  permitir_multiplas_respostas BOOLEAN NOT NULL DEFAULT false,
  versao INTEGER NOT NULL DEFAULT 1,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Campo Templates
CREATE TABLE campo_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  tipo tipo_campo NOT NULL,
  label TEXT NOT NULL,
  obrigatorio BOOLEAN NOT NULL DEFAULT true,
  opcoes TEXT[], -- Para escolha_unica e multipla_escolha
  escala_min INTEGER,
  escala_max INTEGER,
  escala_label_min TEXT,
  escala_label_max TEXT,
  is_indicador BOOLEAN NOT NULL DEFAULT false,
  nome_indicador TEXT,
  ordem INTEGER NOT NULL DEFAULT 0
);

-- Participantes
CREATE TABLE participantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  data_nascimento TIMESTAMPTZ,
  programa_id UUID NOT NULL REFERENCES programas(id) ON DELETE CASCADE,
  status status_participante NOT NULL DEFAULT 'pre_selecionado',
  respondeu_diagnostico_inicial BOOLEAN NOT NULL DEFAULT false,
  percentual_presenca DECIMAL(5,2) NOT NULL DEFAULT 0,
  faltas_consecutivas INTEGER NOT NULL DEFAULT 0,
  data_vinculo TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Negocios
CREATE TABLE negocios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  empresa TEXT,
  descricao TEXT,
  valor DECIMAL(15,2),
  status status_negocio NOT NULL DEFAULT 'prospeccao',
  probabilidade INTEGER CHECK (probabilidade >= 0 AND probabilidade <= 100),
  data_abertura TIMESTAMPTZ,
  data_fechamento TIMESTAMPTZ,
  responsavel TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Relacionamento Participante-Negocio
CREATE TABLE participante_negocios (
  participante_id UUID REFERENCES participantes(id) ON DELETE CASCADE,
  negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE,
  PRIMARY KEY (participante_id, negocio_id)
);

-- Tags
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL, -- turma | negocio | grupo | cohort | outro
  valor TEXT NOT NULL,
  participante_id UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tags_tipo_valor ON tags(tipo, valor);
CREATE INDEX idx_tags_participante ON tags(participante_id);

-- Instancias de Coleta
CREATE TABLE instancias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE RESTRICT,
  programa_id UUID NOT NULL REFERENCES programas(id) ON DELETE CASCADE,
  tipo tipo_template NOT NULL,
  status status_instancia NOT NULL DEFAULT 'rascunho',
  link_compartilhavel TEXT UNIQUE,
  prazo_validade TIMESTAMPTZ,
  mensagem_personalizada TEXT,
  tags_filtro JSONB, -- Filtros de tags para segmentar participantes
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- Respostas
CREATE TABLE respostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instancia_id UUID NOT NULL REFERENCES instancias(id) ON DELETE CASCADE,
  participante_id UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES templates(id),
  programa_id UUID NOT NULL REFERENCES programas(id),
  respostas JSONB NOT NULL,
  rascunho JSONB,
  data_envio TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  versao_template INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (instancia_id, participante_id)
);

-- Sessoes e Presenca
CREATE TABLE sessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programa_id UUID NOT NULL REFERENCES programas(id) ON DELETE CASCADE,
  data TIMESTAMPTZ NOT NULL,
  nome TEXT,
  percentual_presenca DECIMAL(5,2) NOT NULL DEFAULT 0,
  tipo TEXT NOT NULL DEFAULT 'manual', -- manual | inferida
  instancia_satisfacao_id UUID REFERENCES instancias(id),
  template_satisfacao_id UUID REFERENCES templates(id),
  denominador UUID[], -- Snapshot IDs de participantes esperados
  tags_filtro JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE presencas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sessao_id UUID NOT NULL REFERENCES sessoes(id) ON DELETE CASCADE,
  participante_id UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
  presente BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (sessao_id, participante_id)
);

-- Paineis Customizados (Impacto)
CREATE TABLE paineis_customizados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  indicadores_selecionados TEXT[],
  programas_filtro UUID[],
  tags_filtro JSONB,
  tipo_visualizacao TEXT NOT NULL DEFAULT 'cards',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Setup (Basic)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrocinadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE programas ENABLE ROW LEVEL SECURITY;
ALTER TABLE programa_patrocinadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campo_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE negocios ENABLE ROW LEVEL SECURITY;
ALTER TABLE participante_negocios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE instancias ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE presencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE paineis_customizados ENABLE ROW LEVEL SECURITY;
