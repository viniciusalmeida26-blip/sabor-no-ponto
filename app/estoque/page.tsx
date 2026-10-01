"use client"

import { Boxes, CircleAlert, PackageSearch, Plus } from "lucide-react"
import { useStore } from "@/lib/store"

export default function EstoquePage() {
  const { hidratado } = useStore()

  if (!hidratado) return <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">Carregando estoque...</div>

  return <div className="space-y-8">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-primary">Controle operacional</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Estoque</h1><p className="mt-2 text-sm text-muted-foreground">Acompanhe ingredientes, entradas, saídas e níveis mínimos em um só lugar.</p></div><button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"><Plus className="size-4" aria-hidden="true" />Registrar movimentação</button></header>
    <section aria-label="Resumo do estoque" className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Boxes className="size-4" aria-hidden="true" />Itens cadastrados</div><p className="mt-2 text-2xl font-bold text-foreground">0</p></div><div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center gap-2 text-sm text-muted-foreground"><CircleAlert className="size-4" aria-hidden="true" />Estoque baixo</div><p className="mt-2 text-2xl font-bold text-foreground">0</p></div><div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center gap-2 text-sm text-muted-foreground"><PackageSearch className="size-4" aria-hidden="true" />Movimentações</div><p className="mt-2 text-2xl font-bold text-foreground">0</p></div></section>
    <section className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-sm"><Boxes className="mx-auto size-10 text-muted-foreground" aria-hidden="true" /><h2 className="mt-3 font-semibold text-foreground">Estoque ainda não cadastrado</h2><p className="mx-auto mt-1 max-w-lg text-sm text-muted-foreground">O banco atual não possui uma tabela de ingredientes e movimentações. Nenhum número foi inventado. Este espaço está pronto para receber o cadastro persistente quando o schema for estendido.</p></section>
  </div>
}
