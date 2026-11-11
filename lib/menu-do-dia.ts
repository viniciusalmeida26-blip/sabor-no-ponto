export type CardapioDoDia = {
  nome: string
  descricao: string
  ingredientes: string
}

export const cardapiosPorDia: CardapioDoDia[] = [
  { nome: "Frango grelhado com arroz e feijão", descricao: "Uma combinação caseira, leve e completa para o almoço.", ingredientes: "Frango grelhado, arroz branco, feijão carioca, salada fresca" },
  { nome: "Bife acebolado com purê", descricao: "Sabor de comida feita em casa com acompanhamento cremoso.", ingredientes: "Bife acebolado, purê de batata, arroz branco, salada" },
  { nome: "Frango ao molho com macarrão", descricao: "Molho da casa e acompanhamentos preparados no dia.", ingredientes: "Frango ao molho, macarrão, arroz, legumes refogados" },
  { nome: "Carne de panela com mandioca", descricao: "Carne macia cozida lentamente para um almoço especial.", ingredientes: "Carne de panela, mandioca, arroz branco, couve" },
  { nome: "Frango crocante com farofa", descricao: "Uma marmita completa com textura e tempero na medida.", ingredientes: "Frango crocante, arroz, feijão, farofa, vinagrete" },
  { nome: "Feijoada da casa", descricao: "Feijoada caseira servida com os acompanhamentos tradicionais.", ingredientes: "Feijoada, arroz, couve, farofa, laranja" },
  { nome: "Marmita especial de domingo", descricao: "Uma combinação acolhedora para fechar a semana com sabor.", ingredientes: "Assado do dia, arroz, feijão, legumes e salada" },
]

export function obterCardapioDoDia(data = new Date()) {
  return cardapiosPorDia[data.getDay()]
}
