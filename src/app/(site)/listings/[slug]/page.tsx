import { notFound } from "next/navigation";
import { MapPin, Ruler, Phone } from "lucide-react";
import { PageTheme } from "@/components/theme-style";
import { Icon } from "@/components/icon";
import { PropertyGallery } from "@/components/flipbook/property-gallery";
import { LayoutImagesGated } from "@/components/layout-images-gated";
import { UnlockProvider } from "@/components/unlock-context";
import { AttributesGrid, AmenitiesGrid } from "@/components/property-attributes";
import { EnquiryForm } from "@/components/enquiry-form";
import { TrackView } from "@/components/track-view";
import { PropertyCard } from "@/components/property-card";
import { PropertyMap } from "@/components/property-map";
import { NearbyExplorer } from "@/components/nearby-explorer";
import { UnitVariantSelector } from "@/components/unit-variant-selector";
import { EmbedBlock } from "@/components/embed-block";
import { TrackedLink } from "@/components/tracked-link";
import { WhatsappIcon } from "@/components/social-icons";
import { ShareButton } from "@/components/share-button";
import { EmiCalculator } from "@/components/emi-calculator";
import { StickyMobileCta } from "@/components/sticky-mobile-cta";
import { MatchHeightProvider, HeightReporter } from "@/components/match-height";
import { DescriptionProvider, DescriptionPreview, DescriptionFull } from "@/components/property-description";
import { SetChatPropertyContext } from "@/components/chatbot/chat-context";
import { getAttributeDefinitions, getPropertyBySlug, getSiteSettings, listProperties } from "@/lib/queries";
import { formatInventoryStat, formatPrice, formatPriceParts } from "@/lib/utils";
import { getColorScheme } from "@/lib/color-schemes";
import type { Metadata } from "next";
import type { CSSProperties } from "react";

// ISR via the R2 incremental cache doesn't reliably pick up revalidatePath() from admin
// actions yet (edits weren't showing up live), so this stays dynamic for now.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return {};

  const locationStr = [property.location, property.city, property.state].filter(Boolean).join(", ");
  const priceStr = formatPrice(property.price, property.price_label, false, property.area_unit, property.property_type?.slug);
  const areaStr = formatInventoryStat(
    property.property_type?.slug,
    property.total_units,
    property.area_value,
    property.area_unit,
    property.area_value_max,
    property.unit_variants
  );
  const descriptionText = property.description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  // AEO-friendly: a factual one-line answer to "what is this, where, how much" up front.
  const autoDescription =
    descriptionText?.slice(0, 155) ||
    `${property.property_type?.name ?? "Property"} for sale${locationStr ? ` in ${locationStr}` : ""} — ${priceStr}${areaStr ? `, ${areaStr}` : ""}. Listed by BRK Estates.`;
  const title = property.meta_title || property.title;
  const description = property.meta_description || autoDescription;
  const cover = property.cover_image || property.images?.[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: `/listings/${property.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: cover ? [{ url: cover, width: 1200, height: 900 }] : undefined,
    },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title,
      description,
      images: cover ? [cover] : undefined,
    },
  };
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const [definitions, related, settings] = await Promise.all([
    getAttributeDefinitions(property.type_id),
    listProperties({ typeSlug: property.property_type?.slug, pageSize: 4 }),
    getSiteSettings(),
  ]);

  const images = property.images?.map((i) => i.url) ?? (property.cover_image ? [property.cover_image] : []);
  const area = formatInventoryStat(
    property.property_type?.slug,
    property.total_units,
    property.area_value,
    property.area_unit,
    property.area_value_max,
    property.unit_variants
  );
  const relatedProperties = related.properties.filter((p) => p.id !== property.id).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || undefined,
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://brkestates.com"}/listings/${property.slug}`,
    image: images,
    address: {
      "@type": "PostalAddress",
      addressLocality: property.city ?? undefined,
      addressRegion: property.state ?? undefined,
      streetAddress: property.location ?? undefined,
      addressCountry: "IN",
    },
    ...(property.latitude != null && property.longitude != null
      ? { geo: { "@type": "GeoCoordinates", latitude: property.latitude, longitude: property.longitude } }
      : {}),
    ...(property.price
      ? { offers: { "@type": "Offer", price: property.price, priceCurrency: "INR", availability: "https://schema.org/InStock" } }
      : {}),
  };

  const scheme = getColorScheme(property.color_scheme);
  const schemeVars = {
    "--color-primary": scheme.primary,
    "--color-secondary": scheme.secondary,
    "--color-accent": scheme.accent,
  } as CSSProperties;

  return (
    <PageTheme page="property_detail" style={schemeVars}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TrackView propertyId={property.id} price={property.price} title={property.title} />
      <SetChatPropertyContext id={property.id} title={property.title} slug={property.slug} />
      <UnlockProvider propertyId={property.id}>
      <div className="mx-auto max-w-7xl px-4 py-8 pb-24 md:px-8 md:py-12 md:pb-12">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-[7fr_3fr] sm:items-start sm:gap-6">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {property.property_type && (
                <span
                  className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    background: `${property.property_type.accent_color ?? "#1b5e3a"}1a`,
                    color: property.property_type.accent_color ?? "#1b5e3a",
                  }}
                >
                  {property.property_type.name}
                </span>
              )}
              {property.status === "sold" && (
                <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">Sold</span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">{property.title}</h1>
            {(property.location || property.city) && (
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-neutral-500">
                <MapPin size={14} />
                {[property.location, property.city, property.state].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
          <div className="min-w-0 sm:text-right">
            {(() => {
              const priceParts = formatPriceParts(property.price, property.price_label, true, property.area_unit, property.property_type?.slug);
              return (
                <>
                  {priceParts.prefix && (
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{priceParts.prefix}</p>
                  )}
                  <p className="text-2xl font-extrabold tracking-tight text-[var(--color-primary,#1b5e3a)] md:text-3xl">
                    {priceParts.amount}
                    {priceParts.suffix && <span className="text-base font-normal text-neutral-500 md:text-lg">{priceParts.suffix}</span>}
                  </p>
                </>
              );
            })()}
            {area && (
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-neutral-500 sm:justify-end">
                <Ruler size={12} /> {area}
              </p>
            )}
            {property.available_units != null && (
              <p className="mt-1 text-xs font-semibold text-emerald-600">
                {property.available_units} of {property.total_units ?? property.available_units} available
              </p>
            )}
          </div>
        </div>

        <MatchHeightProvider>
        <DescriptionProvider>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <PropertyGallery
              title={property.title}
              images={images}
              brochureUrl={property.brochure?.pdf_url}
              virtualTours={property.virtual_tours}
              propertyId={property.id}
            />

            {property.description && <DescriptionPreview html={property.description} />}

            {definitions.length > 0 && (
              <div id="specifications" className="scroll-mt-20 md:scroll-mt-24">
                <h2 className="mb-3 text-lg font-semibold text-neutral-900">Specifications</h2>
                <AttributesGrid attributes={property.attributes} definitions={definitions} />
              </div>
            )}

            {(property.amenities?.length ?? 0) > 0 && (
              <div id="amenities" className="scroll-mt-20 md:scroll-mt-24">
                <h2 className="mb-3 text-lg font-semibold text-neutral-900">Amenities</h2>
                <AmenitiesGrid amenities={property.amenities!} />
              </div>
            )}

            {(() => {
              const publicCerts = property.certifications?.filter((c) => c.show_publicly && c.type.trim()) ?? [];
              if (publicCerts.length === 0) return null;
              return (
                <div>
                  <h2 className="mb-3 text-lg font-semibold text-neutral-900">Certifications &amp; Approvals</h2>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {publicCerts.map((c, i) => (
                      <div key={i} className="rounded-xl border border-black/5 bg-neutral-50 p-3">
                        <p className="text-sm font-semibold text-neutral-900">{c.type}</p>
                        {c.number && <p className="mt-0.5 text-xs text-neutral-500">No. {c.number}</p>}
                        {c.date_issued && (
                          <p className="mt-0.5 text-xs text-neutral-400">
                            Issued {new Date(c.date_issued).toLocaleDateString("en-IN", { year: "numeric", month: "short" })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">
                    Disclaimer: The certifications, approvals, registration numbers and related documents displayed
                    on this page are based on information provided by the respective property developer, owner or
                    venture management. BRK Estates does not independently certify or guarantee the accuracy,
                    authenticity, validity or current status of such information. Buyers are advised to verify all
                    relevant approvals and documents directly at the time of site visit or any decision making
                    meetings — before making any purchase decision.
                  </p>
                </div>
              );
            })()}

            {property.growth_highlights?.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-semibold text-neutral-900">Future Growth, Near &amp; Around</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {property.growth_highlights.map((g, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-black/5 bg-gradient-to-br from-[var(--color-primary,#1b5e3a)]/[0.05] to-transparent p-3.5"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary,#1b5e3a)]/10 text-[var(--color-primary,#1b5e3a)]">
                        <Icon name={g.icon} fallback="trending-up" size={16} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-neutral-900">{g.title}</p>
                        {g.subtitle && <p className="mt-0.5 text-xs text-neutral-500">{g.subtitle}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legacy single-embed fallback — superseded by the tabbed virtual tours in
                PropertyGallery above; only shows for older properties that still have
                this set and haven't been migrated to the new multi-tour list. */}
            {(!property.virtual_tours || property.virtual_tours.length === 0) && property.embed_code && (
              <EmbedBlock code={property.embed_code} />
            )}

            {property.unit_variants?.length > 0 && <UnitVariantSelector variants={property.unit_variants} />}

            {property.latitude != null && property.longitude != null ? (
              <div id="nearby-map" className="scroll-mt-20 md:scroll-mt-24">
                <h2 className="mb-3 text-lg font-semibold text-neutral-900">Location &amp; Nearby</h2>
                <NearbyExplorer
                  latitude={property.latitude}
                  longitude={property.longitude}
                  title={property.title}
                  nearbyPlaces={property.nearby_places ?? []}
                />
              </div>
            ) : property.map_precision === "locality" ? (
              <div>
                <h2 className="mb-3 text-lg font-semibold text-neutral-900">Location</h2>
                <PropertyMap latitude={null} longitude={null} precision={property.map_precision} title={property.title} />
              </div>
            ) : null}

            {property.layout_images?.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-semibold text-neutral-900">Layout &amp; Floor Plans</h2>
                <LayoutImagesGated propertyId={property.id} propertyTitle={property.title} layoutImages={property.layout_images} />
              </div>
            )}

            {property.description && <DescriptionFull html={property.description} />}
          </div>

          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <HeightReporter>
              <EnquiryForm propertyId={property.id} propertyTitle={property.title} variants={property.unit_variants} />
            </HeightReporter>
            <div className="grid grid-cols-2 gap-3">
              {settings.phone && (
                <TrackedLink
                  href={`tel:${settings.phone}`}
                  event="call_click"
                  propertyId={property.id}
                  className="flex items-center justify-center gap-2 rounded-full border border-black/10 py-2.5 text-sm font-medium text-neutral-700 hover:border-neutral-300"
                >
                  <Phone size={15} /> Call
                </TrackedLink>
              )}
              {settings.whatsapp && (
                <TrackedLink
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Hi, I'm interested in ${property.title}`
                  )}`}
                  event="whatsapp_click"
                  propertyId={property.id}
                  className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-2.5 text-sm font-medium text-white"
                >
                  <WhatsappIcon size={15} className="text-white" /> WhatsApp
                </TrackedLink>
              )}
            </div>
            <ShareButton title={property.title} />
            {property.price != null && (
              <div id="emi-calculator" className="scroll-mt-20 md:scroll-mt-24">
                <EmiCalculator price={property.price} />
              </div>
            )}
          </div>
        </div>
        </DescriptionProvider>
        </MatchHeightProvider>

        {relatedProperties.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 text-xl font-bold text-neutral-900">Similar Properties</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProperties.map((p, i) => (
                <PropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
      </UnlockProvider>

      <StickyMobileCta
        propertyId={property.id}
        phone={settings.phone}
        whatsapp={settings.whatsapp}
        title={property.title}
        variants={property.unit_variants}
      />
    </PageTheme>
  );
}
