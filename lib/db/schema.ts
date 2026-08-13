import {
  pgTable,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core"

export type ItemPedido = {
  descricao: string
  quantidade: number
  preco: number
}

export const vendas = pgTable("vendas", {
  id: text("id").primaryKey(),
  descricao: text("descricao").notNull(),
  quantidade: integer("quantidade").notNull(),
  valorUnitario: numeric("valor_unitario", { precision: 10, scale: 2 }).notNull(),
  forma: text("forma").notNull(),
  data: timestamp("data", { withTimezone: true }).notNull().defaultNow(),
})

export const despesas = pgTable("despesas", {
  id: text("id").primaryKey(),
  descricao: text("descricao").notNull(),
  valor: numeric("valor", { precision: 10, scale: 2 }).notNull(),
  data: timestamp("data", { withTimezone: true }).notNull().defaultNow(),
})

export const pedidos = pgTable("pedidos", {
  id: text("id").primaryKey(),
  cliente: text("cliente").notNull(),
  itens: jsonb("itens").$type<ItemPedido[]>().notNull(),
  observacao: text("observacao").notNull().default(""),
  forma: text("forma").notNull(),
  status: text("status").notNull().default("pendente"),
  vendaRegistrada: boolean("venda_registrada").notNull().default(false),
  data: timestamp("data", { withTimezone: true }).notNull().defaultNow(),
})
