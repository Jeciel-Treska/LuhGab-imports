"use client";

interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}

/** Switch acessível (role="switch") no padrão esmeralda do painel. */
export default function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex min-h-11 items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40"
    >
      <span
        aria-hidden
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
          checked ? "bg-emerald-600" : "bg-zinc-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-[1.375rem]" : "translate-x-0.5"
          }`}
        />
      </span>
      <span className={`text-sm font-medium ${checked ? "text-zinc-950" : "text-zinc-600"}`}>{label}</span>
    </button>
  );
}
