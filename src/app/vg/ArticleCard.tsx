"use client";

import { useState } from "react";
import type { VgArticle } from "./lib";
import type { ArticleStatus } from "./VgFeed";

interface Props {
  article: VgArticle;
  status: ArticleStatus;
  onRetry: (id: string) => void;
  className?: string;
}

function maskHeadline(headline: string): string {
  return headline.replace(/[^\s]/g, "*");
}

function formatTime(rfc2822: string): string {
  try {
    return new Date(rfc2822).toLocaleTimeString("nb-NO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function ArticleCard({
  article,
  status,
  onRetry,
  className = "",
}: Props) {
  const [revealed, setRevealed] = useState(false);

  const isLoading = status.status === "idle" || status.status === "checking";
  const isWC = status.status === "done" && status.isWorldCup;
  const isError = status.status === "error";
  const showContent =
    (status.status === "done" && !status.isWorldCup) || (isWC && revealed);
  const spoilerActive = (isWC && !revealed) || isError;

  const maskedHeadline = maskHeadline(article.headline);

  const image = article.imageUrl && (
    <div className="relative w-full aspect-video bg-gray-200 dark:bg-gray-800 overflow-hidden">
      {!isLoading && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.imageUrl}
          alt=""
          className={`w-full h-full object-cover transition-all duration-300 ${spoilerActive ? "grayscale brightness-0" : ""}`}
          loading="lazy"
        />
      )}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
      )}
    </div>
  );

  return (
    <div className={`overflow-hidden ${className}`}>
      {/* Image — clickable when article is not a spoiler */}
      {article.imageUrl && (
        showContent ? (
          <a href={article.url} target="_blank" rel="noreferrer">
            {image}
          </a>
        ) : (
          image
        )
      )}

      {/* Headline + meta */}
      <div className="px-3 py-2.5 sm:px-4 sm:py-3">
        {article.publishedAt && !isLoading && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 tabular-nums">
            {formatTime(article.publishedAt)}
          </p>
        )}

        {isLoading && (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-3/4" />
          </div>
        )}

        {showContent && (
          <a href={article.url} target="_blank" rel="noreferrer" className="group">
            <p className="font-bold leading-tight text-xl text-gray-900 dark:text-gray-50 group-hover:underline">
              {article.headline}
            </p>
          </a>
        )}

        {isWC && !revealed && (
          <div>
            <p className="font-bold leading-tight text-xl select-none text-gray-300 dark:text-gray-700">
              {maskedHeadline}
            </p>
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-950 px-2 py-0.5 rounded-full transition-colors"
            >
              ⚠ VM-spoiler — trykk for å vise
            </button>
          </div>
        )}

        {isWC && revealed && (
          <button
            type="button"
            onClick={() => setRevealed(false)}
            className="mt-2 text-xs text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
          >
            Skjul igjen
          </button>
        )}

        {isError && (
          <div>
            <p className="font-bold leading-tight text-xl select-none text-gray-300 dark:text-gray-700">
              {maskedHeadline}
            </p>
            <button
              type="button"
              onClick={() => onRetry(article.id)}
              className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 underline underline-offset-2"
            >
              Kunne ikke verifisere — trykk for å prøve igjen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
