import { router } from "expo-router";

/** A little longer than iOS takes to slide a modal away */
const MODAL_DISMISS_MS = 450;

/**
 * Closes the modal on top, then navigates once it's gone.
 *
 * Going straight from a modal to a regular screen, like `router.replace` from
 * a modal does, makes iOS slide the modal away and push or pop the screen
 * underneath at the same time. Those two transitions can get in each other's
 * way and leave the navigation stuck halfway, where nothing responds to taps
 * any more until the app is restarted. Once the modal has started closing,
 * react-native-screens waits for it to finish before pushing, and the delay
 * makes sure it has started.
 */
export function leaveModal(navigate: () => void) {
  router.dismiss();
  setTimeout(navigate, MODAL_DISMISS_MS);
}
