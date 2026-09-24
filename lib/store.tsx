"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import {
  carregarDados,
  criarVenda,
  excluirVenda,
  criarDespesa,
  excluirDespesa,
  criarPedido,
  excluirPedido,
  mudarStatusPedido,
  resetarPedidosEntregues as resetarPedidosEntreguesNoBanco,
} from "@/app/actions/dados"

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

export type CategoriaProduto = "marmita" | "bebida" | "sobremesa" | "fitness"

export type Produto = {
  id: string
  nome: string
  descricao: string
  preco: number
  categoria: CategoriaProduto
  imagem: string
  disponivel: boolean
}

export type ConfiguracaoMarmitaDia = {
  produtoId: string
  nome: string
  ingredientes: string
  descricao: string
}

// Catálogo com preços fixos usado nas páginas de Pedidos e Vendas.
export const produtos: Produto[] = [
  { id: "marmita-p", nome: "Marmita P", descricao: "Arroz, feijão e mistura do dia", preco: 15, categoria: "marmita", imagem: "/images/fundo-marmita.png", disponivel: true },
  { id: "marmita-m", nome: "Marmita M", descricao: "Arroz, feijão e mistura do dia", preco: 18, categoria: "marmita", imagem: "/images/fundo-marmita.png", disponivel: true },
  { id: "marmita-g", nome: "Marmita G", descricao: "Arroz, feijão e mistura do dia", preco: 25, categoria: "marmita", imagem: "/images/fundo-marmita.png", disponivel: true },
  { id: "refrigerante-lata", nome: "Refrigerante Lata", descricao: "Refrigerante gelado", preco: 6, categoria: "bebida", imagem: "/images/bebida-refrigerante.png", disponivel: true },
  { id: "suco-natural", nome: "Suco Natural", descricao: "Suco natural da casa", preco: 8, categoria: "bebida", imagem: "/images/bebida-suco.png", disponivel: true },
  { id: "agua-mineral", nome: "Água Mineral", descricao: "Água mineral sem gás", preco: 4, categoria: "bebida", imagem: "/images/bebida-agua.png", disponivel: true },
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
  produtos: Produto[]
  marmitaDoDiaId: string
  configuracaoMarmitaDia: ConfiguracaoMarmitaDia
  salvarConfiguracaoMarmitaDia: (configuracao: ConfiguracaoMarmitaDia) => void
  atualizarProduto: (produto: Produto) => void
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
  ultimoResetPedidos: string | null
  resetarPedidosEntregues: () => Promise<string>
}

const StoreContext = createContext<StoreContextType | null>(null)

const CHAVE_USUARIO = "snp_usuario"

function ler<T>(chave: string, padrao: T): T {
  if (typeof window === "undefined") return padrao
  try {
    const bruto = window.localStorage.getItem(chave)
    return bruto ? (JSON.parse(bruto) as T) : padrao
  } catch {
    return padrao
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [vendas, setVendas] = useState<Venda[]>([])
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [catalogo, setCatalogo] = useState<Produto[]>(produtos)
  const [configuracaoMarmitaDia, setConfiguracaoMarmitaDia] = useState<ConfiguracaoMarmitaDia>({ produtoId: "marmita-m", nome: "", ingredientes: "", descricao: "" })
  const [ultimoResetPedidos, setUltimoResetPedidos] = useState<string | null>(null)
  const [hidratado, setHidratado] = useState(false)

  // Sessão (login fixo) fica no dispositivo; os dados vêm do banco.
  useEffect(() => {
    setUsuario(ler<Usuario | null>(CHAVE_USUARIO, null))
    const salvo = ler<Produto[]>("snp_catalogo", produtos)
    const normalizado = produtos.map((padrao) => {
      const salvoItem = salvo.find((item) => item.id === padrao.id)
      return salvoItem ? { ...padrao, ...salvoItem, imagem: salvoItem.imagem || padrao.imagem } : padrao
    })
    setCatalogo(normalizado)
    const produtoId = ler("snp_marmita_do_dia", "marmita-m")
    const salvoDestaque = ler<Partial<ConfiguracaoMarmitaDia>>("snp_configuracao_marmita_dia", {})
    setConfiguracaoMarmitaDia({ produtoId, nome: salvoDestaque.nome ?? "", ingredientes: salvoDestaque.ingredientes ?? "", descricao: salvoDestaque.descricao ?? "" })
  }, [])

  function salvarConfiguracaoMarmitaDia(configuracao: ConfiguracaoMarmitaDia) {
    const produto = catalogo.find((item) => item.id === configuracao.produtoId && item.categoria === "marmita")
    if (!produto) return
    const normalizada = { ...configuracao, nome: configuracao.nome.trim(), ingredientes: configuracao.ingredientes.trim(), descricao: configuracao.descricao.trim() }
    setConfiguracaoMarmitaDia(normalizada)
    window.localStorage.setItem("snp_marmita_do_dia", produto.id)
    window.localStorage.setItem("snp_configuracao_marmita_dia", JSON.stringify(normalizada))
  }

  function atualizarProduto(produto: Produto) {
    setCatalogo((atual) => {
      const novo = atual.map((item) => item.id === produto.id ? produto : item)
      window.localStorage.setItem("snp_catalogo", JSON.stringify(novo))
      return novo
    })
  }

  // Carrega os registros do banco (compartilhados entre todos os
  // dispositivos e sessões) sempre que houver um usuário logado.
  useEffect(() => {
    let ativo = true
    if (!usuario) {
      setVendas([])
      setDespesas([])
      setPedidos([])
      setHidratado(true)
      return
    }
    setHidratado(false)
    carregarDados()
      .then((dados) => {
        if (!ativo) return
        setVendas(dados.vendas)
        setDespesas(dados.despesas)
        setPedidos(dados.pedidos)
        setUltimoResetPedidos(dados.ultimoReset)
      })
      .catch((e) => {
        console.log("[v0] erro ao carregar dados:", e)
      })
      .finally(() => {
        if (ativo) setHidratado(true)
      })
    return () => {
      ativo = false
    }
  }, [usuario])

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

  async function addVenda(v: Omit<Venda, "id" | "data">) {
    try {
      const nova = await criarVenda(v)
      setVendas((atual) => [nova, ...atual])
    } catch (e) {
      console.log("[v0] erro ao criar venda:", e)
    }
  }

  async function removeVenda(id: string) {
    setVendas((atual) => atual.filter((v) => v.id !== id))
    try {
      await excluirVenda(id)
    } catch (e) {
      console.log("[v0] erro ao excluir venda:", e)
    }
  }

  async function addDespesa(d: Omit<Despesa, "id" | "data">) {
    try {
      const nova = await criarDespesa(d)
      setDespesas((atual) => [nova, ...atual])
    } catch (e) {
      console.log("[v0] erro ao criar despesa:", e)
    }
  }

  async function removeDespesa(id: string) {
    setDespesas((atual) => atual.filter((d) => d.id !== id))
    try {
      await excluirDespesa(id)
    } catch (e) {
      console.log("[v0] erro ao excluir despesa:", e)
    }
  }

  async function addPedido(
    p: Omit<Pedido, "id" | "data" | "status" | "vendaRegistrada">,
  ) {
    try {
      const novo = await criarPedido(p)
      setPedidos((atual) => [novo, ...atual])
    } catch (e) {
      console.log("[v0] erro ao criar pedido:", e)
    }
  }

  async function removePedido(id: string) {
    setPedidos((atual) => atual.filter((p) => p.id !== id))
    try {
      await excluirPedido(id)
    } catch (e) {
      console.log("[v0] erro ao excluir pedido:", e)
    }
  }

  async function resetarPedidosEntregues() {
    const data = await resetarPedidosEntreguesNoBanco()
    setPedidos((atual) => atual.filter((pedido) => pedido.status !== "entregue"))
    setUltimoResetPedidos(data)
    return data
  }

  async function atualizarStatusPedido(id: string, status: StatusPedido) {
    // Atualiza o status na tela imediatamente.
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
    try {
      const { vendasNovas } = await mudarStatusPedido(id, status)
      if (vendasNovas.length > 0) {
        setVendas((atual) => [...vendasNovas, ...atual])
      }
    } catch (e) {
      console.log("[v0] erro ao atualizar status do pedido:", e)
    }
  }

  return (
    <StoreContext.Provider
      value={{
        usuario,
        vendas,
        despesas,
        pedidos,
        produtos: catalogo,
        marmitaDoDiaId: configuracaoMarmitaDia.produtoId,
        configuracaoMarmitaDia,
        salvarConfiguracaoMarmitaDia,
        atualizarProduto,
        hidratado,
        ultimoResetPedidos,
        resetarPedidosEntregues,
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
