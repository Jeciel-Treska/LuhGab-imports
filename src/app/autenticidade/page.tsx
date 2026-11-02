import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Autenticidade e Laudos",
  description: "Como a LuhGab Imports trata a originalidade e a procedência dos produtos.",
  alternates: { canonical: "/autenticidade" },
};

export default function AuthenticityPage() {
  return (
    <InfoPage
      title="Autenticidade e Laudos"
      intro="Vendemos produtos originais, nacionais e importados, lacrados de fábrica."
      whatsappMessage="Olá! Gostaria de confirmar a procedência de um produto."
      whatsappLabel="Consultar procedência"
    >
      <section>
        <h2>Antes de usar</h2>
        <ul>
          <li>Confira se o lacre está intacto ao receber o produto.</li>
          <li>Verifique o lote e a validade impressos na embalagem.</li>
          <li>Guarde o comprovante do pedido.</li>
        </ul>
      </section>
      <section>
        <h2>Ficou com dúvida?</h2>
        <p>
          Fale com a nossa equipe antes de abrir o produto. Você pode pedir informações de
          procedência, lote e laudo disponíveis para o item comprado.
        </p>
      </section>
    </InfoPage>
  );
}
