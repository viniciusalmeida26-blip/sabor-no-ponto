"use client"

import { useMemo } from "react"
import { AppShell } from "@/components/app-shell"
import {
  useStore,
  formatarBRL,
  rotuloForma,
  rotuloStatus,
  totalPedido,
  type StatusPedido,
} from "@/lib/store"
import {
  Trash2,
  ShoppingCart,
  ClipboardList,
  Clock,
  ChefHat,
  CheckCircle2,
} from "lucide-react"

const statusInfo: Record<
  StatusPedido,
  { icon: typeof Clock; classe: string }
> = {
  pendente: { icon: Clock, classe: "bg-muted text-muted-foreground" },
  preparando: { icon: ChefHat, classe: "bg-accent text-accent-foreground" },
  entregue: { icon: CheckCircle2, classe: "bg-primary/15 text-primary" },
}

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
  const { vendas, pedidos, removeVenda } = useStore()

  const vendasHoje = useMemo(
    () => vendas.filter((v) => ehHoje(v.data)),
    [vendas],
  )

  const totalHoje = useMemo(
    () => vendasHoje.reduce((s, v) => s + v.quantidade * v.valorUnitario, 0),
    [vendasHoje],
  )

  const pedidosHoje = useMemo(
    () => pedidos.filter((p) => ehHoje(p.data)),
    [pedidos],
  )

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Registro de Vendas
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe as vendas e o registro diário dos pedidos.
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

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">
            Vendas de hoje
          </h2>
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
