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
  const [erro, setErro] = useState(false)

  // Sempre que o e-mail mudar, tenta carregar a foto de novo.
  useEffect(() => {
    setErro(false)
  }, [email])

  const mostrarFoto = email && !erro

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground ${className}`}
      style={{ width: size, height: size }}
    >
      {mostrarFoto ? (
        <img
          src={gravatarUrl(email, size * 2) || "/placeholder.svg"}
          alt={`Foto de ${nome || email}`}
          width={size}
          height={size}
          crossOrigin="anonymous"
          className="h-full w-full object-cover"
          onError={() => setErro(true)}
        />
      ) : (
        <span
          className="font-semibold"
          style={{ fontSize: Math.max(11, size * 0.38) }}
          aria-hidden="true"
        >
          {iniciais(nome || email || "?")}
        </span>
      )}
    </span>
  )
}
