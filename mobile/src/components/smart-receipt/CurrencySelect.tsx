import { Check, ChevronDown, ChevronUp } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { CURRENCIES } from "@/lib/currencies";
import { cn } from "@/lib/utils";

interface CurrencySelectProps {
  label?: string;
  value: string;
  onChange: (currencyCode: string) => void;
  disabled?: boolean;
}

/** Searchable currency list that expands inline (a combobox on the website) */
export function CurrencySelect({ label, value, onChange, disabled }: CurrencySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = CURRENCIES.find((currency) => currency.code === value);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return search
      ? CURRENCIES.filter(
          (currency) =>
            currency.code.toLowerCase().includes(search) ||
            currency.name.toLowerCase().includes(search),
        )
      : CURRENCIES;
  }, [query]);

  const select = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <View>
      {label && <Label>{label}</Label>}
      <Pressable
        disabled={disabled}
        onPress={() => setIsOpen((open) => !open)}
        className={cn(
          "h-11 flex-row items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 active:bg-accent",
          disabled && "opacity-50",
        )}
      >
        <Text
          className={cn("flex-1", !value && "text-muted-foreground")}
          numberOfLines={1}
        >
          {selected ? `${selected.code} - ${selected.name}` : value || "Select currency"}
        </Text>
        <Icon
          as={isOpen ? ChevronUp : ChevronDown}
          size={16}
          className="text-muted-foreground"
        />
      </Pressable>

      {isOpen && (
        <View className="mt-2 overflow-hidden rounded-lg border border-border">
          <Input
            placeholder="Search currency…"
            value={query}
            onChangeText={setQuery}
            autoFocus
            autoCorrect={false}
            className="rounded-none border-0 border-b border-border"
          />
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: 240 }}
          >
            {filtered.map((currency) => (
              <Pressable
                key={currency.code}
                onPress={() => select(currency.code)}
                className="flex-row items-center justify-between gap-2 px-3 py-2.5 active:bg-accent"
              >
                <Text className="flex-1 text-sm" numberOfLines={1}>
                  {currency.code} - {currency.name}
                </Text>
                {currency.code === value && <Icon as={Check} size={16} />}
              </Pressable>
            ))}
            {filtered.length === 0 && (
              <Text className="p-3 text-sm text-muted-foreground">
                No currency found.
              </Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
