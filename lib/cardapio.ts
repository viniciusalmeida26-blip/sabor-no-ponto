export type CardapioDia = {
  dia: string
  mistura: string
  acompanhamentos: string
  valor: number
}

export const cardapios: CardapioDia[] = [
  { dia: "Domingo", mistura: "Frango assado com ervas", acompanhamentos: "Arroz, feijão, farofa e salada", valor: 20 },
  { dia: "Segunda-feira", mistura: "Bife acebolado", acompanhamentos: "Arroz, feijão, purê de batata e salada", valor: 22 },
  { dia: "Terça-feira", mistura: "Frango grelhado", acompanhamentos: "Arroz, feijão, macarrão e salada", valor: 20 },
  { dia: "Quarta-feira", mistura: "Carne de panela", acompanhamentos: "Arroz, feijão, mandioca e couve", valor: 23 },
  { dia: "Quinta-feira", mistura: "Bisteca suína acebolada", acompanhamentos: "Arroz, feijão, batata dourada e salada", valor: 22 },
  { dia: "Sexta-feira", mistura: "Strogonoff de frango", acompanhamentos: "Arroz, feijão, batata palha e salada", valor: 24 },
  { dia: "Sábado", mistura: "Linguiça acebolada", acompanhamentos: "Arroz, feijão, farofa e vinagrete", valor: 20 },
]

export function cardapioDaData(data: Date) {
  return cardapios[data.getDay()]
}

export function cardapioDaChave(chave: string) {
  const [ano, mes, dia] = chave.split("-").map(Number)
  return cardapioDaData(new Date(ano, mes - 1, dia))
}

export function formatarValorCardapio(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}
