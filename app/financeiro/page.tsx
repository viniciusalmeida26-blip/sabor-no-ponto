"use client"

import { useMemo, useState } from "react"
import { ArrowDownRight, ArrowUpRight, CircleDollarSign, Download, ReceiptText, Wallet } from "lucide-react"
import { useStore, formatarBRL } from "@/lib/store"
import { AppShell } from "@/components/app-shell"

const periodos = [
  { valor: "7", label: "Últimos 7 dias" },
  { valor: "30", label: "Este mês" },
  { valor: "all", label: "Todo o período" },
]

export default function FinanceiroPage() {
  const { vendas, despesas, pedidos, hidratado } = useStore()
  const [periodo, setPeriodo] = useState("30")

  function exportarCSV() {
    const linhas = [
      ["Tipo", "Descrição", "Valor", "Data"],
      ...dados.vendasFiltradas.map((venda) => ["Entrada", venda.descricao, String(venda.quantidade * venda.valorUnitario), venda.data]),
      ...dados.despesasFiltradas.map((despesa) => ["Saída", despesa.descricao, String(-despesa.valor), despesa.data]),
    ]
    const csv = linhas.map((linha) => linha.map((valor) => `"${valor.replaceAll('"', '""')}"`).join(",")).join("\n")
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }))
    const link = document.createElement("a")
    link.href = url
    link.download = `sabor-no-ponto-financeiro-${periodo}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const dados = useMemo(() => {
    const limite = periodo === "all" ? 0 : Date.now() - Number(periodo) * 86400000
    const vendasFiltradas = vendas.filter((venda) => !limite || new Date(venda.data).getTime() >= limite).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    const despesasFiltradas = despesas.filter((despesa) => !limite || new Date(despesa.data).getTime() >= limite).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    const entradas = vendasFiltradas.reduce((total, venda) => total + venda.quantidade * venda.valorUnitario, 0)
    const saidas = despesasFiltradas.reduce((total, despesa) => total + despesa.valor, 0)
    const pedidosAtivos = pedidos.filter((pedido) => ["pendente", "preparando", "pronta"].includes(pedido.status)).length
    const margem = entradas > 0 ? Math.round(((entradas - saidas) / entradas) * 100) : 0
    return { entradas, saidas, resultado: entradas - saidas, pedidosAtivos, margem, vendasFiltradas, despesasFiltradas }
  }, [despesas, pedidos, periodo, vendas])

  if (!hidratado) return <AppShell><div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Carregando financeiro...</div></AppShell>

  return (
    <AppShell><div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-medium text-primary">Gestão</p><h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Financeiro</h1><p className="mt-2 text-sm text-muted-foreground">Acompanhe entradas, despesas e resultado com base nos registros reais.</p></div>
        <div className="flex flex-col gap-2 sm:flex-row"><select value={periodo} onChange={(event) => setPeriodo(event.target.value)} aria-label="Período financeiro" className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/50">{periodos.map((item) => <option key={item.valor} value={item.valor}>{item.label}</option>)}</select><button type="button" onClick={exportarCSV} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground transition hover:bg-muted"><Download className="size-4" aria-hidden="true" />Exportar CSV</button></div>
      </header>

      <section aria-label="Resumo financeiro" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Entradas</p><span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600"><ArrowUpRight className="size-4" aria-hidden="true" /></span></div><p className="mt-3 text-2xl font-bold text-foreground">{formatarBRL(dados.entradas)}</p></div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Despesas</p><span className="rounded-lg bg-rose-500/10 p-2 text-rose-600"><ArrowDownRight className="size-4" aria-hidden="true" /></span></div><p className="mt-3 text-2xl font-bold text-foreground">{formatarBRL(dados.saidas)}</p></div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Resultado</p><span className="rounded-lg bg-primary/10 p-2 text-primary"><CircleDollarSign className="size-4" aria-hidden="true" /></span></div><p className={`mt-3 text-2xl font-bold ${dados.resultado >= 0 ? "text-foreground" : "text-destructive"}`}>{formatarBRL(dados.resultado)}</p></div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Pedidos em andamento</p><span className="rounded-lg bg-amber-500/10 p-2 text-amber-600"><Wallet className="size-4" aria-hidden="true" /></span></div><p className="mt-3 text-2xl font-bold text-foreground">{dados.pedidosAtivos}</p></div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Margem líquida</p><span className="rounded-lg bg-primary/10 p-2 text-primary"><CircleDollarSign className="size-4" aria-hidden="true" /></span></div><p className={`mt-3 text-2xl font-bold ${dados.margem >= 0 ? "text-foreground" : "text-destructive"}`}>{dados.margem}%</p></div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-semibold text-foreground">Últimas entradas</h2><p className="text-sm text-muted-foreground">Vendas registradas no período</p></div><ReceiptText className="size-5 text-primary" aria-hidden="true" /></div>{dados.vendasFiltradas.length ? <ul className="mt-4 divide-y divide-border">{dados.vendasFiltradas.slice(0, 8).map((venda) => <li key={venda.id} className="flex items-center justify-between gap-3 py-3 text-sm"><span className="truncate text-foreground">{venda.descricao}</span><span className="shrink-0 font-semibold text-emerald-600">{formatarBRL(venda.quantidade * venda.valorUnitario)}</span></li>)}</ul> : <p className="mt-5 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">Nenhuma venda no período selecionado.</p>}</div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div><h2 className="font-semibold text-foreground">Últimas despesas</h2><p className="text-sm text-muted-foreground">Saídas registradas no período</p></div>{dados.despesasFiltradas.length ? <ul className="mt-4 divide-y divide-border">{dados.despesasFiltradas.slice(0, 8).map((despesa) => <li key={despesa.id} className="flex items-center justify-between gap-3 py-3 text-sm"><span className="truncate text-foreground">{despesa.descricao}</span><span className="shrink-0 font-semibold text-rose-600">{formatarBRL(despesa.valor)}</span></li>)}</ul> : <p className="mt-5 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">Nenhuma despesa no período selecionado.</p>}</div>
      </section>
    </div></AppShell>
  )
}

