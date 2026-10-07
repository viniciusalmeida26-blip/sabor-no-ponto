"use client"

import { AppShell } from "@/components/app-shell"
import { formatarBRL, useStore } from "@/lib/store"
import Link from "next/link"
import { CalendarDays, ClipboardPlus, FileText, ShoppingBag, Soup, TrendingUp, Utensils, Clock3, CheckCircle2 } from "lucide-react"

export default function VendasPage() {
  const { vendas, produtos, pedidos, marmitaDoDiaId, configuracaoMarmitaDia } = useStore()
  const marmitas = produtos.filter((produto) => produto.categoria === "marmita")
  const marmitaDoDia = produtos.find((produto) => produto.id === marmitaDoDiaId) ?? marmitas[0]
  const hoje = new Date()
  const chaveHoje = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`
  const vendasHoje = vendas.filter((venda) => venda.data.slice(0, 10) === chaveHoje)
  const faturamentoHoje = vendasHoje.reduce((total, venda) => total + venda.quantidade * venda.valorUnitario, 0)
  const unidadesHoje = vendasHoje.reduce((total, venda) => total + venda.quantidade, 0)
  const pedidosHoje = pedidos.filter((pedido) => pedido.data.slice(0, 10) === chaveHoje)
  const pedidosEmPreparo = pedidosHoje.filter((pedido) => pedido.status === "preparando").length
  const pedidosConcluidos = pedidosHoje.filter((pedido) => pedido.status === "entregue").length
  const ticketMedio = vendasHoje.length ? faturamentoHoje / vendasHoje.length : 0
  const dataFormatada = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(hoje)

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Início</h1>
          <p className="mt-1 flex items-center gap-2 text-sm capitalize text-muted-foreground"><CalendarDays className="size-4" aria-hidden="true" />{dataFormatada}</p>
        </div>

        <section aria-label="Ações rápidas" className="grid gap-3 sm:grid-cols-3">
          <Link href="/pedidos" className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><ClipboardPlus className="size-5" aria-hidden="true" /></span><span><span className="block text-sm font-semibold text-foreground">Novo pedido</span><span className="block text-xs text-muted-foreground">Acompanhar atendimento</span></span></Link>
          <Link href="/gerenciamento-cardapio" className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Utensils className="size-5" aria-hidden="true" /></span><span><span className="block text-sm font-semibold text-foreground">Gerenciar cardápio</span><span className="block text-xs text-muted-foreground">Produtos e disponibilidade</span></span></Link>
          <Link href="/relatorios" className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileText className="size-5" aria-hidden="true" /></span><span><span className="block text-sm font-semibold text-foreground">Ver relatórios</span><span className="block text-xs text-muted-foreground">Analisar desempenho</span></span></Link>
        </section>

        <section aria-label="Indicadores do dia" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Faturamento hoje</p><span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><TrendingUp className="size-4" aria-hidden="true" /></span></div><p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{formatarBRL(faturamentoHoje)}</p><p className="mt-1 text-xs text-muted-foreground">Total registrado</p></div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Vendas registradas</p><span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><ShoppingBag className="size-4" aria-hidden="true" /></span></div><p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{vendasHoje.length}</p><p className="mt-1 text-xs text-muted-foreground">Lançamentos de hoje</p></div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Marmitas vendidas</p><span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Soup className="size-4" aria-hidden="true" /></span></div><p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{unidadesHoje}</p><p className="mt-1 text-xs text-muted-foreground">Unidades comercializadas</p></div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Em preparo</p><span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600"><Clock3 className="size-4" aria-hidden="true" /></span></div><p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{pedidosEmPreparo}</p><p className="mt-1 text-xs text-muted-foreground">Pedidos de hoje</p></div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Concluídos</p><span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600"><CheckCircle2 className="size-4" aria-hidden="true" /></span></div><p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{pedidosConcluidos}</p><p className="mt-1 text-xs text-muted-foreground">Pedidos entregues</p></div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Ticket médio</p><span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><TrendingUp className="size-4" aria-hidden="true" /></span></div><p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{formatarBRL(ticketMedio)}</p><p className="mt-1 text-xs text-muted-foreground">Por lançamento</p></div>
        </section>

        <section className="relative min-h-[340px] overflow-hidden rounded-2xl border border-border bg-primary shadow-sm">
          <img src={marmitaDoDia?.imagem || "/images/fundo-marmita.png"} alt={marmitaDoDia?.nome || "Marmita do cardápio do dia"} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/95 via-foreground/65 to-foreground/15" />
          <div className="relative flex min-h-[340px] flex-col justify-center gap-5 p-6 text-primary-foreground sm:p-9">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary-foreground/85"><Soup className="size-5" aria-hidden="true" /> Cardápio em destaque</div>
            <div><p className="text-sm font-medium text-primary-foreground/80">Marmita do Dia</p><h2 className="mt-1 max-w-2xl text-3xl font-bold leading-tight text-balance sm:text-4xl">{configuracaoMarmitaDia.nome || marmitaDoDia?.nome}</h2></div>
            <p className="max-w-xl text-sm leading-6 text-primary-foreground/85">{configuracaoMarmitaDia.descricao || marmitaDoDia?.descricao}</p>
            {configuracaoMarmitaDia.ingredientes && <div className="flex flex-col gap-2"><p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">Ingredientes</p><p className="max-w-xl text-sm leading-6 text-primary-foreground/90">{configuracaoMarmitaDia.ingredientes.split(",").map((item) => item.trim()).filter(Boolean).join(" • ")}</p></div>}
            <div className="flex flex-wrap gap-2"><span className="rounded-full bg-primary-foreground/15 px-3 py-1.5 text-sm">{marmitaDoDia?.disponivel ? "Disponível" : "Indisponível"}</span><span className="rounded-full bg-primary-foreground/15 px-3 py-1.5 text-sm">Ingredientes do dia</span></div>
          </div>
        </section>


        <section aria-label="Preços das marmitas" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {marmitas.length > 0 ? marmitas.map((produto) => <div key={produto.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"><div className="min-w-0"><p className="truncate text-xs text-muted-foreground">{produto.nome}</p><p className="mt-1 text-2xl font-bold text-foreground">{formatarBRL(produto.preco)}</p></div><img src={produto.imagem || "/images/fundo-marmita.png"} alt={`Foto de ${produto.nome}`} loading="lazy" className="size-12 rounded-xl object-cover shadow-sm" /></div>) : <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">Nenhuma marmita cadastrada no cardápio.</div>}
        </section>



      </div>
    </AppShell>
  )
}
