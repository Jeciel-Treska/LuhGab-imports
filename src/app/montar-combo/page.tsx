import type { Metadata } from "next";
import ComboBuilder from "@/components/ComboBuilder";

export const metadata: Metadata = {
  title: "Monte seu Combo",
  description: "Escolha proteína, energia e saúde e ganhe até 15% OFF no kit.",
  alternates: { canonical: "/montar-combo" },
};

export default function ComboPage() {
  return <ComboBuilder />;
}
