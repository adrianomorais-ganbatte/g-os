"use client"

import * as React from "react"
import { toast } from "sonner"
import { Upload, FileText, AlertTriangle, Check } from "lucide-react"
import Papa from "papaparse"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createParticipant } from "@/app/actions/participants/actions"
import { Database } from "@/types/supabase"

type Programa = Database['public']['Tables']['programas']['Row']

interface CsvRow {
  nome: string
  email: string
  status: string
  telefone?: string
}

interface ImportResult {
  success: number
  skipped: number
  errors: string[]
}

const VALID_STATUSES = ['pre_selecionado', 'selecionado', 'ativo', 'concluinte', 'desistente']

function parseCSV(text: string): CsvRow[] {
  const result = Papa.parse<string[]>(text, {
    skipEmptyLines: true,
  })

  const rows: CsvRow[] = []
  const seenEmails = new Set<string>()

  for (const row of result.data) {
    // Skip header row
    if (row[0]?.toLowerCase().includes('nome') || row[0]?.toLowerCase().includes('name')) {
      continue
    }
    // Skip rows with less than 2 columns
    if (row.length < 2) continue

    const nome = row[0]?.trim()
    const email = row[1]?.trim()
    const statusRaw = row[2]?.trim()?.toLowerCase() || 'selecionado'
    const telefone = row[3]?.trim()

    if (!nome || !email || !email.includes('@')) continue
    if (seenEmails.has(email.toLowerCase())) continue

    seenEmails.add(email.toLowerCase())

    const status = VALID_STATUSES.includes(statusRaw) ? statusRaw : 'selecionado'
    rows.push({ nome, email, status, telefone })
  }

  return rows
}

interface CSVImportDialogProps {
  programas: Programa[]
}

export function CSVImportDialog({ programas }: CSVImportDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState<1 | 2 | 3>(1) // 1: upload, 2: preview, 3: results
  const [programaId, setProgramaId] = React.useState("")
  const [parsedRows, setParsedRows] = React.useState<CsvRow[]>([])
  const [result, setResult] = React.useState<ImportResult | null>(null)
  const [isPending, setIsPending] = React.useState(false)

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const rows = parseCSV(text)

      if (rows.length === 0) {
        toast.error("Nenhum registro válido encontrado no CSV.")
        return
      }

      setParsedRows(rows)
      setStep(2)
    }
    reader.readAsText(file)
  }

  async function handleImport() {
    if (!programaId) {
      toast.error("Selecione um programa.")
      return
    }

    setIsPending(true)
    const importResult: ImportResult = { success: 0, skipped: 0, errors: [] }

    for (const row of parsedRows) {
      try {
        const res = await createParticipant({
          nome: row.nome,
          email: row.email,
          status: row.status as any,
          programaId,
          telefone: row.telefone,
        })

        if (res.error) {
          if (typeof res.error === 'string' && res.error.includes('duplicate')) {
            importResult.skipped++
          } else {
            importResult.errors.push(`${row.email}: ${typeof res.error === 'string' ? res.error : 'Erro de validação'}`)
          }
        } else {
          importResult.success++
        }
      } catch {
        importResult.errors.push(`${row.email}: Erro inesperado`)
      }
    }

    setResult(importResult)
    setStep(3)
    setIsPending(false)

    if (importResult.success > 0) {
      toast.success(`${importResult.success} participante(s) importado(s) com sucesso!`)
    }
  }

  function handleClose() {
    setOpen(false)
    setTimeout(() => {
      setStep(1)
      setParsedRows([])
      setResult(null)
      setProgramaId("")
    }, 200)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => v ? setOpen(true) : handleClose()}>
      <DialogTrigger render={<Button variant="outline" className="gap-2" />}>
        <Upload className="size-4" />
        Importar CSV
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Importar Participantes via CSV"}
            {step === 2 && "Pré-visualização dos Dados"}
            {step === 3 && "Resultado da Importação"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Upload de arquivo CSV com formato: nome, email, status (opcional), telefone (opcional)"}
            {step === 2 && `${parsedRows.length} registro(s) encontrado(s). Revise antes de confirmar.`}
            {step === 3 && "Processo de importação concluído."}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Programa de Destino</Label>
              <Select value={programaId} onValueChange={(v) => setProgramaId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o programa..." />
                </SelectTrigger>
                <SelectContent>
                  {programas.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Arquivo CSV</Label>
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
              />
              <p className="text-xs text-muted-foreground">
                Formato: nome, email, status, telefone. Header detectado automaticamente.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 2 && (
          <div className="space-y-4 py-4">
            <div className="max-h-[300px] overflow-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedRows.slice(0, 20).map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{row.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{row.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {parsedRows.length > 20 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        ...e mais {parsedRows.length - 20} registro(s)
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button onClick={handleImport} disabled={isPending || !programaId}>
                {isPending ? "Importando..." : `Importar ${parsedRows.length} registros`}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && result && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <Check className="size-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-emerald-700">{result.success}</p>
                <p className="text-xs text-emerald-600">Importados</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <AlertTriangle className="size-5 text-amber-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-amber-700">{result.skipped}</p>
                <p className="text-xs text-amber-600">Duplicados</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <FileText className="size-5 text-red-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-red-700">{result.errors.length}</p>
                <p className="text-xs text-red-600">Erros</p>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="max-h-[150px] overflow-auto bg-muted/50 rounded-lg p-3 text-xs space-y-1">
                {result.errors.map((err, i) => (
                  <p key={i} className="text-destructive">{err}</p>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleClose}>Fechar</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
