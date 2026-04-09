"use client"

import * as React from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { CalendarRange } from "lucide-react"

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { sessionSchema, type SessionInput } from "@/lib/validations/session"
import { createSession } from "@/app/actions/sessions/actions"
import { DatePicker } from "@/components/ui/date-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { Database } from "@/types/supabase"

type Template = Database['public']['Tables']['templates']['Row']

interface CreateSessionDialogProps {
  programas: Database['public']['Tables']['programas']['Row'][]
  templatesSatisfacao?: Template[]
}

export function CreateSessionDialog({ programas, templatesSatisfacao = [] }: CreateSessionDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)

  const form = useForm<SessionInput>({
    resolver: zodResolver(sessionSchema) as any,
    defaultValues: {
      nome: "",
      data: new Date(),
      tipo: "oficina",
      programaId: "",
      tagsFiltro: [],
      comNps: false,
      templateSatisfacaoId: undefined,
    },
  })

  const onSubmit: SubmitHandler<SessionInput> = async (data) => {
    setIsPending(true)
    try {
      const result = await createSession(data)

      if (result.error) {
        toast.error(typeof result.error === 'string' ? result.error : "Erro ao validar campos.")
        return
      }

      toast.success("Sessão agendada com sucesso!")
      form.reset()
      setOpen(false)
    } catch (error) {
      toast.error("Ocorreu um erro inesperado ao salvar.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <CalendarRange className="size-4" />
        Agendar Encontro
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Encontro</DialogTitle>
          <DialogDescription>
            Agende uma nova oficina, mentoria ou palestra para os seus participantes.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 py-4">
            <FormField
              control={form.control as any}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Encontro</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Oficina de Design Thinking" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control as any}
                name="data"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Realização</FormLabel>
                    <DatePicker 
                        date={field.value} 
                        setDate={(date) => field.onChange(date)} 
                        placeholder="Selecione o dia" 
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control as any}
                name="programaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Programa</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {programas.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Atividade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="oficina">Oficina</SelectItem>
                        <SelectItem value="mentoria">Mentoria</SelectItem>
                        <SelectItem value="palestra">Palestra</SelectItem>
                        <SelectItem value="encontro_geral">Encontro Geral</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* NPS Section */}
            <div className="space-y-3 border-t pt-4">
              <FormField
                control={form.control as any}
                name="comNps"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 font-medium">Incluir pesquisa de satisfação (NPS)</FormLabel>
                  </FormItem>
                )}
              />
              {form.watch("comNps") && (
                <FormField
                  control={form.control as any}
                  name="templateSatisfacaoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template de Satisfação</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o template..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {templatesSatisfacao.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Agendando..." : "Confirmar Encontro"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
