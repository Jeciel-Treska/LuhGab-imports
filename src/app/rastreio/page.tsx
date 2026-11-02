import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Rastrear Pedido",
  description: "Saiba como acompanhar a entrega do seu pedido na LuhGab Imports.",
  alternates: { canonical: "/rastreio" },
};

export default function TrackingPage() {
  return (
    <InfoPage
      title="Rastrear Pedido"
      intro="O acompanhamento dos pedidos é feito pelo WhatsApp."
      whatsappMessage="Olá! Gostaria de rastrear o meu pedido."
      whatsappLabel="Consultar meu pedido"
    >
      <section>
        <h2>Como acompanhar</h2>
        <p>
          Quando o pedido é despachado, enviamos o código de rastreamento pelo WhatsApp usado na
          compra. Se você ainda não recebeu o código ou quer saber a situação do envio, fale com a
          nossa equipe e informe o nome usado no pedido.
        </p>
      </section>
    </InfoPage>
  );
}
