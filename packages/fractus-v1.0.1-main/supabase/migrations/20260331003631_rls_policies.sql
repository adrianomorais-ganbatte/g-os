-- Helper function for role checking
CREATE OR REPLACE FUNCTION current_user_tipo()
RETURNS TEXT AS $$
  SELECT tipo FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_patrocinador_id()
RETURNS UUID AS $$
  SELECT patrocinador_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_participante_id()
RETURNS UUID AS $$
  SELECT participante_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- POLICIES: PROFILES
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Gestores can manage all profiles" ON profiles
  FOR ALL USING (current_user_tipo() = 'gestor');

-- POLICIES: PROGRAMAS
CREATE POLICY "Gestores have full access to programs" ON programas
  FOR ALL USING (current_user_tipo() = 'gestor');

CREATE POLICY "Patrocinadores can view assigned programs" ON programas
  FOR SELECT USING (
    id IN (
      SELECT programa_id FROM programa_patrocinadores
      WHERE patrocinador_id = current_user_patrocinador_id()
    )
  );

CREATE POLICY "Participantes can view their program" ON programas
  FOR SELECT USING (
    id IN (
      SELECT programa_id FROM participantes
      WHERE id = current_user_participante_id()
    )
  );

-- POLICIES: PARTICIPANTES
CREATE POLICY "Gestores have full access to participants" ON participantes
  FOR ALL USING (current_user_tipo() = 'gestor');

CREATE POLICY "Participantes can view their own data" ON participantes
  FOR SELECT USING (id = current_user_participante_id());

CREATE POLICY "Patrocinadores can view participants in their programs" ON participantes
  FOR SELECT USING (
    programa_id IN (
      SELECT programa_id FROM programa_patrocinadores
      WHERE patrocinador_id = current_user_patrocinador_id()
    )
  );

-- POLICIES: RESPOSTAS
CREATE POLICY "Gestores have full access to answers" ON respostas
  FOR ALL USING (current_user_tipo() = 'gestor');

CREATE POLICY "Participantes can manage their own answers" ON respostas
  FOR ALL USING (participante_id = current_user_participante_id());

CREATE POLICY "Patrocinadores can view answers in their programs" ON respostas
  FOR SELECT USING (
    programa_id IN (
      SELECT programa_id FROM programa_patrocinadores
      WHERE patrocinador_id = current_user_patrocinador_id()
    )
  );

-- POLICIES: INSTANCIAS (Coleta)
CREATE POLICY "Gestores have full access to instances" ON instancias
  FOR ALL USING (current_user_tipo() = 'gestor');

CREATE POLICY "Participantes can view published instances in their program" ON instancias
  FOR SELECT USING (
    status = 'publicado' AND
    programa_id IN (
      SELECT programa_id FROM participantes
      WHERE id = current_user_participante_id()
    )
  );

-- Generic Gestor Policy for all other tables
CREATE POLICY "Gestor full access on patrocinadores" ON patrocinadores FOR ALL USING (current_user_tipo() = 'gestor');
CREATE POLICY "Gestor full access on programa_patrocinadores" ON programa_patrocinadores FOR ALL USING (current_user_tipo() = 'gestor');
CREATE POLICY "Gestor full access on workspaces" ON workspaces FOR ALL USING (current_user_tipo() = 'gestor');
CREATE POLICY "Gestor full access on templates" ON templates FOR ALL USING (current_user_tipo() = 'gestor');
CREATE POLICY "Gestor full access on campo_templates" ON campo_templates FOR ALL USING (current_user_tipo() = 'gestor');
CREATE POLICY "Gestor full access on negocios" ON negocios FOR ALL USING (current_user_tipo() = 'gestor');
CREATE POLICY "Gestor full access on participante_negocios" ON participante_negocios FOR ALL USING (current_user_tipo() = 'gestor');
CREATE POLICY "Gestor full access on tags" ON tags FOR ALL USING (current_user_tipo() = 'gestor');
CREATE POLICY "Gestor full access on sessoes" ON sessoes FOR ALL USING (current_user_tipo() = 'gestor');
CREATE POLICY "Gestor full access on presencas" ON presencas FOR ALL USING (current_user_tipo() = 'gestor');
CREATE POLICY "Gestor full access on paineis_customizados" ON paineis_customizados FOR ALL USING (current_user_tipo() = 'gestor');
