import AppIntents
import Foundation

public let bragsterJourneyActionNotification = Notification.Name("BragsterJourneyAction")

@available(iOS 17.0, *)
public struct SwitchRouteIntent: LiveActivityIntent {
  public static var title: LocalizedStringResource = "Switch to faster route"
  public static var description = IntentDescription("Switches the active Bragster trip to the faster route.")

  public init() {}

  public func perform() async throws -> some IntentResult {
    await MainActor.run {
      NotificationCenter.default.post(
        name: bragsterJourneyActionNotification,
        object: nil,
        userInfo: ["action": "switch"]
      )
    }
    return .result()
  }
}

@available(iOS 17.0, *)
public struct FinishStopoverIntent: LiveActivityIntent {
  public static var title: LocalizedStringResource = "Done at stop"
  public static var description = IntentDescription("Marks the current stopover as done and leaves now.")

  public init() {}

  public func perform() async throws -> some IntentResult {
    await MainActor.run {
      NotificationCenter.default.post(
        name: bragsterJourneyActionNotification,
        object: nil,
        userInfo: ["action": "finish_stopover"]
      )
    }
    return .result()
  }
}
