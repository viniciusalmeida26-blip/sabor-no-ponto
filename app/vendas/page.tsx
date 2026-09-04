"use client"

import { useMemo } from "react"
import { AppShell } from "@/components/app-shell"
import { useStore, formatarBRL, rotuloForma, rotuloStatus, totalPedido, ehMarmita, type StatusPedido } from "@/lib/store"
import { ClipboardList, Clock, ChefHat, CheckCircle2, Soup, Trash2, UtensilsCrossed } from "lucide-react"

const cardapios = [
  { dia: "Domingo", mistura: "Frango assado com ervas", acompanhamentos: "Arroz, feijão, farofa e salada", valor: 20 },
  { dia: "Segunda-feira", mistura: "Bife acebolado", acompanhamentos: "Arroz, feijão, purê de batata e salada", valor: 22 },
  { dia: "Terça-feira", mistura: "Frango grelhado", acompanhamentos: "Arroz, feijão, macarrão e salada", valor: 20 },
  { dia: "Quarta-feira", mistura: "Carne de panela", acompanhamentos: "Arroz, feijão, mandioca e couve", valor: 23 },
  { dia: "Quinta-feira", mistura: "Bisteca suína acebolada", acompanhamentos: "Arroz, feijão, batata dourada e salada", valor: 22 },
  { dia: "Sexta-feira", mistura: "Strogonoff de frango", acompanhamentos: "Arroz, feijão, batata palha e salada", valor: 24 },
  { dia: "Sábado", mistura: "Linguiça acebolada", acompanhamentos: "Arroz, feijão, farofa e vinagrete", valor: 20 },
]

const statusInfo: Record<StatusPedido, { icon: typeof Clock; classe: string }> = {
  pendente: { icon: Clock, classe: "bg-muted text-muted-foreground" },
  preparando: { icon: ChefHat, classe: "bg-accent text-accent-foreground" },
  entregue: { icon: CheckCircle2, classe: "bg-primary/15 text-primary" },
}

function ehHoje(iso: string) {
  const d = new Date(iso)
  const h = new Date()
  return d.getDate() === h.getDate() && d.getMonth() === h.getMonth() && d.getFullYear() === h.getFullYear()
}

function horaFormatada(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

export default function VendasPage() {
  const { vendas, pedidos, removeVenda } = useStore()
  const cardapio = cardapios[new Date().getDay()]
  const vendasHoje = useMemo(() => vendas.filter((v) => ehHoje(v.data)), [vendas])
  const pedidosHoje = useMemo(() => pedidos.filter((p) => ehHoje(p.data)), [pedidos])
  const totalHoje = useMemo(() => vendasHoje.reduce((s, v) => s + v.quantidade * v.valorUnitario, 0), [vendasHoje])
  const totalMarmitasHoje = useMemo(() => vendasHoje.filter((v) => ehMarmita(v.descricao)).reduce((s, v) => s + v.quantidade * v.valorUnitario, 0), [vendasHoje])
  const qtdMarmitasHoje = useMemo(() => vendasHoje.filter((v) => ehMarmita(v.descricao)).reduce((s, v) => s + v.quantidade, 0), [vendasHoje])

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Vendas</h1>
          <p className="text-sm text-muted-foreground">Confira o cardápio e acompanhe as vendas do dia.</p>
        </div>

        <section className="relative min-h-[300px] overflow-hidden rounded-2xl border border-border bg-primary shadow-sm">
          <img src="/images/fundo-marmita.png" alt="Marmitas prontas com arroz, feijão, frango e salada" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/60 to-foreground/10" />
          <div className="relative flex min-h-[300px] max-w-xl flex-col justify-center gap-5 p-6 text-primary-foreground sm:p-8">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary-foreground/85">
              <Soup className="size-5" aria-hidden="true" />
              Cardápio de hoje
            </div>
            <div>
              <p className="text-sm font-medium text-primary-foreground/80">{cardapio.dia}</p>
              <h2 className="mt-1 text-3xl font-bold leading-tight text-balance">Marmita de {cardapio.mistura}</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-primary-foreground/85">{cardapio.acompanhamentos}. A mistura do dia já vem definida, sem escolhas.</p>
            <div className="flex items-end justify-between gap-4 border-t border-primary-foreground/25 pt-4">
              <span className="text-sm text-primary-foreground/80">Valor da marmita</span>
              <span className="text-3xl font-bold">{formatarBRL(cardapio.valor)}</span>
            </div>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"><UtensilsCrossed className="size-5" aria-hidden="true" /></div>
            <div><p className="text-xs text-muted-foreground">Total vendido hoje</p><p className="text-xl font-bold text-foreground">{formatarBRL(totalHoje)}</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground"><Soup className="size-5" aria-hidden="true" /></div>
            <div className="min-w-0 flex-1"><p className="text-xs text-muted-foreground">Total só de marmitas</p><p className="text-xl font-bold text-foreground">{formatarBRL(totalMarmitasHoje)}</p></div>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{qtdMarmitasHoje} {qtdMarmitasHoje === 1 ? "marmita" : "marmitas"}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">Vendas de hoje</h2>
          {vendasHoje.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-10 text-center"><UtensilsCrossed className="size-8 text-muted-foreground" aria-hidden="true" /><p className="text-sm text-muted-foreground">Nenhuma venda registrada hoje.</p></div>
          ) : (
            <ul className="flex flex-col gap-2">{vendasHoje.map((v) => <li key={v.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"><div className="min-w-0"><p className="truncate text-sm font-medium text-foreground">{v.descricao}</p><p className="text-xs text-muted-foreground">{v.quantidade} × {formatarBRL(v.valorUnitario)} · {rotuloForma[v.forma]}</p></div><div className="flex items-center gap-2"><span className="text-sm font-semibold text-foreground">{formatarBRL(v.quantidade * v.valorUnitario)}</span><button type="button" onClick={() => removeVenda(v.id)} className="rounded-md p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive" aria-label={`Remover venda ${v.descricao}`}><Trash2 className="size-4" aria-hidden="true" /></button></div></li>)}</ul>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">Registro diário dos pedidos</h2>
          {pedidosHoje.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-10 text-center"><ClipboardList className="size-8 text-muted-foreground" aria-hidden="true" /><p className="text-sm text-muted-foreground">Nenhum pedido registrado hoje.</p></div>
          ) : (
            <ul className="flex flex-col gap-3">{pedidosHoje.map((p) => { const info = statusInfo[p.status]; const Icon = info.icon; return <li key={p.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{p.cliente}</p><p className="text-xs text-muted-foreground">{horaFormatada(p.data)} · {rotuloForma[p.forma]}</p></div><span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${info.classe}`}><Icon className="size-3.5" aria-hidden="true" />{rotuloStatus[p.status]}</span></div><ul className="flex flex-col gap-1 border-y border-border py-2">{p.itens.map((item, i) => <li key={i} className="flex items-center justify-between text-sm text-foreground"><span className="truncate">{item.descricao} × {item.quantidade}</span><span className="text-muted-foreground">{formatarBRL(item.preco * item.quantidade)}</span></li>)}</ul><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Total</span><span className="text-sm font-bold text-primary">{formatarBRL(totalPedido(p.itens))}</span></div>{p.observacao && <p className="text-xs italic text-muted-foreground">{p.observacao}</p>}</li> })}</ul>
          )}
        </div>
      </div>
    </AppShell>
  )
}
