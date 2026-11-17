import { getAllLocations, getAllProperties } from "@/lib/admin-queries";
import { getSiteSettings } from "@/lib/queries";
import { LocationsManager } from "@/components/admin/locations-manager";
import { HomeMapToggle } from "@/components/admin/home-map-toggle";

export default async function LocationsPage() {
  const [locations, properties, settings] = await Promise.all([getAllLocations(), getAllProperties(), getSiteSettings()]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Locations</h1>
        <p className="text-sm text-neutral-500">
          Group properties by area — each location gets its own listing page, map view and (if active) a spot in the nav menu.
        </p>
      </div>
      <HomeMapToggle enabled={settings.home_map_enabled} />
      <LocationsManager locations={locations} properties={properties} />
    </div>
  );
}
