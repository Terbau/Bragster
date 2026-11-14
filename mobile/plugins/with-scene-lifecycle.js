const { withAppDelegate, withInfoPlist } = require("expo/config-plugins");

/**
 * Moves the app to the UIScene life cycle. iOS 27 won't start apps built
 * with the iOS 27 SDK (Xcode 27) that still set up their window in the app
 * delegate: they crash at launch in
 * `_UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`.
 *
 * The app delegate still creates React Native, and a scene delegate puts it
 * in the scene's window and passes on the links the app is opened with.
 *
 * Expo's dev launcher looks for the window while the app is launching, before
 * the scene has one, so development builds with expo-dev-client need it
 * fixed in Expo before they run on iOS 27. Release builds don't include it.
 */
const TAG = "// @generated bragster-scene-lifecycle";

const START_REACT_NATIVE =
  /window = UIWindow\(frame: UIScreen\.main\.bounds\)\s*factory\.startReactNative\(\s*withModuleName: "main",\s*in: window,\s*launchOptions: launchOptions\)/;

const SCENE_DELEGATE = `
${TAG}
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
      let appDelegate = UIApplication.shared.delegate as? AppDelegate,
      let factory = appDelegate.reactNativeFactory
    else { return }

    // React Native's Linking reads the link the app was opened with from these
    var launchOptions: [UIApplication.LaunchOptionsKey: Any] = [:]
    if let url = connectionOptions.urlContexts.first?.url {
      launchOptions[.url] = url
    }
    if let activity = connectionOptions.userActivities.first(where: {
      $0.activityType == NSUserActivityTypeBrowsingWeb
    }) {
      launchOptions[.userActivityDictionary] = [
        "UIApplicationLaunchOptionsUserActivityKey": activity,
        "UIApplicationLaunchOptionsUserActivityTypeKey": activity.activityType,
      ]
    }

    let window = UIWindow(windowScene: windowScene)
    self.window = window
    appDelegate.window = window
    factory.startReactNative(withModuleName: "main", in: window, launchOptions: launchOptions)

    // Expo Linking (and so expo-router) learns about the link from the app delegate
    open(connectionOptions.urlContexts)
    for activity in connectionOptions.userActivities {
      continueActivity(activity)
    }
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    open(URLContexts)
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    continueActivity(userActivity)
  }

  private func open(_ contexts: Set<UIOpenURLContext>) {
    for context in contexts {
      var options: [UIApplication.OpenURLOptionsKey: Any] = [
        .openInPlace: context.options.openInPlace
      ]
      if let source = context.options.sourceApplication {
        options[.sourceApplication] = source
      }
      if let annotation = context.options.annotation {
        options[.annotation] = annotation
      }
      _ = UIApplication.shared.delegate?.application?(
        UIApplication.shared, open: context.url, options: options)
    }
  }

  private func continueActivity(_ activity: NSUserActivity) {
    _ = UIApplication.shared.delegate?.application?(
      UIApplication.shared, continue: activity, restorationHandler: { _ in })
  }
}
`;

const withSceneDelegate = (config) =>
  withAppDelegate(config, (config) => {
    if (config.modResults.language !== "swift") {
      throw new Error("with-scene-lifecycle expects a Swift AppDelegate");
    }
    let contents = config.modResults.contents;
    if (!contents.includes(TAG)) {
      if (!START_REACT_NATIVE.test(contents)) {
        throw new Error(
          "with-scene-lifecycle couldn't find where AppDelegate.swift starts React Native",
        );
      }
      contents =
        contents.replace(
          START_REACT_NATIVE,
          "// The scene delegate starts React Native in the scene's window",
        ) + SCENE_DELEGATE;
    }
    config.modResults.contents = contents;
    return config;
  });

const withSceneManifest = (config) =>
  withInfoPlist(config, (config) => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: "Default Configuration",
            UISceneDelegateClassName: "$(PRODUCT_MODULE_NAME).SceneDelegate",
          },
        ],
      },
    };
    return config;
  });

module.exports = (config) => withSceneManifest(withSceneDelegate(config));
