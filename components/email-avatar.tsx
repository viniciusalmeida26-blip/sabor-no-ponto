"use client"

import { iniciais } from "@/lib/gravatar"

type Props = {
  email: string
  nome?: string
  /** tamanho em pixels */
  size?: number
  className?: string
}

/**
 * Mostra a foto real associada ao e-mail (Gravatar). Como a URL é derivada
 * do e-mail, a foto é atualizada automaticamente sempre que o e-mail muda.
 * Se o e-mail não tiver foto, mostra as iniciais do nome.
 */
export function EmailAvatar({ email, nome, size = 48, className = "" }: Props) {
  return (
    <span
      className={`relative inline-flex shrink-0 rounded-full bg-gradient-to-br from-primary via-amber-400 to-accent p-[2px] shadow-[0_8px_20px_-10px_hsl(var(--primary))] ${className}`}
      style={{ width: size + 4, height: size + 4 }}
    >
      <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground ring-2 ring-background">
        {/* Iniciais ficam sempre ao fundo; a foto aparece por cima ao carregar. */}
        <span
          className="font-semibold"
          style={{ fontSize: Math.max(11, size * 0.38) }}
          aria-hidden="true"
        >
          {iniciais(nome || email || "?")}
        </span>

      </span>
      <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background bg-emerald-500" aria-label="Online" />
    </span>
  )
}
