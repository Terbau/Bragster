import ActivityKit
import Foundation

// The same type is in targets/padel-live-activity, the widget extension that
// shows the activity. ActivityKit matches the two by name and by their JSON,
// so both copies have to stay identical.
@available(iOS 16.2, *)
struct BusArrivalAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    /** When the bus is expected at the stop, in seconds since 1970 */
    var expectedArrival: Double
    /** When the timetable says it gets there */
    var aimedArrival: Double
    /** "coming", "approaching", "here", "departed" or "cancelled" */
    var status: String
    /** The last stop the bus has passed, nil before it has started */
    var lastPassed: String?
    /** Whether the bus is standing at `lastPassed` */
    var atLastPassed: Bool
    /** The stop before yours, where the progress bar starts */
    var previousStop: String?
    /** How many more stops it gets to, counting yours */
    var stopsAway: Int
    /** When the progress bar starts and ends filling up, in seconds since
     1970, so it keeps moving between updates */
    var progressStart: Double?
    var progressEnd: Double?
    /** Whether the times are real-time, or from the timetable */
    var realtime: Bool
  }

  var journeyId: String
  /** The day the trip is run on, like "2026-11-14" */
  var date: String
  /** The stop's place in the trip, from 0 */
  var stopPosition: Int
  var quayId: String
  /** Like "3" */
  var line: String
  var destination: String
  var stopName: String
  /** The platform, like "P1", if the stop has more than one */
  var platform: String?
}
