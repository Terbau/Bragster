import CoreLocation
import Foundation

/// Keeps the app running while the phone is locked, so it can keep fetching
/// the bus and updating the Live Activity. iOS pauses apps soon after they
/// leave the screen, unless they're getting location updates in the
/// background. For a bus that's only followed, the location itself isn't
/// used, so the least accurate one is asked for, which uses cell towers and
/// Wi-Fi rather than GPS. A trip is planned from where you are, so it turns
/// on the GPS with `setUsesLocation`.
///
/// Needs `location` in UIBackgroundModes and a When In Use permission, see
/// app.json. iOS shows a blue location indicator while it runs. Only used
/// from the main thread.
final class BusBackgroundRunner: NSObject, CLLocationManagerDelegate {
  static let shared = BusBackgroundRunner()

  private let manager = CLLocationManager()
  private var permissionCallbacks: [(String) -> Void] = []
  /// A CLBackgroundActivitySession from iOS 17, which keeps the updates going
  /// in the background with a When In Use permission
  private var backgroundSession: AnyObject?
  private(set) var isRunning = false
  /// Whether where you are is used, for a trip, and not only to keep running
  private(set) var usesLocation = false
  /// Lower GPS accuracy while staying at a long stopover to save battery
  private(set) var lowPowerLocation = false
  /// Where you last were, while `usesLocation`
  private(set) var lastLocation: CLLocation?

  private override init() {
    super.init()
    manager.delegate = self
    manager.desiredAccuracy = kCLLocationAccuracyThreeKilometers
    manager.distanceFilter = kCLDistanceFilterNone
    // Standing still at a stop mustn't make iOS stop the updates
    manager.pausesLocationUpdatesAutomatically = false
    manager.activityType = .otherNavigation
  }

  /// Without it in Info.plist, background updates crash the app
  static var hasBackgroundMode: Bool {
    let modes = Bundle.main.object(forInfoDictionaryKey: "UIBackgroundModes") as? [String]
    return modes?.contains("location") ?? false
  }

  /// "granted", "denied" or "undetermined"
  var permission: String {
    switch manager.authorizationStatus {
    case .authorizedWhenInUse, .authorizedAlways: return "granted"
    case .notDetermined: return "undetermined"
    default: return "denied"
    }
  }

  /// Asks for When In Use permission the first time, and calls back with it
  func requestPermission(_ callback: @escaping (String) -> Void) {
    guard manager.authorizationStatus == .notDetermined else {
      callback(permission)
      return
    }
    permissionCallbacks.append(callback)
    manager.requestWhenInUseAuthorization()
  }

  /// Returns whether it's running. It can't without the background mode, or
  /// without permission.
  @discardableResult
  func start() -> Bool {
    if isRunning { return true }
    guard Self.hasBackgroundMode, permission == "granted" else { return false }
    manager.allowsBackgroundLocationUpdates = true
    manager.showsBackgroundLocationIndicator = true
    if #available(iOS 17.0, *) {
      backgroundSession = CLBackgroundActivitySession()
    }
    manager.startUpdatingLocation()
    isRunning = true
    return true
  }

  /// Turns the GPS on or off. Returns whether it's on, which it isn't
  /// without permission.
  @discardableResult
  func setUsesLocation(_ uses: Bool) -> Bool {
    guard uses else {
      usesLocation = false
      lowPowerLocation = false
      lastLocation = nil
      manager.desiredAccuracy = kCLLocationAccuracyThreeKilometers
      manager.distanceFilter = kCLDistanceFilterNone
      if !isRunning { manager.stopUpdatingLocation() }
      return false
    }
    guard permission == "granted" else { return false }
    usesLocation = true
    applyLocationAccuracy()
    manager.startUpdatingLocation()
    return true
  }

  /// Drops GPS accuracy during long stopovers to conserve battery
  func setLowPowerLocation(_ lowPower: Bool) {
    lowPowerLocation = lowPower
    if usesLocation {
      applyLocationAccuracy()
    }
  }

  private func applyLocationAccuracy() {
    if lowPowerLocation {
      manager.desiredAccuracy = kCLLocationAccuracyHundredMeters
      manager.distanceFilter = 50
    } else {
      manager.desiredAccuracy = kCLLocationAccuracyBest
      manager.distanceFilter = 5
    }
  }

  func stop() {
    guard isRunning else { return }
    if !usesLocation { manager.stopUpdatingLocation() }
    manager.allowsBackgroundLocationUpdates = false
    if #available(iOS 17.0, *) {
      (backgroundSession as? CLBackgroundActivitySession)?.invalidate()
    }
    backgroundSession = nil
    isRunning = false
  }

  func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
    guard manager.authorizationStatus != .notDetermined else { return }
    let callbacks = permissionCallbacks
    permissionCallbacks = []
    for callback in callbacks { callback(permission) }
    // Turned off in Settings while running
    if permission != "granted" {
      if isRunning { stop() }
      if usesLocation { setUsesLocation(false) }
    }
  }

  func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    // Otherwise only there to keep the app running
    if usesLocation, let location = locations.last, location.horizontalAccuracy >= 0 {
      lastLocation = location
    }
  }

  func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
    // A missing fix doesn't stop the updates, so the app keeps running
  }
}
