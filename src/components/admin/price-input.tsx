"use client";

import { useEffect, useState } from "react";

function sanitize(input: string) {
  let cleaned = input.replace(/[^0-9.,]/g, "").replace(/,/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot !== -1) {
    cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
  }
  return cleaned;
}

function formatDisplay(raw: string) {
  const [intPart, decPart] = raw.split(".");
  const grouped = intPart ? Number(intPart).toLocaleString("en-IN") : "";
  return decPart !== undefined ? `${grouped}.${decPart}` : grouped;
}

/** Plain-rupee price entry — only digits, commas and a decimal point can be typed,
 *  and the value is reformatted with Indian comma grouping as you go, so admins can
 *  see at a glance whether they typed 65,00,000 or accidentally fat-fingered a digit. */
export function PriceInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  className?: string;
}) {
  const [text, setText] = useState(value != null ? formatDisplay(String(value)) : "");

  useEffect(() => {
    // Only resync when the underlying value changes from outside this input.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setText(value != null ? formatDisplay(String(value)) : "");
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const cleaned = sanitize(e.target.value);
    setText(formatDisplay(cleaned));
    onChange(cleaned === "" || cleaned === "." ? null : Number(cleaned));
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={text}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
}
