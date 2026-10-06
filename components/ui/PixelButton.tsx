import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "cream" | "mint" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export function buttonClass(variant: ButtonVariant = "cream", size: Size = "md", className?: string) {
  return cn("px-btn", variant !== "cream" && `px-btn-${variant}`, size !== "md" && `px-btn-${size}`, className);
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: Size;
  href?: string;
  external?: boolean;
  children: ReactNode;
};

export function PixelButton({ variant, size, href, external, className, children, type, ...rest }: Props) {
  const cls = buttonClass(variant, size, className);
  if (href) {
    return external ? (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ) : (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type ?? "button"} className={cls} {...rest}>
      {children}
    </button>
  );
}
