"use client"

import { AppShell } from "@/components/app-shell"
import { formatarBRL, useStore } from "@/lib/store"
import { CalendarDays, ShoppingBag, Soup, TrendingUp } from "lucide-react"

export default function VendasPage() {
  const { vendas, produtos, marmitaDoDiaId, configuracaoMarmitaDia } = useStore()
  const marmitas = produtos.filter((produto) => produto.categoria === "marmita")
  const marmitaDoDia = produtos.find((produto) => produto.id === marmitaDoDiaId) ?? marmitas[0]
  const hoje = new Date().toISOString().slice(0, 10)
  const vendasHoje = vendas.filter((venda) => venda.data.slice(0, 10) === hoje)
  const faturamentoHoje = vendasHoje.reduce((total, venda) => total + venda.quantidade * venda.valorUnitario, 0)
  const unidadesHoje = vendasHoje.reduce((total, venda) => total + venda.quantidade, 0)
  const dataFormatada = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date())

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Início</h1>
          <p className="mt-1 flex items-center gap-2 text-sm capitalize text-muted-foreground"><CalendarDays className="size-4" aria-hidden="true" />{dataFormatada}</p>
        </div>

        <section aria-label="Indicadores do dia" className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Faturamento hoje</p><TrendingUp className="size-4 text-primary" aria-hidden="true" /></div><p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{formatarBRL(faturamentoHoje)}</p></div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Vendas registradas</p><ShoppingBag className="size-4 text-primary" aria-hidden="true" /></div><p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{vendasHoje.length}</p></div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Marmitas vendidas</p><Soup className="size-4 text-primary" aria-hidden="true" /></div><p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{unidadesHoje}</p></div>
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
          {marmitas.length > 0 ? marmitas.map((produto) => <div key={produto.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"><div className="min-w-0"><p className="truncate text-xs text-muted-foreground">{produto.nome}</p><p className="mt-1 text-2xl font-bold text-foreground">{formatarBRL(produto.preco)}</p></div><img src={produto.imagem || "/images/fundo-marmita.png"} alt="" className="size-12 rounded-xl object-cover shadow-sm" /></div>) : <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">Nenhuma marmita cadastrada no cardápio.</div>}
        </section>

        <section className="grid gap-3 sm:grid-cols-3" aria-label="Informações do cardápio">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><p className="text-xs text-muted-foreground">Produto em destaque</p><p className="mt-1 font-semibold text-foreground">{marmitaDoDia?.nome}</p></div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><p className="text-xs text-muted-foreground">Descrição</p><p className="mt-1 font-semibold text-foreground">{marmitaDoDia?.descricao}</p></div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><p className="text-xs text-muted-foreground">Marmitas disponíveis</p><p className="mt-1 font-semibold text-foreground">{marmitas.filter((produto) => produto.disponivel).length} produto(s)</p></div>
        </section>


      </div>
    </AppShell>
  )
}
