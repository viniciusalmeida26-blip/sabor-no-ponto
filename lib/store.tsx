"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

export type FormaPagamento = "dinheiro" | "cartao" | "pix"

export type Venda = {
  id: string
  descricao: string
  quantidade: number
  valorUnitario: number
  forma: FormaPagamento
  data: string // ISO
}

export type Despesa = {
  id: string
  descricao: string
  valor: number
  data: string // ISO
}

export type StatusPedido = "pendente" | "preparando" | "entregue"

export type CategoriaProduto = "marmita" | "bebida"

export type Produto = {
  nome: string
  preco: number
  categoria: CategoriaProduto
}

// Catálogo com preços fixos usado nas páginas de Pedidos e Vendas.
export const produtos: Produto[] = [
  { nome: "Marmita P", preco: 15, categoria: "marmita" },
  { nome: "Marmita M", preco: 18, categoria: "marmita" },
  { nome: "Marmita G", preco: 25, categoria: "marmita" },
  { nome: "Refrigerante Lata", preco: 6, categoria: "bebida" },
  { nome: "Suco Natural", preco: 8, categoria: "bebida" },
  { nome: "Água Mineral", preco: 4, categoria: "bebida" },
]

export type ItemPedido = {
  descricao: string
  quantidade: number
  preco: number
}

export function totalPedido(itens: ItemPedido[]) {
  return itens.reduce((soma, i) => soma + i.preco * i.quantidade, 0)
}

// Considera marmita qualquer produto do catálogo com categoria "marmita"
// ou cuja descrição comece com "Marmita".
export function ehMarmita(descricao: string) {
  const noCatalogo = produtos.find((p) => p.nome === descricao)
  if (noCatalogo) return noCatalogo.categoria === "marmita"
  return descricao.trim().toLowerCase().startsWith("marmita")
}

export type Pedido = {
  id: string
  cliente: string
  itens: ItemPedido[]
  observacao: string
  forma: FormaPagamento
  status: StatusPedido
  vendaRegistrada: boolean
  data: string // ISO
}

type Usuario = {
  nome: string
  email: string
}

// Credenciais fixas de acesso.
export const CREDENCIAL_EMAIL = "davi.oliveira03@escola.pr.gov.br"
export const CREDENCIAL_SENHA = "davi(10)"
const CREDENCIAL_NOME = "Davi Oliveira"

type StoreContextType = {
  usuario: Usuario | null
  vendas: Venda[]
  despesas: Despesa[]
  pedidos: Pedido[]
  hidratado: boolean
  login: (email: string, senha: string) => boolean
  logout: () => void
  addVenda: (v: Omit<Venda, "id" | "data">) => void
  removeVenda: (id: string) => void
  addDespesa: (d: Omit<Despesa, "id" | "data">) => void
  removeDespesa: (id: string) => void
  addPedido: (
    p: Omit<Pedido, "id" | "data" | "status" | "vendaRegistrada">,
  ) => void
  removePedido: (id: string) => void
  atualizarStatusPedido: (id: string, status: StatusPedido) => void
}

const StoreContext = createContext<StoreContextType | null>(null)

const CHAVE_USUARIO = "snp_usuario"
const CHAVE_VENDAS = "snp_vendas"
const CHAVE_DESPESAS = "snp_despesas"
const CHAVE_PEDIDOS = "snp_pedidos"

function gerarId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function ler<T>(chave: string, padrao: T): T {
  if (typeof window === "undefined") return padrao
  try {
    const bruto = window.localStorage.getItem(chave)
    return bruto ? (JSON.parse(bruto) as T) : padrao
  } catch {
    return padrao
  }
}

// Dados reais persistidos em localStorage. Iniciam vazios: os registros
// são criados conforme o uso e mantidos entre sessões. O filtro por data
// nas telas garante que cada dia mostre apenas seus próprios registros.
const vendasIniciais: Venda[] = []
const despesasIniciais: Despesa[] = []
const pedidosIniciais: Pedido[] = []

export function StoreProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [vendas, setVendas] = useState<Venda[]>([])
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [hidratado, setHidratado] = useState(false)

  useEffect(() => {
    setUsuario(ler<Usuario | null>(CHAVE_USUARIO, null))
    setVendas(ler<Venda[]>(CHAVE_VENDAS, vendasIniciais))
    setDespesas(ler<Despesa[]>(CHAVE_DESPESAS, despesasIniciais))
    setPedidos(ler<Pedido[]>(CHAVE_PEDIDOS, pedidosIniciais))
    setHidratado(true)
  }, [])

  useEffect(() => {
    if (hidratado) window.localStorage.setItem(CHAVE_VENDAS, JSON.stringify(vendas))
  }, [vendas, hidratado])

  useEffect(() => {
    if (hidratado)
      window.localStorage.setItem(CHAVE_DESPESAS, JSON.stringify(despesas))
  }, [despesas, hidratado])

  useEffect(() => {
    if (hidratado)
      window.localStorage.setItem(CHAVE_PEDIDOS, JSON.stringify(pedidos))
  }, [pedidos, hidratado])

  function login(email: string, senha: string) {
    const emailValido =
      email.trim().toLowerCase() === CREDENCIAL_EMAIL.toLowerCase()
    const senhaValida = senha === CREDENCIAL_SENHA
    if (!emailValido || !senhaValida) return false
    const u = { email: CREDENCIAL_EMAIL, nome: CREDENCIAL_NOME }
    setUsuario(u)
    window.localStorage.setItem(CHAVE_USUARIO, JSON.stringify(u))
    return true
  }

  function logout() {
    setUsuario(null)
    window.localStorage.removeItem(CHAVE_USUARIO)
  }

  function addVenda(v: Omit<Venda, "id" | "data">) {
    setVendas((atual) => [
      { ...v, id: gerarId(), data: new Date().toISOString() },
      ...atual,
    ])
  }

  function removeVenda(id: string) {
    setVendas((atual) => atual.filter((v) => v.id !== id))
  }

  function addDespesa(d: Omit<Despesa, "id" | "data">) {
    setDespesas((atual) => [
      { ...d, id: gerarId(), data: new Date().toISOString() },
      ...atual,
    ])
  }

  function removeDespesa(id: string) {
    setDespesas((atual) => atual.filter((d) => d.id !== id))
  }

  function addPedido(
    p: Omit<Pedido, "id" | "data" | "status" | "vendaRegistrada">,
  ) {
    setPedidos((atual) => [
      {
        ...p,
        id: gerarId(),
        status: "pendente",
        vendaRegistrada: false,
        data: new Date().toISOString(),
      },
      ...atual,
    ])
  }

  function removePedido(id: string) {
    setPedidos((atual) => atual.filter((p) => p.id !== id))
  }

  function atualizarStatusPedido(id: string, status: StatusPedido) {
    const pedido = pedidos.find((p) => p.id === id)
    if (!pedido) return

    // Ao entregar, registra as vendas do pedido uma única vez.
    if (status === "entregue" && !pedido.vendaRegistrada) {
      const novasVendas: Venda[] = pedido.itens.map((item) => ({
        id: gerarId(),
        descricao: item.descricao,
        quantidade: item.quantidade,
        valorUnitario: item.preco,
        forma: pedido.forma,
        data: new Date().toISOString(),
      }))
      setVendas((atual) => [...novasVendas, ...atual])
    }

    setPedidos((atual) =>
      atual.map((p) =>
        p.id === id
          ? {
              ...p,
              status,
              vendaRegistrada:
                status === "entregue" ? true : p.vendaRegistrada,
            }
          : p,
      ),
    )
  }

  return (
    <StoreContext.Provider
      value={{
        usuario,
        vendas,
        despesas,
        pedidos,
        hidratado,
        login,
        logout,
        addVenda,
        removeVenda,
        addDespesa,
        removeDespesa,
        addPedido,
        removePedido,
        atualizarStatusPedido,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore precisa estar dentro de StoreProvider")
  return ctx
}

export function formatarBRL(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export const rotuloForma: Record<FormaPagamento, string> = {
  dinheiro: "Dinheiro",
  cartao: "Cartão",
  pix: "Pix",
}

export const rotuloStatus: Record<StatusPedido, string> = {
  pendente: "Pendente",
  preparando: "Preparando",
  entregue: "Entregue",
}

// Chave "AAAA-MM-DD" no fuso local, usada para agrupar registros por dia.
export function chaveDia(iso: string) {
  const d = new Date(iso)
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, "0")
  const dia = String(d.getDate()).padStart(2, "0")
  return `${ano}-${mes}-${dia}`
}

export function mesmaData(iso: string, ref: Date) {
  const d = new Date(iso)
  return (
    d.getDate() === ref.getDate() &&
    d.getMonth() === ref.getMonth() &&
    d.getFullYear() === ref.getFullYear()
  )
}
