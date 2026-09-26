import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { ExternalLink, LogOut, UserRound } from "lucide-react-native";
import { Alert, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SignInPrompt } from "@/components/SignInPrompt";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/auth";
import { type ThemePreference, useThemePreference } from "@/lib/color-scheme";
import { API_URL } from "@/lib/config";
import { formatDate } from "@/lib/format";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { status, user, signOut } = useAuth();
  const { preference, setPreference } = useThemePreference();

  const confirmSignOut = () =>
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => void signOut() },
    ]);

  const themeSection = (
    <View className="gap-2">
      <Text className="text-sm font-medium text-muted-foreground">Theme</Text>
      <SegmentedControl<ThemePreference>
        value={preference}
        onChange={setPreference}
        options={[
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
          { value: "system", label: "System" },
        ]}
      />
    </View>
  );

  if (status !== "signedIn") {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <SignInPrompt
          icon={UserRound}
          title="Profile"
          description="Sign in with the same account you use on the Bragster website."
        />
        <View className="px-6 pb-8">{themeSection}</View>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: 32 }}
      contentContainerClassName="gap-8 px-5"
    >
      <Text className="text-3xl font-bold tracking-tight">Profile</Text>

      <Card className="flex-row items-center gap-4 p-4">
        <Avatar src={user?.avatarUrl} email={user?.email} size="lg" />
        <View className="flex-1">
          <Text className="font-medium" numberOfLines={1}>
            {user?.email ?? "…"}
          </Text>
          {user && (
            <Text className="mt-0.5 text-xs text-muted-foreground">
              Member since {formatDate(user.createdAt)}
            </Text>
          )}
        </View>
      </Card>

      {themeSection}

      <View className="gap-3">
        <Button
          variant="outline"
          icon={ExternalLink}
          onPress={() => WebBrowser.openBrowserAsync(API_URL)}
        >
          Open website
        </Button>
        <Button
          variant="outline"
          icon={LogOut}
          textClassName="text-destructive"
          onPress={confirmSignOut}
        >
          Sign Out
        </Button>
      </View>

      <Text className="text-center text-xs text-muted-foreground">
        Bragster {Constants.expoConfig?.version} · Made with ❤️ by Terbau
      </Text>
    </ScrollView>
  );
}
