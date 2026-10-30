"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, CheckCircle2, Heart, Minus, Plus, Search, ShoppingBag, Trash2 } from "lucide-react"
import { alternarFavoritoCliente, listarFavoritosCliente, listarEnderecosCliente, type EnderecoCliente } from "@/app/actions/dados"
import { formatarBRL, useStore, type FormaPagamento } from "@/lib/store"

type ItemCarrinho = { id: string; nome: string; preco: number; quantidade: number; imagem: string }

export function ClientMenu() {
  const { produtos, addPedido } = useStore()
  const [busca, setBusca] = useState("")
  const [categoria, setCategoria] = useState("todos")
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [aberto, setAberto] = useState(false)
  const [cliente, setCliente] = useState("")
  const [telefone, setTelefone] = useState("")
  const [forma, setForma] = useState<FormaPagamento>("pix")
  const [observacao, setObservacao] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState("")
  const [favoritos, setFavoritos] = useState<string[]>([])
  const [enderecos, setEnderecos] = useState<EnderecoCliente[]>([])
  const [enderecoSelecionado, setEnderecoSelecionado] = useState("")
  const [carrinhoCarregado, setCarrinhoCarregado] = useState(false)
  const categorias = ["todos", ...Array.from(new Set(produtos.map((produto) => produto.categoria)))]
  const filtrados = useMemo(() => produtos.filter((produto) => produto.disponivel && (categoria === "todos" || produto.categoria === categoria) && `${produto.nome} ${produto.descricao}`.toLowerCase().includes(busca.toLowerCase())), [produtos, categoria, busca])
  const quantidade = carrinho.reduce((total, item) => total + item.quantidade, 0)
  const total = carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0)
  useEffect(() => {
    try {
      const clienteSalvo = window.sessionStorage.getItem("snp_cliente")
      if (clienteSalvo) {
        const dados = JSON.parse(clienteSalvo) as { nome?: string; telefone?: string }
        setCliente(dados.nome ?? "")
        setTelefone(dados.telefone ?? "")
      }
      const salvo = window.sessionStorage.getItem("snp_carrinho")
      if (salvo) setCarrinho(JSON.parse(salvo) as ItemCarrinho[])
    } catch (error) {
      console.log("[v0] erro ao restaurar carrinho:", error)
    } finally {
      setCarrinhoCarregado(true)
    }
  }, [])
  useEffect(() => {
    if (carrinhoCarregado) window.sessionStorage.setItem("snp_carrinho", JSON.stringify(carrinho))
  }, [carrinho, carrinhoCarregado])
  useEffect(() => {
    if (telefone.replace(/\D/g, "").length >= 10) {
      listarFavoritosCliente(telefone).then(setFavoritos).catch(() => setFavoritos([]))
      listarEnderecosCliente(telefone).then((lista) => { setEnderecos(lista); setEnderecoSelecionado(lista.find((item) => item.principal)?.id ?? lista[0]?.id ?? "") }).catch(() => setEnderecos([]))
    }
  }, [telefone])
  async function alternarFavorito(produtoId: string) {
    if (telefone.replace(/\D/g, "").length < 10) { setErro("Informe seu telefone para salvar favoritos."); return }
    const ativo = await alternarFavoritoCliente(telefone, produtoId)
    setFavoritos((atual) => ativo ? [produtoId, ...atual] : atual.filter((id) => id !== produtoId))
  }
  function adicionar(produto: (typeof produtos)[number]) { setCarrinho((atual) => { const existente = atual.find((item) => item.id === produto.id); return existente ? atual.map((item) => item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item) : [...atual, { id: produto.id, nome: produto.nome, preco: produto.preco, quantidade: 1, imagem: produto.imagem }] }) }
  function alterar(id: string, delta: number) { setCarrinho((atual) => atual.flatMap((item) => item.id === id ? [{ ...item, quantidade: item.quantidade + delta }].filter((novo) => novo.quantidade > 0) : [item])) }
  async function finalizarPedido() {
    if (!cliente.trim() || telefone.replace(/\D/g, "").length < 10 || carrinho.length === 0 || enviando) return
    setErro("")
    setEnviando(true)
    try {
      await addPedido({ cliente: cliente.trim(), telefone: telefone.trim(), itens: carrinho.map(({ nome, preco, quantidade, imagem }) => ({ descricao: nome, preco, quantidade, imagem })), observacao: `Telefone: ${telefone.trim()}${enderecoSelecionado ? `\nEndereço: ${(() => { const e = enderecos.find((item) => item.id === enderecoSelecionado); return e ? `${e.rua}, ${e.numero} - ${e.bairro}, ${e.cidade} - CEP ${e.cep}` : "" })()}` : ""}${observacao.trim() ? `\n${observacao.trim()}` : ""}`, forma })
      window.sessionStorage.setItem("snp_cliente", JSON.stringify({ nome: cliente.trim(), telefone: telefone.trim() }))
      setCarrinho([])
      window.sessionStorage.removeItem("snp_carrinho")
      setSucesso(true)
    } catch (error) {
      console.log("[v0] erro ao enviar pedido do cliente:", error)
      setErro("Não foi possível enviar seu pedido agora. Confira os dados e tente novamente.")
    } finally {
      setEnviando(false)
    }
  }
  return <div className="min-h-dvh bg-[#fffaf5] text-[#3a2518]">
    <header className="sticky top-0 z-20 border-b border-[#eadbce] bg-[#fffaf5]/95 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6"><Link href="/cliente" className="flex items-center gap-3"><Image src="/images/logo-sabor-no-ponto.jpg" alt="Sabor no Ponto" width={46} height={46} className="size-11 rounded-full object-cover shadow-sm" priority /><span><strong className="block text-sm">Sabor no Ponto</strong><span className="text-xs text-[#856c5a]">Marmitaria caseira</span></span></Link><nav aria-label="Navegação do cliente" className="flex items-center gap-2 overflow-x-auto text-xs font-medium text-[#856c5a] sm:gap-4 sm:text-sm"><Link href="/cliente" className="text-[#c85b16]">Cardápio</Link><Link href="/cliente/pedidos" className="transition hover:text-[#c85b16]">Meus pedidos</Link><Link href="/cliente/perfil" className="transition hover:text-[#c85b16]">Perfil</Link><button type="button" onClick={() => { window.sessionStorage.removeItem("snp_cliente"); window.location.replace("/") }} className="transition hover:text-[#c85b16]">Sair</button></nav><button type="button" onClick={() => { setAberto(true); setSucesso(false); setErro("") }} className="relative inline-flex size-11 items-center justify-center rounded-full bg-[#e87524] text-white shadow-sm" aria-label={`Abrir carrinho com ${quantidade} item(ns)`}><ShoppingBag className="size-5" aria-hidden="true" />{quantidade > 0 && <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#3a2518] text-[10px] font-bold">{quantidade}</span>}</button></div></header>
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6"><div className="mb-8 max-w-2xl"><p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#c85b16]">Cardápio</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Comida caseira feita com carinho.</h1><p className="mt-3 text-[#856c5a]">Escolha seus favoritos e monte seu pedido com praticidade.</p></div><div className="flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9b806c]" aria-hidden="true" /><span className="sr-only">Pesquisar no cardápio</span><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="O que você deseja hoje?" className="h-11 w-full rounded-xl border border-[#eadbce] bg-white pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#e87524]/30" /></label><div className="flex gap-2 overflow-x-auto pb-1">{categorias.map((item) => <button key={item} type="button" onClick={() => setCategoria(item)} className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium capitalize transition ${categoria === item ? "bg-[#e87524] text-white" : "border border-[#eadbce] bg-white text-[#856c5a] hover:border-[#e87524]"}`}>{item === "todos" ? "Todos" : item}</button>)}</div></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtrados.map((produto) => <article key={produto.id} className="overflow-hidden rounded-2xl border border-[#eadbce] bg-white shadow-sm"><div className="relative"><Image src={produto.imagem || "/images/fundo-marmita.png"} alt={`Foto de ${produto.nome}`} width={640} height={360} className="h-44 w-full object-cover" /><button type="button" onClick={() => alternarFavorito(produto.id)} aria-label={favoritos.includes(produto.id) ? `Remover ${produto.nome} dos favoritos` : `Adicionar ${produto.nome} aos favoritos`} className="absolute right-3 top-3 rounded-full bg-white/95 p-2 text-[#c85b16] shadow-sm"><Heart className={`size-5 ${favoritos.includes(produto.id) ? "fill-current" : ""}`} aria-hidden="true" /></button></div><div className="p-4"><p className="text-xs font-semibold uppercase tracking-wider text-[#c85b16]">{produto.categoria}</p><h2 className="mt-1 text-lg font-bold">{produto.nome}</h2><p className="mt-1 min-h-10 text-sm text-[#856c5a]">{produto.descricao}</p><div className="mt-4 flex items-center justify-between gap-3"><strong className="text-lg">{formatarBRL(produto.preco)}</strong><button type="button" onClick={() => adicionar(produto)} className="rounded-xl bg-[#e87524] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#cf631a]">Adicionar</button></div></div></article>)}</div>{filtrados.length === 0 && <div className="mt-8 rounded-2xl border border-dashed border-[#d9c3b2] bg-white p-10 text-center"><p className="font-semibold">Nenhum produto encontrado</p><p className="mt-1 text-sm text-[#856c5a]">Tente outra busca ou categoria.</p></div>}</main>
    {aberto && <div className="fixed inset-0 z-40 bg-[#3a2518]/30" onClick={() => setAberto(false)}><aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between border-b border-[#eadbce] pb-4"><div><h2 className="text-xl font-bold">Seu carrinho</h2><p className="text-sm text-[#856c5a]">{quantidade} item(ns)</p></div><button type="button" onClick={() => setAberto(false)} className="rounded-lg p-2 text-[#856c5a] hover:bg-[#fff3ea]" aria-label="Fechar carrinho"><ArrowLeft className="size-5" aria-hidden="true" /></button></div>{erro && <p role="alert" className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{erro}</p>}{sucesso ? <div className="flex flex-1 flex-col items-center justify-center text-center"><CheckCircle2 className="size-12 text-emerald-600" /><h3 className="mt-4 text-xl font-bold">Pedido enviado</h3><p className="mt-2 text-sm text-[#856c5a]">Seu pedido foi registrado com sucesso.</p><div className="mt-6 flex w-full flex-col gap-2 sm:flex-row sm:justify-center"><Link href="/cliente/pedidos" onClick={() => setAberto(false)} className="rounded-xl bg-[#e87524] px-5 py-3 text-center text-sm font-semibold text-white">Acompanhar pedido</Link><button type="button" onClick={() => setAberto(false)} className="rounded-xl border border-[#eadbce] px-5 py-3 text-sm font-semibold text-[#3a2518]">Voltar ao cardápio</button></div></div> : <><div className="flex-1 space-y-3 overflow-y-auto py-5">{carrinho.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl border border-[#eadbce] p-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.nome}</p><p className="text-sm text-[#c85b16]">{formatarBRL(item.preco * item.quantidade)}</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => alterar(item.id, -1)} className="rounded-md border p-1" aria-label={`Remover uma unidade de ${item.nome}`}><Minus className="size-3" /></button><span className="w-4 text-center text-sm">{item.quantidade}</span><button type="button" onClick={() => alterar(item.id, 1)} className="rounded-md border p-1" aria-label={`Adicionar uma unidade de ${item.nome}`}><Plus className="size-3" /></button></div><button type="button" onClick={() => setCarrinho((atual) => atual.filter((produto) => produto.id !== item.id))} aria-label={`Remover ${item.nome}`} className="text-[#b44b35]"><Trash2 className="size-4" /></button></div>)}{carrinho.length === 0 && <p className="py-12 text-center text-sm text-[#856c5a]">Seu carrinho está vazio.</p>} {carrinho.length > 0 && <div className="space-y-3 pt-3"><label className="block text-sm font-medium">Seu nome<input value={cliente} onChange={(event) => setCliente(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-[#eadbce] px-3" placeholder="Como podemos chamar você?" /></label><label className="block text-sm font-medium">Pagamento<select value={forma} onChange={(event) => setForma(event.target.value as FormaPagamento)} className="mt-1 h-10 w-full rounded-lg border border-[#eadbce] px-3"><option value="pix">Pix</option><option value="cartao">Cartão</option><option value="dinheiro">Dinheiro</option></select></label><label className="block text-sm font-medium">Telefone<input value={telefone} onChange={(event) => setTelefone(event.target.value)} inputMode="tel" placeholder="+55 (41) 99999-9999" required className="h-11 w-full rounded-xl border border-[#eadbce] px-3 text-sm outline-none focus:ring-2 focus:ring-[#e87524]/30" /></label><label className="mt-3 block text-sm font-medium text-[#3a2518]">Observação<textarea value={observacao} onChange={(event) => setObservacao(event.target.value)} className="mt-1 min-h-20 w-full rounded-lg border border-[#eadbce] px-3 py-2" placeholder="Alguma observação?" /></label></div>}</div><div className="border-t border-[#eadbce] pt-4"><div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatarBRL(total)}</span></div><button type="button" onClick={finalizarPedido} disabled={!cliente.trim() || carrinho.length === 0 || enviando} className="mt-4 w-full rounded-xl bg-[#e87524] px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{enviando ? "Enviando..." : "Finalizar pedido"}</button></div></>}</aside></div>}
  </div>
}
