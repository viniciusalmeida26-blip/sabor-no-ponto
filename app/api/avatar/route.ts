import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

const TIPOS_PERMITIDOS = new Set(["image/jpeg", "image/png", "image/webp"])

export async function POST(request: Request) {
  const formData = await request.formData()
  const arquivo = formData.get("file")

  if (!(arquivo instanceof File) || !TIPOS_PERMITIDOS.has(arquivo.type)) {
    return NextResponse.json({ error: "Envie uma imagem JPG, PNG ou WebP." }, { status: 400 })
  }

  if (arquivo.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "A imagem deve ter no máximo 5 MB." }, { status: 400 })
  }

  const blob = await put(`avatars/${crypto.randomUUID()}-${arquivo.name}`, arquivo, {
    access: "public",
    addRandomSuffix: false,
  })

  return NextResponse.json({ url: blob.url })
}
