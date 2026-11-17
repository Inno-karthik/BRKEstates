import { Plus } from "lucide-react";
import { getAllProperties } from "@/lib/admin-queries";
import { PropertiesList } from "@/components/admin/properties-list";
import { createDraftProperty } from "./actions";

export default async function AdminPropertiesPage() {
  const properties = await getAllProperties();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Properties</h1>
          <p className="text-sm text-neutral-500">{properties.length} total</p>
        </div>
        <form action={createDraftProperty}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-full bg-[#9b1c1c] px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus size={15} /> Add Property
          </button>
        </form>
      </div>
      <PropertiesList properties={properties} />
    </div>
  );
}
