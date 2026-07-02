"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { UtensilsCrossed, LockKeyhole } from "lucide-react"

export default function LoginPage() {
  const { usuario, hidratado, login } = useStore()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")

  useEffect(() => {
    if (hidratado && usuario) router.replace("/vendas")
  }, [hidratado, usuario, router])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !senha.trim()) {
      setErro("Preencha e-mail e senha para entrar.")
      return
    }
    const ok = login(email.trim(), senha)
    if (!ok) {
      setErro("E-mail ou senha incorretos.")
      return
    }
    setErro("")
    router.replace("/vendas")
  }

  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      {/* Coluna visual: foto de marmitas com a escrita da marca por cima */}
      <div className="relative hidden overflow-hidden bg-[#2b1a12] lg:block">
        <img
          src="/images/fundo-marmita.png"
          alt="Marmitas caseiras com arroz, feijão, frango e salada sobre mesa de madeira"
          className="absolute inset-0 size-full object-cover"
        />
        {/* overlay escuro para dar contraste ao texto */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(43,26,18,0.92) 0%, rgba(43,26,18,0.78) 45%, rgba(43,26,18,0.35) 100%)",
          }}
          aria-hidden="true"
        />
        <div className="relative flex h-full flex-col justify-center p-12">
          <div className="max-w-xs">
            <p className="font-serif text-6xl font-bold leading-none text-[#f3e6cf]">
              sabor
            </p>
            <p className="-mt-1 font-serif text-5xl font-bold italic leading-none text-primary">
              no ponto
            </p>
            <div className="mt-8 h-px w-16 bg-primary/60" aria-hidden="true" />
            <p className="mt-6 text-lg leading-relaxed text-[#f3e6cf]/90">
              Marmitas feitas com carinho,{" "}
              <span className="font-semibold text-primary">
                no ponto certo
              </span>{" "}
              para o seu dia.
            </p>
          </div>
        </div>
      </div>

      {/* Coluna do formulário */}
      <div
        className="flex flex-col items-center justify-center px-4 py-10"
        style={{
          backgroundImage: "url(/images/fundo-textura.png)",
          backgroundSize: "420px",
        }}
      >
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <UtensilsCrossed className="size-8" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
              Sabor no Ponto
            </h1>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              Controle financeiro da sua marmitaria
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card/95 p-6 shadow-lg backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="davi.oliveira03@escola.pr.gov.br"
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none ring-ring/50 transition focus:border-ring focus:ring-2"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="senha"
                className="text-sm font-medium text-foreground"
              >
                Senha
              </label>
              <input
                id="senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none ring-ring/50 transition focus:border-ring focus:ring-2"
              />
            </div>

            {erro && (
              <p className="text-sm text-destructive" role="alert">
                {erro}
              </p>
            )}

              <Button type="submit" size="lg" className="mt-1 w-full">
                <LockKeyhole className="size-4" aria-hidden="true" />
                Entrar
              </Button>
            </form>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground text-pretty">
            Acesso restrito ao responsável cadastrado.
          </p>
        </div>
      </div>
    </main>
  )
}
