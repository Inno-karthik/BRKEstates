import Script from "next/script";
import type { SiteSettings } from "@/lib/types";

/** Loads Meta Pixel + Google tag only when the admin has configured IDs in Settings. */
export function PixelScripts({ settings }: { settings: SiteSettings }) {
  return (
    <>
      {settings.meta_pixel_id && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
            document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${settings.meta_pixel_id}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {settings.google_tag_id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_tag_id}`}
            strategy="afterInteractive"
          />
          <Script id="google-tag" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${settings.google_tag_id}');
            `}
          </Script>
        </>
      )}
    </>
  );
}
