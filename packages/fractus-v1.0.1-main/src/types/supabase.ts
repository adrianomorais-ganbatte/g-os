export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      campo_templates: {
        Row: {
          escala_label_max: string | null
          escala_label_min: string | null
          escala_max: number | null
          escala_min: number | null
          id: string
          is_indicador: boolean
          label: string
          nome_indicador: string | null
          obrigatorio: boolean
          opcoes: string[] | null
          ordem: number
          template_id: string
          tipo: Database["public"]["Enums"]["tipo_campo"]
        }
        Insert: {
          escala_label_max?: string | null
          escala_label_min?: string | null
          escala_max?: number | null
          escala_min?: number | null
          id?: string
          is_indicador?: boolean
          label: string
          nome_indicador?: string | null
          obrigatorio?: boolean
          opcoes?: string[] | null
          ordem?: number
          template_id: string
          tipo: Database["public"]["Enums"]["tipo_campo"]
        }
        Update: {
          escala_label_max?: string | null
          escala_label_min?: string | null
          escala_max?: number | null
          escala_min?: number | null
          id?: string
          is_indicador?: boolean
          label?: string
          nome_indicador?: string | null
          obrigatorio?: boolean
          opcoes?: string[] | null
          ordem?: number
          template_id?: string
          tipo?: Database["public"]["Enums"]["tipo_campo"]
        }
        Relationships: [
          {
            foreignKeyName: "campo_templates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      instancias: {
        Row: {
          created_at: string
          id: string
          link_compartilhavel: string | null
          mensagem_personalizada: string | null
          prazo_validade: string | null
          programa_id: string
          published_at: string | null
          status: Database["public"]["Enums"]["status_instancia"]
          tags_filtro: Json | null
          template_id: string
          tipo: Database["public"]["Enums"]["tipo_template"]
        }
        Insert: {
          created_at?: string
          id?: string
          link_compartilhavel?: string | null
          mensagem_personalizada?: string | null
          prazo_validade?: string | null
          programa_id: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["status_instancia"]
          tags_filtro?: Json | null
          template_id: string
          tipo: Database["public"]["Enums"]["tipo_template"]
        }
        Update: {
          created_at?: string
          id?: string
          link_compartilhavel?: string | null
          mensagem_personalizada?: string | null
          prazo_validade?: string | null
          programa_id?: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["status_instancia"]
          tags_filtro?: Json | null
          template_id?: string
          tipo?: Database["public"]["Enums"]["tipo_template"]
        }
        Relationships: [
          {
            foreignKeyName: "instancias_programa_id_fkey"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "programas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instancias_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      negocios: {
        Row: {
          created_at: string
          data_abertura: string | null
          data_fechamento: string | null
          descricao: string | null
          empresa: string | null
          id: string
          nome: string
          observacoes: string | null
          probabilidade: number | null
          responsavel: string | null
          status: Database["public"]["Enums"]["status_negocio"]
          valor: number | null
        }
        Insert: {
          created_at?: string
          data_abertura?: string | null
          data_fechamento?: string | null
          descricao?: string | null
          empresa?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          probabilidade?: number | null
          responsavel?: string | null
          status?: Database["public"]["Enums"]["status_negocio"]
          valor?: number | null
        }
        Update: {
          created_at?: string
          data_abertura?: string | null
          data_fechamento?: string | null
          descricao?: string | null
          empresa?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          probabilidade?: number | null
          responsavel?: string | null
          status?: Database["public"]["Enums"]["status_negocio"]
          valor?: number | null
        }
        Relationships: []
      }
      paineis_customizados: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          indicadores_selecionados: string[] | null
          nome: string
          programas_filtro: string[] | null
          tags_filtro: Json | null
          tipo_visualizacao: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          indicadores_selecionados?: string[] | null
          nome: string
          programas_filtro?: string[] | null
          tags_filtro?: Json | null
          tipo_visualizacao?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          indicadores_selecionados?: string[] | null
          nome?: string
          programas_filtro?: string[] | null
          tags_filtro?: Json | null
          tipo_visualizacao?: string
          updated_at?: string
        }
        Relationships: []
      }
      participante_negocios: {
        Row: {
          negocio_id: string
          participante_id: string
        }
        Insert: {
          negocio_id: string
          participante_id: string
        }
        Update: {
          negocio_id?: string
          participante_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participante_negocios_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participante_negocios_participante_id_fkey"
            columns: ["participante_id"]
            isOneToOne: false
            referencedRelation: "participantes"
            referencedColumns: ["id"]
          },
        ]
      }
      participantes: {
        Row: {
          created_at: string
          data_nascimento: string | null
          data_vinculo: string
          email: string
          faltas_consecutivas: number
          id: string
          nome: string
          percentual_presenca: number
          programa_id: string
          respondeu_diagnostico_inicial: boolean
          status: Database["public"]["Enums"]["status_participante"]
          telefone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_nascimento?: string | null
          data_vinculo?: string
          email: string
          faltas_consecutivas?: number
          id?: string
          nome: string
          percentual_presenca?: number
          programa_id: string
          respondeu_diagnostico_inicial?: boolean
          status?: Database["public"]["Enums"]["status_participante"]
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_nascimento?: string | null
          data_vinculo?: string
          email?: string
          faltas_consecutivas?: number
          id?: string
          nome?: string
          percentual_presenca?: number
          programa_id?: string
          respondeu_diagnostico_inicial?: boolean
          status?: Database["public"]["Enums"]["status_participante"]
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participantes_programa_id_fkey"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "programas"
            referencedColumns: ["id"]
          },
        ]
      }
      patrocinadores: {
        Row: {
          created_at: string
          id: string
          logo: string | null
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo?: string | null
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo?: string | null
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      presencas: {
        Row: {
          id: string
          participante_id: string
          presente: boolean
          sessao_id: string
        }
        Insert: {
          id?: string
          participante_id: string
          presente?: boolean
          sessao_id: string
        }
        Update: {
          id?: string
          participante_id?: string
          presente?: boolean
          sessao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "presencas_participante_id_fkey"
            columns: ["participante_id"]
            isOneToOne: false
            referencedRelation: "participantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presencas_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "sessoes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          nome: string
          participante_id: string | null
          patrocinador_id: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          nome: string
          participante_id?: string | null
          patrocinador_id?: string | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nome?: string
          participante_id?: string | null
          patrocinador_id?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      programa_patrocinadores: {
        Row: {
          patrocinador_id: string
          programa_id: string
        }
        Insert: {
          patrocinador_id: string
          programa_id: string
        }
        Update: {
          patrocinador_id?: string
          programa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "programa_patrocinadores_patrocinador_id_fkey"
            columns: ["patrocinador_id"]
            isOneToOne: false
            referencedRelation: "patrocinadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programa_patrocinadores_programa_id_fkey"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "programas"
            referencedColumns: ["id"]
          },
        ]
      }
      programas: {
        Row: {
          created_at: string
          data_fim: string
          data_inicio: string
          descricao: string | null
          id: string
          nome: string
          quantidade_vagas: number | null
          total_inscritos: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_fim: string
          data_inicio: string
          descricao?: string | null
          id?: string
          nome: string
          quantidade_vagas?: number | null
          total_inscritos?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          id?: string
          nome?: string
          quantidade_vagas?: number | null
          total_inscritos?: number
          updated_at?: string
        }
        Relationships: []
      }
      respostas: {
        Row: {
          completed_at: string | null
          created_at: string
          data_envio: string | null
          id: string
          instancia_id: string
          participante_id: string
          programa_id: string
          rascunho: Json | null
          respostas: Json
          template_id: string
          versao_template: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          data_envio?: string | null
          id?: string
          instancia_id: string
          participante_id: string
          programa_id: string
          rascunho?: Json | null
          respostas: Json
          template_id: string
          versao_template: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          data_envio?: string | null
          id?: string
          instancia_id?: string
          participante_id?: string
          programa_id?: string
          rascunho?: Json | null
          respostas?: Json
          template_id?: string
          versao_template?: number
        }
        Relationships: [
          {
            foreignKeyName: "respostas_instancia_id_fkey"
            columns: ["instancia_id"]
            isOneToOne: false
            referencedRelation: "instancias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_participante_id_fkey"
            columns: ["participante_id"]
            isOneToOne: false
            referencedRelation: "participantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_programa_id_fkey"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "programas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      sessoes: {
        Row: {
          created_at: string
          data: string
          denominador: string[] | null
          id: string
          instancia_satisfacao_id: string | null
          nome: string | null
          percentual_presenca: number
          programa_id: string
          tags_filtro: Json | null
          template_satisfacao_id: string | null
          tipo: string
        }
        Insert: {
          created_at?: string
          data: string
          denominador?: string[] | null
          id?: string
          instancia_satisfacao_id?: string | null
          nome?: string | null
          percentual_presenca?: number
          programa_id: string
          tags_filtro?: Json | null
          template_satisfacao_id?: string | null
          tipo?: string
        }
        Update: {
          created_at?: string
          data?: string
          denominador?: string[] | null
          id?: string
          instancia_satisfacao_id?: string | null
          nome?: string | null
          percentual_presenca?: number
          programa_id?: string
          tags_filtro?: Json | null
          template_satisfacao_id?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessoes_instancia_satisfacao_id_fkey"
            columns: ["instancia_satisfacao_id"]
            isOneToOne: false
            referencedRelation: "instancias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessoes_programa_id_fkey"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "programas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessoes_template_satisfacao_id_fkey"
            columns: ["template_satisfacao_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          participante_id: string
          tipo: string
          valor: string
        }
        Insert: {
          created_at?: string
          id?: string
          participante_id: string
          tipo: string
          valor: string
        }
        Update: {
          created_at?: string
          id?: string
          participante_id?: string
          tipo?: string
          valor?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_participante_id_fkey"
            columns: ["participante_id"]
            isOneToOne: false
            referencedRelation: "participantes"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
          permitir_multiplas_respostas: boolean
          tipo: Database["public"]["Enums"]["tipo_template"]
          updated_at: string
          versao: number
          workspace_id: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          permitir_multiplas_respostas?: boolean
          tipo: Database["public"]["Enums"]["tipo_template"]
          updated_at?: string
          versao?: number
          workspace_id?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          permitir_multiplas_respostas?: boolean
          tipo?: Database["public"]["Enums"]["tipo_template"]
          updated_at?: string
          versao?: number
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_participante_id: { Args: never; Returns: string }
      current_user_patrocinador_id: { Args: never; Returns: string }
      current_user_tipo: { Args: never; Returns: string }
    }
    Enums: {
      status_instancia: "rascunho" | "publicado" | "expirado"
      status_negocio: "prospeccao" | "negociacao" | "fechado" | "perdido"
      status_participante:
        | "pre_selecionado"
        | "selecionado"
        | "ativo"
        | "desistente"
        | "concluinte"
      tipo_campo: "texto" | "escolha_unica" | "multipla_escolha" | "escala"
      tipo_template:
        | "diagnostico_inicial"
        | "diagnostico_meio"
        | "diagnostico_final"
        | "satisfacao_nps"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      status_instancia: ["rascunho", "publicado", "expirado"],
      status_negocio: ["prospeccao", "negociacao", "fechado", "perdido"],
      status_participante: [
        "pre_selecionado",
        "selecionado",
        "ativo",
        "desistente",
        "concluinte",
      ],
      tipo_campo: ["texto", "escolha_unica", "multipla_escolha", "escala"],
      tipo_template: [
        "diagnostico_inicial",
        "diagnostico_meio",
        "diagnostico_final",
        "satisfacao_nps",
      ],
    },
  },
} as const
