"use client"

import { useState } from "react"
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
import { ImageIcon, Pencil, Plus, UtensilsCrossed } from "lucide-react"
import { toast } from "sonner"

const categorias: { value: CategoriaProduto; label: string }[] = [
  { value: "marmita", label: "Marmitas Traditional" },
  { value: "fitness", label: "Marmitas Fitness" },
  { value: "bebida", label: "Bebidas" },
  { value: "sobremesa", label: "Sobremesas" },
]

const categoriaLabel = (categoria: CategoriaProduto) => categorias.find((item) => item.value === categoria)?.label ?? categoria

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
  const { produtos, atualizarProduto } = useStore()
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-medium text-primary">Administração</p><h1 className="text-2xl font-bold tracking-tight text-foreground">Gerenciamento de cardápio</h1><p className="text-sm text-muted-foreground">Edite os produtos, preços e disponibilidade em um só lugar.</p></div>
          <Badge variant="secondary">{produtos.length} produtos</Badge>
        </div>
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
        <Card className="border-dashed bg-card/70"><CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground"><Plus className="text-primary" /> Para adicionar novos produtos, mantenha o catálogo centralizado nesta página.</CardContent></Card>
      </div>
    </AppShell>
  )
}
