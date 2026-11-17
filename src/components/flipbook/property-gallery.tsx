"use client";

import { useState } from "react";
import { FileText, Download, Compass } from "lucide-react";
import { PropertyCarousel } from "@/components/flipbook/property-carousel";
import { LeadUnlock } from "@/components/lead-unlock";
import { useUnlock } from "@/components/unlock-context";
import type { VirtualTour } from "@/lib/types";

type Tab = "photos" | "brochure" | number;

export function PropertyGallery({
  title,
  images,
  brochureUrl,
  virtualTours = [],
  propertyId,
}: {
  title: string;
  images: string[];
  brochureUrl?: string | null;
  virtualTours?: VirtualTour[];
  propertyId: string;
}) {
  const [tab, setTab] = useState<Tab>("photos");
  const { unlocked, unlock } = useUnlock();
  const [pdfFailed, setPdfFailed] = useState(false);

  if (images.length === 0 && !brochureUrl && virtualTours.length === 0) return null;

  const showTabs = !!brochureUrl || virtualTours.length > 0;

  return (
    <div>
      {showTabs && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setTab("photos")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              tab === "photos" ? "bg-[var(--color-primary,#9b1c1c)] text-white" : "border border-black/10 text-neutral-600"
            }`}
          >
            Photos
          </button>
          {brochureUrl && (
            <button
              onClick={() => setTab("brochure")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                tab === "brochure" ? "bg-[var(--color-primary,#9b1c1c)] text-white" : "border border-black/10 text-neutral-600"
              }`}
            >
              <FileText size={13} /> Brochure
            </button>
          )}
          {virtualTours.map((v, i) => (
            <button
              key={i}
              onClick={() => setTab(i)}
              className={`flex items-center gap-1.5 truncate rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                tab === i ? "bg-[var(--color-primary,#9b1c1c)] text-white" : "border border-black/10 text-neutral-600"
              }`}
            >
              <Compass size={13} /> {v.title}
            </button>
          ))}
        </div>
      )}

      {tab === "brochure" && brochureUrl && !unlocked ? (
        <LeadUnlock propertyId={propertyId} context="Brochure" onUnlock={unlock} previewImage={images[0]} />
      ) : tab === "brochure" && brochureUrl ? (
        // A native embedded PDF viewer is far more reliable than rasterizing pages to
        // images client-side (that depended on a bundler-sensitive PDF.js worker and
        // CORS-fetching the file, and silently showed "No images available" when either
        // failed). Browsers render PDFs natively; a direct download link covers the rest.
        // The #toolbar=0&navpanes=0&scrollbar=0 fragment hides the browser's own PDF
        // chrome (page thumbnails panel, zoom/print controls) in favor of our own header.
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-[var(--color-primary,#9b1c1c)]/[0.07] to-transparent px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary,#9b1c1c)]/10 text-[var(--color-primary,#9b1c1c)]">
                <FileText size={15} />
              </span>
              Property Brochure
            </div>
            <a
              href={brochureUrl}
              target="_blank"
              rel="noreferrer"
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--color-primary,#9b1c1c)] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
            >
              <Download size={13} /> Download
            </a>
          </div>
          {!pdfFailed ? (
            <object
              data={`${brochureUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              type="application/pdf"
              className="aspect-[4/5] w-full border-t border-black/5 md:aspect-[3/4]"
              onError={() => setPdfFailed(true)}
            >
              <div className="flex aspect-[4/5] flex-col items-center justify-center gap-3 border-t border-black/5 p-6 text-center text-neutral-500 md:aspect-[3/4]">
                <FileText size={28} />
                <p className="text-sm">This browser can&apos;t preview the brochure inline.</p>
                <a
                  href={brochureUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-full bg-[var(--color-primary,#9b1c1c)] px-4 py-2 text-xs font-semibold text-white"
                >
                  <Download size={13} /> Open Brochure PDF
                </a>
              </div>
            </object>
          ) : (
            <div className="flex aspect-[4/5] flex-col items-center justify-center gap-3 border-t border-black/5 p-6 text-center text-neutral-500 md:aspect-[3/4]">
              <FileText size={28} />
              <a
                href={brochureUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-[var(--color-primary,#9b1c1c)] px-4 py-2 text-xs font-semibold text-white"
              >
                <Download size={13} /> Open Brochure PDF
              </a>
            </div>
          )}
        </div>
      ) : typeof tab === "number" && virtualTours[tab] ? (
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          <div className="flex items-center gap-2 bg-gradient-to-r from-[var(--color-primary,#9b1c1c)]/[0.07] to-transparent px-4 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary,#9b1c1c)]/10 text-[var(--color-primary,#9b1c1c)]">
              <Compass size={15} />
            </span>
            <p className="truncate text-sm font-semibold text-neutral-800">{virtualTours[tab].title}</p>
          </div>
          <div
            className="aspect-[4/5] w-full border-t border-black/5 [&_iframe]:h-full [&_iframe]:w-full md:aspect-[3/4]"
            dangerouslySetInnerHTML={{ __html: virtualTours[tab].embed_code }}
          />
        </div>
      ) : images.length === 0 ? (
        <div className="flex aspect-[4/5] items-center justify-center rounded-2xl border border-dashed border-black/10 text-neutral-400">
          No images available
        </div>
      ) : (
        <PropertyCarousel images={images} title={title} />
      )}
    </div>
  );
}
