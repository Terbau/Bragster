import { Redirect } from "expo-router";

// The sign in flow redirects to bragster://auth. On iOS the in-app browser
// session consumes that link, but if it is ever opened as a deep link, go home.
export default function AuthRedirect() {
  return <Redirect href="/" />;
}
