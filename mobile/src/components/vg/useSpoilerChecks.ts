import { useCallback, useEffect, useRef, useState } from "react";
import {
  checkArticleSpoiler,
  isKnownVmUrl,
  readSpoilerCache,
  type VgArticle,
  writeSpoilerCache,
} from "@/lib/vg";
import type { ArticleStatus } from "./ArticleCard";

const MAX_CONCURRENT = 4;
export const PAGE_SIZE = 10;

const initialResults = (articles: VgArticle[]) => {
  const init: Record<string, ArticleStatus> = {};
  for (const article of articles) {
    init[article.id] = isKnownVmUrl(article.url)
      ? { status: "done", isWorldCup: true }
      : { status: "idle" };
  }
  return init;
};

/** Port of the website's VgFeed queue: checks visible articles for VM spoilers */
export function useSpoilerChecks(articles: VgArticle[]) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [results, setResults] = useState(() => initialResults(articles));

  const resultsRef = useRef(results);
  resultsRef.current = results;
  const articlesRef = useRef(articles);
  articlesRef.current = articles;

  const queueRef = useRef<number[]>([]);
  const inFlightRef = useRef(0);
  const processQueueRef = useRef<() => void>(() => {});

  const runCheck = useCallback((article: VgArticle) => {
    inFlightRef.current++;
    setResults((prev) => ({ ...prev, [article.id]: { status: "checking" } }));

    void checkArticleSpoiler(article.url)
      .then(({ isWorldCup }) => {
        writeSpoilerCache(article.url, isWorldCup);
        setResults((prev) => ({
          ...prev,
          [article.id]: { status: "done", isWorldCup },
        }));
      })
      .catch(() => {
        setResults((prev) => ({ ...prev, [article.id]: { status: "error" } }));
      })
      .finally(() => {
        inFlightRef.current--;
        processQueueRef.current();
      });
  }, []);

  processQueueRef.current = () => {
    while (inFlightRef.current < MAX_CONCURRENT && queueRef.current.length > 0) {
      const index = queueRef.current.shift();
      if (index === undefined) break;
      const article = articlesRef.current[index];
      if (!article) continue;

      const current = resultsRef.current[article.id];
      if (current?.status === "done" || current?.status === "checking") continue;

      runCheck(article);
    }
  };

  // Enqueue a slice of articles [from, to) that haven't been checked yet
  const enqueueRange = useCallback(async (from: number, to: number) => {
    const cache = await readSpoilerCache();
    const updates: Record<string, ArticleStatus> = {};
    const toEnqueue: number[] = [];

    for (let i = from; i < to; i++) {
      const article = articlesRef.current[i];
      if (!article) continue;
      if (isKnownVmUrl(article.url)) {
        updates[article.id] = { status: "done", isWorldCup: true };
      } else if (Object.prototype.hasOwnProperty.call(cache, article.url)) {
        updates[article.id] = { status: "done", isWorldCup: cache[article.url] };
      } else {
        toEnqueue.push(i);
      }
    }

    if (Object.keys(updates).length > 0) {
      resultsRef.current = { ...resultsRef.current, ...updates };
      setResults((prev) => ({ ...prev, ...updates }));
    }
    queueRef.current.push(...toEnqueue);
    processQueueRef.current();
  }, []);

  // Start over whenever a new feed is loaded
  useEffect(() => {
    queueRef.current = [];
    const fresh = initialResults(articles);
    resultsRef.current = fresh;
    setResults(fresh);
    setVisibleCount(PAGE_SIZE);
    void enqueueRange(0, PAGE_SIZE);
  }, [articles, enqueueRange]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => {
      const next = Math.min(prev + PAGE_SIZE, articlesRef.current.length);
      void enqueueRange(prev, next);
      return next;
    });
  }, [enqueueRange]);

  const retry = useCallback(
    (id: string) => {
      const index = articlesRef.current.findIndex((a) => a.id === id);
      if (index === -1) return;
      queueRef.current = queueRef.current.filter((i) => i !== index);
      runCheck(articlesRef.current[index]);
    },
    [runCheck],
  );

  return {
    visible: articles.slice(0, visibleCount),
    hasMore: visibleCount < articles.length,
    results,
    loadMore,
    retry,
  };
}
