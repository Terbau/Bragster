import { ArrowRight, Sparkles } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useColors } from "@/lib/color-scheme";
import type { Translation } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TranslatedTextProps {
  translation: Translation;
  originalText: string;
  className?: string;
}

/** Tap to see the original text (a popover on the website) */
export function TranslatedText({
  translation,
  originalText,
  className,
}: TranslatedTextProps) {
  const { colors } = useColors();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View className="shrink">
      <Pressable hitSlop={6} onPress={() => setIsOpen((open) => !open)}>
        <Text
          className={cn("text-sm font-medium", className)}
          style={{
            textDecorationLine: "underline",
            textDecorationStyle: "dotted",
            textDecorationColor: colors.mutedForeground,
          }}
        >
          {translation.description}
        </Text>
      </Pressable>

      {isOpen && (
        <View className="mt-1.5 gap-2 rounded-md border border-border bg-background p-2.5">
          <View className="flex-row items-center gap-1.5">
            <Icon as={Sparkles} size={13} className="text-muted-foreground" />
            <Text className="text-xs font-medium text-muted-foreground">
              Translated by AI
            </Text>
            <View className="ml-auto rounded bg-muted px-1.5 py-0.5">
              <Text className="font-mono text-[10px] font-medium text-muted-foreground">
                {translation.language.toUpperCase()}
              </Text>
            </View>
          </View>
          <View className="flex-row flex-wrap items-center gap-1.5">
            <Text className="text-sm text-muted-foreground">{originalText}</Text>
            <Icon as={ArrowRight} size={13} className="text-muted-foreground/50" />
            <Text className="text-sm font-medium">{translation.description}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

/** The AI generated category label, e.g. "Beer" */
export function TranslationBadge({ translation }: { translation: Translation }) {
  const { isDark } = useColors();
  return (
    <View
      className="self-start rounded-full border border-border px-2.5 py-0.5"
      style={{
        backgroundColor: isDark
          ? translation.darkModeLabelHexColor
          : translation.lightModeLabelHexColor,
      }}
    >
      <Text className={cn("text-xs font-semibold", isDark ? "text-white" : "text-black")}>
        {translation.label}
      </Text>
    </View>
  );
}
