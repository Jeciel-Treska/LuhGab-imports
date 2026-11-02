export interface BlogSectionContent {
  heading: string;
  paragraphs: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: "Creatina" | "Whey" | "Pré-treino";
  publishedAt: string;
  readingTime: number;
  sections: BlogSectionContent[];
  relatedLink: {
    label: string;
    href: string;
  };
}

export const blogDisclaimer =
  "Este conteúdo tem caráter educativo e não substitui a orientação de um médico ou nutricionista. Gestantes, lactantes, menores de idade, pessoas com condições cardíacas, hipertensão ou sensibilidade à cafeína devem consultar um profissional antes de usar qualquer suplemento.";

export const blogPosts: BlogPost[] = [
  {
    id: "creatina",
    slug: "como-tomar-creatina-corretamente",
    title: "Como Tomar Creatina Corretamente: Saturação vs. Uso Contínuo e Melhores Horários",
    excerpt:
      "Entenda como a creatina atua nos músculos, qual protocolo escolher e se o horário realmente importa.",
    category: "Creatina",
    publishedAt: "2026-10-05",
    readingTime: 5,
    sections: [
      {
        heading: "Como a creatina funciona",
        paragraphs: [
          "A creatina é um composto naturalmente presente no músculo e participa da regeneração do ATP, a principal fonte de energia para esforços curtos e intensos. Quando a reserva muscular está saturada, os treinos de força e sprint tendem a render mais.",
          "Parte do efeito visível nas primeiras semanas vem da retenção de água dentro das células musculares. Isso aumenta o volume da célula e não representa ganho de gordura.",
        ],
      },
      {
        heading: "Saturação ou uso contínuo?",
        paragraphs: [
          "Existem dois protocolos eficazes. Na saturação, você toma cerca de 20 g por dia, divididos em quatro doses, por 5 a 7 dias. No uso contínuo, a dose é de 3 a 5 g por dia, sem fase inicial.",
          "Os dois levam à mesma saturação muscular. A diferença está no tempo: a saturação chega em uma semana, enquanto o uso contínuo leva cerca de três a quatro semanas. Para a maioria das pessoas, o uso contínuo é mais simples e dá a mesma resposta no longo prazo.",
        ],
      },
      {
        heading: "Melhor horário e combinação",
        paragraphs: [
          "O horário faz menos diferença do que se imagina. Alguns estudos sugerem uma leve vantagem para a dose pós-treino, mas o mais importante é tomar a creatina todos os dias, no mesmo horário.",
          "Consumir a creatina com carboidratos e proteínas pode favorecer a captação muscular, mas não é obrigatório. Misture em água, suco ou na sua bebida de whey.",
        ],
      },
      {
        heading: "Escolha da forma",
        paragraphs: [
          "A creatina monohidratada é a forma mais estudada e costuma ter o melhor custo-benefício. Formas com marketing de absorção superior não mostraram vantagem consistente em pesquisas independentes.",
        ],
      },
    ],
    relatedLink: {
      label: "Ver creatinas disponíveis",
      href: "/produtos?categoria=creatina",
    },
  },
  {
    id: "whey",
    slug: "whey-isolado-concentrado-hidrolisado",
    title:
      "Whey Isolado vs. Concentrado vs. Hidrolisado: Qual o Ideal para o Seu Bolso e Objetivo?",
    excerpt:
      "Compare teor de proteína, lactose e velocidade de absorção para escolher o whey certo sem pagar por algo que não precisa.",
    category: "Whey",
    publishedAt: "2026-10-12",
    readingTime: 6,
    sections: [
      {
        heading: "As três formas do whey",
        paragraphs: [
          "O concentrado costuma ter entre 70% e 80% de proteína, com mais lactose e gordura. É a opção mais econômica e funciona bem para quem tolera lactose.",
          "O isolado passa por uma filtragem extra e chega a cerca de 90% de proteína ou mais, com muito menos lactose e gordura. É a escolha comum para quem é sensível ao leite ou quer controlar as calorias.",
          "O hidrolisado é pré-digerido em peptídeos menores. Tende a ser absorvido mais rapidamente, tem preço mais alto e costuma ter sabor mais amargo.",
        ],
      },
      {
        heading: "Velocidade de absorção: o que importa de verdade",
        paragraphs: [
          "As diferenças de absorção existem, mas são pequenas na prática. Para quem treina com força, o fator que mais influencia os resultados é a quantidade total de proteína no dia.",
          "A recomendação de consenso para praticantes de força fica entre 1,6 e 2,2 g de proteína por quilo de peso corporal por dia. O whey é uma forma prática de completar essa meta.",
        ],
      },
      {
        heading: "Custo-benefício e objetivo",
        paragraphs: [
          "Se você busca ganho de massa e não tem restrição a lactose, o concentrado entrega ótimo custo-benefício. Para definição ou intolerância, o isolado costuma compensar. O hidrolisado faz mais sentido para atletas que precisam de recuperação rápida e têm orçamento para isso.",
        ],
      },
    ],
    relatedLink: {
      label: "Comparar wheys na loja",
      href: "/produtos?categoria=proteina",
    },
  },
  {
    id: "pre-treino",
    slug: "guia-definitivo-pre-treino",
    title: "Guia Definitivo do Pré-Treino: Cafeína, Beta-Alanina e Como Evitar o Efeito Crash",
    excerpt:
      "Saiba o que cada ingrediente faz no treino, quanto tomar e como evitar a queda de energia depois.",
    category: "Pré-treino",
    publishedAt: "2026-10-20",
    readingTime: 5,
    sections: [
      {
        heading: "O papel de cada ingrediente",
        paragraphs: [
          "A cafeína aumenta o estado de alerta e reduz a percepção de esforço. A dose eficaz costuma ficar entre 3 e 6 mg por quilo de peso corporal.",
          "A beta-alanina aumenta a carnosina muscular, que ajuda a tamponar a acidez gerada em séries longas. Seu efeito mais conhecido é uma sensação de formigamento na pele, que é inofensiva.",
          "Citrulina e nitratos participam da produção de óxido nítrico e podem contribuir para o pump muscular, a sensação de vascularização durante o treino.",
        ],
      },
      {
        heading: "Por que acontece o efeito crash",
        paragraphs: [
          "A queda de energia após o treino geralmente tem três causas: excesso de cafeína em uma única dose, consumo frequente que leva à tolerância e ingestão tarde da tarde, que pode prejudicar o sono.",
          "Para evitar o crash, prefira doses moderadas, faça pausas da cafeína de vez em quando e evite o pré-treino a partir do fim da tarde.",
        ],
      },
      {
        heading: "Como usar com equilíbrio",
        paragraphs: [
          "Tome o pré-treino cerca de 30 a 45 minutos antes do treino, com água. Um pré-treino não substitui uma boa alimentação, sono e hidratação. Se perceber palpitações, ansiedade intensa ou insônia, interrompa o uso e procure um médico.",
        ],
      },
    ],
    relatedLink: {
      label: "Ver pré-treinos da LuhGab",
      href: "/produtos?categoria=pre-treino",
    },
  },
];
