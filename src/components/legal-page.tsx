import { PageTheme } from "@/components/theme-style";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <PageTheme page="about">
      <section className="bg-[var(--color-secondary,#0f3d26)] py-14 text-center text-white md:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold md:text-4xl">{title}</h1>
          <p className="mt-2 text-xs text-white/60">Last updated: {updated}</p>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
        <div className="prose prose-sm max-w-none prose-headings:text-neutral-900 prose-a:text-[var(--color-primary,#1b5e3a)] text-neutral-600">
          {children}
        </div>
      </section>
    </PageTheme>
  );
}
