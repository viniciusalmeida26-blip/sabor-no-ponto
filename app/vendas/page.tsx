"use client"

import { AppShell } from "@/components/app-shell"
import { formatarBRL } from "@/lib/store"
import { Soup } from "lucide-react"

const cardapios = [
  { dia: "Domingo", mistura: "Frango assado com ervas", acompanhamentos: "Arroz, feijão, farofa e salada", valor: 20 },
  { dia: "Segunda-feira", mistura: "Bife acebolado", acompanhamentos: "Arroz, feijão, purê de batata e salada", valor: 22 },
  { dia: "Terça-feira", mistura: "Frango grelhado", acompanhamentos: "Arroz, feijão, macarrão e salada", valor: 20 },
  { dia: "Quarta-feira", mistura: "Carne de panela", acompanhamentos: "Arroz, feijão, mandioca e couve", valor: 23 },
  { dia: "Quinta-feira", mistura: "Bisteca suína acebolada", acompanhamentos: "Arroz, feijão, batata dourada e salada", valor: 22 },
  { dia: "Sexta-feira", mistura: "Strogonoff de frango", acompanhamentos: "Arroz, feijão, batata palha e salada", valor: 24 },
  { dia: "Sábado", mistura: "Linguiça acebolada", acompanhamentos: "Arroz, feijão, farofa e vinagrete", valor: 20 },
]

export default function VendasPage() {
  const cardapio = cardapios[new Date().getDay()]

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Início</h1>
          <p className="text-sm text-muted-foreground">Confira o cardápio do dia.</p>
        </div>

        <section className="relative min-h-[300px] overflow-hidden rounded-2xl border border-border bg-primary shadow-sm">
          <img src="/images/fundo-marmita.png" alt="Marmitas prontas com arroz, feijão, frango e salada" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/60 to-foreground/10" />
          <div className="relative flex min-h-[300px] max-w-xl flex-col justify-center gap-5 p-6 text-primary-foreground sm:p-8">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary-foreground/85">
              <Soup className="size-5" aria-hidden="true" />
              Cardápio de hoje
            </div>
            <div>
              <p className="text-sm font-medium text-primary-foreground/80">{cardapio.dia}</p>
              <h2 className="mt-1 text-3xl font-bold leading-tight text-balance">Marmita de {cardapio.mistura}</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-primary-foreground/85">{cardapio.acompanhamentos}. A mistura do dia já vem definida, sem escolhas.</p>
            <div className="flex items-end justify-between gap-4 border-t border-primary-foreground/25 pt-4">
              <span className="text-sm text-primary-foreground/80">Valor da marmita</span>
              <span className="text-3xl font-bold">{formatarBRL(cardapio.valor)}</span>
            </div>
          </div>
        </section>


      </div>
    </AppShell>
  )
}
