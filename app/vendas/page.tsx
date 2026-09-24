"use client"

import { AppShell } from "@/components/app-shell"
import { formatarBRL, useStore, ehMarmita } from "@/lib/store"
import { cardapioDaData, valoresMarmitas, formatarValorCardapio } from "@/lib/cardapio"
import { Soup, TrendingUp, UtensilsCrossed, PackageCheck, CalendarDays, Clock3 } from "lucide-react"
import { useMemo } from "react"

export default function VendasPage() {
  const { vendas } = useStore()
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
  const cardapio = cardapioDaData(hoje)
  const valores = valoresMarmitas(cardapio.valor)
  const percentualMarmitas = totalHoje > 0 ? Math.round((totalMarmitas / totalHoje) * 100) : 0

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Início</h1>
          <p className="text-sm text-muted-foreground">Confira o cardápio do dia.</p>
        </div>

        <section className="relative min-h-[340px] overflow-hidden rounded-2xl border border-border bg-primary shadow-sm">
          <img src="/images/fundo-marmita.png" alt="Marmita do cardápio do dia" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/95 via-foreground/65 to-foreground/15" />
          <div className="relative flex min-h-[340px] flex-col justify-center gap-5 p-6 text-primary-foreground sm:p-9">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary-foreground/85"><Soup className="size-5" aria-hidden="true" /> Cardápio em destaque</div>
            <div><p className="text-sm font-medium text-primary-foreground/80">{cardapio.dia}</p><h2 className="mt-1 max-w-2xl text-3xl font-bold leading-tight text-balance sm:text-4xl">Marmita de {cardapio.mistura}</h2></div>
            <p className="max-w-xl text-sm leading-6 text-primary-foreground/85">{cardapio.acompanhamentos}. A mistura do dia já vem definida, sem escolhas.</p>
            <div className="flex flex-wrap gap-2"><span className="rounded-full bg-primary-foreground/15 px-3 py-1.5 text-sm">Arroz e feijão inclusos</span><span className="rounded-full bg-primary-foreground/15 px-3 py-1.5 text-sm">Produção do dia</span></div>
            <div className="flex items-end justify-between gap-4 border-t border-primary-foreground/25 pt-4"><span className="text-sm text-primary-foreground/80">A partir de</span><span className="text-3xl font-bold">{formatarBRL(valores.P)} <span className="text-sm font-medium text-primary-foreground/75">marmita P</span></span></div>
          </div>
        </section>

        <section aria-label="Resumo das vendas e valores" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-muted-foreground">Vendas de hoje</p><TrendingUp className="size-5 text-primary" aria-hidden="true" /></div><p className="mt-2 text-2xl font-bold text-foreground">{formatarBRL(totalHoje)}</p><p className="mt-1 text-xs text-muted-foreground">{vendasHoje.length} registro(s)</p></div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-muted-foreground">Só marmitas vendidas</p><UtensilsCrossed className="size-5 text-primary" aria-hidden="true" /></div><p className="mt-2 text-2xl font-bold text-foreground">{formatarBRL(totalMarmitas)}</p><p className="mt-1 text-xs text-muted-foreground">{quantidadeMarmitas} unidade(s) · {percentualMarmitas}% do total</p></div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-muted-foreground">Marmita P</p><PackageCheck className="size-5 text-primary" aria-hidden="true" /></div><p className="mt-2 text-2xl font-bold text-foreground">{formatarBRL(valores.P)}</p><p className="mt-1 text-xs text-muted-foreground">por unidade</p></div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-muted-foreground">Marmita M</p><CalendarDays className="size-5 text-primary" aria-hidden="true" /></div><p className="mt-2 text-2xl font-bold text-foreground">{formatarBRL(valores.M)}</p><p className="mt-1 text-xs text-muted-foreground">por unidade</p></div>
        </section>

        <section aria-label="Preços das marmitas" className="grid gap-3 sm:grid-cols-3">
          {([['P', valores.P, 'Pequena'], ['M', valores.M, 'Média'], ['G', valores.G, 'Grande']] as const).map(([tamanho, valor, nome]) => <div key={tamanho} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm"><div><p className="text-xs text-muted-foreground">Marmita {nome}</p><p className="mt-1 text-2xl font-bold text-foreground">{formatarValorCardapio(valor)}</p></div><span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{tamanho}</span></div>)}
        </section>

        <section className="grid gap-3 sm:grid-cols-3" aria-label="Informações do cardápio">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><p className="text-xs text-muted-foreground">Mistura do dia</p><p className="mt-1 font-semibold text-foreground">{cardapio.mistura}</p></div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><p className="text-xs text-muted-foreground">Acompanhamentos</p><p className="mt-1 font-semibold text-foreground">{cardapio.acompanhamentos}</p></div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><p className="text-xs text-muted-foreground">Marmitas disponíveis</p><p className="mt-1 font-semibold text-foreground">Cardápio fixo do dia</p></div>
        </section>


      </div>
    </AppShell>
  )
}
