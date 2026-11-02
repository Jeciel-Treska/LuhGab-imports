import { buildWhatsAppUrl } from "@/data/site";
import type { CartItem, Coupon } from "@/types/cart";
import { formatBRL } from "./format";

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

/** Total da linha, já com o desconto de combo. */
export const lineTotal = (item: CartItem): number =>
  round2(item.unitPrice * (1 - item.comboDiscount / 100) * item.quantity);

interface OrderSummary {
  items: CartItem[];
  subtotal: number;
  totalDiscount: number;
  total: number;
  pixTotal: number;
  coupon: Coupon | null;
  couponValue: number;
  freeShipping: boolean;
}

/** Monta o texto do pedido para envio via WhatsApp. */
export function formatWhatsAppOrder(order: OrderSummary): string {
  const lines: string[] = ["*Novo pedido - LuhGab Imports*", ""];

  order.items.forEach((item, i) => {
    const combo = item.comboDiscount > 0 ? ` (combo -${item.comboDiscount}%)` : "";
    lines.push(
      `${i + 1}. ${item.name} - ${item.brandName}`,
      `   Sabor: ${item.flavor.name} | Tamanho: ${item.size.label}`,
      `   ${item.quantity}x = ${formatBRL(lineTotal(item))}${combo}`,
    );
  });

  lines.push("", `Subtotal: ${formatBRL(order.subtotal)}`);
  const otherDiscounts = round2(order.totalDiscount - order.couponValue);
  if (otherDiscounts > 0) lines.push(`Descontos: -${formatBRL(otherDiscounts)}`);
  if (order.coupon) {
    lines.push(`Cupom ${order.coupon.code}: -${formatBRL(order.couponValue)}`);
  }
  lines.push(
    `*Total no Pix: ${formatBRL(order.pixTotal)}*`,
    `Total no cartão: ${formatBRL(order.total)}`,
    order.freeShipping ? "Frete: GRÁTIS" : "Frete: a calcular no atendimento",
    "",
    "Gostaria de finalizar este pedido. Podem me ajudar com o pagamento e a entrega?",
  );

  return lines.join("\n");
}

export function buildOrderUrl(order: OrderSummary): string {
  return buildWhatsAppUrl(formatWhatsAppOrder(order));
}
