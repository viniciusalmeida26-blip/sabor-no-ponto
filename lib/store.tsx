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

type StoreContextType = {
  usuario: Usuario | null
  vendas: Venda[]
  despesas: Despesa[]
  pedidos: Pedido[]
  hidratado: boolean
  login: (email: string, nome?: string) => void
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

const vendasIniciais: Venda[] = [
  {
    id: gerarId(),
    descricao: "Marmita Média",
    quantidade: 3,
    valorUnitario: 18,
    forma: "pix",
    data: new Date().toISOString(),
  },
  {
    id: gerarId(),
    descricao: "Marmita Grande",
    quantidade: 2,
    valorUnitario: 22,
    forma: "cartao",
    data: new Date().toISOString(),
  },
  {
    id: gerarId(),
    descricao: "Marmita Pequena",
    quantidade: 4,
    valorUnitario: 15,
    forma: "dinheiro",
    data: new Date().toISOString(),
  },
]

const despesasIniciais: Despesa[] = [
  {
    id: gerarId(),
    descricao: "Compra de ingredientes",
    valor: 85,
    data: new Date().toISOString(),
  },
]

const pedidosIniciais: Pedido[] = [
  {
    id: gerarId(),
    cliente: "Ana Souza",
    itens: [
      { descricao: "Marmita G", quantidade: 2, preco: 25 },
      { descricao: "Refrigerante Lata", quantidade: 1, preco: 6 },
    ],
    observacao: "Sem cebola, por favor.",
    forma: "pix",
    status: "pendente",
    vendaRegistrada: false,
    data: new Date().toISOString(),
  },
  {
    id: gerarId(),
    cliente: "Carlos Lima",
    itens: [{ descricao: "Marmita M", quantidade: 1, preco: 18 }],
    observacao: "",
    forma: "dinheiro",
    status: "preparando",
    vendaRegistrada: false,
    data: new Date().toISOString(),
  },
]

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

  function login(email: string, nome?: string) {
    const u = { email, nome: nome || email.split("@")[0] }
    setUsuario(u)
    window.localStorage.setItem(CHAVE_USUARIO, JSON.stringify(u))
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
