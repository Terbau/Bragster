const { withPodfile } = require("expo/config-plugins");
const {
  mergeContents,
} = require("@expo/config-plugins/build/utils/generateCode");

/**
 * Raises every pod's minimum iOS version to the app's. Xcode 27 refuses to
 * build targets for iOS versions before 15, and some pods (SDWebImage,
 * RNSVG, AsyncStorage's resources) still ask for 9.0 to 13.4.
 */
const MINIMUM = "15.1";

module.exports = function withPodsDeploymentTarget(config) {
  return withPodfile(config, (config) => {
    config.modResults.contents = mergeContents({
      tag: "bragster-pods-deployment-target",
      src: config.modResults.contents,
      newSrc: [
        "    installer.pods_project.targets.each do |target|",
        "      target.build_configurations.each do |build_config|",
        "        current = build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']",
        `        if current.nil? || Gem::Version.new(current) < Gem::Version.new('${MINIMUM}')`,
        `          build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${MINIMUM}'`,
        "        end",
        "      end",
        "    end",
      ].join("\n"),
      anchor: /post_install do \|installer\|/,
      offset: 1,
      comment: "#",
    }).contents;
    return config;
  });
};
