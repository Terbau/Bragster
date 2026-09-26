# Bragster mobile

The Bragster iOS app, built with Expo (SDK 54), Expo Router and NativeWind. It has the
same features as the website (Smart Receipt and the spoiler-free VG feed), plus a
document scanner for receipts:

- **Scan with camera** uses Apple's VisionKit document camera, the same scanner as
  the Notes and Files apps. Like Adobe Scan, it finds the receipt in the camera view,
  outlines it, takes the picture automatically once it's steady and straightens it.
  The flash turns on automatically when it's too dark, and the ⚡ button in the
  scanner overrides it (Auto/On/Off). The filter button in the scanner switches
  between color, grayscale, black & white and photo.
- **Choose from Photos / Files** imports an existing image. The app finds the receipt
  edges in the image, crops and straightens it (the "Auto-crop" switch turns this off).
- Before uploading you can pick a filter: _Original_, _Enhanced_ (removes shadows and
  whitens the paper, Core Image's document enhancer), _Grayscale_ or _B&W_. The image
  is converted to JPEG and compressed to stay under Vercel's upload limit.

The scanner lives in a local Expo module, `modules/document-scanner` (Swift).

## How it talks to the website

The app uses a small REST API on the website, `src/app/api/mobile/*`, which calls the
same server actions as the web UI. **Deploy the website before using the app**, since
the app talks to `https://bragster.vercel.app` by default.

Sign in opens the website's normal Auth0 sign-in in an in-app browser. Afterwards the
website hands the app a token (a PKCE-protected code exchange), which is stored in
the iOS Keychain. If you're already signed in to the website in Safari, sign-in is
instant. No Auth0 configuration changes are needed.

To point the app at another deployment, copy `.env.example` to `.env.local` and set
`EXPO_PUBLIC_API_URL`.

## Requirements

- macOS with **Xcode 16.1 or newer** (Expo SDK 54 is the newest SDK that builds with
  Xcode 16. SDK 55+ needs Xcode 26, which needs macOS 15.6+)
- Node 20+, pnpm, CocoaPods (`brew install cocoapods`)
- An iPhone with iOS 15.1 or newer

```bash
cd mobile
pnpm install
```

## Running on your iPhone

The app uses native code (the scanner, secure storage), so it can't run in Expo Go.
You build it with Xcode instead.

### 1. Apple account

Either account type works:

| | Free Apple ID ("Personal Team") | Paid Apple Developer Program ($99/year) |
|---|---|---|
| Install on your own iPhone | ✅ | ✅ |
| App keeps working for | **7 days**, then rebuild/reinstall | 1 year |
| TestFlight / EAS cloud builds | ❌ | ✅ |

To see what you have, sign in at https://developer.apple.com/account. If it says
you need to enroll, you have a free account, which is fine for now.

### 2. One-time setup

1. Open Xcode → **Settings → Accounts** → **+** → sign in with your Apple ID.
2. On the iPhone: **Settings → Privacy & Security → Developer Mode** → on (the
   iPhone restarts). If the option isn't there, connect the iPhone to the Mac once
   with a cable first.
3. Connect the iPhone with a cable and tap **Trust** if asked.
4. Generate the native project and choose your team:
   ```bash
   pnpm expo prebuild --platform ios
   open ios/Bragster.xcworkspace
   ```
   In Xcode, select the **Bragster** project → **Bragster** target → **Signing &
   Capabilities** → check _Automatically manage signing_ and pick your team. If the
   bundle identifier `com.terbau.bragster` is taken, change it here and in
   `app.json` (`ios.bundleIdentifier`).

### 3. Install

**Standalone (recommended):** a release build with the JavaScript bundled in. It
runs without your Mac:

```bash
pnpm ios:release
```

**Development:** a debug build that loads JavaScript from your Mac (same Wi-Fi) with
fast refresh:

```bash
pnpm ios:device   # builds, installs and starts the dev server
pnpm start        # later on, just start the dev server
```

The first time, the iPhone may say "Untrusted Developer": go to **Settings → General
→ VPN & Device Management**, tap your Apple ID and trust it.

With a free account, run `pnpm ios:release` again when the app stops opening after
7 days. Your data is on the server, so nothing is lost.

## Scripts

| Script | |
|---|---|
| `pnpm start` | Start the dev server |
| `pnpm ios` | Build and run in the iOS simulator (the camera scanner isn't available in the simulator, importing images works) |
| `pnpm ios:device` | Build a debug build and run it on a connected iPhone |
| `pnpm ios:release` | Build a release build and install it on a connected iPhone |
| `pnpm type-check` / `pnpm lint` / `pnpm doctor` | Checks |

## Project structure

- `src/app` – screens (Expo Router). Sheets such as _Assign Users_ and _Properties_
  are modal routes under `smart-receipt/[smartReceiptId]/`
- `src/components` – UI components. `ui/` mirrors the website's shadcn components
- `src/lib` – API client, auth, React Query hooks, payment calculations, VG feed
- `modules/document-scanner` – native scanner and image processing (Swift)
- `global.css` / `tailwind.config.js` – same design tokens as the website

`ios/` and `android/` are generated by `expo prebuild` and not checked in.
