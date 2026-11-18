import { LegalPage } from "@/components/legal-page";
import { getSiteSettings } from "@/lib/queries";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Important information about the accuracy of project and property information on BKR Estates.",
  alternates: { canonical: "/disclaimer" },
};

export default async function DisclaimerPage() {
  const settings = await getSiteSettings();

  return (
    <LegalPage title="Disclaimer" updated="October 2026">
      <p>
        {settings.site_name} is a real estate advisory and sales-facilitation company representing property owners,
        developers and ventures, and guiding buyers and investors. Please read this disclaimer carefully before relying on any
        information presented on this website.
      </p>

      <h2>Project Information</h2>
      <p>
        Property details — including price, area, specifications, amenities, images, floor/layout plans and
        availability — are provided by the respective property owner, developer or venture management, and are
        displayed on this site in good faith. {settings.site_name} does not independently verify every detail and
        makes no warranty, express or implied, as to the accuracy, completeness or current status of this
        information.
      </p>

      <h2>Certifications &amp; Approvals</h2>
      <p>
        Certifications, approvals, registration numbers (such as RERA, VUDA, DTCP or similar) and related
        documents displayed on a property page are based on information provided by the respective developer,
        owner or venture management. {settings.site_name} does not independently certify or guarantee the
        accuracy, authenticity, validity or current status of such information. Buyers are advised to verify all
        relevant approvals and documents directly — at the time of a site visit or any decision-making meeting —
        before making any purchase decision.
      </p>

      <h2>No Investment or Legal Advice</h2>
      <p>
        Nothing on this website constitutes financial, investment or legal advice. Prices, area calculations
        (including per-sqft/sqyd rates) and EMI estimates shown are indicative only and may vary. You should
        conduct your own due diligence, including site visits, legal verification of title and approvals, and
        consultation with qualified professionals, before making any purchase or investment decision.
      </p>

      <h2>Third-Party Content</h2>
      <p>
        Maps, routing and location data are provided by third-party map services and may not always be fully
        accurate. Pin locations marked as &quot;approximate&quot; are indicative only.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you believe any information on this site is inaccurate, please let us know so we can review it.
        {settings.email && (
          <>
            {" "}
            Email: <a href={`mailto:${settings.email}`}>{settings.email}</a>
          </>
        )}
        {settings.phone && <> · Phone: {settings.phone}</>}
      </p>
    </LegalPage>
  );
}
