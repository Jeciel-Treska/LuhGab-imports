import { CreditCard, ShieldCheck, Truck, Zap, type LucideIcon } from "lucide-react";
import { FREE_SHIPPING_THRESHOLD } from "@/data/site";
import { formatBRL } from "@/lib/format";

const PERKS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Truck,
    title: "Frete Grátis",
    text: `Pedidos acima de ${formatBRL(FREE_SHIPPING_THRESHOLD).replace(",00", "")}`,
  },
  { icon: CreditCard, title: "10x Sem Juros", text: "Ou 10% OFF no Pix à vista" },
  { icon: Zap, title: "Envio em 24h", text: "Despacho expresso rastreado" },
  { icon: ShieldCheck, title: "100% Original", text: "Lacrado, com nota fiscal e laudo" },
];

/** Régua de vantagens comerciais. */
export default function StorePerks() {
  return (
    <section aria-label="Vantagens da loja" className="border-b border-white/10 bg-dark-soft">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-3 px-4 py-4 sm:px-6 lg:grid-cols-4">
        {PERKS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-3">
            <Icon className="h-7 w-7 shrink-0 text-[#C9A55C]" aria-hidden />
            <p className="min-w-0 leading-tight">
              <span className="block text-sm font-bold text-zinc-100">{title}</span>
              <span className="block text-xs text-zinc-400">{text}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
