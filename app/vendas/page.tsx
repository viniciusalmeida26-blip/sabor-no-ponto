"use client"

import { useMemo, useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import {
  useStore,
  formatarBRL,
  rotuloForma,
  rotuloStatus,
  totalPedido,
  ehMarmita,
  produtos,
  type StatusPedido,
  type FormaPagamento,
} from "@/lib/store"
import {
  Trash2,
  ShoppingCart,
  ClipboardList,
  Clock,
  ChefHat,
  CheckCircle2,
  UtensilsCrossed,
  CupSoda,
  Plus,
  Minus,
  Banknote,
  CreditCard,
  QrCode,
} from "lucide-react"

const statusInfo: Record<
  StatusPedido,
  { icon: typeof Clock; classe: string }
> = {
  pendente: { icon: Clock, classe: "bg-muted text-muted-foreground" },
  preparando: { icon: ChefHat, classe: "bg-accent text-accent-foreground" },
  entregue: { icon: CheckCircle2, classe: "bg-primary/15 text-primary" },
}

const formas: { valor: FormaPagamento; label: string; icon: typeof Banknote }[] =
  [
    { valor: "dinheiro", label: "Dinheiro", icon: Banknote },
    { valor: "cartao", label: "Cartão", icon: CreditCard },
    { valor: "pix", label: "Pix", icon: QrCode },
  ]

const marmitas = produtos.filter((p) => p.categoria === "marmita")
const bebidas = produtos.filter((p) => p.categoria === "bebida")

function ehHoje(iso: string) {
  const d = new Date(iso)
  const h = new Date()
  return (
    d.getDate() === h.getDate() &&
    d.getMonth() === h.getMonth() &&
    d.getFullYear() === h.getFullYear()
  )
}

function horaFormatada(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function VendasPage() {
  const { vendas, pedidos, addVenda, removeVenda } = useStore()

  const [forma, setForma] = useState<FormaPagamento>("dinheiro")
  const [quantidades, setQuantidades] = useState<Record<string, number>>({})

  const totalAtual = useMemo(
    () =>
      produtos.reduce(
        (soma, p) => soma + p.preco * (quantidades[p.nome] || 0),
        0,
      ),
    [quantidades],
  )

  const temItens = useMemo(
    () => produtos.some((p) => (quantidades[p.nome] || 0) > 0),
    [quantidades],
  )

  function ajustar(nome: string, delta: number) {
    setQuantidades((atual) => ({
      ...atual,
      [nome]: Math.max(0, (atual[nome] || 0) + delta),
    }))
  }

  function registrarVenda(e: React.FormEvent) {
    e.preventDefault()
    const itens = produtos.filter((p) => (quantidades[p.nome] || 0) > 0)
    if (itens.length === 0) return
    // Cada produto vira uma venda no banco.
    for (const p of itens) {
      addVenda({
        descricao: p.nome,
        quantidade: quantidades[p.nome],
        valorUnitario: p.preco,
        forma,
      })
    }
    setQuantidades({})
    setForma("dinheiro")
  }

  const vendasHoje = useMemo(
    () => vendas.filter((v) => ehHoje(v.data)),
    [vendas],
  )

  const totalHoje = useMemo(
    () => vendasHoje.reduce((s, v) => s + v.quantidade * v.valorUnitario, 0),
    [vendasHoje],
  )

  const totalMarmitasHoje = useMemo(
    () =>
      vendasHoje
        .filter((v) => ehMarmita(v.descricao))
        .reduce((s, v) => s + v.quantidade * v.valorUnitario, 0),
    [vendasHoje],
  )

  const qtdMarmitasHoje = useMemo(
    () =>
      vendasHoje
        .filter((v) => ehMarmita(v.descricao))
        .reduce((s, v) => s + v.quantidade, 0),
    [vendasHoje],
  )

  const pedidosHoje = useMemo(
    () => pedidos.filter((p) => ehHoje(p.data)),
    [pedidos],
  )

  function CartaoProduto({ nome, preco }: { nome: string; preco: number }) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{nome}</p>
          <p className="text-xs text-muted-foreground">
            {formatarBRL(preco)} cada
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => ajustar(nome, -1)}
            disabled={(quantidades[nome] || 0) === 0}
            className="flex size-8 items-center justify-center rounded-md border border-input text-foreground transition hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            aria-label={`Diminuir ${nome}`}
          >
            <Minus className="size-4" aria-hidden="true" />
          </button>
          <span
            className="w-6 text-center text-sm font-semibold tabular-nums text-foreground"
            aria-live="polite"
          >
            {quantidades[nome] || 0}
          </span>
          <button
            type="button"
            onClick={() => ajustar(nome, 1)}
            className="flex size-8 items-center justify-center rounded-md border border-input text-foreground transition hover:bg-muted"
            aria-label={`Aumentar ${nome}`}
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Registro de Vendas
          </h1>
          <p className="text-sm text-muted-foreground">
            Registre vendas rápidas e acompanhe o resumo diário.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-primary p-5 text-primary-foreground shadow-sm">
          <p className="text-sm opacity-90">Total vendido hoje</p>
          <p className="mt-1 text-3xl font-bold">{formatarBRL(totalHoje)}</p>
          <p className="mt-1 text-sm opacity-90">
            {vendasHoje.length}{" "}
            {vendasHoje.length === 1 ? "venda registrada" : "vendas registradas"}
          </p>
        </div>

        <form
          onSubmit={registrarVenda}
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <h2 className="text-sm font-semibold text-foreground">
            Registrar venda rápida
          </h2>

          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <UtensilsCrossed
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              Marmitas
            </span>
            {marmitas.map((p) => (
              <CartaoProduto key={p.nome} nome={p.nome} preco={p.preco} />
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <CupSoda
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              Bebidas
            </span>
            {bebidas.map((p) => (
              <CartaoProduto key={p.nome} nome={p.nome} preco={p.preco} />
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">
              Forma de pagamento
            </span>
            <div className="grid grid-cols-3 gap-2">
              {formas.map((f) => {
                const Icon = f.icon
                const ativo = forma === f.valor
                return (
                  <button
                    key={f.valor}
                    type="button"
                    onClick={() => setForma(f.valor)}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-xs font-medium transition ${
                      ativo
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input bg-background text-muted-foreground hover:border-ring"
                    }`}
                    aria-pressed={ativo}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                    {f.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2.5">
            <span className="text-sm font-medium text-foreground">Total</span>
            <span className="text-base font-bold text-primary">
              {formatarBRL(totalAtual)}
            </span>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={!temItens}>
            <Plus className="size-4" aria-hidden="true" />
            Registrar venda
          </Button>
        </form>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">
            Vendas de hoje
          </h2>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <UtensilsCrossed className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">
                Total só de marmitas hoje
              </p>
              <p className="text-lg font-bold text-foreground">
                {formatarBRL(totalMarmitasHoje)}
              </p>
            </div>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {qtdMarmitasHoje}{" "}
              {qtdMarmitasHoje === 1 ? "marmita" : "marmitas"}
            </span>
          </div>

          {vendasHoje.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-10 text-center">
              <ShoppingCart
                className="size-8 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="text-sm text-muted-foreground">
                Nenhuma venda registrada hoje.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {vendasHoje.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {v.descricao}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {v.quantidade} × {formatarBRL(v.valorUnitario)} ·{" "}
                      {rotuloForma[v.forma]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {formatarBRL(v.quantidade * v.valorUnitario)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVenda(v.id)}
                      className="rounded-md p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remover venda ${v.descricao}`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">
            Registro diário dos pedidos
          </h2>
          {pedidosHoje.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-10 text-center">
              <ClipboardList
                className="size-8 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="text-sm text-muted-foreground">
                Nenhum pedido registrado hoje.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {pedidosHoje.map((p) => {
                const info = statusInfo[p.status]
                const Icon = info.icon
                return (
                  <li
                    key={p.id}
                    className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {p.cliente}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {horaFormatada(p.data)} · {rotuloForma[p.forma]}
                        </p>
                      </div>
                      <span
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${info.classe}`}
                      >
                        <Icon className="size-3.5" aria-hidden="true" />
                        {rotuloStatus[p.status]}
                      </span>
                    </div>

                    <ul className="flex flex-col gap-1 border-y border-border py-2">
                      {p.itens.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between text-sm text-foreground"
                        >
                          <span className="truncate">
                            {item.descricao} × {item.quantidade}
                          </span>
                          <span className="text-muted-foreground">
                            {formatarBRL(item.preco * item.quantidade)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Total
                      </span>
                      <span className="text-sm font-bold text-primary">
                        {formatarBRL(totalPedido(p.itens))}
                      </span>
                    </div>

                    {p.observacao && (
                      <p className="text-xs italic text-muted-foreground">
                        {p.observacao}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  )
}
