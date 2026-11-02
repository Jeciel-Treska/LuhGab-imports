import { FREE_SHIPPING_THRESHOLD, PIX_DISCOUNT_PERCENT } from "@/data/site";
import { formatBRL } from "@/lib/format";

const MESSAGES = [
  `Frete grátis Brasil acima de ${formatBRL(FREE_SHIPPING_THRESHOLD).replace(",00", "")}`,
  `${PIX_DISCOUNT_PERCENT}% OFF no Pix à vista`,
  "Suplementos 100% Originais com Laudo Certificado",
  "Parcelamento em até 10x sem juros",
  "Envio expresso em até 24h",
];

export default function TopBanner() {
  const track = [...MESSAGES, ...MESSAGES];
  return (
    <div className="overflow-hidden border-b border-zinc-800 bg-zinc-950 text-zinc-300">
      <ul
        aria-label="Vantagens da loja"
        className="animate-marquee flex w-max items-center py-2 text-xs motion-reduce:animate-none font-medium uppercase tracking-[0.16em]"
      >
        {track.map((text, i) => (
          <li
            key={i}
            aria-hidden={i >= MESSAGES.length}
            className="flex items-center whitespace-nowrap"
          >
            <span className="px-6">{text}</span>
            <span aria-hidden className="text-zinc-400">
              •
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
