"use client"

import { useMemo, useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { useStore, formatarBRL, rotuloForma } from "@/lib/store"
import {
  Banknote,
  CreditCard,
  QrCode,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Trash2,
} from "lucide-react"

type Periodo = "hoje" | "semana" | "mes"

const periodos: { valor: Periodo; label: string }[] = [
  { valor: "hoje", label: "Hoje" },
  { valor: "semana", label: "7 dias" },
  { valor: "mes", label: "30 dias" },
]

function dentroDoPeriodo(iso: string, periodo: Periodo) {
  const d = new Date(iso).getTime()
  const agora = Date.now()
  const dia = 24 * 60 * 60 * 1000
  if (periodo === "hoje") {
    const hoje = new Date()
    const inicio = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
    ).getTime()
    return d >= inicio
  }
  if (periodo === "semana") return d >= agora - 7 * dia
  return d >= agora - 30 * dia
}

export default function RelatoriosPage() {
  const { vendas, despesas, addDespesa, removeDespesa } = useStore()
  const [periodo, setPeriodo] = useState<Periodo>("hoje")

  const [descDespesa, setDescDespesa] = useState("")
  const [valorDespesa, setValorDespesa] = useState("")

  const vendasFiltradas = useMemo(
    () => vendas.filter((v) => dentroDoPeriodo(v.data, periodo)),
    [vendas, periodo],
  )
  const despesasFiltradas = useMemo(
    () => despesas.filter((d) => dentroDoPeriodo(d.data, periodo)),
    [despesas, periodo],
  )

  const totalVendas = useMemo(
    () =>
      vendasFiltradas.reduce((s, v) => s + v.quantidade * v.valorUnitario, 0),
    [vendasFiltradas],
  )
  const totalDespesas = useMemo(
    () => despesasFiltradas.reduce((s, d) => s + d.valor, 0),
    [despesasFiltradas],
  )
  const lucro = totalVendas - totalDespesas

  const porForma = useMemo(() => {
    const base = { dinheiro: 0, cartao: 0, pix: 0 }
    for (const v of vendasFiltradas) {
      base[v.forma] += v.quantidade * v.valorUnitario
    }
    return base
  }, [vendasFiltradas])

  const iconesForma = {
    dinheiro: Banknote,
    cartao: CreditCard,
    pix: QrCode,
  } as const

  function handleDespesa(e: React.FormEvent) {
    e.preventDefault()
    const val = Number(valorDespesa)
    if (!descDespesa.trim() || !val) return
    addDespesa({ descricao: descDespesa.trim(), valor: val })
    setDescDespesa("")
    setValorDespesa("")
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Relatórios e Fechamento
          </h1>
          <p className="text-sm text-muted-foreground">
            Resumo financeiro por período.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {periodos.map((p) => {
            const ativo = periodo === p.valor
            return (
              <button
                key={p.valor}
                type="button"
                onClick={() => setPeriodo(p.valor)}
                className={`rounded-lg border px-2 py-2.5 text-sm font-medium transition ${
                  ativo
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-card text-muted-foreground hover:border-ring"
                }`}
                aria-pressed={ativo}
              >
                {p.label}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-accent">
              <TrendingUp className="size-4" aria-hidden="true" />
              <span className="text-xs font-medium">Entradas</span>
            </div>
            <p className="mt-2 text-xl font-bold text-foreground">
              {formatarBRL(totalVendas)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-destructive">
              <TrendingDown className="size-4" aria-hidden="true" />
              <span className="text-xs font-medium">Saídas</span>
            </div>
            <p className="mt-2 text-xl font-bold text-foreground">
              {formatarBRL(totalDespesas)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-primary">
              <Wallet className="size-4" aria-hidden="true" />
              <span className="text-xs font-medium">Lucro</span>
            </div>
            <p
              className={`mt-2 text-xl font-bold ${
                lucro >= 0 ? "text-accent" : "text-destructive"
              }`}
            >
              {formatarBRL(lucro)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">
            Entradas por forma de pagamento
          </h2>
          {(["dinheiro", "cartao", "pix"] as const).map((f) => {
            const Icon = iconesForma[f]
            const valor = porForma[f]
            const pct = totalVendas > 0 ? (valor / totalVendas) * 100 : 0
            return (
              <div key={f} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-foreground">
                    <Icon
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    {rotuloForma[f]}
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatarBRL(valor)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">
            Registrar despesa
          </h2>
          <form onSubmit={handleDespesa} className="flex flex-col gap-3">
            <input
              value={descDespesa}
              onChange={(e) => setDescDespesa(e.target.value)}
              placeholder="Descrição (ex.: Gás, ingredientes)"
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none ring-ring/50 transition focus:border-ring focus:ring-2"
              aria-label="Descrição da despesa"
            />
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={valorDespesa}
                onChange={(e) => setValorDespesa(e.target.value)}
                placeholder="Valor (R$)"
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none ring-ring/50 transition focus:border-ring focus:ring-2"
                aria-label="Valor da despesa"
              />
              <Button type="submit" className="shrink-0">
                <Plus className="size-4" aria-hidden="true" />
                Adicionar
              </Button>
            </div>
          </form>

          {despesasFiltradas.length > 0 && (
            <ul className="flex flex-col gap-2">
              {despesasFiltradas.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3"
                >
                  <span className="truncate text-sm text-foreground">
                    {d.descricao}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-destructive">
                      - {formatarBRL(d.valor)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDespesa(d.id)}
                      className="rounded-md p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remover despesa ${d.descricao}`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  )
}
