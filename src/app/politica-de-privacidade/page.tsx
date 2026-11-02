import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
import { COMPANY_CNPJ, COMPANY_LEGAL_NAME, SITE_NAME } from "@/data/site";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como a LuhGab Imports trata os seus dados pessoais.",
  alternates: { canonical: "/politica-de-privacidade" },
};

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Política de Privacidade"
      intro="Esta política explica quais dados são tratados quando você usa este site, em linha com a Lei Geral de Proteção de Dados (Lei 13.709/2018)."
      whatsappMessage="Olá! Quero falar sobre os meus dados pessoais."
      whatsappLabel="Falar sobre meus dados"
    >
      <section>
        <h2>Quem somos</h2>
        <p>
          {COMPANY_LEGAL_NAME || SITE_NAME}
          {COMPANY_CNPJ && `, CNPJ ${COMPANY_CNPJ}`}, responsável pela loja e por este site.
        </p>
      </section>
      <section>
        <h2>Dados armazenados no seu navegador</h2>
        <p>
          O site não exige cadastro. Carrinho, cupom e favoritos ficam salvos apenas no seu
          navegador, para não se perderem entre as visitas, e não são enviados aos nossos servidores.
          Você pode apagá-los limpando os dados de navegação.
        </p>
      </section>
      <section>
        <h2>Dados enviados pelo WhatsApp</h2>
        <p>
          Ao finalizar um pedido ou tirar uma dúvida, você é levado ao WhatsApp, serviço de terceiro
          com política própria. Usamos o que você nos envia por lá, como nome, telefone, CEP e
          endereço, para atender você, processar o pagamento e entregar o pedido.
        </p>
      </section>
      <section>
        <h2>Seus direitos</h2>
        <p>
          Você pode pedir a confirmação, o acesso, a correção ou a exclusão dos seus dados, nos termos
          da LGPD, pelo nosso canal de atendimento.
        </p>
      </section>
    </InfoPage>
  );
}
