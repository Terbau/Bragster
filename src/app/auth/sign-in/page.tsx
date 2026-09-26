"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

// Only allow relative paths to avoid open redirects
const getSafeCallbackUrl = (callbackUrl: string | null) =>
  callbackUrl?.startsWith("/") && !/^\/[/\\]/.test(callbackUrl)
    ? callbackUrl
    : "/";

function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("auth0", { callbackUrl });
    } else if (status === "authenticated") {
      // API routes (like the mobile app sign in) need a full page navigation
      if (callbackUrl.startsWith("/api/")) {
        window.location.replace(callbackUrl);
      } else {
        router.push(callbackUrl);
      }
    }
  }, [status, router, callbackUrl]);

  return <div />;
}

export default function Signin() {
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  );
}
