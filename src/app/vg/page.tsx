import type { VgArticle } from "./lib";
import { fetchVgFrontPage } from "./lib";
import { VgFeed } from "./VgFeed";

export const dynamic = "force-dynamic";

export default async function VgPage() {
  let articles: VgArticle[] = [];
  let error = false;

  try {
    articles = await fetchVgFrontPage();
  } catch {
    error = true;
  }

  return (
    // Negative margins to break out of the root layout's horizontal padding,
    // making the VG masthead go edge-to-edge within the max-w-5xl container
    <div className="-mx-3 sm:-mx-5 -mt-5">
      {/* VG masthead strip */}
      <div className="bg-[#e00000] text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-black text-3xl tracking-tight leading-none">VG</span>
          <span className="text-sm font-medium opacity-75 border-l border-white/30 pl-3">
            Spoiler-free edition
          </span>
        </div>
        <span className="text-xs opacity-60">VM 2026 skjult</span>
      </div>

      {error || articles.length === 0 ? (
        <div className="px-4 py-20 text-center text-muted-foreground">
          <p className="text-lg font-medium mb-1">Kunne ikke laste VG</p>
          <p className="text-sm">Prøv igjen om litt.</p>
        </div>
      ) : (
        <VgFeed articles={articles} />
      )}
    </div>
  );
}
