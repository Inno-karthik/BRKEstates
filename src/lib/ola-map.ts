/** Default Ola Maps style layers we don't want: Ola's own branded store/office pins
 *  and generic business POI clutter (shops, petrol pumps, etc). Matches any layer id
 *  containing "poi" rather than a fixed list — different zoom levels / viewport sizes
 *  (seen specifically on mobile) load extra POI sub-layers the exact-name list missed. */
const EXTRA_CLUTTER_LAYERS = ["ola-pois", "poi_traffic_signal"];

export type OlaMap = {
  getLayer: (id: string) => unknown;
  setLayoutProperty: (id: string, name: string, value: unknown) => void;
  getStyle?: () => { layers?: { id: string }[] } | undefined;
};

export function hideMapClutter(map: OlaMap) {
  const ids = new Set(EXTRA_CLUTTER_LAYERS);
  try {
    for (const layer of map.getStyle?.()?.layers ?? []) {
      if (/poi/i.test(layer.id)) ids.add(layer.id);
    }
  } catch {
    // style not ready yet — the EXTRA_CLUTTER_LAYERS fallback still applies
  }

  for (const id of ids) {
    try {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", "none");
    } catch {
      // layer not present in this style — ignore
    }
  }
}
