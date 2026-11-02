import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Sobre a LuhGab",
  description: "Conheça a LuhGab Imports, loja de suplementos esportivos nacionais e importados.",
  alternates: { canonical: "/sobre" },
};

export default function AboutPage() {
  return (
    <InfoPage
      title="Sobre a LuhGab"
      intro="A LuhGab Imports é uma loja de suplementos esportivos, com produtos nacionais e importados para quem leva o treino a sério."
      whatsappMessage="Olá! Gostaria de saber mais sobre a LuhGab Imports."
    >
      <section>
        <h2>O que você encontra aqui</h2>
        <p>
          Whey protein, creatina, pré-treinos, aminoácidos, vitaminas e termogênicos de diversas{" "}
          <Link href="/marcas" className="font-semibold underline">
            marcas
          </Link>
          , além de um{" "}
          <Link href="/montar-combo" className="font-semibold underline">
            montador de combos
          </Link>{" "}
          com desconto progressivo.
        </p>
      </section>
      <section>
        <h2>Como comprar</h2>
        <p>
          Escolha seus produtos, monte o carrinho e finalize pelo WhatsApp. Nossa equipe confirma
          disponibilidade, valores, frete e forma de pagamento antes de concluir o pedido.
        </p>
      </section>
    </InfoPage>
  );
}
