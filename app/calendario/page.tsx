"use client"

import { useMemo, useState } from "react"
import { AppShell } from "@/components/app-shell"
import {
  useStore,
  formatarBRL,
  chaveDia,
  ehMarmita,
  type Venda,
} from "@/lib/store"
import { cardapios } from "@/lib/cardapio"
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  UtensilsCrossed,
  ShoppingCart,
} from "lucide-react"

const nomesMeses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

const diasSemana = ["D", "S", "T", "Q", "Q", "S", "S"]

function chaveDeData(ano: number, mes: number, dia: number) {
  return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
}

export default function CalendarioPage() {
  const { vendas } = useStore()

  const hoje = new Date()
  const [mesAtual, setMesAtual] = useState(hoje.getMonth())
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear())
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(
    chaveDia(hoje.toISOString()),
  )

  // Agrupa totais por dia (chave AAAA-MM-DD).
  const totaisPorDia = useMemo(() => {
    const mapa = new Map<string, { total: number; marmitas: number }>()
    for (const v of vendas) {
      const chave = chaveDia(v.data)
      const atual = mapa.get(chave) || { total: 0, marmitas: 0 }
      const valor = v.quantidade * v.valorUnitario
      atual.total += valor
      if (ehMarmita(v.descricao)) atual.marmitas += valor
      mapa.set(chave, atual)
    }
    return mapa
  }, [vendas])

  const primeiroDiaSemana = new Date(anoAtual, mesAtual, 1).getDay()
  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate()

  const celulas: (number | null)[] = []
  for (let i = 0; i < primeiroDiaSemana; i++) celulas.push(null)
  for (let d = 1; d <= diasNoMes; d++) celulas.push(d)

  const totalMes = useMemo(() => {
    let soma = 0
    for (const [chave, val] of totaisPorDia) {
      if (chave.startsWith(chaveDeData(anoAtual, mesAtual, 1).slice(0, 7)))
        soma += val.total
    }
    return soma
  }, [totaisPorDia, anoAtual, mesAtual])

  function mudarMes(delta: number) {
    let novoMes = mesAtual + delta
    let novoAno = anoAtual
    if (novoMes < 0) {
      novoMes = 11
      novoAno -= 1
    } else if (novoMes > 11) {
      novoMes = 0
      novoAno += 1
    }
    setMesAtual(novoMes)
    setAnoAtual(novoAno)
  }

  const vendasDoDia = useMemo<Venda[]>(() => {
    if (!diaSelecionado) return []
    return vendas.filter((v) => chaveDia(v.data) === diaSelecionado)
  }, [vendas, diaSelecionado])

  const resumoDia = diaSelecionado ? totaisPorDia.get(diaSelecionado) : undefined

  const chaveHoje = chaveDia(hoje.toISOString())

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Calendário de Vendas
          </h1>
          <p className="text-sm text-muted-foreground">
            Veja o total vendido em cada dia. Toque em uma data para os
            detalhes.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => mudarMes(-1)}
              className="flex size-9 items-center justify-center rounded-md border border-input text-foreground transition hover:bg-muted"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <p className="text-sm font-semibold text-foreground">
              {nomesMeses[mesAtual]} de {anoAtual}
            </p>
            <button
              type="button"
              onClick={() => mudarMes(1)}
              className="flex size-9 items-center justify-center rounded-md border border-input text-foreground transition hover:bg-muted"
              aria-label="Próximo mês"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {diasSemana.map((d, i) => (
              <div
                key={i}
                className="py-1 text-center text-xs font-medium text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {celulas.map((dia, i) => {
              if (dia === null) return <div key={`v-${i}`} />
              const chave = chaveDeData(anoAtual, mesAtual, dia)
              const dados = totaisPorDia.get(chave)
              const temVenda = !!dados && dados.total > 0
              const selecionado = chave === diaSelecionado
              const ehHoje = chave === chaveHoje
              return (
                <button
                  key={chave}
                  type="button"
                  onClick={() => setDiaSelecionado(chave)}
                  className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border text-xs transition ${
                    selecionado
                      ? "border-primary bg-primary/10"
                      : temVenda
                        ? "border-border bg-accent/40 hover:border-ring"
                        : "border-transparent hover:bg-muted"
                  }`}
                  aria-pressed={selecionado}
                >
                  <span
                    className={`font-semibold ${
                      ehHoje ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {dia}
                  </span>
                  {temVenda && (
                    <span className="text-[10px] font-medium leading-none text-muted-foreground">
                      {dados!.total >= 1000
                        ? `${Math.round(dados!.total / 100) / 10}k`
                        : dados!.total}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <section className="flex flex-col gap-3" aria-label="Cardápio da semana">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Cardápio da semana</h2>
            <p className="text-xs text-muted-foreground">Cada dia tem uma marmita completa, sem escolhas.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cardapios.map((cardapio, indice) => {
              const dataDoDia = new Date(anoAtual, mesAtual, 1)
              const diferenca = (indice - dataDoDia.getDay() + 7) % 7
              dataDoDia.setDate(1 + diferenca)
              const chave = chaveDeData(dataDoDia.getFullYear(), dataDoDia.getMonth(), dataDoDia.getDate())
              const selecionado = diaSelecionado === chave
              return (
                <button key={cardapio.dia} type="button" onClick={() => setDiaSelecionado(chave)} className={`flex flex-col gap-1 rounded-xl border p-4 text-left shadow-sm transition ${selecionado ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50"}`}>
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">{cardapio.dia}</span>
                  <span className="font-semibold text-foreground">Marmita de {cardapio.mistura}</span>
                  <span className="text-xs leading-5 text-muted-foreground">{cardapio.acompanhamentos}</span>
                  <span className="mt-1 text-sm font-bold text-foreground">{formatarBRL(cardapio.valor)}</span>
                </button>
              )
            })}
          </div>
        </section>

        <div className="flex items-center gap-3 rounded-xl border border-border bg-primary p-4 text-primary-foreground shadow-sm">
          <CalendarDays className="size-8" aria-hidden="true" />
          <div>
            <p className="text-sm opacity-90">
              Total em {nomesMeses[mesAtual]}
            </p>
            <p className="text-2xl font-bold">{formatarBRL(totalMes)}</p>
          </div>
        </div>

        {diaSelecionado && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-foreground">
              Detalhes do dia{" "}
              {diaSelecionado.split("-").reverse().join("/")}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ShoppingCart className="size-4" aria-hidden="true" />
                  Total do dia
                </span>
                <span className="text-lg font-bold text-foreground">
                  {formatarBRL(resumoDia?.total || 0)}
                </span>
              </div>
              <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <UtensilsCrossed className="size-4" aria-hidden="true" />
                  Só marmitas
                </span>
                <span className="text-lg font-bold text-foreground">
                  {formatarBRL(resumoDia?.marmitas || 0)}
                </span>
              </div>
            </div>

            {vendasDoDia.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-10 text-center">
                <ShoppingCart
                  className="size-8 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="text-sm text-muted-foreground">
                  Nenhuma venda registrada nesse dia.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {vendasDoDia.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {v.descricao}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {v.quantidade} × {formatarBRL(v.valorUnitario)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatarBRL(v.quantidade * v.valorUnitario)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
