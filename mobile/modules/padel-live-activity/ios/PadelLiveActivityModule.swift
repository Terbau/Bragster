import ActivityKit
import ExpoModulesCore
import Foundation

/// Starts, updates and ends the Live Activities with a padel game's current
/// matches, one for each court. The widget extension in
/// targets/padel-live-activity draws them. The courts come from JavaScript as
/// JSON, an array of `CourtContent`.
public class PadelLiveActivityModule: Module {
  public func definition() -> ModuleDefinition {
    Name("PadelLiveActivity")

    /// Live Activities need iOS 16.2, and can be turned off in Settings
    Function("isSupported") { () -> Bool in
      guard #available(iOS 16.2, *) else { return false }
      return ActivityAuthorizationInfo().areActivitiesEnabled
    }

    /// Whether any of the game's courts is still showing. Each one is gone
    /// once it has been swiped away on the Lock Screen.
    Function("isActive") { (gameId: String) -> Bool in
      guard #available(iOS 16.2, *) else { return false }
      return !Self.activities(for: gameId).isEmpty
    }

    /// Shows an activity for each of the game's courts, in place of any other
    /// padel activity. Ones that are already showing are replaced, so they all
    /// come back, at the top of the Lock Screen.
    AsyncFunction("showAsync") { (gameId: String, gameName: String, courtsJson: String) async throws in
      guard #available(iOS 16.2, *) else { throw LiveActivitiesUnavailableException() }
      guard ActivityAuthorizationInfo().areActivitiesEnabled else {
        throw LiveActivitiesUnavailableException()
      }
      try await Self.show(gameId: gameId, gameName: gameName, courts: try Self.decode(courtsJson))
    }

    /// Changes what the game's activities show. Courts that aren't showing
    /// aren't brought back by accident, and ones no longer in the game end.
    /// Resolves with how many are showing.
    AsyncFunction("updateAsync") { (gameId: String, courtsJson: String) async throws -> Int in
      guard #available(iOS 16.2, *) else { return 0 }
      let courts = try Self.decode(courtsJson)
      let activities = Self.activities(for: gameId)

      // Started by a version with one activity per game
      if let legacy = activities.first(where: { $0.attributes.court == nil }) {
        try await Self.show(gameId: gameId, gameName: legacy.attributes.gameName, courts: courts)
        return Self.activities(for: gameId).count
      }

      var showing = 0
      for activity in activities {
        if let court = courts.first(where: { $0.court == activity.attributes.court }) {
          await activity.update(ActivityContent(state: court.state, staleDate: nil))
          showing += 1
        } else {
          await activity.end(nil, dismissalPolicy: .immediate)
        }
      }
      return showing
    }

    /// Ends the game's activities. With a final state, the first court's stays
    /// on the Lock Screen a little while, so the result can be seen.
    AsyncFunction("endAsync") { (gameId: String, stateJson: String?) async throws in
      guard #available(iOS 16.2, *) else { return }
      let content = try stateJson.map { json in
        ActivityContent(state: try Self.decodeState(json), staleDate: nil)
      }
      let activities = Self.activities(for: gameId).sorted {
        ($0.attributes.court ?? 0) < ($1.attributes.court ?? 0)
      }
      for (index, activity) in activities.enumerated() {
        if index == 0, let content {
          await activity.end(content, dismissalPolicy: .after(Date().addingTimeInterval(15 * 60)))
        } else {
          await activity.end(nil, dismissalPolicy: .immediate)
        }
      }
    }
  }

  @available(iOS 16.2, *)
  private static func show(gameId: String, gameName: String, courts: [CourtContent]) async throws {
    for activity in Activity<PadelMatchAttributes>.activities {
      await activity.end(nil, dismissalPolicy: .immediate)
    }
    var started = 0
    var failure: Error?
    // The newest activity is shown at the top, so the first court goes last
    for court in courts.reversed() {
      do {
        _ = try Activity.request(
          attributes: PadelMatchAttributes(gameId: gameId, gameName: gameName, court: court.court),
          content: ActivityContent(state: court.state, staleDate: nil),
          pushType: nil
        )
        started += 1
      } catch {
        failure = error
      }
    }
    if started == 0, let failure {
      throw StartFailedException(failure.localizedDescription)
    }
  }

  @available(iOS 16.2, *)
  private static func activities(for gameId: String) -> [Activity<PadelMatchAttributes>] {
    Activity<PadelMatchAttributes>.activities.filter { activity in
      activity.attributes.gameId == gameId
        && (activity.activityState == .active || activity.activityState == .stale)
    }
  }

  @available(iOS 16.2, *)
  private static func decode(_ json: String) throws -> [CourtContent] {
    do {
      return try JSONDecoder().decode([CourtContent].self, from: Data(json.utf8))
    } catch {
      throw InvalidStateException(error.localizedDescription)
    }
  }

  @available(iOS 16.2, *)
  private static func decodeState(_ json: String) throws -> PadelMatchAttributes.ContentState {
    do {
      return try JSONDecoder().decode(PadelMatchAttributes.ContentState.self, from: Data(json.utf8))
    } catch {
      throw InvalidStateException(error.localizedDescription)
    }
  }
}

/// What one court's activity shows
@available(iOS 16.2, *)
private struct CourtContent: Decodable {
  /** The court number, from 1 */
  let court: Int
  let state: PadelMatchAttributes.ContentState
}

final class LiveActivitiesUnavailableException: Exception {
  override var reason: String {
    "Live Activities are turned off for Bragster, or need a newer version of iOS"
  }
}

final class StartFailedException: GenericException<String> {
  override var reason: String { "Couldn't show the matches on the Lock Screen: \(param)" }
}

final class InvalidStateException: GenericException<String> {
  override var reason: String { "The Live Activity state is invalid: \(param)" }
}
