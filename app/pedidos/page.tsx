"use client"

import { useMemo, useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import {
  useStore,
  rotuloStatus,
  rotuloForma,
  produtos,
  totalPedido,
  formatarBRL,
  type StatusPedido,
  type FormaPagamento,
} from "@/lib/store"
import {
  ClipboardList,
  Plus,
  Minus,
  Trash2,
  Clock,
  ChefHat,
  CheckCircle2,
  Banknote,
  CreditCard,
  QrCode,
  UtensilsCrossed,
  CupSoda,
} from "lucide-react"

const statusInfo: {
  valor: StatusPedido
  label: string
  icon: typeof Clock
  classe: string
}[] = [
  {
    valor: "pendente",
    label: "Pendente",
    icon: Clock,
    classe: "bg-muted text-muted-foreground",
  },
  {
    valor: "preparando",
    label: "Preparando",
    icon: ChefHat,
    classe: "bg-accent text-accent-foreground",
  },
  {
    valor: "entregue",
    label: "Entregue",
    icon: CheckCircle2,
    classe: "bg-primary/15 text-primary",
  },
]

const formas: { valor: FormaPagamento; label: string; icon: typeof Banknote }[] =
  [
    { valor: "dinheiro", label: "Dinheiro", icon: Banknote },
    { valor: "cartao", label: "Cartão", icon: CreditCard },
    { valor: "pix", label: "Pix", icon: QrCode },
  ]

function horaFormatada(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

const marmitas = produtos.filter((p) => p.categoria === "marmita")
const bebidas = produtos.filter((p) => p.categoria === "bebida")

export default function PedidosPage() {
  const { pedidos, addPedido, removePedido, atualizarStatusPedido } = useStore()

  const [cliente, setCliente] = useState("")
  const [observacao, setObservacao] = useState("")
  const [forma, setForma] = useState<FormaPagamento>("dinheiro")
  const [quantidades, setQuantidades] = useState<Record<string, number>>({})

  const pedidosAtivos = useMemo(
    () => pedidos.filter((p) => p.status !== "entregue"),
    [pedidos],
  )

  const totalAtual = useMemo(
    () =>
      produtos.reduce(
        (soma, p) => soma + p.preco * (quantidades[p.nome] || 0),
        0,
      ),
    [quantidades],
  )

  function ajustar(nome: string, delta: number) {
    setQuantidades((atual) => ({
      ...atual,
      [nome]: Math.max(0, (atual[nome] || 0) + delta),
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const itens = produtos
      .filter((p) => (quantidades[p.nome] || 0) > 0)
      .map((p) => ({
        descricao: p.nome,
        quantidade: quantidades[p.nome],
        preco: p.preco,
      }))
    if (!cliente.trim() || itens.length === 0) return
    addPedido({
      cliente: cliente.trim(),
      itens,
      observacao: observacao.trim(),
      forma,
    })
    setCliente("")
    setObservacao("")
    setForma("dinheiro")
    setQuantidades({})
  }

  function CartaoProduto({
    nome,
    preco,
  }: {
    nome: string
    preco: number
  }) {
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
            Pedidos dos Clientes
          </h1>
          <p className="text-sm text-muted-foreground">
            Anote os pedidos e acompanhe até a entrega. Ao entregar, a venda é
            registrada automaticamente.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="cliente"
              className="text-sm font-medium text-foreground"
            >
              Cliente
            </label>
            <input
              id="cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Ex.: Maria Fernanda"
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none ring-ring/50 transition focus:border-ring focus:ring-2"
            />
          </div>

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

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="observacao"
              className="text-sm font-medium text-foreground"
            >
              Observações (opcional)
            </label>
            <textarea
              id="observacao"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex.: Sem cebola, entregar às 12h."
              rows={2}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring/50 transition focus:border-ring focus:ring-2"
            />
          </div>

          <Button type="submit" size="lg" className="w-full">
            <Plus className="size-4" aria-hidden="true" />
            Registrar pedido
          </Button>
        </form>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">
            Pedidos em andamento
          </h2>
          {pedidosAtivos.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-10 text-center">
              <ClipboardList
                className="size-8 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="text-sm text-muted-foreground">
                Nenhum pedido em andamento.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {pedidosAtivos.map((p) => {
                const info = statusInfo.find((s) => s.valor === p.status)!
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
                        {info.label}
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

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {statusInfo.map((s) => {
                          const ativo = p.status === s.valor
                          return (
                            <button
                              key={s.valor}
                              type="button"
                              onClick={() =>
                                atualizarStatusPedido(p.id, s.valor)
                              }
                              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                                ativo
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-input bg-background text-muted-foreground hover:border-ring"
                              }`}
                              aria-pressed={ativo}
                            >
                              {rotuloStatus[s.valor]}
                            </button>
                          )
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={() => removePedido(p.id)}
                        className="rounded-md p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Remover pedido de ${p.cliente}`}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
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
