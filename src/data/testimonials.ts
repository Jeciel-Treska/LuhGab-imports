// ATENÇÃO: conteúdo de PLACEHOLDER para desenvolvimento.
// Estes depoimentos são ilustrativos e NÃO são de clientes reais.
// Antes de publicar, substitua por avaliações reais e defina `verified: true`
// somente para compras confirmadas. O selo "Compra Verificada" depende desse campo.

export interface Testimonial {
  id: string;
  name: string;
  city: string;
  profile: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date: string;
  text: string;
  verified: boolean;
}

export const testimonials: Testimonial[] = [
  {
    id: "fisiculturismo",
    name: "Rafael S.",
    city: "São Paulo, SP",
    profile: "Atleta de fisiculturismo",
    rating: 5,
    date: "2026-09-14",
    text: "Competindo em alto nível, eu não abro mão de pureza. O whey isolado chegou lacrado, com a rotulagem original e um sabor limpo, sem aquele gosto artificial. Na fase de definição, senti a diferença na recuperação entre os treinos.",
    verified: false,
  },
  {
    id: "nutricionista",
    name: "Camila R.",
    city: "Curitiba, PR",
    profile: "Nutricionista esportiva",
    rating: 5,
    date: "2026-08-27",
    text: "Indico a LuhGab Imports para meus pacientes pelo cuidado com a origem dos produtos. Os lotes são rastreáveis e a equipe explica a composição de cada item com clareza. Isso me dá segurança para recomendar.",
    verified: false,
  },
  {
    id: "crossfit",
    name: "Bruno L.",
    city: "Belo Horizonte, MG",
    profile: "Praticante de CrossFit",
    rating: 5,
    date: "2026-10-03",
    text: "Treino seis vezes por semana e o pré-treino faz toda a diferença no WOD das manhãs. Energia constante, sem aquele crash no meio do treino. Comprei o combo com três produtos e o desconto foi bem aplicado.",
    verified: false,
  },
  {
    id: "corredor",
    name: "Juliana M.",
    city: "Porto Alegre, RS",
    profile: "Corredora de rua",
    rating: 5,
    date: "2026-07-19",
    text: "Comecei a correr maratonas no ano passado e a creatina entrou na minha rotina de força. Chegou rápido, bem embalada e com nota fiscal. Dá para ver que é um produto cuidado do início ao fim.",
    verified: false,
  },
  {
    id: "cliente-regular",
    name: "Thiago A.",
    city: "Salvador, BA",
    profile: "Cliente regular",
    rating: 5,
    date: "2026-10-12",
    text: "Já é a quinta compra que faço. Sempre entrega no prazo informado, o Pix com 10% de desconto compensa muito, e o atendimento pelo WhatsApp resolve tudo em minutos.",
    verified: false,
  },
  {
    id: "iniciante",
    name: "Larissa F.",
    city: "Fortaleza, CE",
    profile: "Iniciante na musculação",
    rating: 5,
    date: "2026-06-30",
    text: "Eu não entendia nada de suplementação. Usei o seletor por objetivo e o atendimento me ajudou a montar uma rotina simples. Hoje me sinto mais confiante nos treinos e sei exatamente o que estou tomando.",
    verified: false,
  },
];

export const socialProofHighlight = "Mais de 5.000 clientes satisfeitos em todo o Brasil";
