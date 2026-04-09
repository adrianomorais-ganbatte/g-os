"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Trash2, GripVertical, ArrowLeft } from "lucide-react"

import { cn } from "@/lib/utils"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createTemplate } from "@/app/actions/templates/actions"
import Link from "next/link"

type TipoCampo = 'texto' | 'escolha_unica' | 'multipla_escolha' | 'escala'
type TipoTemplate = 'diagnostico_inicial' | 'diagnostico_meio' | 'diagnostico_final' | 'satisfacao_nps'

interface Campo {
  id: string
  tipo: TipoCampo
  label: string
  obrigatorio: boolean
  opcoes: string[]
  escalaMin?: number
  escalaMax?: number
  escalaLabelMin?: string
  escalaLabelMax?: string
  isIndicador: boolean
  nomeIndicador?: string
}

const tipoTemplateLabels: Record<TipoTemplate, string> = {
  diagnostico_inicial: 'Diagnóstico Inicial',
  diagnostico_meio: 'Diagnóstico Meio',
  diagnostico_final: 'Diagnóstico Final',
  satisfacao_nps: 'Satisfação / NPS',
}

const tipoCampoLabels: Record<TipoCampo, string> = {
  texto: 'Texto',
  escolha_unica: 'Escolha Única',
  multipla_escolha: 'Múltipla Escolha',
  escala: 'Escala',
}

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export default function TemplateFormBuilderPage() {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)
  const [nome, setNome] = React.useState("")
  const [descricao, setDescricao] = React.useState("")
  const [tipo, setTipo] = React.useState<TipoTemplate>("diagnostico_inicial")
  const [permitirMultiplas, setPermitirMultiplas] = React.useState(false)
  const [campos, setCampos] = React.useState<Campo[]>([
    {
      id: generateId(),
      tipo: 'texto',
      label: '',
      obrigatorio: true,
      opcoes: [],
      isIndicador: false,
    }
  ])

  function addCampo() {
    setCampos([...campos, {
      id: generateId(),
      tipo: 'texto',
      label: '',
      obrigatorio: true,
      opcoes: [],
      isIndicador: false,
    }])
  }

  function removeCampo(id: string) {
    if (campos.length <= 1) {
      toast.error("Template deve ter pelo menos 1 campo")
      return
    }
    setCampos(campos.filter(c => c.id !== id))
  }

  function updateCampo(id: string, updates: Partial<Campo>) {
    setCampos(campos.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  function addOpcao(campoId: string) {
    setCampos(campos.map(c =>
      c.id === campoId
        ? { ...c, opcoes: [...c.opcoes, ''] }
        : c
    ))
  }

  function updateOpcao(campoId: string, index: number, value: string) {
    setCampos(campos.map(c =>
      c.id === campoId
        ? { ...c, opcoes: c.opcoes.map((o, i) => i === index ? value : o) }
        : c
    ))
  }

  function removeOpcao(campoId: string, index: number) {
    setCampos(campos.map(c =>
      c.id === campoId
        ? { ...c, opcoes: c.opcoes.filter((_, i) => i !== index) }
        : c
    ))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!nome || nome.length < 3) {
      toast.error("Nome deve ter pelo menos 3 caracteres")
      return
    }

    if (campos.some(c => !c.label)) {
      toast.error("Todos os campos devem ter um label")
      return
    }

    setIsPending(true)
    try {
      const result = await createTemplate({
        nome,
        descricao: descricao || undefined,
        tipo,
        permitirMultiplasRespostas: permitirMultiplas,
        campos: campos.map((campo, index) => ({
          tipo: campo.tipo,
          label: campo.label,
          obrigatorio: campo.obrigatorio,
          opcoes: campo.opcoes.length > 0 ? campo.opcoes.filter(Boolean) : undefined,
          escalaMin: campo.escalaMin,
          escalaMax: campo.escalaMax,
          escalaLabelMin: campo.escalaLabelMin,
          escalaLabelMax: campo.escalaLabelMax,
          isIndicador: campo.isIndicador,
          nomeIndicador: campo.nomeIndicador,
          ordem: index,
        })),
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Template criado com sucesso!")
      router.push("/dashboard/templates")
    } catch {
      toast.error("Erro inesperado ao salvar.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-8 p-8 max-w-4xl">
        <PageHeader
          title="Novo Template"
          description="Configure as perguntas do formulário de coleta."
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Templates", href: "/dashboard/templates" },
            { label: "Novo" },
          ]}
          actions={
            <Button variant="outline"
              render={(props) => (
                <Link href="/dashboard/templates" {...props} className={cn(props.className, "gap-2")}>
                  <ArrowLeft className="size-4" />
                  Voltar
                </Link>
              )}
            />
          }
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Metadados */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Diagnóstico Inicial — Turma 2026"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Breve descrição do propósito deste template..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select value={tipo} onValueChange={(v) => setTipo(v as TipoTemplate)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(tipoTemplateLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-3 pb-1">
                  <Switch
                    checked={permitirMultiplas}
                    onCheckedChange={setPermitirMultiplas}
                    id="multiplas"
                  />
                  <Label htmlFor="multiplas" className="text-sm">Permitir múltiplas respostas</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campos / Form Builder */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">Campos do Formulário</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addCampo} className="gap-2">
                <Plus className="size-4" />
                Adicionar Campo
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {campos.map((campo, index) => (
                <Card key={campo.id} className="border-dashed">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <GripVertical className="size-5 text-muted-foreground mt-2 shrink-0 cursor-grab" />
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            #{index + 1}
                          </span>
                          <Input
                            placeholder="Pergunta / Label do campo"
                            value={campo.label}
                            onChange={(e) => updateCampo(campo.id, { label: e.target.value })}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCampo(campo.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Tipo</Label>
                            <Select
                              value={campo.tipo}
                              onValueChange={(v) => updateCampo(campo.id, { tipo: v as TipoCampo })}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(tipoCampoLabels).map(([key, label]) => (
                                  <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-end gap-2 pb-1">
                            <Switch
                              checked={campo.obrigatorio}
                              onCheckedChange={(v) => updateCampo(campo.id, { obrigatorio: v })}
                              id={`obrigatorio-${campo.id}`}
                            />
                            <Label htmlFor={`obrigatorio-${campo.id}`} className="text-xs">Obrigatório</Label>
                          </div>
                          <div className="flex items-end gap-2 pb-1">
                            <Switch
                              checked={campo.isIndicador}
                              onCheckedChange={(v) => updateCampo(campo.id, { isIndicador: v })}
                              id={`indicador-${campo.id}`}
                            />
                            <Label htmlFor={`indicador-${campo.id}`} className="text-xs">Indicador</Label>
                          </div>
                        </div>

                        {campo.isIndicador && (
                          <Input
                            placeholder="Nome do indicador (ex: Satisfação Geral)"
                            value={campo.nomeIndicador || ''}
                            onChange={(e) => updateCampo(campo.id, { nomeIndicador: e.target.value })}
                          />
                        )}

                        {/* Escala config */}
                        {campo.tipo === 'escala' && (
                          <div className="grid grid-cols-4 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Mín</Label>
                              <Input
                                type="number"
                                value={campo.escalaMin ?? ''}
                                onChange={(e) => updateCampo(campo.id, { escalaMin: Number(e.target.value) })}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Máx</Label>
                              <Input
                                type="number"
                                value={campo.escalaMax ?? ''}
                                onChange={(e) => updateCampo(campo.id, { escalaMax: Number(e.target.value) })}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Label Mín</Label>
                              <Input
                                placeholder="Ex: Péssimo"
                                value={campo.escalaLabelMin || ''}
                                onChange={(e) => updateCampo(campo.id, { escalaLabelMin: e.target.value })}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Label Máx</Label>
                              <Input
                                placeholder="Ex: Excelente"
                                value={campo.escalaLabelMax || ''}
                                onChange={(e) => updateCampo(campo.id, { escalaLabelMax: e.target.value })}
                              />
                            </div>
                          </div>
                        )}

                        {/* Opções for escolha_unica / multipla_escolha */}
                        {(campo.tipo === 'escolha_unica' || campo.tipo === 'multipla_escolha') && (
                          <div className="space-y-2">
                            <Label className="text-xs">Opções</Label>
                            {campo.opcoes.map((opcao, opIndex) => (
                              <div key={opIndex} className="flex items-center gap-2">
                                <Input
                                  placeholder={`Opção ${opIndex + 1}`}
                                  value={opcao}
                                  onChange={(e) => updateOpcao(campo.id, opIndex, e.target.value)}
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOpcao(campo.id, opIndex)}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="size-3" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addOpcao(campo.id)}
                              className="gap-1 text-xs"
                            >
                              <Plus className="size-3" />
                              Adicionar Opção
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center gap-3 justify-end">
            <Button type="button" variant="outline"
              render={(props) => (
                <Link href="/dashboard/templates" {...props}>Cancelar</Link>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Criar Template"}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}
