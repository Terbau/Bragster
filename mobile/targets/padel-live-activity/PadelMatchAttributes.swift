import ActivityKit
import Foundation

// The same type is in modules/padel-live-activity/ios, which starts and
// updates the activity from the app. ActivityKit matches the two by name and
// by their JSON, so both copies have to stay identical.
struct PadelMatchAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    /** Player names */
    var team1: [String]
    var team2: [String]
    /** Each team's average rating, nil until the ratings have loaded */
    var team1Rating: Int?
    var team2Rating: Int?
    /** Counted within the series, from 1 */
    var matchNumber: Int
    var matchCount: Int
    /** Only set when the game has more than one series */
    var series: Int?
    /** Only set when the game has more than one court, or named courts */
    var court: String?
    /** Set once every match has been played, like "Ola won with 98 points" */
    var finished: String?
    /** The match shown, so tapping the activity opens its score. Optional, like
     everything added later, so activities started by older versions still
     decode. */
    var matchId: String?
    /** Set when the court has no match to play yet, like "Waiting for the
     other courts" */
    var waiting: String?
  }

  var gameId: String
  var gameName: String
  /** Each court has its own activity. Nil for activities started by versions
   with one activity per game. */
  var court: Int?
}
