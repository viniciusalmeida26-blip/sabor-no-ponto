"use server"

import { db } from "@/lib/db"
import {
  vendas as tVendas,
  despesas as tDespesas,
  pedidos as tPedidos,
  pedidoResets as tPedidoResets,
  type ItemPedido,
} from "@/lib/db/schema"
import { and, desc, eq, sql } from "drizzle-orm"
import { usuarios as tUsuarios } from "@/lib/db/schema"

export type FormaPagamento = "dinheiro" | "cartao" | "pix"
export type StatusPedido = "pendente" | "preparando" | "pronta" | "saiu_entrega" | "entregue" | "cancelado"

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

export type ResetPedidos = {
  data: string | null
}

export async function obterPerfil(email: string) {
  const [usuario] = await db
    .select({ email: tUsuarios.email, nome: tUsuarios.name, fotoUrl: tUsuarios.image })
    .from(tUsuarios)
    .where(eq(tUsuarios.email, email))
    .limit(1)
  return usuario ?? null
}

export async function atualizarFotoPerfil(email: string, fotoUrl: string | null) {
  if (!email.trim()) throw new Error("E-mail do usuário é obrigatório")
  if (fotoUrl !== null && fotoUrl.length > 2_000_000) throw new Error("Imagem de perfil muito grande")
  const [usuario] = await db
    .update(tUsuarios)
    .set({ image: fotoUrl })
    .where(eq(tUsuarios.email, email))
    .returning({ email: tUsuarios.email, nome: tUsuarios.name, fotoUrl: tUsuarios.image })
  return usuario ?? null
}

function gerarId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function normalizarTelefone(telefone: string) {
  const digitos = telefone.replace(/\D/g, "")
  if (digitos.startsWith("55")) return digitos.slice(0, 13)
  if (digitos.length === 10 || digitos.length === 11) return `55${digitos}`
  return digitos
}

async function garantirTabelasCliente() {
  await db.execute(sql`CREATE TABLE IF NOT EXISTS clientes (
    id TEXT PRIMARY KEY,
    telefone TEXT NOT NULL,
    nome TEXT NOT NULL,
    email TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`)
  await db.execute(sql`ALTER TABLE clientes ADD COLUMN IF NOT EXISTS id TEXT`)
  await db.execute(sql`ALTER TABLE clientes ADD COLUMN IF NOT EXISTS email TEXT`)
  await db.execute(sql`UPDATE clientes SET id = COALESCE(id, md5(telefone)) WHERE id IS NULL`)
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS clientes_telefone_unico ON clientes (telefone)`)
  await db.execute(sql`CREATE TABLE IF NOT EXISTS enderecos_clientes (
    id TEXT PRIMARY KEY,
    cliente_id TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    etiqueta TEXT NOT NULL,
    cep TEXT NOT NULL,
    rua TEXT NOT NULL,
    numero TEXT NOT NULL,
    complemento TEXT NOT NULL DEFAULT '',
    bairro TEXT NOT NULL,
    cidade TEXT NOT NULL,
    referencia TEXT NOT NULL DEFAULT '',
    principal BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`)
  await db.execute(sql`CREATE TABLE IF NOT EXISTS favoritos_clientes (
    cliente_id TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    produto_id TEXT NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (cliente_id, produto_id)
  )`)
}

async function garantirTabelaClientes() {
  await garantirTabelasCliente()
}

// ---------- Leitura ----------

export async function resetarPedidosEntregues(): Promise<string> {
  const agora = new Date()
  await db
    .insert(tPedidoResets)
    .values({ id: 1, resetAt: agora })
    .onConflictDoUpdate({ target: tPedidoResets.id, set: { resetAt: agora } })
  return agora.toISOString()
}

async function garantirResetDiario() {
  const [ultimo] = await db.select().from(tPedidoResets).where(eq(tPedidoResets.id, 1))
  return ultimo?.resetAt.toISOString() ?? null
}

export async function carregarDados(): Promise<{
  vendas: Venda[]
  despesas: Despesa[]
  pedidos: Pedido[]
  ultimoReset: string | null
}> {
  const resetAutomatico = await garantirResetDiario()
  const [linhasVendas, linhasDespesas, linhasPedidos, reset] = await Promise.all([
    db.select().from(tVendas).orderBy(desc(tVendas.data)),
    db.select().from(tDespesas).orderBy(desc(tDespesas.data)),
    db.select().from(tPedidos).orderBy(desc(tPedidos.data)),
    db.select().from(tPedidoResets).where(eq(tPedidoResets.id, 1)),
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
    ultimoReset: resetAutomatico ?? reset[0]?.resetAt.toISOString() ?? null,
  }
}

export async function obterUltimoReset() {
  const [reset] = await db.select().from(tPedidoResets).where(eq(tPedidoResets.id, 1))
  return reset?.resetAt.toISOString() ?? null
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

export async function carregarCliente(telefone: string) {
  const normalizado = normalizarTelefone(telefone)
  if (normalizado.length < 10) return null
  await garantirTabelaClientes()
  const resultado = await db.execute(sql`SELECT id, telefone, nome FROM clientes WHERE telefone = ${normalizado} LIMIT 1`)
  const linha = (resultado.rows[0] ?? null) as { id: string; telefone: string; nome: string } | null
  return linha
}

export async function verificarTelefoneCliente(telefone: string) {
  const normalizado = normalizarTelefone(telefone)
  if (normalizado.length < 10) throw new Error("Informe um telefone válido com DDD")
  const cliente = await carregarCliente(normalizado)
  return { telefone: normalizado, existe: Boolean(cliente), nome: cliente?.nome ?? "" }
}

export async function atualizarCliente(entrada: { nome: string; telefone: string }) {
  const verificacao = await verificarTelefoneCliente(entrada.telefone)
  const cliente = await criarOuAtualizarCliente({ nome: entrada.nome, telefone: verificacao.telefone })
  return { ...cliente, telefoneVerificado: true, eraExistente: verificacao.existe }
}

export async function criarOuAtualizarCliente(entrada: { nome: string; telefone: string }) {
  const nome = entrada.nome.trim()
  const telefone = normalizarTelefone(entrada.telefone)
  if (!nome || nome.length > 120) throw new Error("Nome do cliente inválido")
  if (telefone.length !== 13 || !telefone.startsWith("55")) throw new Error("Use um celular brasileiro com 13 dígitos, por exemplo 5544999999999")
  await garantirTabelasCliente()
  const id = `cli_${telefone}`
  await db.execute(sql`INSERT INTO clientes (id, telefone, nome) VALUES (${id}, ${telefone}, ${nome}) ON CONFLICT (telefone) DO UPDATE SET nome = EXCLUDED.nome, atualizado_em = NOW()`)
  return { id, nome, telefone }
}

export type EnderecoCliente = {
  id: string
  etiqueta: string
  cep: string
  rua: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  referencia: string
  principal: boolean
}

export async function listarEnderecosCliente(telefone: string): Promise<EnderecoCliente[]> {
  const normalizado = normalizarTelefone(telefone)
  if (normalizado.length < 10) return []
  await garantirTabelasCliente()
  const linhas = await db.execute(sql`SELECT e.id, e.etiqueta, e.cep, e.rua, e.numero, e.complemento, e.bairro, e.cidade, e.referencia, e.principal FROM enderecos_clientes e JOIN clientes c ON c.id = e.cliente_id WHERE c.telefone = ${normalizado} ORDER BY e.principal DESC, e.criado_em DESC`)
  return linhas.rows as EnderecoCliente[]
}

export async function salvarEnderecoCliente(telefone: string, endereco: Omit<EnderecoCliente, "id"> & { id?: string }) {
  const normalizado = normalizarTelefone(telefone)
  if (normalizado.length < 10) throw new Error("Telefone do cliente inválido")
  await garantirTabelasCliente()
  const cliente = await carregarCliente(normalizado)
  if (!cliente) throw new Error("Cliente não encontrado")
  const id = endereco.id ?? gerarId()
  if (endereco.principal) await db.execute(sql`UPDATE enderecos_clientes SET principal = FALSE WHERE cliente_id = ${`cli_${normalizado}`}`)
  await db.execute(sql`INSERT INTO enderecos_clientes (id, cliente_id, etiqueta, cep, rua, numero, complemento, bairro, cidade, referencia, principal) VALUES (${id}, ${`cli_${normalizado}`}, ${endereco.etiqueta}, ${endereco.cep}, ${endereco.rua}, ${endereco.numero}, ${endereco.complemento}, ${endereco.bairro}, ${endereco.cidade}, ${endereco.referencia}, ${endereco.principal}) ON CONFLICT (id) DO UPDATE SET etiqueta = EXCLUDED.etiqueta, cep = EXCLUDED.cep, rua = EXCLUDED.rua, numero = EXCLUDED.numero, complemento = EXCLUDED.complemento, bairro = EXCLUDED.bairro, cidade = EXCLUDED.cidade, referencia = EXCLUDED.referencia, principal = EXCLUDED.principal`)
  return { ...endereco, id }
}

export async function excluirEnderecoCliente(telefone: string, id: string) {
  const normalizado = normalizarTelefone(telefone)
  await garantirTabelasCliente()
  await db.execute(sql`DELETE FROM enderecos_clientes WHERE id = ${id} AND cliente_id = ${`cli_${normalizado}`}`)
}

export async function listarFavoritosCliente(telefone: string): Promise<string[]> {
  const normalizado = normalizarTelefone(telefone)
  if (normalizado.length < 10) return []
  await garantirTabelasCliente()
  const linhas = await db.execute(sql`SELECT f.produto_id FROM favoritos_clientes f JOIN clientes c ON c.id = f.cliente_id WHERE c.telefone = ${normalizado} ORDER BY f.criado_em DESC`)
  return linhas.rows.map((linha) => String((linha as { produto_id: string }).produto_id))
}

export async function alternarFavoritoCliente(telefone: string, produtoId: string) {
  const normalizado = normalizarTelefone(telefone)
  if (normalizado.length < 10) throw new Error("Telefone do cliente inválido")
  await garantirTabelasCliente()
  const cliente = await carregarCliente(normalizado)
  if (!cliente) throw new Error("Cliente não encontrado")
  const existente = await db.execute(sql`SELECT 1 FROM favoritos_clientes WHERE cliente_id = ${cliente.id} AND produto_id = ${produtoId} LIMIT 1`)
  if (existente.rows.length) await db.execute(sql`DELETE FROM favoritos_clientes WHERE cliente_id = ${cliente.id} AND produto_id = ${produtoId}`)
  else await db.execute(sql`INSERT INTO favoritos_clientes (cliente_id, produto_id) VALUES (${cliente.id}, ${produtoId})`)
  return !existente.rows.length
}

export async function carregarPedidosDoCliente(telefone: string): Promise<Pedido[]> {
  const normalizado = normalizarTelefone(telefone)
  if (normalizado.length < 10) return []
  const linhas = await db.select().from(tPedidos).where(sql`${tPedidos.observacao} LIKE ${`Telefone: %${normalizado}%`}`).orderBy(desc(tPedidos.data))
  return linhas.map((p) => ({ id: p.id, cliente: p.cliente, itens: p.itens, observacao: p.observacao, forma: p.forma as FormaPagamento, status: p.status as StatusPedido, vendaRegistrada: p.vendaRegistrada, data: p.data.toISOString() }))
}

export async function criarPedido(entrada: {
  cliente: string
  telefone?: string
  itens: ItemPedido[]
  observacao: string
  forma: FormaPagamento
}): Promise<Pedido> {
  const cliente = entrada.cliente.trim()
  const telefone = normalizarTelefone(entrada.telefone ?? "")
  if (!cliente || cliente.length > 120) throw new Error("Nome do cliente inválido")
  if (entrada.telefone && telefone.length < 10) throw new Error("Telefone do cliente inválido")
  if (telefone) await criarOuAtualizarCliente({ nome: cliente, telefone })
  if (!entrada.itens.length || entrada.itens.length > 50) throw new Error("O pedido precisa ter itens válidos")
  const totalItens = entrada.itens.reduce((total, item) => total + item.quantidade, 0)
  if (totalItens > 99) throw new Error("Quantidade total de itens excedida")
  if (entrada.itens.some((item) => !item.descricao.trim() || item.descricao.length > 180 || !Number.isInteger(item.quantidade) || item.quantidade < 1 || item.quantidade > 99 || !Number.isFinite(item.preco) || item.preco < 0 || item.preco > 100000)) throw new Error("Dados dos itens inválidos")
  if (entrada.observacao.length > 500) throw new Error("Observação muito longa")
  const id = gerarId()
  const data = new Date()
  await db.insert(tPedidos).values({
    id,
    cliente,
    itens: entrada.itens,
    observacao: `${telefone ? `Telefone: ${telefone}\n` : ""}${entrada.observacao}`.trim(),
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
    cliente,
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
  const statusPermitidos: StatusPedido[] = ["pendente", "preparando", "pronta", "saiu_entrega", "entregue", "cancelado"]
  if (!statusPermitidos.includes(status)) throw new Error("Status de pedido inválido")
  const vendasNovas = await db.transaction(async (tx) => {
    const [pedido] = await tx
      .select()
      .from(tPedidos)
      .where(eq(tPedidos.id, id))
      .for("update")

    if (!pedido) return []
    if (pedido.status === "cancelado" || (pedido.status === "entregue" && status !== "entregue")) throw new Error("Este pedido não pode voltar para um status anterior")

    const novas: Venda[] = []

    if (status === "entregue" && !pedido.vendaRegistrada) {
    for (const item of pedido.itens) {
      const idVenda = gerarId()
      const dataVenda = new Date()
      await tx.insert(tVendas).values({
        id: idVenda,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valorUnitario: item.preco.toString(),
        forma: pedido.forma,
        data: dataVenda,
      })
      novas.push({
        id: idVenda,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valorUnitario: item.preco,
        forma: pedido.forma as FormaPagamento,
        data: dataVenda.toISOString(),
      })
    }
  }

    await tx
      .update(tPedidos)
      .set({
        status,
        vendaRegistrada:
          status === "entregue" ? true : pedido.vendaRegistrada,
      })
      .where(eq(tPedidos.id, id))

    return novas
  })

  return { vendasNovas }
}
