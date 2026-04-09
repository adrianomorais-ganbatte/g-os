"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Lock, Mail, ArrowRight, Activity, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { login } from "./actions"

export default function LoginPage() {
  const [isPending, setIsPending] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsPending(true)
    setErrorMsg(null)

    const formData = new FormData(event.currentTarget)
    const result = await login(formData)

    if (result?.error) {
      setErrorMsg(result.error)
      toast.error(result.error)
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#09090b] relative overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Background Decorativo Estilo Glass/Blur */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      
      <div className="w-full max-w-md p-6 relative z-10">
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/20">
             <Activity className="size-8 text-white" strokeWidth={3} />
          </div>
          <div className="text-center">
             <h1 className="text-3xl font-black text-white tracking-tighter">Fractus Platform</h1>
             <p className="text-zinc-500 text-sm font-medium tracking-wide uppercase">Command Center 🛰️</p>
          </div>
        </div>

        <Card className="bg-zinc-900/40 border-zinc-800/50 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600" />
          <CardHeader className="pt-8 pb-4 text-center px-8">
            <CardTitle className="text-2xl font-bold text-zinc-100">Portal do Instrutor</CardTitle>
            <CardDescription className="text-zinc-400">
               Autentique-se para gerenciar o cronograma e o impacto.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10 pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1" htmlFor="email">
                  E-mail institucional
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-3 size-4.5 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input 
                    id="email"
                    name="email"
                    type="email" 
                    placeholder="ex@instituto.org" 
                    className="bg-zinc-950/50 border-zinc-800 text-zinc-100 pl-11 h-11 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-zinc-700"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between pl-1 pr-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest" htmlFor="password">
                    Senha de acesso
                  </label>
                  <a href="#" className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-tighter transition-colors">
                    Esqueceu?
                  </a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-3 size-4.5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                  <Input 
                    id="password"
                    name="password"
                    type="password" 
                    placeholder="••••••••" 
                    className="bg-zinc-950/50 border-zinc-800 text-zinc-100 pl-11 h-11 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-zinc-700"
                    required
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium flex items-center gap-2">
                   <ShieldCheck className="size-4" />
                   {errorMsg}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-blue-600/20 border-t border-white/10 group transition-all"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                     Processando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Acessar Dashboard
                    <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center space-y-4">
           <p className="text-zinc-600 text-xs font-medium">
             © 2026 Fractus Tech for Social Good. 
           </p>
           <div className="flex items-center justify-center gap-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">
              <a href="#" className="hover:text-zinc-300 transition-colors">Suporte</a>
              <span>•</span>
              <a href="#" className="hover:text-zinc-300 transition-colors">Termos</a>
              <span>•</span>
              <a href="#" className="hover:text-zinc-300 transition-colors">Privacidade</a>
           </div>
        </div>
      </div>
    </div>
  )
}
