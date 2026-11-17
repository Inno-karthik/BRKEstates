import { LegalPage } from "@/components/legal-page";
import { getSiteSettings } from "@/lib/queries";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How BRK Estates collects, uses and protects your information.",
  alternates: { canonical: "/privacy-policy" },
};

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();

  return (
    <LegalPage title="Privacy Policy" updated="October 2026">
      <p>
        {settings.site_name} (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) respects your privacy. This Privacy Policy explains what
        information we collect when you use this website, how we use it, and the choices you have.
      </p>

      <h2>Information We Collect</h2>
      <ul>
        <li>Contact details you submit through enquiry, contact or callback forms (name, phone, email, message).</li>
        <li>Basic usage data (pages visited, device/browser type, approximate location from IP) via standard analytics.</li>
        <li>Cookies used to remember recently viewed and favorited properties, and to measure ad performance.</li>
      </ul>

      <h2>How We Use Information</h2>
      <ul>
        <li>To respond to enquiries and connect you with the right property or team member.</li>
        <li>To improve the site and understand which listings and pages are useful.</li>
        <li>To measure the effectiveness of our marketing campaigns.</li>
      </ul>

      <h2>Sharing</h2>
      <p>
        We do not sell your personal information. We may share enquiry details with the property owner/developer
        relevant to your enquiry, and with service providers who help us operate the site (such as hosting and
        communication tools), under confidentiality obligations.
      </p>

      <h2>Cookies</h2>
      <p>
        We use cookies for essential site functionality and, where enabled, for analytics and advertising. You can
        control cookies through your browser settings.
      </p>

      <h2>Your Choices</h2>
      <p>
        You may ask us to access, correct or delete the personal information you have shared with us by contacting
        us using the details below.
      </p>

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
