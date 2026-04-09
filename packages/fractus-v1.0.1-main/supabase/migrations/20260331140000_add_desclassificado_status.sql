-- Add missing 'desclassificado' status to the participante enum
-- Per spec: pre_selecionado → selecionado | desclassificado
ALTER TYPE status_participante ADD VALUE IF NOT EXISTS 'desclassificado';
