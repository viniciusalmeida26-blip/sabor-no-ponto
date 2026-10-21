import Link from "next/link"

export const metadata = { title: "Perfil | Sabor no Ponto" }

export default function ClientePerfilPage() {
  return <main className="min-h-dvh bg-[#fffaf5] px-4 py-12 text-[#3a2518]"><div className="mx-auto max-w-xl rounded-3xl border border-[#eadbce] bg-white p-8 text-center shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#c85b16]">Perfil</p><h1 className="mt-3 text-2xl font-bold">Sua conta do cliente</h1><p className="mt-3 text-sm leading-6 text-[#856c5a]">A edição segura de nome, telefone e endereços será vinculada à conta assim que a autenticação real estiver configurada.</p><Link href="/cliente" className="mt-6 inline-flex rounded-xl bg-[#e87524] px-5 py-3 text-sm font-semibold text-white">Voltar ao cardápio</Link></div></main>
}
