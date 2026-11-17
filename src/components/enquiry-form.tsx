"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitLead, type LeadFormState } from "@/app/(site)/listings/[slug]/actions";
import { getStoredUtm, type UtmData } from "@/lib/utm";
import { trackConversion } from "@/lib/pixels";
import type { UnitVariant } from "@/lib/types";

const initialState: LeadFormState = { ok: false };

export function EnquiryForm({
  propertyId,
  propertyTitle,
  variants,
  bare = false,
}: {
  propertyId?: string;
  propertyTitle?: string;
  variants?: UnitVariant[];
  /** Drop the card chrome + heading when the form is already inside its own sheet/modal. */
  bare?: boolean;
}) {
  const [state, formAction, pending] = useActionState(submitLead, initialState);
  const [utm, setUtm] = useState<UtmData>({});
  const [variant, setVariant] = useState(variants?.[0]?.label ?? "");

  useEffect(() => {
    // UTM params are read from the URL/cookies, which aren't available on the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUtm(getStoredUtm());
  }, []);

  useEffect(() => {
    if (state.ok) trackConversion("Lead", { property_id: propertyId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok]);

  // Pre-fills the message with the property (and chosen variant, if any) so a lead
  // identifies what it's about even if the visitor doesn't type anything themselves.
  const defaultMessage = useMemo(() => {
    if (!propertyTitle) return "";
    return variant ? `Enquiry about ${propertyTitle} — ${variant}` : `Enquiry about ${propertyTitle}`;
  }, [propertyTitle, variant]);

  if (state.ok) {
    return (
      <div
        className={
          bare
            ? "flex flex-col items-center gap-2 py-4 text-center"
            : "flex flex-col items-center gap-2 rounded-2xl border border-black/5 bg-white p-6 text-center"
        }
      >
        <CheckCircle2 className="text-[var(--color-primary,#9b1c1c)]" size={32} />
        <p className="font-semibold text-neutral-900">Thank you!</p>
        <p className="text-sm text-neutral-500">We&apos;ve received your enquiry and will reach out shortly.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className={bare ? "space-y-3" : "space-y-3 rounded-2xl border border-black/5 bg-white p-5"}>
      {!bare && (
        <h3 className="text-base font-semibold text-neutral-900">
          {propertyTitle ? `Enquire about this property` : "Get in touch"}
        </h3>
      )}
      {propertyId && <input type="hidden" name="propertyId" value={propertyId} />}
      {variant && <input type="hidden" name="variant" value={variant} />}
      {utm.utm_source && <input type="hidden" name="utmSource" value={utm.utm_source} />}
      {utm.utm_medium && <input type="hidden" name="utmMedium" value={utm.utm_medium} />}
      {utm.utm_campaign && <input type="hidden" name="utmCampaign" value={utm.utm_campaign} />}
      {utm.utm_content && <input type="hidden" name="utmContent" value={utm.utm_content} />}
      {utm.utm_term && <input type="hidden" name="utmTerm" value={utm.utm_term} />}
      {utm.landing_page && <input type="hidden" name="landingPage" value={utm.landing_page} />}

      <input
        name="name"
        required
        placeholder="Your name"
        className="w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary,#9b1c1c)]"
      />
      <input
        name="phone"
        required
        placeholder="Phone number"
        className="w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary,#9b1c1c)]"
      />
      <input
        name="email"
        type="email"
        placeholder="Email (optional)"
        className="w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary,#9b1c1c)]"
      />
      {variants && variants.length > 0 && (
        <select
          value={variant}
          onChange={(e) => setVariant(e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary,#9b1c1c)]"
        >
          {variants.map((v, i) => (
            <option key={i} value={v.label}>
              Interested in: {v.label}
            </option>
          ))}
        </select>
      )}
      <textarea
        key={defaultMessage}
        name="message"
        rows={3}
        defaultValue={defaultMessage}
        placeholder="Message (optional)"
        className="w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary,#9b1c1c)]"
      />

      {state.error && <p className="text-xs text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary,#9b1c1c)] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending && <Loader2 size={15} className="animate-spin" />}
        Send Enquiry
      </button>
    </form>
  );
}
