#!/usr/bin/env bash
# Builds a Release version of the iOS app and packs it as an .ipa for
# sideloading: Bragster.app goes in a Payload folder, which is zipped.
#
#   pnpm ipa                  writes build/Bragster.ipa
#   pnpm ipa ~/Desktop/B.ipa  writes it somewhere else
#
# Signs with the team set in Xcode, like a build from Xcode itself, and uses
# Xcode's build folder, so builds after the first one are quicker.
set -euo pipefail

cd "$(dirname "$0")/.."
MOBILE_DIR="$(pwd)"
WORKSPACE="ios/Bragster.xcworkspace"
SCHEME="Bragster"
CONFIGURATION="Release"
OUTPUT="${1:-$MOBILE_DIR/build/Bragster.ipa}"

step() { printf '\n\033[1m▸ %s\033[0m\n' "$1"; }

if [ ! -d "$WORKSPACE" ]; then
  # Without --clean, so the signing team set in Xcode is kept
  step "Generating the ios folder"
  npx expo prebuild --platform ios
fi

if [ ! -d ios/Pods ]; then
  step "Installing pods"
  (cd ios && pod install)
fi

XCODEBUILD_ARGS=(
  -workspace "$WORKSPACE"
  -scheme "$SCHEME"
  -configuration "$CONFIGURATION"
  -sdk iphoneos
  -destination "generic/platform=iOS"
)

step "Building $SCHEME ($CONFIGURATION)"
LOG="$(mktemp -t bragster-build).log"
if command -v xcbeautify >/dev/null; then
  xcodebuild "${XCODEBUILD_ARGS[@]}" -allowProvisioningUpdates build 2>&1 |
    tee "$LOG" | xcbeautify
else
  # Only errors and the result are shown, the full log is kept
  xcodebuild "${XCODEBUILD_ARGS[@]}" -allowProvisioningUpdates build \
    >"$LOG" 2>&1 || {
    grep -E "error:|BUILD FAILED" "$LOG" | sort -u | tail -40
    echo "The build failed. The full log is in $LOG"
    exit 1
  }
fi

PRODUCTS_DIR="$(xcodebuild "${XCODEBUILD_ARGS[@]}" -showBuildSettings 2>/dev/null |
  awk -F' = ' '/^ *BUILT_PRODUCTS_DIR = / { print $2; exit }')"
APP="$PRODUCTS_DIR/$SCHEME.app"
if [ ! -d "$APP" ]; then
  echo "Couldn't find the built app at $APP"
  exit 1
fi

step "Packing $OUTPUT"
STAGING="$(mktemp -d)"
trap 'rm -rf "$STAGING"' EXIT
mkdir "$STAGING/Payload"
# ditto keeps the app's symlinks and code signature intact
ditto "$APP" "$STAGING/Payload/$SCHEME.app"
mkdir -p "$(dirname "$OUTPUT")"
# Zipping happens in another folder, so the path can't be relative
OUTPUT="$(cd "$(dirname "$OUTPUT")" && pwd)/$(basename "$OUTPUT")"
rm -f "$OUTPUT"
(cd "$STAGING" && zip -qry "$OUTPUT.zip" Payload)
mv "$OUTPUT.zip" "$OUTPUT"

VERSION="$(/usr/libexec/PlistBuddy -c "Print CFBundleShortVersionString" "$APP/Info.plist")"
BUILD="$(/usr/libexec/PlistBuddy -c "Print CFBundleVersion" "$APP/Info.plist")"
echo "Done: $OUTPUT ($(du -h "$OUTPUT" | cut -f1 | xargs), version $VERSION ($BUILD))"
open -R "$OUTPUT"
