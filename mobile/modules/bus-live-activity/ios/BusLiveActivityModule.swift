import ActivityKit
import ExpoModulesCore
import Foundation
import MapKit

/// Starts, updates and ends the Live Activity with a bus on its way to a stop.
/// The widget extension in targets/padel-live-activity draws it. Only one bus
/// is shown at a time. Attributes and states come from JavaScript as JSON.
/// Also keeps the app running in the background while a bus is followed, see
/// BusBackgroundRunner. For trips, see src/lib/journey.ts, it also shows the
/// trip's Live Activity, says where you are, and searches for places.
public class BusLiveActivityModule: Module {
  public func definition() -> ModuleDefinition {
    Name("BusLiveActivity")

    /// Live Activities need iOS 16.2, and can be turned off in Settings
    Function("isSupported") { () -> Bool in
      guard #available(iOS 16.2, *) else { return false }
      return ActivityAuthorizationInfo().areActivitiesEnabled
    }

    /// Whether the bus is showing. It's gone once it has been swiped away.
    Function("isActive") { (journeyId: String, stopPosition: Int) -> Bool in
      guard #available(iOS 16.2, *) else { return false }
      return Self.activity(journeyId: journeyId, stopPosition: stopPosition) != nil
    }

    /// Shows the bus, in place of any other bus
    AsyncFunction("showAsync") { (attributesJson: String, stateJson: String) async throws in
      guard #available(iOS 16.2, *) else { throw BusLiveActivitiesUnavailableException() }
      guard ActivityAuthorizationInfo().areActivitiesEnabled else {
        throw BusLiveActivitiesUnavailableException()
      }
      let attributes: BusArrivalAttributes = try Self.decode(attributesJson)
      let state: BusArrivalAttributes.ContentState = try Self.decode(stateJson)
      for activity in Activity<BusArrivalAttributes>.activities {
        await activity.end(nil, dismissalPolicy: .immediate)
      }
      do {
        _ = try Activity.request(
          attributes: attributes,
          content: Self.content(state),
          pushType: nil
        )
      } catch {
        throw BusStartFailedException(error.localizedDescription)
      }
    }

    /// Changes what the bus's activity shows, without bringing it back if it
    /// has been swiped away. Resolves with whether it's showing.
    AsyncFunction("updateAsync") { (journeyId: String, stopPosition: Int, stateJson: String) async throws -> Bool in
      guard #available(iOS 16.2, *) else { return false }
      guard let activity = Self.activity(journeyId: journeyId, stopPosition: stopPosition) else {
        return false
      }
      let state: BusArrivalAttributes.ContentState = try Self.decode(stateJson)
      await activity.update(Self.content(state))
      return true
    }

    /// Asks for location permission, used to keep the app running in the
    /// background, the first time. Resolves with "granted", "denied" or
    /// "undetermined".
    AsyncFunction("requestBackgroundPermissionAsync") { (promise: Promise) in
      BusBackgroundRunner.shared.requestPermission { promise.resolve($0) }
    }.runOnQueue(.main)

    /// Keeps the app running while the phone is locked. Resolves with whether
    /// it is, which it isn't without the location background mode in
    /// Info.plist, or without permission.
    AsyncFunction("startBackgroundUpdatesAsync") { () -> Bool in
      BusBackgroundRunner.shared.start()
    }.runOnQueue(.main)

    AsyncFunction("stopBackgroundUpdatesAsync") {
      BusBackgroundRunner.shared.stop()
    }.runOnQueue(.main)

    /// Turns the GPS on for a trip, and off after it. Resolves with whether
    /// it's on, which it isn't without permission.
    AsyncFunction("setUsesLocationAsync") { (uses: Bool) -> Bool in
      BusBackgroundRunner.shared.setUsesLocation(uses)
    }.runOnQueue(.main)

    /// Where you last were, with `accuracy` in metres and `timestamp` in ms
    /// since 1970. Empty before the GPS has found it.
    AsyncFunction("getLocationAsync") { () -> [String: Double] in
      guard let location = BusBackgroundRunner.shared.lastLocation else { return [:] }
      return [
        "latitude": location.coordinate.latitude,
        "longitude": location.coordinate.longitude,
        "accuracy": location.horizontalAccuracy,
        "timestamp": location.timestamp.timeIntervalSince1970 * 1000,
      ]
    }.runOnQueue(.main)

    /// Shops, restaurants and other places called something like `query`,
    /// near the coordinates, from Apple Maps
    AsyncFunction("searchPlacesAsync") { (query: String, latitude: Double, longitude: Double, promise: Promise) in
      let request = MKLocalSearch.Request()
      request.naturalLanguageQuery = query
      request.region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: latitude, longitude: longitude),
        latitudinalMeters: 30_000,
        longitudinalMeters: 30_000
      )
      request.resultTypes = [.pointOfInterest, .address]
      MKLocalSearch(request: request).start { response, _ in
        // Nothing found comes as an error
        let places = (response?.mapItems ?? []).prefix(12).map { item -> [String: Any] in
          [
            "name": item.name ?? "",
            "detail": item.placemark.title ?? "",
            "latitude": item.placemark.coordinate.latitude,
            "longitude": item.placemark.coordinate.longitude,
          ]
        }
        promise.resolve(Array(places))
      }
    }.runOnQueue(.main)

    /// Whether the trip is showing. It's gone once it has been swiped away.
    Function("isJourneyActive") { (id: String) -> Bool in
      guard #available(iOS 16.2, *) else { return false }
      return Self.journey(id) != nil
    }

    /// Shows the trip, in place of any other trip
    AsyncFunction("showJourneyAsync") { (id: String, stateJson: String) async throws in
      guard #available(iOS 16.2, *) else { throw BusLiveActivitiesUnavailableException() }
      guard ActivityAuthorizationInfo().areActivitiesEnabled else {
        throw BusLiveActivitiesUnavailableException()
      }
      let state: JourneyAttributes.ContentState = try Self.decode(stateJson)
      for activity in Activity<JourneyAttributes>.activities {
        await activity.end(nil, dismissalPolicy: .immediate)
      }
      do {
        _ = try Activity.request(
          attributes: JourneyAttributes(id: id),
          content: Self.journeyContent(state),
          pushType: nil
        )
      } catch {
        throw BusStartFailedException(error.localizedDescription)
      }
    }

    /// Changes what the trip's activity shows, without bringing it back if
    /// it has been swiped away. Resolves with whether it's showing.
    AsyncFunction("updateJourneyAsync") { (id: String, stateJson: String) async throws -> Bool in
      guard #available(iOS 16.2, *) else { return false }
      guard let activity = Self.journey(id) else { return false }
      let state: JourneyAttributes.ContentState = try Self.decode(stateJson)
      await activity.update(Self.journeyContent(state))
      return true
    }

    /// Ends the trip's activity. With a final state, it stays on the Lock
    /// Screen for `dismissAfter` seconds, so it can be seen.
    AsyncFunction("endJourneyAsync") { (id: String, stateJson: String?, dismissAfter: Double) async throws in
      guard #available(iOS 16.2, *) else { return }
      guard let activity = Self.journey(id) else { return }
      if let stateJson {
        let state: JourneyAttributes.ContentState = try Self.decode(stateJson)
        await activity.end(
          ActivityContent(state: state, staleDate: nil),
          dismissalPolicy: .after(Date().addingTimeInterval(dismissAfter))
        )
      } else {
        await activity.end(nil, dismissalPolicy: .immediate)
      }
    }

    /// Ends the bus's activity. With a final state, it stays on the Lock
    /// Screen for `dismissAfter` seconds, so it can be seen.
    AsyncFunction("endAsync") { (journeyId: String, stopPosition: Int, stateJson: String?, dismissAfter: Double) async throws in
      guard #available(iOS 16.2, *) else { return }
      guard let activity = Self.activity(journeyId: journeyId, stopPosition: stopPosition) else {
        return
      }
      if let stateJson {
        let state: BusArrivalAttributes.ContentState = try Self.decode(stateJson)
        await activity.end(
          ActivityContent(state: state, staleDate: nil),
          dismissalPolicy: .after(Date().addingTimeInterval(dismissAfter))
        )
      } else {
        await activity.end(nil, dismissalPolicy: .immediate)
      }
    }
  }

  /// Shown as out of date a few minutes after the bus should have come, if
  /// the app hasn't been opened since
  @available(iOS 16.2, *)
  private static func content(
    _ state: BusArrivalAttributes.ContentState
  ) -> ActivityContent<BusArrivalAttributes.ContentState> {
    ActivityContent(
      state: state,
      staleDate: Date(timeIntervalSince1970: state.expectedArrival + 3 * 60)
    )
  }

  /// A trip is updated every few seconds, so it's out of date when it hasn't
  /// been for some minutes, like after the app was closed
  @available(iOS 16.2, *)
  private static func journeyContent(
    _ state: JourneyAttributes.ContentState
  ) -> ActivityContent<JourneyAttributes.ContentState> {
    ActivityContent(state: state, staleDate: Date().addingTimeInterval(5 * 60))
  }

  @available(iOS 16.2, *)
  private static func journey(_ id: String) -> Activity<JourneyAttributes>? {
    Activity<JourneyAttributes>.activities.first { activity in
      activity.attributes.id == id
        && (activity.activityState == .active || activity.activityState == .stale)
    }
  }

  @available(iOS 16.2, *)
  private static func activity(journeyId: String, stopPosition: Int) -> Activity<BusArrivalAttributes>? {
    Activity<BusArrivalAttributes>.activities.first { activity in
      activity.attributes.journeyId == journeyId
        && activity.attributes.stopPosition == stopPosition
        && (activity.activityState == .active || activity.activityState == .stale)
    }
  }

  private static func decode<T: Decodable>(_ json: String) throws -> T {
    do {
      return try JSONDecoder().decode(T.self, from: Data(json.utf8))
    } catch {
      throw BusInvalidStateException(error.localizedDescription)
    }
  }
}

final class BusLiveActivitiesUnavailableException: Exception {
  override var reason: String {
    "Live Activities are turned off for Bragster, or need a newer version of iOS"
  }
}

final class BusStartFailedException: GenericException<String> {
  override var reason: String { "Couldn't show the bus on the Lock Screen: \(param)" }
}

final class BusInvalidStateException: GenericException<String> {
  override var reason: String { "The bus Live Activity state is invalid: \(param)" }
}
