"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import {
  User,
  LogOut,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  Mail,
} from "lucide-react"

const ajudas = [
  {
    p: "Como registro uma venda?",
    r: "Na página Pedidos, monte o pedido do cliente e acompanhe até a entrega. Ao marcar como entregue, a venda é registrada automaticamente e aparece em Vendas.",
  },
  {
    p: "Os dados são salvos?",
    r: "Sim. Os registros ficam salvos no aparelho e não são perdidos ao sair do site. Cada dia mostra apenas seus próprios registros, e o histórico completo fica no Calendário.",
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
    <div className="rounded-lg border border-border bg-background">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
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
        <p className="px-4 pb-3 text-sm leading-relaxed text-muted-foreground">
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
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="size-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {usuario?.nome}
              </p>
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <Mail className="size-3.5" aria-hidden="true" />
                {usuario?.email}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-start"
              onClick={sair}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Trocar de usuário
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={sair}
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sair da conta
            </Button>
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
