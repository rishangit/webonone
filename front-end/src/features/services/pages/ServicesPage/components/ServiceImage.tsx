import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";
import { ServiceImageProps } from "../types";

const FALLBACK_SRC =
  "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop";

export const ServiceImage = ({ imageUrl, serviceName, variant = "grid" }: ServiceImageProps) => {
  const [src, setSrc] = useState(() => imageUrl?.trim() || FALLBACK_SRC);

  useEffect(() => {
    setSrc(imageUrl?.trim() || FALLBACK_SRC);
  }, [imageUrl]);

  const imgClass =
    variant === "list"
      ? "absolute inset-0 h-full w-full object-cover"
      : "h-full w-full object-cover group-hover:scale-105 transition-transform duration-300";

  const placeholder = (
    <div
      className={
        variant === "list"
          ? "absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground"
          : "flex h-48 items-center justify-center bg-muted text-muted-foreground"
      }
      aria-hidden
    >
      <ImageIcon className="h-10 w-10 opacity-50" />
    </div>
  );

  if (!src) {
    return placeholder;
  }

  const img = (
    <img
      src={src}
      alt={serviceName}
      className={imgClass}
      onError={() => setSrc((current) => (current === FALLBACK_SRC ? "" : FALLBACK_SRC))}
    />
  );

  if (variant === "list") {
    return img;
  }

  return <div className="relative h-48 overflow-hidden">{img}</div>;
};