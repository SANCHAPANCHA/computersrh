import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  hint?: ReactNode;
  error?: string | null;
}

function Field({ id, label, hint, error, children }: FieldProps & { id: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="px-label">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-sm text-red" role="alert">
          ✕ {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-faint">{hint}</p>
      ) : null}
    </div>
  );
}

export function PixelInput({ label, hint, error, id, name, className, ...rest }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const fid = id ?? name ?? label;
  return (
    <Field id={fid} label={label} hint={hint} error={error}>
      <input id={fid} name={name} className={cn("px-input", className)} aria-invalid={error ? true : undefined} aria-describedby={error ? `${fid}-err` : undefined} {...rest} />
    </Field>
  );
}

export function PixelSelect({ label, hint, error, id, name, className, children, ...rest }: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const fid = id ?? name ?? label;
  return (
    <Field id={fid} label={label} hint={hint} error={error}>
      <select id={fid} name={name} className={cn("px-input", className)} {...rest}>
        {children}
      </select>
    </Field>
  );
}

export function PixelTextarea({ label, hint, error, id, name, className, ...rest }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const fid = id ?? name ?? label;
  return (
    <Field id={fid} label={label} hint={hint} error={error}>
      <textarea id={fid} name={name} className={cn("px-input resize-none", className)} {...rest} />
    </Field>
  );
}
