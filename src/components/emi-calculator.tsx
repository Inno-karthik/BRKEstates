"use client";

import { useMemo, useState } from "react";
import { Calculator, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function EmiCalculator({ price }: { price: number | null }) {
  const [open, setOpen] = useState(false);
  const [principal, setPrincipal] = useState(price ? Math.round(price * 0.8) : 5000000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  const { emi, totalInterest, totalPayment } = useMemo(() => {
    const r = rate / 12 / 100;
    const n = years * 12;
    if (r === 0) {
      const flatEmi = principal / n;
      return { emi: flatEmi, totalInterest: 0, totalPayment: principal };
    }
    const emiVal = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emiVal * n;
    return { emi: emiVal, totalInterest: total - principal, totalPayment: total };
  }, [principal, rate, years]);

  const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

  return (
    <div className="rounded-2xl border border-black/5 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 p-5"
      >
        <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
          <Calculator size={16} className="text-[var(--color-primary,#7f1d1d)]" /> EMI Calculator
        </h3>
        <ChevronDown size={16} className={cn("text-neutral-400 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-4 px-5 pb-5">
              <Slider label="Loan Amount" value={principal} onChange={setPrincipal} min={100000} max={50000000} step={50000} format={fmt} />
              <Slider label="Interest Rate" value={rate} onChange={setRate} min={5} max={16} step={0.1} format={(n) => `${n.toFixed(1)}%`} />
              <Slider label="Tenure" value={years} onChange={setYears} min={1} max={30} step={1} format={(n) => `${n} yrs`} />

              <div className="rounded-xl bg-[var(--color-primary,#7f1d1d)]/5 p-4 text-center">
                <p className="text-xs text-neutral-500">Monthly EMI</p>
                <p className="text-2xl font-bold text-[var(--color-primary,#7f1d1d)]">{fmt(emi)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center text-xs">
                <div>
                  <p className="text-neutral-400">Total Interest</p>
                  <p className="font-semibold text-neutral-700">{fmt(totalInterest)}</p>
                </div>
                <div>
                  <p className="text-neutral-400">Total Payment</p>
                  <p className="font-semibold text-neutral-700">{fmt(totalPayment)}</p>
                </div>
              </div>
              <p className="text-center text-[10px] text-neutral-400">Indicative only — actual rates vary by lender.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-neutral-600">{label}</span>
        <span className="font-semibold text-neutral-900">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-[var(--color-primary,#7f1d1d)]"
      />
    </div>
  );
}
