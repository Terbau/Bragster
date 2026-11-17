import { BusLiveActivity } from "../../modules/bus-live-activity";

/**
 * Keeps the app running while the phone is locked, for as long as anything
 * needs it: a followed bus, or a trip. See BusBackgroundRunner.swift.
 */
const needs = new Set<string>();
let isRunning = false;
let syncing: Promise<boolean> = Promise.resolve(false);

/**
 * Says whether `owner` needs the app kept running. Resolves with whether it
 * is, which it isn't on Android, or without location permission.
 */
export function setKeepAlive(owner: string, isNeeded: boolean) {
  if (isNeeded) needs.add(owner);
  else needs.delete(owner);
  syncing = syncing.then(async () => {
    const activity = BusLiveActivity;
    if (!activity) return false;
    if (needs.size > 0 && !isRunning) {
      isRunning = await activity.startBackgroundUpdates().catch(() => false);
    } else if (needs.size === 0 && isRunning) {
      await activity.stopBackgroundUpdates().catch(() => {});
      isRunning = false;
    }
    return isRunning;
  });
  return syncing;
}
