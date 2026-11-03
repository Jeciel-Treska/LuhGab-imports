export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const faq: FaqItem[] = [
  {
    id: "originais",
    question: "Os suplementos vendidos pela LuhGab Imports são originais?",
    answer:
      "Sim. Vendemos produtos originais, nacionais e importados, lacrados de fábrica. Se precisar, você pode consultar a procedência e o lote do seu produto com a nossa equipe no WhatsApp.",
  },
  {
    id: "frete",
    question: "Como funciona o frete e qual o prazo de entrega?",
    answer:
      "Enviamos para todo o Brasil. O frete é grátis em compras acima de R$ 299. Abaixo desse valor, o custo e o prazo dependem da sua região e são informados no atendimento pelo WhatsApp. Assim que o pedido é despachado, você recebe o código de rastreamento.",
  },
  {
    id: "retirada",
    question: "Posso retirar meu pedido pessoalmente?",
    answer:
      "A retirada pessoal depende da disponibilidade no momento da compra. Para combinar local, dia e horário, fale com a nossa equipe no WhatsApp antes de finalizar o pedido.",
  },
  {
    id: "desconto",
    question: "Como funciona o desconto no Pix e no Combo?",
    answer:
      "No Montador de Combo, o desconto é progressivo: 10% com 2 produtos, 15% com 3 e 20% com 4 ou mais. No Pix, você ganha mais 10% sobre o total já com os descontos de combo e cupom. O carrinho mostra os totais no cartão e no Pix antes de você finalizar o pedido.",
  },
  {
    id: "objetivo",
    question: "Como sei qual suplemento é ideal para o meu objetivo?",
    answer:
      "Use o filtro de objetivo no catálogo para ver os produtos de acordo com o que você busca, como ganho de massa, energia ou saúde. Se ainda tiver dúvidas, fale com a nossa equipe pelo WhatsApp. Para orientação individual, consulte um médico ou nutricionista.",
  },
];
