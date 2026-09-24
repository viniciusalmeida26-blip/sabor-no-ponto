"use client"

import { useEffect, useState, type ReactNode } from "react"
import { AppShell } from "@/components/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useStore, formatarBRL, type CategoriaProduto, type Produto } from "@/lib/store"
import { ImageIcon, Pencil, Plus } from "lucide-react"
import { toast } from "sonner"

const categorias: { value: CategoriaProduto; label: string }[] = [
  { value: "marmita", label: "Marmitas Traditional" },
  { value: "fitness", label: "Marmitas Fitness" },
  { value: "bebida", label: "Bebidas" },
  { value: "sobremesa", label: "Sobremesas" },
]

const categoriaLabel = (categoria: CategoriaProduto) => categorias.find((item) => item.value === categoria)?.label ?? categoria

function NovoProdutoDialog({ onSave, trigger }: { onSave: (produto: Omit<Produto, "id">) => void; trigger?: ReactNode }) {
  const [aberto, setAberto] = useState(false)
  const [form, setForm] = useState<Omit<Produto, "id">>({ nome: "", descricao: "", preco: 0, categoria: "marmita", imagem: "", disponivel: true })

  function salvar() {
    if (!form.nome.trim() || form.preco < 0) {
      toast.error("Informe um nome e um preço válido.")
      return
    }
    onSave({ ...form, nome: form.nome.trim(), descricao: form.descricao.trim(), imagem: form.imagem.trim() })
    setForm({ nome: "", descricao: "", preco: 0, categoria: "marmita", imagem: "", disponivel: true })
    setAberto(false)
    toast.success("Produto adicionado ao cardápio")
  }

  return <Dialog open={aberto} onOpenChange={setAberto}>
    <DialogTrigger asChild>{trigger ?? <Button onClick={() => setAberto(true)}><Plus data-icon="inline-start" /> Adicionar produto</Button>}</DialogTrigger>
    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
      <DialogHeader><DialogTitle>Adicionar produto</DialogTitle><DialogDescription>Cadastre um novo item para usar no cardápio e nos pedidos.</DialogDescription></DialogHeader>
      <div className="grid gap-4 py-2 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2"><Label>Nome do item</Label><Input value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} /></div>
        <div className="flex flex-col gap-2 sm:col-span-2"><Label>Descrição</Label><Textarea value={form.descricao} onChange={(event) => setForm({ ...form, descricao: event.target.value })} rows={3} /></div>
        <div className="flex flex-col gap-2"><Label>Preço (R$)</Label><Input type="number" min="0" step="0.01" value={form.preco} onChange={(event) => setForm({ ...form, preco: Number(event.target.value) })} /></div>
        <div className="flex flex-col gap-2"><Label>Categoria</Label><Select value={form.categoria} onValueChange={(categoria: CategoriaProduto) => setForm({ ...form, categoria })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categorias.map((categoria) => <SelectItem key={categoria.value} value={categoria.value}>{categoria.label}</SelectItem>)}</SelectContent></Select></div>
        <div className="flex flex-col gap-2 sm:col-span-2"><Label>URL da imagem</Label><Input placeholder="https://... ou /images/..." value={form.imagem} onChange={(event) => setForm({ ...form, imagem: event.target.value })} /></div>
        <div className="overflow-hidden rounded-lg border bg-muted sm:col-span-2">{form.imagem ? <img src={form.imagem} alt="Pré-visualização do novo produto" className="h-32 w-full object-cover" /> : <div className="flex h-32 items-center justify-center text-muted-foreground"><ImageIcon /></div>}</div>
      </div>
      <DialogFooter><Button variant="outline" onClick={() => setAberto(false)}>Cancelar</Button><Button onClick={salvar}>Adicionar produto</Button></DialogFooter>
    </DialogContent>
  </Dialog>
}

function ProdutoDialog({ produto, onSave }: { produto: Produto; onSave: (produto: Produto) => void }) {
  const [aberto, setAberto] = useState(false)
  const [form, setForm] = useState(produto)

  function abrir() {
    setForm(produto)
    setAberto(true)
  }

  function salvar() {
    if (!form.nome.trim() || form.preco < 0) {
      toast.error("Informe um nome e um preço válido.")
      return
    }
    onSave({ ...form, nome: form.nome.trim(), descricao: form.descricao.trim() })
    setAberto(false)
    toast.success("Produto atualizado com sucesso")
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={abrir}>
          <Pencil data-icon="inline-start" /> Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar produto</DialogTitle>
          <DialogDescription>Atualize as informações do item do cardápio.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
        <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor={`nome-${produto.id}`}>Nome do item</Label>
              <Input id={`nome-${produto.id}`} value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor={`descricao-${produto.id}`}>Descrição</Label>
              <Textarea id={`descricao-${produto.id}`} value={form.descricao} onChange={(event) => setForm({ ...form, descricao: event.target.value })} rows={3} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`preco-${produto.id}`}>Preço (R$)</Label>
              <Input id={`preco-${produto.id}`} type="number" min="0" step="0.01" value={form.preco} onChange={(event) => setForm({ ...form, preco: Number(event.target.value) })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Categoria</Label>
              <Select value={form.categoria} onValueChange={(value: CategoriaProduto) => setForm({ ...form, categoria: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categorias.map((categoria) => <SelectItem key={categoria.value} value={categoria.value}>{categoria.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor={`imagem-${produto.id}`}>URL da imagem</Label>
              <Input id={`imagem-${produto.id}`} placeholder="https://..." value={form.imagem} onChange={(event) => setForm({ ...form, imagem: event.target.value })} />
            </div>
            <div className="overflow-hidden rounded-lg border bg-muted sm:col-span-2">
              {form.imagem ? <img src={form.imagem} alt={`Pré-visualização de ${form.nome}`} className="h-32 w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none" }} /> : <div className="flex h-32 items-center justify-center text-muted-foreground"><ImageIcon /></div>}
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
              <div><Label htmlFor={`disponivel-${produto.id}`}>Disponível em estoque</Label><p className="text-xs text-muted-foreground">Exibir este produto para novos pedidos.</p></div>
              <Switch id={`disponivel-${produto.id}`} checked={form.disponivel} onCheckedChange={(disponivel) => setForm({ ...form, disponivel })} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAberto(false)}>Cancelar</Button>
          <Button onClick={salvar}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function GerenciamentoCardapioPage() {
  const { produtos, adicionarProduto, atualizarProduto, configuracaoMarmitaDia, salvarConfiguracaoMarmitaDia } = useStore()
  const marmitas = produtos.filter((produto) => produto.categoria === "marmita")
  const [destaque, setDestaque] = useState(configuracaoMarmitaDia)

  useEffect(() => setDestaque(configuracaoMarmitaDia), [configuracaoMarmitaDia])

  const produtoDestaque = marmitas.find((produto) => produto.id === destaque.produtoId) ?? marmitas[0]

  function salvarDestaque() {
    if (!produtoDestaque) {
      toast.error("Cadastre uma marmita antes de configurar o destaque.")
      return
    }
    salvarConfiguracaoMarmitaDia({ ...destaque, produtoId: produtoDestaque.id })
    toast.success("Alterações salvas com sucesso.")
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-medium text-primary">Administração</p><h1 className="text-2xl font-bold tracking-tight text-foreground">Gerenciamento de cardápio</h1><p className="text-sm text-muted-foreground">Edite os produtos, preços e disponibilidade em um só lugar.</p></div>
          <div className="flex items-center gap-2"><Badge variant="secondary">{produtos.length} produtos</Badge><NovoProdutoDialog onSave={adicionarProduto} /></div>
        </div>
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3"><CardTitle className="text-base">Marmita do Dia</CardTitle><CardDescription>Selecione um produto existente e personalize apenas o conteúdo do destaque.</CardDescription></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2"><Label>Produto do cardápio</Label><Select value={destaque.produtoId} onValueChange={(produtoId) => setDestaque({ ...destaque, produtoId })}><SelectTrigger className="bg-background"><SelectValue placeholder="Selecione uma marmita" /></SelectTrigger><SelectContent>{marmitas.map((produto) => <SelectItem key={produto.id} value={produto.id}>{produto.nome}</SelectItem>)}</SelectContent></Select></div>
              <div className="flex flex-col gap-2 sm:col-span-2"><Label htmlFor="nome-marmita-dia">Nome da Marmita do Dia</Label><Input id="nome-marmita-dia" value={destaque.nome} placeholder={produtoDestaque?.nome} onChange={(event) => setDestaque({ ...destaque, nome: event.target.value })} /></div>
              <div className="flex flex-col gap-2 sm:col-span-2"><Label htmlFor="ingredientes-marmita-dia">Ingredientes</Label><Textarea id="ingredientes-marmita-dia" value={destaque.ingredientes} placeholder="Ex.: arroz, feijão, carne, salada" onChange={(event) => setDestaque({ ...destaque, ingredientes: event.target.value })} rows={2} /><p className="text-xs text-muted-foreground">Separe os ingredientes por vírgulas. Deixe vazio se não houver informação cadastrada.</p></div>
              <div className="flex flex-col gap-2 sm:col-span-2"><Label htmlFor="descricao-marmita-dia">Descrição do destaque</Label><Textarea id="descricao-marmita-dia" value={destaque.descricao} placeholder={produtoDestaque?.descricao} onChange={(event) => setDestaque({ ...destaque, descricao: event.target.value })} rows={3} /></div>
            </div>
            <div className="flex flex-col gap-3 rounded-lg border bg-background/70 p-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><img src={produtoDestaque?.imagem || "/images/fundo-marmita.png"} alt="" className="size-14 rounded-lg object-cover shadow-sm" /><div><p className="text-sm font-semibold">Imagem vinculada</p><p className="text-xs text-muted-foreground">Atualizada junto com o produto.</p></div></div><Button type="button" onClick={salvarDestaque}>Salvar alterações</Button></div>
          </CardContent>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2">
          {produtos.map((produto) => (
            <Card key={produto.id} className="overflow-hidden">
              <div className="relative h-36 bg-muted">
                {produto.imagem ? <img src={produto.imagem} alt={produto.nome} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><UtensilsCrossed /></div>}
                <Badge className="absolute right-3 top-3" variant={produto.disponivel ? "default" : "secondary"}>{produto.disponivel ? "Disponível" : "Indisponível"}</Badge>
              </div>
              <CardHeader className="pb-2"><div className="flex items-start justify-between gap-3"><div><CardTitle className="text-base">{produto.nome}</CardTitle><CardDescription className="mt-1">{categoriaLabel(produto.categoria)}</CardDescription></div><span className="font-bold text-primary">{formatarBRL(produto.preco)}</span></div></CardHeader>
              <CardContent className="flex items-end justify-between gap-3"><p className="line-clamp-2 text-sm text-muted-foreground">{produto.descricao}</p><ProdutoDialog produto={produto} onSave={atualizarProduto} /></CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-dashed bg-card/70"><CardContent className="flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">Adicione novos produtos mantendo o catálogo centralizado nesta página.</p><NovoProdutoDialog onSave={adicionarProduto} trigger={<Button type="button" variant="outline"><Plus data-icon="inline-start" /> Adicionar produto</Button>} /></CardContent></Card>
      </div>
    </AppShell>
  )
}
