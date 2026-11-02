import type { Product, ProductFlavor, ProductSize } from "./product";

export interface CartItem {
  /** Chave composta: `${productId}:${flavorId}:${sizeId}:${comboDiscount}` */
  id: string;
  productId: string;
  slug: string;
  name: string;
  brandName: string;
  flavor: ProductFlavor;
  size: ProductSize;
  /** Preço unitário já com o multiplicador do tamanho */
  unitPrice: number;
  /** Preço unitário original (sem desconto) com o multiplicador do tamanho */
  originalUnitPrice: number;
  quantity: number;
  /** Percentual de desconto de combo (0-100) aplicado a este item */
  comboDiscount: number;
}

export interface ComboItemInput {
  product: Product;
  flavor: ProductFlavor;
  size: ProductSize;
  quantity?: number;
}

export interface Coupon {
  code: string;
  /** Percentual de desconto (0-100) sobre o subtotal */
  percentage: number;
  description: string;
}

export interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  activeCoupon: Coupon | null;
}

export interface CartTotals {
  /** Soma dos preços originais (antes de qualquer desconto) */
  subtotal: number;
  /** Descontos de produto + combo + cupom */
  totalDiscount: number;
  /** Total no cartão, após descontos de produto, combo e cupom */
  total: number;
  /** Total à vista no Pix, com o desconto do Pix sobre `total` */
  pixTotal: number;
  itemCount: number;
}

export interface CartContextValue extends CartState, CartTotals {
  hydrated: boolean;
  addItem: (
    product: Product,
    flavor: ProductFlavor,
    weight: ProductSize,
    quantity?: number,
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  clearCart: () => void;
  toggleCart: () => void;
  addCombo: (comboItems: ComboItemInput[], comboDiscount: number) => void;
}
