import Image from "next/image";
import type { Model3DConfig } from "@/types/product";

interface ProductThumbProps {
  type: Model3DConfig["type"];
  color: string;
  className?: string;
  productId?: string;
  imageUrl?: string;
  alt?: string;
  sizes?: string;
}

const PRODUCT_IMAGE_FALLBACKS: Record<string, string> = {
  "under-labz-dimethylex": "/products/under-labz-dimethylex.png",
  "adaptogen-tasty-whey-original": "/products/adaptogen-tasty-whey-original.png",
  "vitafor-whey-fort-3w": "/products/vitafor-whey-fort-3w-baunilha.png",
  "vitafor-whey-protein-wpc": "/products/vitafor-whey-protein-wpc.png",
  "vitafor-creafort": "/products/vitafor-creafort.png",
  "vitafor-creatina": "/products/vitafor-creatina-300g.png",
  "growth-creatina-monohidratada": "/products/growth-creatina-monohidratada-500g.png",
  "growth-creatina-creapure": "/products/growth-creatina-creapure-250g.png",
  "growth-arginine-powder": "/products/growth-arginine-powder.png",
  "bvs-beast-kaos": "/products/bvs-beast-kaos.png",
  "demons-lab-psycho-killer": "/products/demons-lab-psycho-killer.png",
  "diabo-verde-ftw-whey": "/products/diabo-verde-ftw-whey.png",
  "vitamin-horse-anabolic-mass": "/products/vitamin-horse-mass-3kg.png",
  "nutrata-protobar": "/products/nutrata-protobar-avela.png",
  "nutrata-yopro-plus": "/products/nutrata-yopro-plus.png",
  "probiotica-iso-protein-blend": "/products/probiotica-iso-protein-blend.png",
  "probiotica-whey-bar": "/products/probiotica-whey-bar.png",
  "uevo-uevolucao-proteina": "/products/uevo-uevolucao-proteina.png",
  "max-super-gainers": "/products/max-super-gainers.png",
  "max-horus-elite": "/products/max-horus-elite.png",
  "max-whey-pro": "/products/max-whey-pro-1kg.png",
  "max-100-whey-double-tasty": "/products/max-100-whey-double-tasty.png",
  "max-femini-whey": "/products/max-femini-whey.png",
  "max-super-whey": "/products/max-super-whey.png",
  "im-whey-100-pure": "/products/im-whey-100-pure.png",
  "im-creatina-hardcore": "/products/im-creatina-hardcore-300g.png",
  "danone-yopro-shake-morango": "/products/danone-yopro-shake-morango.png",
  "italac-pro-play": "/products/italac-pro-play.png",
  "vigor-viv-chocolate": "/products/vigor-viv-chocolate.png",
  "biovigor-curcumen": "/products/biovigor-curcumen.png",
  "gecaps-magnesio-inositol": "/products/gecaps-magnesio-inositol.png",
  "dux-creatina-creapure": "/products/dux-creatina-creapure-300g.png",
  "max-creatina-100": "/products/max-creatina-300g.png",
};

export default function ProductThumb({
  type,
  color,
  className = "",
  productId,
  imageUrl,
  alt = "Produto LuhGab",
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: ProductThumbProps) {
  const resolvedImage = imageUrl || (productId ? PRODUCT_IMAGE_FALLBACKS[productId] : undefined);
  // "#" não é válido dentro de um id referenciado por url(#...)
  const colorKey = color.replace(/[^a-zA-Z0-9]/g, "");

  if (resolvedImage) {
    return (
      <div className={`relative flex items-center justify-center p-2 ${className}`}>
        <Image
          src={resolvedImage}
          alt={alt}
          width={1000}
          height={1000}
          sizes={sizes}
          className="h-full w-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)] transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={`relative flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_40%,rgba(0,0,0,0.03),transparent_65%)] ${className}`}
    >
      <svg viewBox="0 0 140 140" className="h-[85%] w-[85%] drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)]">
        <defs>
          <linearGradient id={`grad-tub-${colorKey}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#18181B" />
            <stop offset="35%" stopColor="#27272A" />
            <stop offset="65%" stopColor="#18181B" />
            <stop offset="100%" stopColor="#09090B" />
          </linearGradient>
          <linearGradient id={`grad-lid-${colorKey}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3F3F46" />
            <stop offset="50%" stopColor="#71717A" />
            <stop offset="100%" stopColor="#27272A" />
          </linearGradient>
          <linearGradient id={`grad-label-${colorKey}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.95" />
            <stop offset="100%" stopColor="#09090B" />
          </linearGradient>
          <linearGradient id="grad-gold-rim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#CA8A04" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
        </defs>

        {(type === "whey-tub" || type === "cutout") && (
          <g>
            <ellipse cx="70" cy="126" rx="36" ry="6" fill="#000000" opacity="0.2" />
            <rect x="42" y="20" width="56" height="15" rx="3" fill={`url(#grad-lid-${colorKey})`} />
            <rect x="45" y="24" width="50" height="2" fill="#A1A1AA" opacity="0.4" />
            <rect x="42" y="33" width="56" height="2" fill="url(#grad-gold-rim)" />
            <path
              d="M 37 36 Q 37 35 45 35 L 95 35 Q 103 35 103 36 L 100 120 Q 100 125 90 125 L 50 125 Q 40 125 40 120 Z"
              fill={`url(#grad-tub-${colorKey})`}
            />
            <path
              d="M 39 52 L 101 52 L 99 98 L 41 98 Z"
              fill={`url(#grad-label-${colorKey})`}
            />
            <rect x="45" y="58" width="50" height="3" fill="#FFFFFF" opacity="0.8" rx="1.5" />
            <rect x="45" y="65" width="30" height="3" fill="#FFFFFF" opacity="0.6" rx="1.5" />
            <rect x="45" y="72" width="20" height="2" fill="#FFFFFF" opacity="0.4" rx="1" />
            <path d="M 46 36 L 46 122" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.15" strokeLinecap="round" />
          </g>
        )}

        {type === "creatine-jar" && (
          <g>
            <ellipse cx="70" cy="124" rx="42" ry="6" fill="#000000" opacity="0.2" />
            <rect x="35" y="36" width="70" height="14" rx="3" fill={`url(#grad-lid-${colorKey})`} />
            <rect x="35" y="48" width="70" height="2" fill="url(#grad-gold-rim)" />
            <rect x="32" y="50" width="76" height="70" rx="6" fill={`url(#grad-tub-${colorKey})`} />
            <rect x="34" y="62" width="72" height="46" rx="3" fill={`url(#grad-label-${colorKey})`} />
            <rect x="40" y="68" width="40" height="4" fill="#FFFFFF" opacity="0.9" rx="1" />
            <rect x="40" y="76" width="25" height="3" fill="#FFFFFF" opacity="0.6" rx="1" />
            <path d="M 40 50 L 40 118" stroke="#FFFFFF" strokeWidth="2" opacity="0.15" />
          </g>
        )}

        {type === "capsule-bottle" && (
          <g>
            <ellipse cx="70" cy="122" rx="30" ry="5" fill="#000000" opacity="0.2" />
            <rect x="52" y="18" width="36" height="16" rx="3" fill="url(#grad-gold-rim)" />
            <path d="M 52 34 L 88 34 L 92 48 L 48 48 Z" fill="#1C1917" />
            <rect x="46" y="48" width="48" height="72" rx="8" fill={`url(#grad-tub-${colorKey})`} />
            <rect x="48" y="60" width="44" height="48" rx="2" fill={`url(#grad-label-${colorKey})`} />
            <rect x="53" y="66" width="34" height="3" fill="#FFFFFF" opacity="0.85" rx="1" />
            <rect x="53" y="73" width="24" height="3" fill="#FFFFFF" opacity="0.6" rx="1" />
            <path d="M 52 48 L 52 118" stroke="#FFFFFF" strokeWidth="2" opacity="0.18" />
          </g>
        )}
      </svg>
    </div>
  );
}
