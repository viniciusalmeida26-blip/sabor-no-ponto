"use client"

import { AppShell } from "@/components/app-shell"
import { formatarBRL, useStore, ehMarmita } from "@/lib/store"
import { Soup, TrendingUp, UtensilsCrossed, PackageCheck, CalendarDays, Clock3 } from "lucide-react"
import { useMemo } from "react"

export default function VendasPage() {
  const { vendas, produtos, marmitaDoDiaId, configuracaoMarmitaDia } = useStore()
  const hoje = new Date()
  const vendasHoje = useMemo(
    () =>
      vendas.filter((venda) => {
        const data = new Date(venda.data)
        return (
          data.getDate() === hoje.getDate() &&
          data.getMonth() === hoje.getMonth() &&
          data.getFullYear() === hoje.getFullYear()
        )
      }),
    [vendas, hoje.getDate(), hoje.getMonth(), hoje.getFullYear()],
  )
  const vendasMarmitas = vendasHoje.filter((venda) => ehMarmita(venda.descricao))
  const totalHoje = vendasHoje.reduce(
    (total, venda) => total + venda.quantidade * venda.valorUnitario,
    0,
  )
  const totalMarmitas = vendasMarmitas.reduce(
    (total, venda) => total + venda.quantidade * venda.valorUnitario,
    0,
  )
  const quantidadeMarmitas = vendasMarmitas.reduce(
    (total, venda) => total + venda.quantidade,
    0,
  )
  const marmitas = produtos.filter((produto) => produto.categoria === "marmita")
  const marmitaDoDia = produtos.find((produto) => produto.id === marmitaDoDiaId) ?? marmitas[0]
  const percentualMarmitas = totalHoje > 0 ? Math.round((totalMarmitas / totalHoje) * 100) : 0

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Início</h1>
          <p className="text-sm text-muted-foreground">Confira o cardápio do dia.</p>
        </div>

        <section className="relative min-h-[340px] overflow-hidden rounded-2xl border border-border bg-primary shadow-sm">
          <img src={marmitaDoDia?.imagem || "/images/fundo-marmita.png"} alt={marmitaDoDia?.nome || "Marmita do cardápio do dia"} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/95 via-foreground/65 to-foreground/15" />
          <div className="relative flex min-h-[340px] flex-col justify-center gap-5 p-6 text-primary-foreground sm:p-9">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary-foreground/85"><Soup className="size-5" aria-hidden="true" /> Cardápio em destaque</div>
            <div><p className="text-sm font-medium text-primary-foreground/80">Marmita do Dia</p><h2 className="mt-1 max-w-2xl text-3xl font-bold leading-tight text-balance sm:text-4xl">{configuracaoMarmitaDia.nome || marmitaDoDia?.nome}</h2></div>
            <p className="max-w-xl text-sm leading-6 text-primary-foreground/85">{configuracaoMarmitaDia.descricao || marmitaDoDia?.descricao}</p>
            {configuracaoMarmitaDia.ingredientes && <div className="flex flex-col gap-2"><p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">Ingredientes</p><p className="max-w-xl text-sm leading-6 text-primary-foreground/90">{configuracaoMarmitaDia.ingredientes.split(",").map((item) => item.trim()).filter(Boolean).join(" • ")}</p></div>}
            <div className="flex flex-wrap gap-2"><span className="rounded-full bg-primary-foreground/15 px-3 py-1.5 text-sm">{marmitaDoDia?.disponivel ? "Disponível" : "Indisponível"}</span><span className="rounded-full bg-primary-foreground/15 px-3 py-1.5 text-sm">Imagem e preço do catálogo</span></div>
            <div className="flex items-end justify-between gap-4 border-t border-primary-foreground/25 pt-4"><span className="text-sm text-primary-foreground/80">Preço cadastrado</span><span className="text-3xl font-bold">{formatarBRL(marmitaDoDia?.preco ?? 0)} <span className="text-sm font-medium text-primary-foreground/75">por unidade</span></span></div>
          </div>
        </section>

        <section aria-label="Resumo das vendas e valores" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-muted-foreground">Vendas de hoje</p><TrendingUp className="size-5 text-primary" aria-hidden="true" /></div><p className="mt-2 text-2xl font-bold text-foreground">{formatarBRL(totalHoje)}</p><p className="mt-1 text-xs text-muted-foreground">{vendasHoje.length} registro(s)</p></div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-muted-foreground">Só marmitas vendidas</p><UtensilsCrossed className="size-5 text-primary" aria-hidden="true" /></div><p className="mt-2 text-2xl font-bold text-foreground">{formatarBRL(totalMarmitas)}</p><p className="mt-1 text-xs text-muted-foreground">{quantidadeMarmitas} unidade(s) · {percentualMarmitas}% do total</p></div>
                    {marmitas.slice(0, 2).map((produto, index) => <div key={produto.id} className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-muted-foreground">{produto.nome}</p>{index === 0 ? <PackageCheck className="size-5 text-primary" aria-hidden="true" /> : <CalendarDays className="size-5 text-primary" aria-hidden="true" />}</div><p className="mt-2 text-2xl font-bold text-foreground">{formatarBRL(produto.preco)}</p><p className="mt-1 text-xs text-muted-foreground">preço do cardápio</p></div>)}
        </section>

        <section aria-label="Preços das marmitas" className="grid gap-3 sm:grid-cols-3">
          {marmitas.map((produto) => <div key={produto.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"><div className="min-w-0"><p className="truncate text-xs text-muted-foreground">{produto.nome}</p><p className="mt-1 text-2xl font-bold text-foreground">{formatarBRL(produto.preco)}</p></div><img src={produto.imagem} alt="" className="size-12 rounded-lg object-cover shadow-sm" /></div>)}
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
