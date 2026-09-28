import { get, put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { atualizarFotoPerfil, obterPerfil } from "@/app/actions/dados"

const TIPOS_PERMITIDOS = new Set(["image/jpeg", "image/png", "image/webp"])

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const arquivo = formData.get("file")
    const email = formData.get("email")

    if (typeof email !== "string" || !email.trim() || !(await obterPerfil(email.trim()))) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 401 })
    }

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

    const url = `/api/avatar?pathname=${encodeURIComponent(blob.pathname)}`
    await atualizarFotoPerfil(email.trim(), url)
    return NextResponse.json({ url })
  } catch (error) {
    console.error("[v0] Falha no upload do avatar:", error)
    return NextResponse.json({ error: "Não foi possível salvar a foto. Tente novamente." }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json() as { email?: string }
    if (!body.email || !(await obterPerfil(body.email))) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 401 })
    }
    await atualizarFotoPerfil(body.email, null)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Não foi possível remover a foto." }, { status: 500 })
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
        "Content-Type": resultado.blob.contentType || "application/octet-stream",
        "Cache-Control": "private, no-cache",
        ETag: resultado.blob.etag,
      },
    })
  } catch (error) {
    console.error("[v0] Falha ao carregar avatar:", error)
    return new NextResponse("Foto não encontrada.", { status: 404 })
  }
}
