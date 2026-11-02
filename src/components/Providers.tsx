"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { CompareProvider } from "@/context/CompareContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ToastProvider } from "@/components/Toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <WishlistProvider>
        <CartProvider>
          
            <CompareProvider>{children}</CompareProvider>
          
        </CartProvider>
      </WishlistProvider>
    </ToastProvider>
  );
}
