"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Signin() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("auth0");
    } else if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router.push]);

  return <div />;
}
