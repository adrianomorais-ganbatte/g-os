import { getInstanceByLink } from "@/app/actions/instances/actions"
import { notFound } from "next/navigation"
import { PublicFormClient } from "@/components/domain/forms/public-form-client"

interface Props {
  params: Promise<{ linkId: string }>
}

export default async function FormularioPublicoPage({ params }: Props) {
  const { linkId } = await params
  const instance = await getInstanceByLink(linkId)

  if (!instance) {
    notFound()
  }

  const template = (instance as any).templates
  const campos = template?.campo_templates?.sort(
    (a: any, b: any) => a.ordem - b.ordem
  ) || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <div className="max-w-2xl mx-auto p-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {template?.nome || 'Formulário'}
          </h1>
          {template?.descricao && (
            <p className="text-muted-foreground mt-2 text-lg">{template.descricao}</p>
          )}
          {instance.mensagem_personalizada && (
            <p className="text-sm text-muted-foreground mt-4 bg-muted/50 p-3 rounded-lg">
              {instance.mensagem_personalizada}
            </p>
          )}
        </div>

        <PublicFormClient
          instanciaId={instance.id}
          templateId={template.id}
          programaId={instance.programa_id}
          versaoTemplate={template.versao}
          campos={campos}
          permitirMultiplas={template.permitir_multiplas_respostas}
        />
      </div>
    </div>
  )
}
