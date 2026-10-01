"use client"

import { useMemo } from "react"
import { ChefHat, Clock3, PackageCheck, Play, Timer, Utensils } from "lucide-react"
import { useStore, type Pedido, type StatusPedido } from "@/lib/store"
import { Button } from "@/components/ui/button"

const colunas: Array<{ status: StatusPedido; titulo: string; descricao: string; icon: typeof Clock3 }> = [
  { status: "pendente", titulo: "Pendentes", descricao: "Aguardando preparo", icon: Clock3 },
  { status: "preparando", titulo: "Em preparação", descricao: "Na bancada da cozinha", icon: Play },
  { status: "pronta", titulo: "Prontas", descricao: "Aguardando entrega", icon: PackageCheck },
]

const proximoStatus: Partial<Record<StatusPedido, StatusPedido>> = {
  pendente: "preparando",
  preparando: "pronta",
  pronta: "entregue",
}

function PedidoCozinha({ pedido, onAvancar }: { pedido: Pedido; onAvancar: () => void }) {
  const proximo = proximoStatus[pedido.status]
  const totalItens = pedido.itens.reduce((total, item) => total + item.quantidade, 0)
  const minutos = Math.max(1, Math.round((Date.now() - new Date(pedido.data).getTime()) / 60000))
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground"><Timer className="size-3.5" aria-hidden="true" />Há {minutos} min na fila</div>
      <div className="flex items-start justify-between gap-3">
        <div><p className="font-semibold text-foreground">Pedido #{pedido.id.slice(-6).toUpperCase()}</p><p className="mt-1 text-xs text-muted-foreground">{pedido.cliente} · {new Date(pedido.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p></div>
        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{pedido.forma.toUpperCase()}</span>
      </div>
      <ul className="space-y-2 border-t border-border pt-3">{pedido.itens.map((item) => <li key={item.descricao} className="flex gap-2 text-sm"><span className="font-semibold text-primary">{item.quantidade}x</span><span className="text-foreground">{item.descricao}</span></li>)}</ul>
      <p className="mt-3 text-xs font-medium text-muted-foreground">{totalItens} item(ns) no pedido</p>
      {pedido.observacao && <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">Obs.: {pedido.observacao}</p>}
      {proximo && <Button className="mt-4 w-full" size="sm" onClick={onAvancar}>{proximo === "entregue" ? "Marcar como entregue" : proximo === "preparando" ? "Iniciar preparo" : "Marcar como pronta"}</Button>}
    </article>
  )
}

export default function CozinhaPage() {
  const { pedidos, atualizarStatusPedido } = useStore()
  const ativos = useMemo(() => pedidos.filter((pedido) => pedido.status !== "entregue"), [pedidos])
  const resumo = colunas.map(({ status }) => ({ status, total: ativos.filter((pedido) => pedido.status === status).length }))
  return <div className="space-y-8">
    <header className="flex flex-col gap-5"><div><div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ChefHat className="size-5" aria-hidden="true" /></div><div><p className="text-sm font-medium text-primary">Operação</p><h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Cozinha</h1></div></div><p className="mt-2 text-sm text-muted-foreground">Acompanhe a fila de preparo sem perder o histórico dos pedidos.</p></div><div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm">{resumo.map(({ status, total }) => <div key={status} className="rounded-xl bg-muted/60 px-3 py-2 text-center"><p className="text-lg font-bold text-foreground">{total}</p><p className="truncate text-[11px] text-muted-foreground">{status === "pendente" ? "Na fila" : status === "preparando" ? "Preparando" : "Prontas"}</p></div>)}</div></header>
    <div className="grid gap-4 lg:grid-cols-3">{colunas.map(({ status, titulo, descricao, icon: Icon }) => { const itens = ativos.filter((pedido) => pedido.status === status); return <section key={status} className="min-w-0 space-y-3"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Icon className="size-4 text-primary" aria-hidden="true" /><div><h2 className="font-semibold text-foreground">{titulo}</h2><p className="text-xs text-muted-foreground">{descricao}</p></div></div><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">{itens.length}</span></div>{itens.length ? itens.map((pedido) => <PedidoCozinha key={pedido.id} pedido={pedido} onAvancar={() => atualizarStatusPedido(pedido.id, proximoStatus[pedido.status] ?? status)} />) : <div className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 p-5 text-center"><Utensils className="size-6 text-muted-foreground" aria-hidden="true" /><p className="mt-2 text-sm text-muted-foreground">Nenhum pedido nesta etapa.</p></div>}</section> })}</div>
  </div>
}
