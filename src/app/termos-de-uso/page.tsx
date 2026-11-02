import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
import { COMPANY_CNPJ, COMPANY_LEGAL_NAME, FREE_SHIPPING_THRESHOLD, SITE_NAME } from "@/data/site";
import { formatBRL } from "@/lib/format";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Condições de uso do site e de compra na LuhGab Imports.",
  alternates: { canonical: "/termos-de-uso" },
};

export default function TermsPage() {
  return (
    <InfoPage
      title="Termos de Uso"
      intro={`Estas condições valem para o uso deste site e para as compras feitas com ${COMPANY_LEGAL_NAME || SITE_NAME}${COMPANY_CNPJ ? `, CNPJ ${COMPANY_CNPJ}` : ""}.`}
      whatsappMessage="Olá! Tenho uma dúvida sobre os termos de compra."
    >
      <section>
        <h2>Pedidos</h2>
        <p>
          O carrinho do site monta o seu pedido, que é finalizado pelo WhatsApp. A compra só é
          concluída depois que nossa equipe confirma disponibilidade, valores, frete e pagamento. Em
          caso de divergência, vale o preço do catálogo confirmado no atendimento.
        </p>
      </section>
      <section>
        <h2>Preços, cupons e frete</h2>
        <p>
          Preços e promoções podem mudar sem aviso, respeitados os pedidos já confirmados. O frete é
          grátis em compras a partir de {formatBRL(FREE_SHIPPING_THRESHOLD)}; abaixo disso, o valor é
          informado no atendimento.
        </p>
      </section>
      <section>
        <h2>Trocas e arrependimento</h2>
        <p>
          Nas compras feitas pela internet, você pode desistir em até 7 dias corridos após o
          recebimento, conforme o artigo 49 do Código de Defesa do Consumidor. Produtos com defeito
          seguem os prazos legais de garantia. Fale com a nossa equipe para iniciar a solicitação.
        </p>
      </section>
      <section>
        <h2>Uso dos produtos</h2>
        <p>
          Suplementos não são medicamentos e não substituem uma alimentação equilibrada. Siga as
          orientações do rótulo e, em caso de dúvida, gestação, doença ou uso de medicamentos, consulte
          um médico ou nutricionista.
        </p>
      </section>
    </InfoPage>
  );
}
