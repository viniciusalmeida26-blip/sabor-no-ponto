"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { atualizarCliente, carregarCliente } from "@/app/actions/dados"

export function ClientProfile() {
  const [nome, setNome] = useState("")
  const [telefone, setTelefone] = useState("")
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState("")
  const [erro, setErro] = useState("")

  useEffect(() => {
    try {
      const salvo = window.sessionStorage.getItem("snp_cliente")
      if (salvo) {
        const cliente = JSON.parse(salvo) as { nome?: string; telefone?: string }
        setNome(cliente.nome ?? "")
        setTelefone(cliente.telefone ?? "")
      }
    } catch (error) {
      console.log("[v0] erro ao carregar sessão do cliente:", error)
    }
  }, [])

  useEffect(() => {
    if (!telefone) return
    carregarCliente(telefone).then((cliente) => {
      if (cliente) setNome(cliente.nome)
    }).catch((error) => console.log("[v0] erro ao carregar perfil:", error))
  }, [telefone])

  async function salvar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro("")
    setMensagem("")
    setSalvando(true)
    try {
      const cliente = await atualizarCliente({ nome, telefone })
      window.sessionStorage.setItem("snp_cliente", JSON.stringify(cliente))
      setNome(cliente.nome)
      setTelefone(cliente.telefone)
      setMensagem("Perfil salvo com sucesso.")
    } catch (error) {
      console.log("[v0] erro ao salvar perfil:", error)
      setErro("Não foi possível salvar o perfil. Confira o nome e o telefone.")
    } finally {
      setSalvando(false)
    }
  }

  function sair() {
    window.sessionStorage.removeItem("snp_cliente")
    window.sessionStorage.removeItem("snp_carrinho")
    window.location.href = "/cliente"
  }

  return <main className="min-h-dvh bg-[#fffaf5] px-4 pb-12 text-[#3a2518]"><header className="sticky top-0 z-10 -mx-4 mb-8 border-b border-[#eadbce] bg-[#fffaf5]/95 px-4 py-3 backdrop-blur"><div className="mx-auto flex max-w-5xl items-center justify-between gap-3"><Link href="/cliente" className="font-bold text-[#c85b16]">Sabor no Ponto</Link><nav aria-label="Navegação do cliente" className="flex items-center gap-3 overflow-x-auto text-xs font-semibold sm:gap-4 sm:text-sm"><Link href="/cliente">Cardápio</Link><Link href="/cliente/pedidos">Meus pedidos</Link><Link href="/cliente/perfil" className="text-[#c85b16]">Perfil</Link><button type="button" onClick={sair} className="rounded-lg border border-[#eadbce] px-2 py-1">Sair</button></nav></div></header><section className="mx-auto max-w-xl rounded-3xl border border-[#eadbce] bg-white p-6 shadow-sm sm:p-8"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#c85b16]">Perfil</p><h1 className="mt-3 text-2xl font-bold">Sua conta do cliente</h1><p className="mt-2 text-sm leading-6 text-[#856c5a]">Seu telefone identifica sua conta e seus pedidos.</p><form onSubmit={salvar} className="mt-6 space-y-4"><label className="block text-sm font-semibold">Nome<input value={nome} onChange={(event) => setNome(event.target.value)} required className="mt-1 h-11 w-full rounded-xl border border-[#eadbce] px-3 font-normal outline-none focus:ring-2 focus:ring-[#e87524]/30" /></label><label className="block text-sm font-semibold">Telefone<input value={telefone} onChange={(event) => setTelefone(event.target.value)} required inputMode="tel" placeholder="(41) 99999-9999" className="mt-1 h-11 w-full rounded-xl border border-[#eadbce] px-3 font-normal outline-none focus:ring-2 focus:ring-[#e87524]/30" /></label>{erro && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{erro}</p>}{mensagem && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{mensagem}</p>}<button type="submit" disabled={salvando} className="w-full rounded-xl bg-[#e87524] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{salvando ? "Salvando..." : "Salvar perfil"}</button></form></section></main>
}
