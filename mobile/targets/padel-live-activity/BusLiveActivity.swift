import ActivityKit
import SwiftUI
import WidgetKit

/// A bus on its way to a stop, on the Lock Screen and in the Dynamic Island.
/// Started and updated by the app, see src/lib/bus-tracking.ts. The countdown
/// and the progress bar run by themselves between updates, from the times
/// they were last given.
struct BusLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: BusArrivalAttributes.self) { context in
      BusLockScreenView(
        attributes: context.attributes,
        state: context.state,
        isStale: context.isStale
      )
      .padding(16)
      .activityBackgroundTint(Color.black.opacity(0.75))
      .activitySystemActionForegroundColor(.white)
      .widgetURL(busURL)
    } dynamicIsland: { context in
      let attributes = context.attributes
      let state = context.state
      return DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          HStack(spacing: 6) {
            LineBadge(line: attributes.line)
            Text(attributes.destination)
              .font(.caption.weight(.semibold))
              .lineLimit(1)
          }
          .padding(.leading, 4)
        }
        DynamicIslandExpandedRegion(.trailing) {
          Countdown(state: state)
            .font(.title3.monospacedDigit().weight(.bold))
            .padding(.trailing, 4)
        }
        DynamicIslandExpandedRegion(.bottom) {
          VStack(alignment: .leading, spacing: 6) {
            StatusLine(attributes: attributes, state: state)
              .foregroundStyle(.secondary)
            SegmentProgress(attributes: attributes, state: state)
          }
          .padding(.horizontal, 4)
        }
      } compactLeading: {
        HStack(spacing: 4) {
          Image(systemName: isInSight(state) ? "eye.fill" : "bus.fill")
            .foregroundStyle(isInSight(state) ? Color.green : Color.white)
          Text(attributes.line).font(.caption.weight(.bold))
        }
      } compactTrailing: {
        Countdown(state: state)
          .font(.caption.monospacedDigit().weight(.semibold))
          .frame(maxWidth: 44)
      } minimal: {
        Text(attributes.line)
          .font(.caption.weight(.bold))
          .minimumScaleFactor(0.6)
      }
      .widgetURL(busURL)
    }
  }
}

/// Opens the bus in the app, see src/app/bus/trip.tsx
private let busURL = URL(string: "bragster://bus/trip")

private func date(_ seconds: Double) -> Date {
  Date(timeIntervalSince1970: seconds)
}

/// Like "Passed Nidarosdomen · 3 stops away"
private func statusText(
  _ attributes: BusArrivalAttributes,
  _ state: BusArrivalAttributes.ContentState
) -> String {
  switch state.status {
  case "here":
    return "At \(attributes.stopName) now"
  case "departed":
    return "Has left \(attributes.stopName)"
  case "cancelled":
    return "The trip is cancelled"
  default:
    guard let lastPassed = state.lastPassed else { return "Hasn't started yet" }
    let place = state.atLastPassed ? "At \(lastPassed)" : "Passed \(lastPassed)"
    if state.stopsAway <= 1 { return "\(place) · Your stop is next" }
    return "\(place) · \(state.stopsAway) stops away"
  }
}

/// Whether the bus can be seen from the stop, while it's on its way
private func isInSight(_ state: BusArrivalAttributes.ContentState) -> Bool {
  state.inSight == true && (state.status == "coming" || state.status == "approaching")
}

/// Where the bus is, with a green eye in front once it can be seen from the
/// stop
private struct StatusLine: View {
  let attributes: BusArrivalAttributes
  let state: BusArrivalAttributes.ContentState

  var body: some View {
    HStack(spacing: 4) {
      if isInSight(state) {
        Label("In sight", systemImage: "eye.fill")
          .labelStyle(.titleAndIcon)
          .fontWeight(.semibold)
          .foregroundStyle(.green)
          .layoutPriority(1)
        Text("·")
      }
      Text(statusText(attributes, state))
    }
    .font(.caption)
    .lineLimit(1)
  }
}

/// Like "+3 min", or nil when it's on time
private func delayText(_ state: BusArrivalAttributes.ContentState) -> String? {
  guard state.realtime else { return "Scheduled" }
  let minutes = Int(((state.expectedArrival - state.aimedArrival) / 60).rounded())
  if minutes >= 1 { return "+\(minutes) min" }
  if minutes <= -1 { return "\(-minutes) min early" }
  return nil
}

/// Counts down to when the bus is expected, and stops at 0:00
private struct Countdown: View {
  let state: BusArrivalAttributes.ContentState

  var body: some View {
    switch state.status {
    case "here":
      Text("Now")
    case "departed", "cancelled":
      Text("–")
    default:
      let arrival = date(state.expectedArrival)
      // A range can't end before it starts
      Text(timerInterval: min(Date(), arrival)...arrival, countsDown: true)
        .multilineTextAlignment(.trailing)
    }
  }
}

private struct LineBadge: View {
  let line: String

  var body: some View {
    Text(line)
      .font(.caption.weight(.heavy))
      .foregroundStyle(.black)
      .padding(.horizontal, 6)
      .padding(.vertical, 2)
      .background(Color.yellow, in: RoundedRectangle(cornerRadius: 5))
  }
}

/// From the stop before yours to yours. Empty until the bus has passed the
/// stop before, then fills up on its own until it's expected at yours.
private struct SegmentProgress: View {
  let attributes: BusArrivalAttributes
  let state: BusArrivalAttributes.ContentState

  var body: some View {
    VStack(spacing: 4) {
      bar.tint(.yellow)
      HStack {
        Text(state.previousStop ?? "")
          .lineLimit(1)
        Spacer(minLength: 8)
        Text(attributes.stopName)
          .lineLimit(1)
      }
      .font(.caption2)
      .foregroundStyle(.white.opacity(0.6))
    }
  }

  @ViewBuilder private var bar: some View {
    if state.status == "here" || state.status == "departed" {
      ProgressView(value: 1)
    } else if let start = state.progressStart, let end = state.progressEnd, state.status != "cancelled" {
      let from = date(start)
      // A range can't end before it starts
      ProgressView(timerInterval: from...max(from, date(end)), countsDown: false) {
        EmptyView()
      } currentValueLabel: {
        EmptyView()
      }
    } else {
      ProgressView(value: 0)
    }
  }
}

private struct BusLockScreenView: View {
  let attributes: BusArrivalAttributes
  let state: BusArrivalAttributes.ContentState
  let isStale: Bool

  var body: some View {
    VStack(alignment: .leading, spacing: 10) {
      HStack(spacing: 8) {
        LineBadge(line: attributes.line)
        Text(attributes.destination)
          .font(.caption.weight(.semibold))
          .foregroundStyle(.white.opacity(0.8))
          .lineLimit(1)
        Spacer(minLength: 8)
        if let delay = delayText(state), state.status == "coming" || state.status == "approaching" {
          Text(delay)
            .font(.caption.weight(.semibold))
            .foregroundStyle(state.realtime ? Color.orange : Color.white.opacity(0.6))
        }
      }

      HStack(alignment: .firstTextBaseline, spacing: 8) {
        VStack(alignment: .leading, spacing: 2) {
          Text(stopLabel)
            .font(.headline)
            .foregroundStyle(.white)
            .lineLimit(1)
          if isStale {
            Text("Open Bragster to update")
              .font(.caption)
              .foregroundStyle(.white.opacity(0.7))
              .lineLimit(1)
          } else {
            StatusLine(attributes: attributes, state: state)
              .foregroundStyle(.white.opacity(0.7))
          }
        }
        Spacer(minLength: 8)
        VStack(alignment: .trailing, spacing: 2) {
          Countdown(state: state)
            .font(.title2.monospacedDigit().weight(.bold))
            .foregroundStyle(.white)
          if state.status == "coming" || state.status == "approaching" {
            Text(date(state.expectedArrival), style: .time)
              .font(.caption.monospacedDigit())
              .foregroundStyle(.white.opacity(0.7))
          }
        }
      }

      if state.previousStop != nil {
        SegmentProgress(attributes: attributes, state: state)
      }
    }
  }

  private var stopLabel: String {
    if let platform = attributes.platform { return "\(attributes.stopName) \(platform)" }
    return attributes.stopName
  }
}
