import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
import { faq } from "@/data/faq";

export const metadata: Metadata = {
  title: "Central de Ajuda",
  description: "Tire suas dúvidas sobre produtos, frete, descontos e pedidos na LuhGab Imports.",
  alternates: { canonical: "/ajuda" },
};

export default function HelpPage() {
  return (
    <InfoPage
      title="Central de Ajuda"
      intro="As dúvidas mais comuns sobre produtos, frete e descontos."
      whatsappMessage="Olá! Preciso de ajuda com uma dúvida."
    >
      {faq.map((item) => (
        <section key={item.id}>
          <h2>{item.question}</h2>
          <p>{item.answer}</p>
        </section>
      ))}
    </InfoPage>
  );
}
