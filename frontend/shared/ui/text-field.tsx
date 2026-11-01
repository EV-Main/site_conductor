"use client";

import { type ChangeEvent, useId } from "react";
import { INPUT_CLASS } from "./control";

const LABEL_CLASS =
  "mb-1.5 block font-mono-tech text-[10px] uppercase tracking-[0.2em] text-ink/50";

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  /** Renders a textarea instead of an input. */
  rows?: number;
  error?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}

/**
 * Mono-labelled form control — the "letterhead field" look shared by the
 * application and contact forms. A validation error renders inline and is
 * announced for the control via aria-invalid + aria-describedby.
 */
export function TextField({
  label,
  value,
  onChange,
  maxLength,
  rows,
  error,
  type = "text",
  required,
  placeholder,
}: TextFieldProps) {
  const errorId = useId();
  const shared = {
    value,
    required,
    maxLength,
    placeholder,
    className: INPUT_CLASS,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
  };
  return (
    <label className="block">
      <span className={LABEL_CLASS}>{label}</span>
      {rows ? (
        <textarea rows={rows} {...shared} />
      ) : (
        <input type={type} {...shared} />
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-xs text-accent-error"
        >
          {error}
        </p>
      )}
    </label>
  );
}
