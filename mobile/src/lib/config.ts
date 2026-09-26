/** The website that hosts the API. Override with EXPO_PUBLIC_API_URL in .env */
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? "https://bragster.vercel.app"
).replace(/\/$/, "");

/** Where the sign in flow on the website redirects back to (see app.json scheme) */
export const AUTH_REDIRECT_URI = "bragster://auth";
