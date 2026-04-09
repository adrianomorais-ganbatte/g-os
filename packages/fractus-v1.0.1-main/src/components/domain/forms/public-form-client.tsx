"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { submitResponse } from "@/app/actions/responses/actions"
import { CheckCircle } from "lucide-react"

interface Campo {
  id: string
  tipo: 'texto' | 'escolha_unica' | 'multipla_escolha' | 'escala'
  label: string
  obrigatorio: boolean
  opcoes: string[] | null
  escala_min: number | null
  escala_max: number | null
  escala_label_min: string | null
  escala_label_max: string | null
}

interface Props {
  instanciaId: string
  templateId: string
  programaId: string
  versaoTemplate: number
  campos: Campo[]
  permitirMultiplas: boolean
}

export function PublicFormClient({
  instanciaId,
  templateId,
  programaId,
  versaoTemplate,
  campos,
  permitirMultiplas,
}: Props) {
  const [answers, setAnswers] = React.useState<Record<string, any>>({})
  const [isPending, setIsPending] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const [participanteId, setParticipanteId] = React.useState("")

  function updateAnswer(campoId: string, value: any) {
    setAnswers((prev) => ({ ...prev, [campoId]: value }))
  }

  function toggleMultiChoice(campoId: string, option: string) {
    setAnswers((prev) => {
      const current = (prev[campoId] as string[]) || []
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option]
      return { ...prev, [campoId]: next }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!participanteId) {
      toast.error("Informe seu ID de participante para continuar.")
      return
    }

    // Validate required fields
    for (const campo of campos) {
      if (campo.obrigatorio) {
        const answer = answers[campo.id]
        if (answer === undefined || answer === '' || (Array.isArray(answer) && answer.length === 0)) {
          toast.error(`O campo "${campo.label}" é obrigatório.`)
          return
        }
      }
    }

    setIsPending(true)
    try {
      const result = await submitResponse({
        instanciaId,
        participanteId,
        templateId,
        programaId,
        respostas: answers,
        versaoTemplate,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      setSubmitted(true)
      toast.success("Resposta enviada com sucesso!")
    } catch {
      toast.error("Erro ao enviar resposta.")
    } finally {
      setIsPending(false)
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="p-12 text-center space-y-4">
          <div className="mx-auto size-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="size-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold">Resposta Enviada!</h2>
          <p className="text-muted-foreground">
            Obrigado por preencher o formulário. Sua resposta foi registrada com sucesso.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Participant ID */}
      <Card>
        <CardContent className="p-6 space-y-2">
          <Label htmlFor="participante-id" className="font-semibold">
            Seu ID de Participante *
          </Label>
          <Input
            id="participante-id"
            placeholder="Cole aqui o ID recebido por e-mail"
            value={participanteId}
            onChange={(e) => setParticipanteId(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Você recebeu este ID no e-mail com o link do formulário.
          </p>
        </CardContent>
      </Card>

      {/* Form Fields */}
      {campos.map((campo, index) => (
        <Card key={campo.id}>
          <CardContent className="p-6 space-y-3">
            <Label className="font-semibold text-base">
              {index + 1}. {campo.label}
              {campo.obrigatorio && <span className="text-destructive ml-1">*</span>}
            </Label>

            {campo.tipo === 'texto' && (
              <Textarea
                placeholder="Digite sua resposta..."
                value={answers[campo.id] || ''}
                onChange={(e) => updateAnswer(campo.id, e.target.value)}
                className="resize-none"
              />
            )}

            {campo.tipo === 'escolha_unica' && campo.opcoes && (
              <RadioGroup
                value={answers[campo.id] || ''}
                onValueChange={(v) => updateAnswer(campo.id, v)}
                className="space-y-2"
              >
                {campo.opcoes.map((opcao) => (
                  <div key={opcao} className="flex items-center space-x-3">
                    <RadioGroupItem value={opcao} id={`${campo.id}-${opcao}`} />
                    <Label htmlFor={`${campo.id}-${opcao}`} className="font-normal cursor-pointer">
                      {opcao}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {campo.tipo === 'multipla_escolha' && campo.opcoes && (
              <div className="space-y-2">
                {campo.opcoes.map((opcao) => (
                  <div key={opcao} className="flex items-center space-x-3">
                    <Checkbox
                      id={`${campo.id}-${opcao}`}
                      checked={(answers[campo.id] as string[] || []).includes(opcao)}
                      onCheckedChange={() => toggleMultiChoice(campo.id, opcao)}
                    />
                    <Label htmlFor={`${campo.id}-${opcao}`} className="font-normal cursor-pointer">
                      {opcao}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {campo.tipo === 'escala' && (
              <div className="space-y-4 pt-2">
                <Slider
                  min={campo.escala_min ?? 1}
                  max={campo.escala_max ?? 5}
                  step={1}
                  value={[answers[campo.id] ?? campo.escala_min ?? 1]}
                  onValueChange={(v) => updateAnswer(campo.id, Array.isArray(v) ? v[0] : v)}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{campo.escala_label_min || campo.escala_min}</span>
                  <span className="text-lg font-bold text-foreground">
                    {answers[campo.id] ?? '—'}
                  </span>
                  <span>{campo.escala_label_max || campo.escala_max}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isPending} className="px-8">
          {isPending ? "Enviando..." : "Enviar Resposta"}
        </Button>
      </div>
    </form>
  )
}
