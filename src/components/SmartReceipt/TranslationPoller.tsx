"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { ShiningText } from "@/components/ShiningText/ShiningText";
import { waitForTranslations } from "@/app/receipt/actions";

interface TranslationPollerProps {
  isTranslating: boolean;
  receiptId: string;
}

export const TranslationPoller = ({
  isTranslating,
  receiptId,
}: TranslationPollerProps) => {
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isTranslating) return;

    waitForTranslations(receiptId).then((done) => {
      if (done) {
        router.refresh();
      } else {
        setTimedOut(true);
      }
    });
  }, [isTranslating, receiptId, router]);

  if (!isTranslating) return null;

  if (timedOut) {
    return (
      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-2">
        <Sparkles className="h-3.5 w-3.5 shrink-0" />
        Translations took too long. Refresh the page to see results.
      </p>
    );
  }

  return (
    <span className="flex items-center gap-1.5 mt-2">
      <Sparkles className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <ShiningText className="text-xs">Translating items with AI...</ShiningText>
    </span>
  );
};
