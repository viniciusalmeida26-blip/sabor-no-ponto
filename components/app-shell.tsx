"use client"

import { useEffect, type ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { EmailAvatar } from "@/components/email-avatar"
import {
  Home,
  HandPlatter,
  CalendarDays,
  Receipt,
  CookingPot,
  UtensilsCrossed,
  LogOut,
} from "lucide-react"

const navItems = [
  { href: "/vendas", label: "Início", icon: Home },
  { href: "/pedidos", label: "Pedidos", icon: HandPlatter },
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/relatorios", label: "Relatórios", icon: Receipt },
  { href: "/gerenciamento-cardapio", label: "Cardápio", icon: UtensilsCrossed },
  { href: "/configuracoes", label: "Config", icon: CookingPot },
]

export function AppShell({ children }: { children: ReactNode }) {
  const { usuario, hidratado, logout } = useStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (hidratado && !usuario) router.replace("/")
  }, [hidratado, usuario, router])

  if (!usuario) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh bg-background" style={{ backgroundImage: "url(/images/fundo-textura.png)", backgroundSize: "420px", backgroundAttachment: "fixed" }}>
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card/95 px-4 py-5 lg:flex lg:flex-col">
        <div className="flex items-center gap-3 px-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"><UtensilsCrossed className="size-5" aria-hidden="true" /></div>
          <div className="leading-tight"><p className="font-bold text-foreground">Sabor no Ponto</p><p className="text-xs text-muted-foreground">Gestão da marmitaria</p></div>
        </div>
        <nav className="mt-8 flex flex-col gap-1" aria-label="Navegação principal">
          {navItems.map((item) => {
            const ativo = pathname === item.href
            const Icon = item.icon
            return <Link key={item.href} href={item.href} aria-current={ativo ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${ativo ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><Icon className="size-4" aria-hidden="true" />{item.label}</Link>
          })}
        </nav>
        <div className="mt-auto flex items-center gap-3 border-t border-border px-2 pt-4">
          <EmailAvatar email={usuario.email} nome={usuario.nome} fotoUrl={usuario.fotoUrl} size={36} />
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{usuario.nome}</p><p className="truncate text-xs text-muted-foreground">{usuario.email}</p></div>
          <Button variant="ghost" size="icon" aria-label="Sair" onClick={() => { logout(); router.replace("/") }}><LogOut className="size-4" aria-hidden="true" /></Button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-border bg-card/85 backdrop-blur lg:hidden">
          <div className="mx-auto flex w-full items-center justify-between gap-4 px-4 py-3">
            <div className="flex items-center gap-2"><div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><UtensilsCrossed className="size-5" aria-hidden="true" /></div><div className="leading-tight"><p className="text-sm font-bold text-foreground">Sabor no Ponto</p><p className="text-xs text-muted-foreground">Olá, {usuario.nome}</p></div></div>
            <EmailAvatar email={usuario.email} nome={usuario.nome} fotoUrl={usuario.fotoUrl} size={36} className="ring-2 ring-border" />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur lg:hidden" aria-label="Navegação principal"><div className="mx-auto flex w-full max-w-2xl">{navItems.map((item) => { const ativo = pathname === item.href; const Icon = item.icon; return <Link key={item.href} href={item.href} aria-current={ativo ? "page" : undefined} className={`flex min-w-0 flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${ativo ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}><Icon className="size-5" aria-hidden="true" />{item.label}</Link> })}</div></nav>
      </div>
    </div>
  )
}
