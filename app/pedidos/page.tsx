"use client"

import { useMemo, useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  useStore,
  rotuloStatus,
  rotuloForma,
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
  MapPin,
  Play,
  Send,
  PackageCheck,
  RefreshCw,
  AlertTriangle,
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
    classe: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200",
  },
  {
    valor: "preparando",
    label: "Preparando",
    icon: ChefHat,
    classe: "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-200",
  },
  {
    valor: "entregue",
    label: "Entregue",
    icon: CheckCircle2,
    classe: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200",
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

export default function PedidosPage() {
  const {
    pedidos,
    produtos,
    addPedido,
    removePedido,
    atualizarStatusPedido,
    ultimoResetPedidos,
    resetarPedidosEntregues,
  } = useStore()

  const marmitas = produtos.filter((produto) => produto.categoria === "marmita")
  const bebidas = produtos.filter((produto) => produto.categoria === "bebida")

  const [cliente, setCliente] = useState("")
  const [dialogResetAberto, setDialogResetAberto] = useState(false)
  const [resetando, setResetando] = useState(false)
  const [observacao, setObservacao] = useState("")
  const [forma, setForma] = useState<FormaPagamento>("dinheiro")
  const [quantidades, setQuantidades] = useState<Record<string, number>>({})

  const pedidosPorStatus = useMemo(
    () =>
      statusInfo.map((status) => ({
        ...status,
        pedidos: pedidos.filter((pedido) => pedido.status === status.valor),
      })),
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
        imagem: p.imagem,
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

  async function confirmarReset() {
    setResetando(true)
    try {
      await resetarPedidosEntregues()
      setDialogResetAberto(false)
    } finally {
      setResetando(false)
    }
  }

  function CartaoProduto({
    nome,
    preco,
    imagem,
  }: {
    nome: string
    preco: number
    imagem: string
  }) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3">
        <div className="flex min-w-0 items-center gap-3">
          <img src={imagem || "/placeholder.svg"} alt="" className="size-12 shrink-0 rounded-lg object-cover shadow-sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{nome}</p>
            <p className="text-xs text-muted-foreground">
              {formatarBRL(preco)} cada
            </p>
          </div>
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

        <section className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between" aria-labelledby="reset-pedidos-title">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <RefreshCw className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="reset-pedidos-title" className="text-sm font-semibold text-foreground">Fechamento diário</h2>
              <p className="text-xs text-muted-foreground">
                Pedidos entregues são mantidos nas vendas e retirados da fila após o reset.
              </p>
              <p className="mt-1 text-xs font-medium text-primary">
                {ultimoResetPedidos
                  ? `Último reset: ${new Date(ultimoResetPedidos).toLocaleString("pt-BR")}`
                  : "Ainda não houve reset registrado"}
              </p>
            </div>
          </div>
          <Dialog open={dialogResetAberto} onOpenChange={setDialogResetAberto}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" className="shrink-0 border-primary/30 bg-background">
                <RefreshCw className="size-4" aria-hidden="true" />
                Resetar pedidos do dia
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="size-5 text-primary" aria-hidden="true" />
                  Confirmar reset diário
                </DialogTitle>
                <DialogDescription>
                  Os pedidos entregues sairão da fila atual, mas suas vendas continuarão no histórico e nos relatórios. Pedidos pendentes e em preparo não ser��o alterados.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogResetAberto(false)} disabled={resetando}>Cancelar</Button>
                <Button type="button" onClick={confirmarReset} disabled={resetando}>
                  <RefreshCw className={`size-4 ${resetando ? "animate-spin" : ""}`} aria-hidden="true" />
                  {resetando ? "Resetando..." : "Confirmar reset"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>

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
              <CartaoProduto key={p.id} nome={p.nome} preco={p.preco} imagem={p.imagem} />
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
              <CartaoProduto key={p.id} nome={p.nome} preco={p.preco} imagem={p.imagem} />
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

        <section className="flex flex-col gap-4" aria-labelledby="kanban-title">
          <div className="flex flex-col gap-1">
            <h2 id="kanban-title" className="text-lg font-bold tracking-tight text-foreground">
              Acompanhamento das entregas
            </h2>
            <p className="text-sm text-muted-foreground">
              Organize a produção e avance cada pedido com um toque.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {pedidosPorStatus.map((coluna) => {
              const StatusIcon = coluna.icon
              return (
                <section
                  key={coluna.valor}
                  className="flex min-h-64 flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-3"
                  aria-labelledby={`status-${coluna.valor}`}
                >
                  <div className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${coluna.classe}`}>
                    <div className="flex items-center gap-2">
                      <StatusIcon className="size-4" aria-hidden="true" />
                      <h3 id={`status-${coluna.valor}`} className="text-sm font-semibold">
                        {coluna.label}
                      </h3>
                    </div>
                    <span className="rounded-full bg-background/70 px-2 py-0.5 text-xs font-bold tabular-nums">
                      {coluna.pedidos.length}
                    </span>
                  </div>

                  <ul className="flex flex-col gap-3">
                    {coluna.pedidos.length === 0 ? (
                      <li className="rounded-xl border border-dashed border-border bg-card/60 px-3 py-8 text-center text-xs text-muted-foreground">
                        Nenhum pedido nesta etapa
                      </li>
                    ) : (
                      coluna.pedidos.map((p) => {
                        const proximoStatus = p.status === "pendente" ? "preparando" : p.status === "preparando" ? "entregue" : null
                        const acao = p.status === "pendente" ? "Iniciar preparo" : p.status === "preparando" ? "Enviar para entrega" : null
                        const AcaoIcon = p.status === "pendente" ? Play : p.status === "preparando" ? Send : PackageCheck
                        return (
                          <li key={p.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                  Pedido #{p.id.slice(-6).toUpperCase()}
                                </p>
                                <p className="truncate text-sm font-bold text-foreground">{p.cliente}</p>
                                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="size-3" aria-hidden="true" />
                                  {horaFormatada(p.data)} · {rotuloForma[p.forma]}
                                </p>
                              </div>
                              <button type="button" onClick={() => removePedido(p.id)} className="rounded-md p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive" aria-label={`Remover pedido de ${p.cliente}`}>
                                <Trash2 className="size-4" aria-hidden="true" />
                              </button>
                            </div>

                            <div className="flex items-start gap-2 rounded-lg bg-muted/60 px-2.5 py-2 text-xs text-muted-foreground">
                              <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                              <span>Retirada no balcão · endereço não informado</span>
                            </div>

                            <ul className="flex flex-col gap-1.5 border-y border-border py-2">
                              {p.itens.map((item, i) => (
                                <li key={i} className="flex items-center justify-between gap-2 text-sm text-foreground">
                                  <span className="flex min-w-0 items-center gap-2">
                                    <img src={item.imagem || produtos.find((produto) => produto.nome === item.descricao)?.imagem || "/placeholder.svg"} alt="" className="size-8 shrink-0 rounded-md object-cover" />
                                    <span className="truncate">{item.quantidade}× {item.descricao}</span>
                                  </span>
                                  <span className="shrink-0 text-muted-foreground">{formatarBRL(item.preco * item.quantidade)}</span>
                                </li>
                              ))}
                            </ul>

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Total do pedido</span>
                              <span className="text-base font-bold text-primary">{formatarBRL(totalPedido(p.itens))}</span>
                            </div>

                            {p.observacao && <p className="text-xs italic text-muted-foreground">{p.observacao}</p>}

                            {acao && proximoStatus ? (
                              <Button type="button" size="sm" className="w-full" onClick={() => atualizarStatusPedido(p.id, proximoStatus)}>
                                <AcaoIcon className="size-4" aria-hidden="true" />
                                {acao}
                              </Button>
                            ) : (
                              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                                <AcaoIcon className="size-4" aria-hidden="true" /> Pedido concluído
                              </div>
                            )}
                          </li>
                        )
                      })
                    )}
                  </ul>
                </section>
              )
            })}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
