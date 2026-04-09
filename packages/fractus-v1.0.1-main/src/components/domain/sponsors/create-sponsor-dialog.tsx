"use client"

import * as React from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"

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
import { createSponsor } from "@/app/actions/sponsors/actions"

export function CreateSponsorDialog() {
  const [open, setOpen] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)
  const [nome, setNome] = React.useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome || nome.length < 2) {
      toast.error("Nome deve ter pelo menos 2 caracteres")
      return
    }

    setIsPending(true)
    try {
      const result = await createSponsor({ nome })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Patrocinador criado com sucesso!")
      setNome("")
      setOpen(false)
    } catch {
      toast.error("Erro inesperado ao salvar.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="size-4" />
        Novo Patrocinador
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Novo Patrocinador</DialogTitle>
          <DialogDescription>
            Cadastre um novo patrocinador ou parceiro.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Patrocinador</Label>
            <Input
              id="nome"
              placeholder="Ex: Instituto Nexus"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Criar Patrocinador"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
