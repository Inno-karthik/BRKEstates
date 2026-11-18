import { LegalPage } from "@/components/legal-page";
import { getSiteSettings } from "@/lib/queries";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that govern your use of the BKR Estates website.",
  alternates: { canonical: "/terms-and-conditions" },
};

export default async function TermsPage() {
  const settings = await getSiteSettings();

  return (
    <LegalPage title="Terms &amp; Conditions" updated="October 2026">
      <p>
        These Terms &amp; Conditions govern your use of the {settings.site_name} website. By using this site, you
        agree to these terms. If you do not agree, please do not use the site.
      </p>

      <h2>Use of the Website</h2>
      <p>
        This website is provided to help you explore the projects and properties we represent and get in touch with {settings.site_name}.
        You agree to use it only for lawful purposes and not to misuse, scrape, or attempt to disrupt the site.
      </p>

      <h2>Listings Are Not an Offer</h2>
      <p>
        Property listings, prices, availability and specifications shown on this site are for informational
        purposes and do not constitute a legal offer. Prices, availability and specifications are subject to
        change without notice and should be independently confirmed before making any decision.
      </p>

      <h2>No Guarantee of Accuracy</h2>
      <p>
        While we make reasonable efforts to keep listing information accurate and up to date, {settings.site_name}
        does not guarantee the completeness, accuracy or current status of any listing, image, specification or
        document displayed on this site. Information is sourced from property owners, developers and public
        records and may change.
      </p>

      <h2>Intellectual Property</h2>
      <p>
        All content on this site — including text, images, logos and design — is owned by or licensed to{" "}
        {settings.site_name} and may not be reproduced without permission, except as necessary to use the site
        normally.
      </p>

      <h2>Third-Party Links</h2>
      <p>
        This site may link to third-party services (such as maps or messaging apps). We are not responsible for
        the content or practices of those third-party services.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        {settings.site_name} is not liable for any loss or damage arising from reliance on information provided on
        this website. Any transaction for a property is between the buyer and the respective owner/developer, and
        is subject to its own separate terms, agreements and due diligence.
      </p>

      <h2>Changes to These Terms</h2>
      <p>We may update these terms from time to time. Continued use of the site after changes means you accept the updated terms.</p>

      <h2>Contact Us</h2>
      <p>
        {settings.email && (
          <>
            Email: <a href={`mailto:${settings.email}`}>{settings.email}</a>
            <br />
          </>
        )}
        {settings.phone && <>Phone: {settings.phone}</>}
      </p>
    </LegalPage>
  );
}
