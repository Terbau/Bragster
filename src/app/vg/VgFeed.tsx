"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { VgArticle } from "./lib";
import { isKnownVmUrl } from "./lib";
import { checkArticleSpoiler } from "./actions";
import { ArticleCard } from "./ArticleCard";

export type ArticleStatus =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "done"; isWorldCup: boolean }
  | { status: "error" };

const CACHE_KEY = "vg-spoiler-cache-v1";
const MAX_CONCURRENT = 4;
const PAGE_SIZE = 10;

function readCache(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}") as Record<
      string,
      boolean
    >;
  } catch {
    return {};
  }
}

function writeCache(url: string, isWorldCup: boolean) {
  try {
    const cache = readCache();
    cache[url] = isWorldCup;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // storage unavailable — no-op
  }
}

export function VgFeed({ articles }: { articles: VgArticle[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [results, setResults] = useState<Record<string, ArticleStatus>>(() => {
    const init: Record<string, ArticleStatus> = {};
    for (const a of articles) {
      init[a.id] = isKnownVmUrl(a.url)
        ? { status: "done", isWorldCup: true }
        : { status: "idle" };
    }
    return init;
  });

  const resultsRef = useRef(results);
  resultsRef.current = results;

  const articlesRef = useRef(articles);
  articlesRef.current = articles;

  const queueRef = useRef<number[]>([]);
  const inFlightRef = useRef(0);
  const processQueueRef = useRef<() => void>(() => {});

  const processQueue = () => {
    while (
      inFlightRef.current < MAX_CONCURRENT &&
      queueRef.current.length > 0
    ) {
      const idx = queueRef.current.shift();
      if (idx === undefined) break;
      const article = articlesRef.current[idx];
      if (!article) continue;

      const current = resultsRef.current[article.id];
      if (current?.status === "done" || current?.status === "checking")
        continue;

      inFlightRef.current++;
      setResults((prev) => ({
        ...prev,
        [article.id]: { status: "checking" },
      }));

      void checkArticleSpoiler(article.url)
        .then(({ isWorldCup }) => {
          writeCache(article.url, isWorldCup);
          setResults((prev) => ({
            ...prev,
            [article.id]: { status: "done", isWorldCup },
          }));
        })
        .catch(() => {
          setResults((prev) => ({
            ...prev,
            [article.id]: { status: "error" },
          }));
        })
        .finally(() => {
          inFlightRef.current--;
          processQueueRef.current();
        });
    }
  };
  processQueueRef.current = processQueue;

  // Enqueue a slice of articles [from, to) that haven't been checked yet
  const enqueueRange = useCallback((from: number, to: number) => {
    const cache = readCache();
    const updates: Record<string, ArticleStatus> = {};
    const toEnqueue: number[] = [];

    for (let i = from; i < to; i++) {
      const a = articlesRef.current[i];
      if (!a) continue;
      if (isKnownVmUrl(a.url)) {
        updates[a.id] = { status: "done", isWorldCup: true };
      } else if (Object.hasOwn(cache, a.url)) {
        updates[a.id] = { status: "done", isWorldCup: cache[a.url] };
      } else {
        toEnqueue.push(i);
      }
    }

    if (Object.keys(updates).length > 0) {
      setResults((prev) => ({ ...prev, ...updates }));
    }
    queueRef.current.push(...toEnqueue);
    processQueueRef.current();
  }, []);

  // On mount: check and enqueue the first page
  useEffect(() => {
    enqueueRange(0, PAGE_SIZE);
  }, [enqueueRange]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => {
      const next = Math.min(prev + PAGE_SIZE, articlesRef.current.length);
      enqueueRange(prev, next);
      return next;
    });
  }, [enqueueRange]);

  const retry = useCallback((id: string) => {
    const idx = articlesRef.current.findIndex((a) => a.id === id);
    if (idx === -1) return;
    const article = articlesRef.current[idx];

    queueRef.current = queueRef.current.filter((i) => i !== idx);
    setResults((prev) => ({ ...prev, [id]: { status: "checking" } }));
    inFlightRef.current++;

    void checkArticleSpoiler(article.url)
      .then(({ isWorldCup }) => {
        writeCache(article.url, isWorldCup);
        setResults((prev) => ({
          ...prev,
          [id]: { status: "done", isWorldCup },
        }));
      })
      .catch(() => {
        setResults((prev) => ({ ...prev, [id]: { status: "error" } }));
      })
      .finally(() => {
        inFlightRef.current--;
        processQueueRef.current();
      });
  }, []);

  const visible = articles.slice(0, visibleCount);
  const hasMore = visibleCount < articles.length;

  return (
    <div className="bg-white dark:bg-[#0f0f0f]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {visible.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            status={results[article.id] ?? { status: "idle" }}
            onRetry={retry}
            className="border-b border-r border-gray-200 dark:border-gray-800"
          />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center py-6 border-t border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={loadMore}
            className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Last inn flere
          </button>
        </div>
      )}
    </div>
  );
}
