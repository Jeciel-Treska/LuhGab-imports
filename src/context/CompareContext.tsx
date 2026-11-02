"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useToast } from "@/components/Toast";

export const MAX_COMPARE = 3;

interface CompareContextValue {
  ids: string[];
  isOpen: boolean;
  isSelected: (id: string) => boolean;
  isFull: boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [ids, setIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(
    (id: string) => {
      if (!ids.includes(id) && ids.length >= MAX_COMPARE) {
        showToast(`Você pode comparar até ${MAX_COMPARE} produtos.`, "info");
        return;
      }
      setIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
      );
    },
    [ids, showToast],
  );

  const remove = useCallback((id: string) => {
    setIds((prev) => prev.filter((i) => i !== id));
  }, []);

  const clear = useCallback(() => {
    setIds([]);
    setIsOpen(false);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CompareContextValue>(
    () => ({
      ids,
      isOpen: isOpen && ids.length >= 2,
      isSelected: (id) => ids.includes(id),
      isFull: ids.length >= MAX_COMPARE,
      toggle,
      remove,
      clear,
      open,
      close,
    }),
    [ids, isOpen, toggle, remove, clear, open, close],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare deve ser usado dentro de CompareProvider");
  return ctx;
}
