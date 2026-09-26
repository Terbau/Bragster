import { LinearGradient } from "expo-linear-gradient";
import { type Href, Link } from "expo-router";
import { type LucideIcon, Newspaper, Plus, Receipt } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

const tools: {
  href: Href;
  icon: LucideIcon;
  title: string;
  description: string;
  accent: [string, string];
}[] = [
  {
    href: "/receipts",
    icon: Receipt,
    title: "Smart Receipt",
    description:
      "Scan a receipt, assign items to people, and see exactly who owes what.",
    accent: ["#3b82f6", "#8b5cf6"],
  },
  {
    href: "/vg",
    icon: Newspaper,
    title: "VG (spoilerfri)",
    description:
      "VG.no uten VM-spoilere. Overskrifter skjules og erstattes med * inntil du velger å se dem.",
    accent: ["#ef4444", "#b91c1c"],
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top + 32, paddingBottom: 32 }}
    >
      <View className="px-6 pb-10">
        <Text className="mb-3 text-4xl font-bold tracking-tight">Bragster</Text>
        <Text className="text-lg leading-7 text-muted-foreground">
          A collection of small tools and experiments I&apos;ve built. Nothing
          too serious — just things that scratched an itch.
        </Text>
      </View>

      <View className="gap-4 px-6">
        {tools.map(({ href, icon, title, description, accent }) => (
          <Link key={title} href={href} asChild>
            <Pressable className="gap-4 rounded-2xl border border-border bg-card p-6 active:opacity-70">
              <LinearGradient
                colors={accent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon as={icon} size={20} className="text-white" />
              </LinearGradient>
              <View className="gap-1.5">
                <Text className="text-base font-semibold">{title}</Text>
                <Text className="text-sm leading-5 text-muted-foreground">
                  {description}
                </Text>
              </View>
            </Pressable>
          </Link>
        ))}

        <View className="gap-4 rounded-2xl border border-dashed border-border p-6">
          <View className="h-11 w-11 items-center justify-center rounded-xl border border-dashed border-border">
            <Icon as={Plus} size={20} className="text-muted-foreground" />
          </View>
          <View className="gap-1.5">
            <Text className="text-base font-semibold text-muted-foreground">
              More coming
            </Text>
            <Text className="text-sm leading-5 text-muted-foreground">
              New tools get added whenever I build something worth sharing.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
