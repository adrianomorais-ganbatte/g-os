"use client"

import * as React from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { programSchema, type ProgramInput } from "@/lib/validations/program"
import { createProgram } from "@/app/actions/programs/actions"
import { DatePicker } from "@/components/ui/date-picker"

export function CreateProgramDialog() {
  const [open, setOpen] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)

  const form = useForm<ProgramInput>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      totalInscritos: 0,
      quantidadeVagas: undefined,
      dataInicio: new Date(),
      dataFim: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    },
  })

  const onSubmit: SubmitHandler<ProgramInput> = async (data) => {
    setIsPending(true)
    try {
      const result = await createProgram(data)

      if (result.error) {
        toast.error(typeof result.error === 'string' ? result.error : "Erro ao validar campos.")
        return
      }

      toast.success("Programa criado com sucesso!")
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
        <Plus className="size-4" />
        Novo Programa
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Programa</DialogTitle>
          <DialogDescription>
            Preencha as informações básicas para iniciar sua iniciativa de impacto social.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Programa</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Lideranças do Amanhã 2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição Curta</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Breve resumo da iniciativa..." 
                      className="resize-none" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dataInicio"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Início</FormLabel>
                    <DatePicker 
                        date={field.value} 
                        setDate={(date) => field.onChange(date)} 
                        placeholder="Início" 
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dataFim"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Término</FormLabel>
                    <DatePicker 
                        date={field.value} 
                        setDate={(date) => field.onChange(date)} 
                        placeholder="Fim" 
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="quantidadeVagas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vagas Totais</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalInscritos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inscritos Iniciais</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : "Criar Programa"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
