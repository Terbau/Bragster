import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppState } from "react-native";
import { queryKeys } from "@/lib/queries";
import { onVideoUploadChange, processVideoUploads } from "@/lib/video-uploads";

/** Uploads filmed videos when the app starts and comes back to the foreground */
export function VideoUploader() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = onVideoUploadChange(
      (gameId) =>
        void queryClient.invalidateQueries({ queryKey: queryKeys.padelVideos(gameId) }),
    );
    void processVideoUploads();
    const subscription = AppState.addEventListener("change", (status) => {
      if (status === "active") void processVideoUploads();
    });
    return () => {
      unsubscribe();
      subscription.remove();
    };
  }, [queryClient]);

  return null;
}
