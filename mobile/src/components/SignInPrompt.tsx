import type { LucideIcon } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "./ui/button";
import { Icon } from "./ui/icon";
import { Text } from "./ui/text";

interface SignInPromptProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function SignInPrompt({ icon, title, description }: SignInPromptProps) {
  const { signIn } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      await signIn();
    } catch (signInError) {
      setError(getErrorMessage(signInError));
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center gap-4 px-8">
      <View className="h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <Icon as={icon} size={26} className="text-muted-foreground" />
      </View>
      <View className="items-center gap-1.5">
        <Text className="text-center text-xl font-semibold">{title}</Text>
        <Text className="text-center text-sm leading-5 text-muted-foreground">
          {description}
        </Text>
      </View>
      <Button onPress={handleSignIn} isLoading={isSigningIn} className="w-full max-w-xs">
        Sign in
      </Button>
      {error && (
        <Text className="text-center text-sm text-destructive">{error}</Text>
      )}
    </View>
  );
}
