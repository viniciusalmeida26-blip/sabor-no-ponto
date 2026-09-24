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
  const [tentativa, setTentativa] = useState<"google" | "gravatar">("google")

  // Primeiro tenta a foto pública do perfil Google/Gmail; depois usa Gravatar.
  useEffect(() => {
    setCarregada(false)
    setTentativa("google")
  }, [email])

  const fotoGoogle = email
    ? `https://www.google.com/s2/photos/profile/${encodeURIComponent(email)}`
    : ""
  const foto = tentativa === "google" ? fotoGoogle : gravatarUrl(email, size * 2)

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
          src={foto || "/placeholder.svg"}
          alt={`Foto de ${nome || email}`}
          width={size}
          height={size}
          crossOrigin="anonymous"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity ${
            carregada ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setCarregada(true)}
          onError={() => {
            setCarregada(false)
            if (tentativa === "google") setTentativa("gravatar")
          }}
        />
      )}
    </span>
  )
}
