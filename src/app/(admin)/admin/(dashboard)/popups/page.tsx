import { createClient } from "@/lib/supabase/server";
import { getAllProperties } from "@/lib/admin-queries";
import { PopupsManager } from "@/components/admin/popups-manager";
import type { Popup } from "@/lib/types";

export default async function PopupsPage() {
  const supabase = await createClient();
  const [{ data }, properties] = await Promise.all([
    supabase.from("popups").select("*, property:properties(slug, title)").order("created_at", { ascending: false }),
    getAllProperties(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Popups</h1>
        <p className="text-sm text-neutral-500">
          Offers and festival greetings shown to visitors. Several can be active at once — make one Global to show
          everywhere (including property pages), or scope it to one specific property. Only one shows per page
          view (the most recently created match).
        </p>
      </div>
      <PopupsManager popups={(data ?? []) as unknown as Popup[]} properties={properties} />
    </div>
  );
}
