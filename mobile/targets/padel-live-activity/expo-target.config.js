/**
 * The widget extension that shows a padel game's current match, and a bus on
 * its way to a stop, on the Lock Screen and in the Dynamic Island, see
 * PadelLiveActivity.swift and BusLiveActivity.swift. Linked into
 * the Xcode project by @bacons/apple-targets when running `expo prebuild`.
 *
 * @type {import('@bacons/apple-targets/app.plugin').Config}
 */
module.exports = {
  type: "widget",
  name: "PadelLiveActivity",
  displayName: "Bragster",
  bundleIdentifier: ".padel-live-activity",
  // ActivityContent, used to update the activity, needs iOS 16.2
  deploymentTarget: "16.2",
  frameworks: ["SwiftUI", "WidgetKit", "ActivityKit"],
};
