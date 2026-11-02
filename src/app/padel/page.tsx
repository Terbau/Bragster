import { formatDate } from "@/utils/date";
import { ChevronRight, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { padelSpacePath } from "./_components/padelFormat";
import { padelRoleLabel } from "./_components/padelRoles";
import { getPadelSpaces } from "./actions";
import { NewSpaceButton } from "./NewSpaceButton";

export default async function PadelPage() {
  const spaces = await getPadelSpaces();

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Padel</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Americano or Mexicano, in a space for each group you play with.
              The rounds are made for you, and everyone gets a rating.
            </p>
          </div>
          <NewSpaceButton />
        </div>

        {spaces.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">No spaces yet</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Create a space for the people you play with. You can let others
                host games in it too.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {spaces.map((space) => (
              <li key={space.id}>
                <Link
                  href={padelSpacePath(space.id)}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 hover:border-foreground/20 hover:shadow-sm transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm break-words">
                      {space.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 break-words">
                      {padelRoleLabel(space.role)} · {space.games}{" "}
                      {space.games === 1 ? "game" : "games"}
                      {space.lastPlayedAt
                        ? ` · Last played ${formatDate(space.lastPlayedAt)}`
                        : ""}
                      {space.role !== "OWNER" ? ` · ${space.owner.email}` : ""}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
