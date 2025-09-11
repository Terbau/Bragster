import { redirect } from "next/navigation";
import { createClient } from "./server";
import type { UserResponse } from "@supabase/supabase-js";

export const getServerUser = async (): Promise<UserResponse> => {
  const supabase = await createClient();

  const resp = await supabase.auth.getUser();
  if (resp.error || !resp.data?.user) {
    redirect("/sign-in");
  }

  return resp;
};
