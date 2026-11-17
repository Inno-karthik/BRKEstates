import { getActivePopups } from "@/lib/queries";
import { PopupPageFilter } from "@/components/popup-page-filter";

export async function PopupDisplay() {
  const popups = await getActivePopups();
  if (popups.length === 0) return null;
  return <PopupPageFilter popups={popups} />;
}
