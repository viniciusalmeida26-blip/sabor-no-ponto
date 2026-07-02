"use client"

import { useEffect, type ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
  UtensilsCrossed,
  ShoppingCart,
  BarChart3,
  LogOut,
  ClipboardList,
} from "lucide-react"

const navItems = [
  { href: "/vendas", label: "Vendas", icon: ShoppingCart },
  { href: "/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
]

export function AppShell({ children }: { children: ReactNode }) {
  const { usuario, hidratado, logout } = useStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (hidratado && !usuario) router.replace("/")
  }, [hidratado, usuario, router])

  if (!hidratado || !usuario) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-dvh flex-col bg-background"
      style={{
        backgroundImage: "url(/images/fundo-textura.png)",
        backgroundSize: "420px",
        backgroundAttachment: "fixed",
      }}
    >
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <UtensilsCrossed className="size-5" aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-foreground">Sabor no Ponto</p>
              <p className="text-xs text-muted-foreground">
                Olá, {usuario.nome}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout()
              router.replace("/")
            }}
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Sair</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        {children}
      </main>

      <nav className="sticky bottom-0 border-t border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl">
          {navItems.map((item) => {
            const ativo = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                  ativo
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-current={ativo ? "page" : undefined}
              >
                <Icon className="size-5" aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
