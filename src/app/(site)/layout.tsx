import { Navbar } from "@/components/nav/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav, MobileBottomNavSpacer } from "@/components/nav/mobile-bottom-nav";
import { CookieConsent } from "@/components/cookie-consent";
import { PixelScripts } from "@/components/pixel-scripts";
import { UtmCapture } from "@/components/utm-capture";
import { CompareBar } from "@/components/compare-bar";
import { PopupDisplay } from "@/components/popup-display";
import { ChatWidget } from "@/components/chatbot/chat-widget";
import { ChatContextProvider } from "@/components/chatbot/chat-context";
import { HideOnMapRoute } from "@/components/hide-on-map-route";
import { getActiveLocations, getActivePropertyTypes, getSiteSettings } from "@/lib/queries";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Fetched once here and passed down as props — Navbar/Footer/PixelScripts/WhatsappFloat
  // used to each independently await the same two queries, and relying on React's cache()
  // to dedupe them across components wasn't reliably parallelizing on the Workers runtime,
  // adding seconds of avoidable round-trip latency to every page.
  const [types, locations, settings] = await Promise.all([
    getActivePropertyTypes(),
    getActiveLocations(),
    getSiteSettings(),
  ]);

  return (
    <ChatContextProvider>
      <PixelScripts settings={settings} />
      <UtmCapture />
      <HideOnMapRoute>
        <Navbar types={types} locations={locations} settings={settings} />
      </HideOnMapRoute>
      <main className="flex-1">{children}</main>
      <HideOnMapRoute>
        <Footer types={types} settings={settings} />
        <MobileBottomNavSpacer />
        <MobileBottomNav types={types} />
        <CookieConsent />
        <CompareBar />
        <PopupDisplay />
        <ChatWidget />
      </HideOnMapRoute>
    </ChatContextProvider>
  );
}
