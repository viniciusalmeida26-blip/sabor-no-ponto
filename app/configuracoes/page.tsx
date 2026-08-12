"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { EmailAvatar } from "@/components/email-avatar"
import { useStore } from "@/lib/store"
import {
  LogOut,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  Mail,
  ChevronRight,
} from "lucide-react"

const ajudas = [
  {
    p: "Como registro uma venda?",
    r: "Na página Pedidos, monte o pedido do cliente e acompanhe até a entrega. Ao marcar como entregue, a venda é registrada automaticamente e aparece em Vendas.",
  },
  {
    p: "Os dados são salvos?",
    r: "Sim. Os registros ficam salvos no banco de dados e não são perdidos ao sair do site, mesmo trocando de aparelho. Cada dia mostra apenas seus próprios registros, e o histórico completo fica no Calendário.",
  },
  {
    p: "O que acontece à meia-noite?",
    r: "A partir das 00:00 as telas passam a mostrar o novo dia automaticamente. Os dias anteriores continuam disponíveis no Calendário de Vendas.",
  },
  {
    p: "Como vejo o total só de marmitas?",
    r: "Na página Vendas, o card 'Total só de marmitas hoje' soma apenas as marmitas vendidas no dia.",
  },
]

function ItemAjuda({ p, r }: { p: string; r: string }) {
  const [aberto, setAberto] = useState(false)
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-muted/50"
        aria-expanded={aberto}
      >
        <span className="text-sm font-medium text-foreground">{p}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${
            aberto ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>
      {aberto && (
        <p className="border-t border-border px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          {r}
        </p>
      )}
    </div>
  )
}

export default function ConfiguracoesPage() {
  const { usuario, logout } = useStore()
  const router = useRouter()

  function sair() {
    logout()
    router.replace("/")
  }

  const acoes = [
    {
      label: "Trocar de usuário",
      descricao: "Sair e entrar com outra conta",
      icon: RefreshCw,
      classeIcone: "bg-accent text-accent-foreground",
      classeTexto: "text-foreground",
      onClick: sair,
    },
    {
      label: "Sair da conta",
      descricao: "Encerrar a sessão neste aparelho",
      icon: LogOut,
      classeIcone: "bg-destructive/10 text-destructive",
      classeTexto: "text-destructive",
      onClick: sair,
    },
  ]

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Configurações
          </h1>
          <p className="text-sm text-muted-foreground">
            Sua conta, ajuda e opções do aplicativo.
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">Conta</h2>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
            <EmailAvatar
              email={usuario?.email || ""}
              nome={usuario?.nome}
              size={48}
              className="ring-2 ring-border"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {usuario?.nome}
              </p>
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{usuario?.email}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {acoes.map((a) => {
              const Icon = a.icon
              return (
                <button
                  key={a.label}
                  type="button"
                  onClick={a.onClick}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition hover:bg-muted/50"
                >
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${a.classeIcone}`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold ${a.classeTexto}`}>
                      {a.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.descricao}
                    </p>
                  </div>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </button>
              )
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <HelpCircle className="size-4" aria-hidden="true" />
            Ajuda
          </h2>
          <div className="flex flex-col gap-2">
            {ajudas.map((a) => (
              <ItemAjuda key={a.p} p={a.p} r={a.r} />
            ))}
          </div>
        </section>

        <p className="text-center text-xs text-muted-foreground">
          Sabor no Ponto · Controle da sua marmitaria
        </p>
      </div>
    </AppShell>
  )
}
