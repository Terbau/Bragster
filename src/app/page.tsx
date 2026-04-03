import { Receipt, Plus } from "lucide-react";
import Link from "next/link";

const tools = [
  {
    href: "/receipt",
    icon: Receipt,
    title: "Smart Receipt",
    description:
      "Scan a receipt, assign items to people, and see exactly who owes what.",
    accent: "from-blue-500 to-violet-500",
  },
];

export default async function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="px-6 pt-20 pb-16 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Bragster
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
          A collection of small tools and experiments I&apos;ve built. Nothing
          too serious — just things that scratched an itch.
        </p>
      </section>

      {/* Tools grid */}
      <section className="px-6 pb-24 max-w-3xl mx-auto">
        <div className="grid sm:grid-cols-2 gap-4">
          {tools.map(({ href, icon: Icon, title, description, accent }) => (
            <Link
              key={href}
              href={href}
              className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 hover:border-foreground/20 hover:shadow-md transition-all"
            >
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-1.5">
                <h2 className="font-semibold text-base leading-snug">{title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </Link>
          ))}

          {/* Placeholder "more coming" card */}
          <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-border p-6 text-muted-foreground">
            <div className="w-11 h-11 rounded-xl border border-dashed border-border flex items-center justify-center shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-semibold text-base leading-snug">
                More coming
              </h2>
              <p className="text-sm leading-relaxed">
                New tools get added whenever I build something worth sharing.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
