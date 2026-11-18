import { Building2, Landmark, Plane, Waves } from "lucide-react";

/** Where BKR Estates works, grouped by how Visakhapatnam is actually growing — city core, the
 *  IT-and-coast belt, the airport corridor and the value belt. Facts only (no price claims). */
const ZONES = [
  {
    icon: Landmark,
    title: "City Core",
    places: "Dwaraka Nagar · Seethammadhara",
    note: "Established neighbourhoods with schools, hospitals and business districts at the door — the choice for end-use apartments.",
  },
  {
    icon: Waves,
    title: "IT & Coast Belt",
    places: "Rushikonda · Madhurawada · Yendada · Kommadi",
    note: "Sea-facing hills and the IT corridor, with Google's US$15 billion AI hub now under construction in Visakhapatnam.",
  },
  {
    icon: Plane,
    title: "Airport Corridor",
    places: "Anandapuram · Bheemili · Bhogapuram",
    note: "The coastal road north to Alluri Sitarama Raju International Airport at Bhogapuram, open for flights since August 2026.",
  },
  {
    icon: Building2,
    title: "Value Belt",
    places: "Pendurthi · Gajuwaka · Sabbavaram · Anakapalli",
    note: "Approved plots and larger layouts on the city's growth edges — suited to long-term investment.",
  },
];

export function AreasWeCover() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary,#d0191f)]">Areas we cover</p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-neutral-900 md:text-4xl">
          Where Visakhapatnam is growing, <span className="text-[var(--color-primary,#d0191f)]">we are there</span>
        </h2>
        <p className="mt-3 text-sm text-neutral-500">
          From the city core to the new airport corridor — local knowledge of every belt, built over 20+ years.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ZONES.map(({ icon: IconC, title, places, note }) => (
          <div
            key={title}
            className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d0191f] via-[#d4af37] to-[#f3d98b]" />
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary,#d0191f)]/10 text-[var(--color-primary,#d0191f)] transition-transform group-hover:scale-110">
              <IconC size={22} />
            </span>
            <h3 className="mt-4 text-base font-bold text-neutral-900">{title}</h3>
            <p className="mt-1 text-xs font-semibold text-[var(--color-primary,#d0191f)]">{places}</p>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">{note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
