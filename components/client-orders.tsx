"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { carregarPedidosDoCliente, type Pedido } from "@/app/actions/dados"

const status: Record<Pedido["status"], { label: string; color: string }> = {
  pendente: { label: "Pedido recebido", color: "bg-amber-100 text-amber-800" },
  preparando: { label: "Em preparo", color: "bg-blue-100 text-blue-800" },
  pronta: { label: "Pronto para retirada", color: "bg-emerald-100 text-emerald-800" },
  entregue: { label: "Entregue", color: "bg-slate-100 text-slate-700" },
  cancelado: { label: "Cancelado", color: "bg-rose-100 text-rose-700" },
}

export function ClientOrders() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [carregando, setCarregando] = useState(true)
  const [cliente, setCliente] = useState<{ nome: string; telefone: string } | null>(null)
  useEffect(() => {
    try { const salvo = window.sessionStorage.getItem("snp_cliente"); if (salvo) setCliente(JSON.parse(salvo)) } catch {}
  }, [])
  useEffect(() => {
    if (!cliente?.telefone) { setCarregando(false); return }
    carregarPedidosDoCliente(cliente.telefone).then(setPedidos).catch(() => setPedidos([])).finally(() => setCarregando(false))
  }, [cliente])
  return <main className="min-h-dvh bg-[#fffaf5] px-4 pb-12 text-[#3a2518]"><header className="sticky top-0 z-10 -mx-4 mb-8 border-b border-[#eadbce] bg-[#fffaf5]/95 px-4 py-3 backdrop-blur"><div className="mx-auto flex max-w-5xl items-center justify-between"><Link href="/cliente" className="font-bold text-[#c85b16]">Sabor no Ponto</Link><nav aria-label="Navegação do cliente" className="flex items-center gap-3 text-xs font-semibold"><Link href="/cliente">Cardápio</Link><Link href="/cliente/pedidos" className="text-[#c85b16]">Meus pedidos</Link><Link href="/cliente/perfil">Perfil</Link><button type="button" onClick={() => { window.sessionStorage.removeItem("snp_cliente"); window.location.replace("/") }} className="rounded-lg border border-[#eadbce] px-2 py-1">Sair</button></nav></div></header><div className="mx-auto max-w-3xl"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#c85b16]">Meus pedidos</p><h1 className="mt-2 text-3xl font-bold">Acompanhe seu pedido</h1>{!cliente ? <p className="mt-4 rounded-2xl bg-white p-5 text-sm text-[#856c5a]">Entre pelo acesso Cliente e informe nome e telefone para visualizar seus pedidos.</p> : carregando ? <p className="mt-6 text-sm text-[#856c5a]">Carregando seus pedidos...</p> : pedidos.length === 0 ? <p className="mt-6 rounded-2xl bg-white p-5 text-sm text-[#856c5a]">Ainda não encontramos pedidos para este telefone.</p> : <div className="mt-6 space-y-4">{pedidos.map((pedido) => <article key={pedido.id} className="rounded-2xl border border-[#eadbce] bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-[#856c5a]">Pedido #{pedido.id.slice(-6).toUpperCase()}</p><h2 className="mt-1 font-bold">{pedido.itens.map((item) => `${item.quantidade}x ${item.descricao}`).join(", ")}</h2></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${status[pedido.status].color}`}>{status[pedido.status].label}</span></div><p className="mt-3 text-sm text-[#856c5a]">Atualizado em {new Date(pedido.data).toLocaleString("pt-BR")}</p></article>)}</div>}</div></main>
}
