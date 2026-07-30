"use server"

import { db } from "@/lib/db"
import {
  vendas as tVendas,
  despesas as tDespesas,
  pedidos as tPedidos,
  type ItemPedido,
} from "@/lib/db/schema"
import { and, desc, eq } from "drizzle-orm"

export type FormaPagamento = "dinheiro" | "cartao" | "pix"
export type StatusPedido = "pendente" | "preparando" | "entregue"

export type Venda = {
  id: string
  descricao: string
  quantidade: number
  valorUnitario: number
  forma: FormaPagamento
  data: string
}

export type Despesa = {
  id: string
  descricao: string
  valor: number
  data: string
}

export type Pedido = {
  id: string
  cliente: string
  itens: ItemPedido[]
  observacao: string
  forma: FormaPagamento
  status: StatusPedido
  vendaRegistrada: boolean
  data: string
}

function gerarId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ---------- Leitura ----------

export async function carregarDados(): Promise<{
  vendas: Venda[]
  despesas: Despesa[]
  pedidos: Pedido[]
}> {
  const [linhasVendas, linhasDespesas, linhasPedidos] = await Promise.all([
    db.select().from(tVendas).orderBy(desc(tVendas.data)),
    db.select().from(tDespesas).orderBy(desc(tDespesas.data)),
    db.select().from(tPedidos).orderBy(desc(tPedidos.data)),
  ])

  return {
    vendas: linhasVendas.map((v) => ({
      id: v.id,
      descricao: v.descricao,
      quantidade: v.quantidade,
      valorUnitario: Number(v.valorUnitario),
      forma: v.forma as FormaPagamento,
      data: v.data.toISOString(),
    })),
    despesas: linhasDespesas.map((d) => ({
      id: d.id,
      descricao: d.descricao,
      valor: Number(d.valor),
      data: d.data.toISOString(),
    })),
    pedidos: linhasPedidos.map((p) => ({
      id: p.id,
      cliente: p.cliente,
      itens: p.itens,
      observacao: p.observacao,
      forma: p.forma as FormaPagamento,
      status: p.status as StatusPedido,
      vendaRegistrada: p.vendaRegistrada,
      data: p.data.toISOString(),
    })),
  }
}

// ---------- Vendas ----------

export async function criarVenda(entrada: {
  descricao: string
  quantidade: number
  valorUnitario: number
  forma: FormaPagamento
}): Promise<Venda> {
  const id = gerarId()
  const data = new Date()
  await db.insert(tVendas).values({
    id,
    descricao: entrada.descricao,
    quantidade: entrada.quantidade,
    valorUnitario: entrada.valorUnitario.toString(),
    forma: entrada.forma,
    data,
  })
  return { id, data: data.toISOString(), ...entrada }
}

export async function excluirVenda(id: string) {
  await db.delete(tVendas).where(eq(tVendas.id, id))
}

// ---------- Despesas ----------

export async function criarDespesa(entrada: {
  descricao: string
  valor: number
}): Promise<Despesa> {
  const id = gerarId()
  const data = new Date()
  await db.insert(tDespesas).values({
    id,
    descricao: entrada.descricao,
    valor: entrada.valor.toString(),
    data,
  })
  return { id, data: data.toISOString(), ...entrada }
}

export async function excluirDespesa(id: string) {
  await db.delete(tDespesas).where(eq(tDespesas.id, id))
}

// ---------- Pedidos ----------

export async function criarPedido(entrada: {
  cliente: string
  itens: ItemPedido[]
  observacao: string
  forma: FormaPagamento
}): Promise<Pedido> {
  const id = gerarId()
  const data = new Date()
  await db.insert(tPedidos).values({
    id,
    cliente: entrada.cliente,
    itens: entrada.itens,
    observacao: entrada.observacao,
    forma: entrada.forma,
    status: "pendente",
    vendaRegistrada: false,
    data,
  })
  return {
    id,
    data: data.toISOString(),
    status: "pendente",
    vendaRegistrada: false,
    ...entrada,
  }
}

export async function excluirPedido(id: string) {
  await db.delete(tPedidos).where(eq(tPedidos.id, id))
}

// Atualiza o status. Ao marcar "entregue" pela primeira vez, registra
// as vendas correspondentes ao pedido e devolve-as para o cliente.
export async function mudarStatusPedido(
  id: string,
  status: StatusPedido,
): Promise<{ vendasNovas: Venda[] }> {
  const [pedido] = await db
    .select()
    .from(tPedidos)
    .where(eq(tPedidos.id, id))

  if (!pedido) return { vendasNovas: [] }

  const vendasNovas: Venda[] = []

  if (status === "entregue" && !pedido.vendaRegistrada) {
    for (const item of pedido.itens) {
      const idVenda = gerarId()
      const dataVenda = new Date()
      await db.insert(tVendas).values({
        id: idVenda,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valorUnitario: item.preco.toString(),
        forma: pedido.forma,
        data: dataVenda,
      })
      vendasNovas.push({
        id: idVenda,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valorUnitario: item.preco,
        forma: pedido.forma as FormaPagamento,
        data: dataVenda.toISOString(),
      })
    }
  }

  await db
    .update(tPedidos)
    .set({
      status,
      vendaRegistrada:
        status === "entregue" ? true : pedido.vendaRegistrada,
    })
    .where(eq(tPedidos.id, id))

  return { vendasNovas }
}
