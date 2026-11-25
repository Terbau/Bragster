import ActivityKit
import Foundation

// The same type is in targets/padel-live-activity, which draws the activity.
// ActivityKit matches the two by name and by their JSON, so both copies have
// to stay identical.
@available(iOS 16.2, *)
struct JourneyAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    /** What to do now: "walk", "wait", "ride", "rental", "stay", "arrived"
     or "planning" */
    var step: String
    /** Like "Walk to Prinsens gate P1" */
    var headline: String
    /** Like "350 m · the bus leaves 14:32" */
    var detail: String?
    /** The bus to take, like "3" */
    var line: String?
    /** What's counted down to, in seconds since 1970, like when the bus
     comes or when to get off */
    var countdownTo: Double?
    /** Like "Bus in" */
    var countdownLabel: String?
    /** A second time counted down to, like when the bus leaves while walking */
    var secondaryCountdownTo: Double?
    /** Like "Line 3 leaves in" */
    var secondaryCountdownLabel: String?
    /** Where the trip ends */
    var destination: String
    /** When you get there, in seconds since 1970 */
    var arrival: Double?
    /** Whether the bus you're waiting for can be seen from the stop */
    var inSight: Bool?
    /** When the progress bar starts and ends filling up, in seconds since
     1970, so it keeps moving between updates */
    var progressStart: Double?
    var progressEnd: Double?
    /** Like "6 min faster route found" */
    var notice: String?
    /** Whether the notice is something you have to act on, like a bus that
     left without you. Shown bigger, as it was said with a sound. */
    var urgent: Bool?
    /** "bicycle" or "scooter" when step == "rental" */
    var vehicleMode: String?
    /** Whether a faster route suggestion can be accepted from the Lock Screen */
    var canSwitch: Bool?
    /** Whether the current stopover can be finished from the Lock Screen */
    var canFinishStopover: Bool?
    /** Whether the trip can be marked as started from the Lock Screen */
    var canStartTrip: Bool?
  }

  /** The trip, as only one is followed at a time */
  var id: String
}
