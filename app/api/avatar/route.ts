import { get, put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"

const TIPOS_PERMITIDOS = new Set(["image/jpeg", "image/png", "image/webp"])

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const arquivo = formData.get("file")

    if (!(arquivo instanceof File) || !TIPOS_PERMITIDOS.has(arquivo.type)) {
      return NextResponse.json({ error: "Envie uma imagem JPG, PNG ou WebP." }, { status: 400 })
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "A imagem deve ter no máximo 5 MB." }, { status: 400 })
    }

    const blob = await put(`avatars/${crypto.randomUUID()}-${arquivo.name}`, arquivo, {
      access: "private",
      addRandomSuffix: false,
    })

    return NextResponse.json({ url: `/api/avatar?pathname=${encodeURIComponent(blob.pathname)}` })
  } catch (error) {
    console.error("[v0] Falha no upload do avatar:", error)
    return NextResponse.json({ error: "Não foi possível salvar a foto. Tente novamente." }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get("pathname")
  if (!pathname) return NextResponse.json({ error: "Foto não encontrada." }, { status: 400 })

  try {
    const resultado = await get(pathname, { access: "private" })
    if (!resultado) return new NextResponse("Foto não encontrada.", { status: 404 })
    return new NextResponse(resultado.stream, {
      headers: {
        "Content-Type": resultado.blob.contentType,
        "Cache-Control": "private, no-cache",
        ETag: resultado.blob.etag,
      },
    })
  } catch (error) {
    console.error("[v0] Falha ao carregar avatar:", error)
    return new NextResponse("Foto não encontrada.", { status: 404 })
  }
}
