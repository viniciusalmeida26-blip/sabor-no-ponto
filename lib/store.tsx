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
  obterPerfil,
  atualizarFotoPerfil as atualizarFotoPerfilNoBanco,
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

export type StatusPedido = "pendente" | "preparando" | "pronta" | "entregue" | "cancelado"

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
  imagem?: string
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
  fotoUrl?: string
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
  adicionarProduto: (produto: Omit<Produto, "id">) => void
  atualizarProduto: (produto: Produto) => void
  hidratado: boolean
  login: (email: string, senha: string) => boolean
  atualizarFotoPerfil: (fotoUrl: string) => void
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
    const usuarioSalvo = ler<Usuario | null>(CHAVE_USUARIO, null)
    setUsuario(usuarioSalvo)
    if (usuarioSalvo?.email) {
      obterPerfil(usuarioSalvo.email)
        .then((perfil) => {
          if (!perfil) return
          setUsuario((atual) => (atual ? { ...atual, nome: perfil.nome, fotoUrl: perfil.fotoUrl ?? undefined } : atual))
        })
        .catch((erro) => console.log("[v0] erro ao carregar perfil:", erro))
    }
    const salvo = ler<Produto[]>("snp_catalogo", produtos)
    const normalizado = [
      ...produtos.map((padrao) => {
        const salvoItem = salvo.find((item) => item.id === padrao.id)
        return salvoItem ? { ...padrao, ...salvoItem, imagem: salvoItem.imagem || padrao.imagem } : padrao
      }),
      ...salvo.filter((item) => !produtos.some((padrao) => padrao.id === item.id)),
    ]
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

  function adicionarProduto(produto: Omit<Produto, "id">) {
    const novoProduto: Produto = { ...produto, id: `${produto.categoria}-${Date.now()}` }
    setCatalogo((atual) => {
      const novo = [...atual, novoProduto]
      window.localStorage.setItem("snp_catalogo", JSON.stringify(novo))
      return novo
    })
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
    // A sessão pode entrar imediatamente; os dados do painel carregam em segundo plano.
    setHidratado(true)
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
    const senhaNormalizada = senha.replace(/[\u200B-\u200D\uFEFF]/g, "").trim()
    const senhaValida = senhaNormalizada === CREDENCIAL_SENHA
    if (!emailValido || !senhaValida) return false
    const u: Usuario = {
      email: CREDENCIAL_EMAIL,
      nome: CREDENCIAL_NOME,
    }
    setUsuario(u)
    setHidratado(true)
    window.localStorage.setItem(CHAVE_USUARIO, JSON.stringify(u))
    return true
  }

  async function atualizarFotoPerfil(fotoUrl: string) {
    const atual = usuario
    if (!atual) return
    const anterior = atual.fotoUrl
    setUsuario({ ...atual, fotoUrl })
    try {
      const salvo = await atualizarFotoPerfilNoBanco(atual.email, fotoUrl)
      if (!salvo) throw new Error("Usuário não encontrado no banco")
      window.localStorage.setItem(CHAVE_USUARIO, JSON.stringify({ ...atual, fotoUrl }))
    } catch (erro) {
      setUsuario({ ...atual, fotoUrl: anterior })
      console.log("[v0] erro ao salvar foto de perfil:", erro)
      throw erro
    }
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
      throw e
    }
  }

  async function removeVenda(id: string) {
    try {
      await excluirVenda(id)
      setVendas((atual) => atual.filter((v) => v.id !== id))
    } catch (e) {
      console.log("[v0] erro ao excluir venda:", e)
      throw e
    }
  }

  async function addDespesa(d: Omit<Despesa, "id" | "data">) {
    try {
      const nova = await criarDespesa(d)
      setDespesas((atual) => [nova, ...atual])
    } catch (e) {
      console.log("[v0] erro ao criar despesa:", e)
      throw e
    }
  }

  async function removeDespesa(id: string) {
    try {
      await excluirDespesa(id)
      setDespesas((atual) => atual.filter((d) => d.id !== id))
    } catch (e) {
      console.log("[v0] erro ao excluir despesa:", e)
      throw e
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
      throw e
    }
  }

  async function removePedido(id: string) {
    try {
      await excluirPedido(id)
      setPedidos((atual) => atual.filter((p) => p.id !== id))
    } catch (e) {
      console.log("[v0] erro ao excluir pedido:", e)
      throw e
    }
  }

  async function resetarPedidosEntregues() {
    const data = await resetarPedidosEntreguesNoBanco()
    setPedidos((atual) => atual.filter((pedido) => pedido.status !== "entregue"))
    setUltimoResetPedidos(data)
    return data
  }

  async function atualizarStatusPedido(id: string, status: StatusPedido) {
    const pedidoAnterior = pedidos.find((pedido) => pedido.id === id)
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
      if (pedidoAnterior) setPedidos((atual) => atual.map((pedido) => pedido.id === pedidoAnterior.id ? pedidoAnterior : pedido))
      console.log("[v0] erro ao atualizar status do pedido:", e)
      throw e
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
        adicionarProduto,
        atualizarProduto,
        hidratado,
        ultimoResetPedidos,
        resetarPedidosEntregues,
        login,
        atualizarFotoPerfil,
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
  pronta: "Pronta",
  entregue: "Entregue",
  cancelado: "Cancelado",
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
