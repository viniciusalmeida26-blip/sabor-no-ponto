"use client"

import { useEffect, useState } from "react"
import { gravatarUrl, iniciais } from "@/lib/gravatar"

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
  const [carregada, setCarregada] = useState(false)

  // Sempre que o e-mail mudar, volta a mostrar as iniciais até a nova foto
  // carregar (evita "flash" branco enquanto o Gravatar responde).
  useEffect(() => {
    setCarregada(false)
  }, [email])

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Iniciais ficam sempre ao fundo; a foto aparece por cima ao carregar. */}
      <span
        className="font-semibold"
        style={{ fontSize: Math.max(11, size * 0.38) }}
        aria-hidden="true"
      >
        {iniciais(nome || email || "?")}
      </span>
      {email && (
        <img
          src={gravatarUrl(email, size * 2) || "/placeholder.svg"}
          alt={`Foto de ${nome || email}`}
          width={size}
          height={size}
          crossOrigin="anonymous"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity ${
            carregada ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setCarregada(true)}
          onError={() => setCarregada(false)}
        />
      )}
    </span>
  )
}
