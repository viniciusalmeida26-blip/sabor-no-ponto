"use client"

import { Armchair, Plus, Table2 } from "lucide-react"
import { useStore } from "@/lib/store"

export default function MesasPage() {
  const { pedidos, hidratado } = useStore()
  const mesas = pedidos.filter((pedido) => pedido.status !== "cancelado" && pedido.status !== "entregue")

  if (!hidratado) return <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">Carregando mesas...</div>

  return <div className="space-y-8">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-primary">Operação</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Mesas e comandas</h1><p className="mt-2 text-sm text-muted-foreground">Acompanhe ocupação e consumo usando os pedidos ativos do sistema.</p></div><button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"><Plus className="size-4" aria-hidden="true" />Abrir comanda</button></header>
    <section aria-label="Resumo das mesas" className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><p className="text-sm text-muted-foreground">Mesas ocupadas</p><p className="mt-2 text-2xl font-bold text-foreground">{mesas.length}</p></div><div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><p className="text-sm text-muted-foreground">Aguardando pagamento</p><p className="mt-2 text-2xl font-bold text-foreground">0</p></div><div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><p className="text-sm text-muted-foreground">Mesas livres</p><p className="mt-2 text-2xl font-bold text-foreground">—</p></div></section>
    {mesas.length === 0 ? <section className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-sm"><Table2 className="mx-auto size-10 text-muted-foreground" aria-hidden="true" /><h2 className="mt-3 font-semibold text-foreground">Nenhuma comanda aberta</h2><p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">A estrutura atual ainda não possui mesas numeradas. Quando uma comanda for aberta, os pedidos ativos aparecerão aqui sem duplicar o cadastro de pedidos.</p></section> : <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{mesas.map((pedido) => <article key={pedido.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Armchair className="size-5" aria-hidden="true" /></span><div><p className="font-semibold text-foreground">Comanda {pedido.id.slice(-4)}</p><p className="text-xs text-muted-foreground">{pedido.cliente}</p></div></div><span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700">Em aberto</span></div><p className="mt-4 text-sm text-muted-foreground">{pedido.itens.reduce((total, item) => total + item.quantidade, 0)} item(ns) no consumo</p></article>)}</section>}
  </div>
}
