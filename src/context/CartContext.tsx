"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useToast } from "@/components/Toast";
import type {
  CartContextValue,
  CartItem,
  CartTotals,
  ComboItemInput,
  Coupon,
} from "@/types/cart";
import { getProductById } from "@/data/products";
import { PIX_DISCOUNT_PERCENT } from "@/data/site";
import type { Product, ProductFlavor, ProductSize } from "@/types/product";

const STORAGE_KEY = "luhgab:cart";
const MAX_QUANTITY = 99;
const VALID_COMBO_DISCOUNTS = [0, 10, 15];

const COUPONS: Record<string, Coupon> = {
  LUHGAB10: { code: "LUHGAB10", percentage: 10, description: "10% de desconto" },
  BEMVINDO5: { code: "BEMVINDO5", percentage: 5, description: "5% de desconto" },
};

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateTotals(
  items: CartItem[],
  coupon: Coupon | null,
): CartTotals {
  let original = 0;
  let afterItemDiscounts = 0;
  let itemCount = 0;

  for (const item of items) {
    original += round2(item.originalUnitPrice * item.quantity);
    const discounted = item.unitPrice * (1 - item.comboDiscount / 100);
    afterItemDiscounts += round2(discounted * item.quantity);
    itemCount += item.quantity;
  }

  const couponDiscount = coupon
    ? round2((afterItemDiscounts * coupon.percentage) / 100)
    : 0;
  const total = round2(afterItemDiscounts - couponDiscount);

  return {
    subtotal: round2(original),
    totalDiscount: round2(Math.max(0, original - total)),
    total,
    pixTotal: round2(total * (1 - PIX_DISCOUNT_PERCENT / 100)),
    itemCount,
  };
}

export function calculateInstallment(total: number, installments: number): number {
  return installments > 0 ? round2(total / installments) : total;
}

function buildItem(
  product: Product,
  flavor: ProductFlavor,
  size: ProductSize,
  quantity: number,
  comboDiscount = 0,
): CartItem {
  return {
    id: `${product.id}:${flavor.id}:${size.id}:${comboDiscount}`,
    productId: product.id,
    slug: product.slug,
    name: product.name,
    brandName: product.brandName,
    flavor,
    size,
    unitPrice: round2(product.price * size.priceMultiplier),
    originalUnitPrice: round2(product.originalPrice * size.priceMultiplier),
    quantity,
    comboDiscount,
  };
}

function mergeItems(current: CartItem[], incoming: CartItem[]): CartItem[] {
  const next = [...current];
  for (const item of incoming) {
    const idx = next.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      next[idx] = {
        ...next[idx],
        quantity: Math.min(MAX_QUANTITY, next[idx].quantity + item.quantity),
      };
    } else {
      next.push(item);
    }
  }
  return next;
}

/**
 * Reconstrói o carrinho salvo a partir do catálogo: descarta itens inválidos ou
 * esgotados e nunca confia em nomes e preços vindos do localStorage.
 */
function restoreItems(stored: unknown): CartItem[] {
  if (!Array.isArray(stored)) return [];
  const restored = stored.flatMap((raw): CartItem[] => {
    const entry = raw as Partial<CartItem> | null;
    const product = getProductById(String(entry?.productId));
    const flavor = product?.flavors.find((f) => f.id === entry?.flavor?.id);
    const size = product?.sizes.find((s) => s.id === entry?.size?.id);
    if (!product?.inStock || !flavor?.inStock || !size?.inStock) return [];
    const quantity = Math.floor(Number(entry?.quantity));
    if (!Number.isFinite(quantity) || quantity < 1) return [];
    const discount = Number(entry?.comboDiscount);
    return [
      buildItem(
        product,
        flavor,
        size,
        Math.min(MAX_QUANTITY, quantity),
        VALID_COMBO_DISCOUNTS.includes(discount) ? discount : 0,
      ),
    ];
  });
  return mergeItems([], restored);
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hidrata só no cliente, após o primeiro render, para evitar mismatch de SSR.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          items?: unknown;
          activeCoupon?: Coupon | null;
        };
        setItems(restoreItems(parsed?.items));
        const code = parsed?.activeCoupon?.code;
        if (typeof code === "string" && Object.hasOwn(COUPONS, code)) {
          setActiveCoupon(COUPONS[code]);
        }
      }
    } catch {
      /* storage indisponível ou corrompido */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ items, activeCoupon }),
      );
    } catch {
      /* ignora falhas de quota */
    }
  }, [items, activeCoupon, hydrated]);

  const addItem = useCallback(
    (
      product: Product,
      flavor: ProductFlavor,
      weight: ProductSize,
      quantity = 1,
    ) => {
      const qty = Math.max(1, Math.min(MAX_QUANTITY, Math.floor(quantity)));
      setItems((prev) =>
        mergeItems(prev, [buildItem(product, flavor, weight, qty)]),
      );
      setIsCartOpen(true);
      showToast(`${product.name} adicionado ao carrinho!`);
    },
    [showToast],
  );

  const removeItem = useCallback(
    (id: string) => {
      const target = items.find((i) => i.id === id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (target) showToast(`${target.name} removido do carrinho`, "info");
    },
    [items, showToast],
  );

  const updateQuantity = useCallback((id: string, quantity: number) => {
    const qty = Math.floor(quantity);
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(MAX_QUANTITY, qty) } : i,
          ),
    );
  }, []);

  const applyCoupon = useCallback(
    (code: string) => {
      const normalized = code.trim().toUpperCase();
      const coupon = Object.hasOwn(COUPONS, normalized) ? COUPONS[normalized] : null;
      if (!coupon) {
        showToast("Cupom inválido", "error");
        return false;
      }
      setActiveCoupon(coupon);
      showToast(`Cupom ${coupon.code} aplicado: ${coupon.description}`);
      return true;
    },
    [showToast],
  );

  const removeCoupon = useCallback(() => setActiveCoupon(null), []);

  const clearCart = useCallback(() => {
    setItems([]);
    setActiveCoupon(null);
  }, []);

  const toggleCart = useCallback(() => setIsCartOpen((open) => !open), []);

  const addCombo = useCallback(
    (comboItems: ComboItemInput[], comboDiscount: number) => {
      const discount = Math.max(0, Math.min(100, comboDiscount));
      const built = comboItems.map(({ product, flavor, size, quantity }) =>
        buildItem(
          product,
          flavor,
          size,
          Math.max(1, Math.floor(quantity ?? 1)),
          discount,
        ),
      );
      setItems((prev) => mergeItems(prev, built));
      setIsCartOpen(true);
      showToast("Combo adicionado ao carrinho!");
    },
    [showToast],
  );

  const totals = useMemo(
    () => calculateTotals(items, activeCoupon),
    [items, activeCoupon],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      activeCoupon,
      isCartOpen,
      hydrated,
      ...totals,
      addItem,
      removeItem,
      updateQuantity,
      applyCoupon,
      clearCart,
      toggleCart,
      addCombo,
      removeCoupon,
    }),
    [
      items,
      activeCoupon,
      isCartOpen,
      hydrated,
      totals,
      addItem,
      removeItem,
      updateQuantity,
      applyCoupon,
      clearCart,
      toggleCart,
      addCombo,
      removeCoupon,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}
