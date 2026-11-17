import { createClient } from "@/lib/supabase/server";

export type Analytics = {
  days: number;
  by_type: Record<string, number>;
  visitors: number;
  sessions: number;
  leads: number;
  prev: { page_views: number; visitors: number; contacts: number; leads: number };
  daily: { day: string; page_views: number; visitors: number; contacts: number; leads: number }[];
  hourly: { hour: number; views: number }[];
  top_pages: { path: string; views: number; visitors: number }[];
  top_properties: { id: string; title: string; slug: string; views: number; calls: number; whatsapp: number; saves: number; leads: number }[];
  sources: { source: string; visitors: number; views: number }[];
  devices: { device: string; visitors: number }[];
  top_ctas: { label: string; clicks: number }[];
  top_searches: { label: string; searches: number }[];
  funnel: { visitors: number; property_viewers: number; contacted: number; leads: number };
};

/** One aggregate RPC (crm_analytics) — the heavy lifting happens in Postgres, not the Worker. */
export async function getAnalytics(days: number): Promise<Analytics | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("crm_analytics", { p_days: days });
  if (error || !data) return null;
  return data as Analytics;
}
