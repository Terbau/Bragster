import ActivityKit
import AppIntents
import SwiftUI
import WidgetKit

/// A trip to somewhere, on the Lock Screen and in the Dynamic Island: what
/// to do now, like which stop to walk to, which bus to take and when to get
/// off, and when you get there. Started and updated by the app, see
/// src/lib/journey.ts, which also writes the texts. The countdown and the
/// progress bar run by themselves between updates.
struct JourneyLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: JourneyAttributes.self) { context in
      JourneyLockScreenView(state: context.state, isStale: context.isStale)
        .padding(16)
        .activityBackgroundTint(Color.black.opacity(0.75))
        .activitySystemActionForegroundColor(.white)
        .widgetURL(journeyURL)
    } dynamicIsland: { context in
      let state = context.state
      return DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          HStack(spacing: 6) {
            StepIcon(state: state)
            if let line = state.line { JourneyLineBadge(line: line) }
          }
          .padding(.leading, 4)
        }
        DynamicIslandExpandedRegion(.trailing) {
          JourneyCountdown(state: state)
            .font(.title3.monospacedDigit().weight(.bold))
            .padding(.trailing, 4)
        }
        DynamicIslandExpandedRegion(.bottom) {
          VStack(alignment: .leading, spacing: 6) {
            if let notice = urgentNotice(state) {
              UrgentNotice(notice: notice)
            }
            Text(state.headline)
              .font(.subheadline.weight(.semibold))
              .lineLimit(1)
            JourneyDetail(state: state)
              .foregroundStyle(.secondary)
            HStack(alignment: .center, spacing: 8) {
              JourneyFooter(state: state)
                .foregroundStyle(.secondary)
              Spacer(minLength: 4)
              JourneyQuickAction(state: state)
            }
          }
          .padding(.horizontal, 4)
        }
      } compactLeading: {
        HStack(spacing: 4) {
          IslandIcon(state: state)
          if let line = state.line {
            Text(line).font(.caption.weight(.bold))
          }
        }
      } compactTrailing: {
        JourneyCountdown(state: state)
          .font(.caption.monospacedDigit().weight(.semibold))
          .minimumScaleFactor(0.7)
          .lineLimit(1)
          .frame(maxWidth: 52)
      } minimal: {
        IslandIcon(state: state)
      }
      .widgetURL(journeyURL)
    }
  }
}

/// Opens the trip in the app, see src/app/bus/journey.tsx
private let journeyURL = URL(string: "bragster://bus/journey")

private func journeyDate(_ seconds: Double) -> Date {
  Date(timeIntervalSince1970: seconds)
}

private func isBusInSight(_ state: JourneyAttributes.ContentState) -> Bool {
  state.inSight == true && state.step == "wait"
}

/// Something you have to act on, like a bus that left without you, that was
/// said with a sound. It's said for a couple of minutes.
private func urgentNotice(_ state: JourneyAttributes.ContentState) -> String? {
  state.urgent == true ? state.notice : nil
}

/// Interactive iOS 17+ Lock Screen action for switching routes or finishing a stopover
private struct JourneyQuickAction: View {
  let state: JourneyAttributes.ContentState

  var body: some View {
    if #available(iOS 17.0, *) {
      if state.canSwitch == true {
        Button(intent: SwitchRouteIntent()) {
          Label("Switch", systemImage: "bolt.fill")
            .font(.caption.weight(.bold))
            .foregroundStyle(.black)
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(Color.orange, in: Capsule())
        }
        .buttonStyle(.plain)
      } else if state.canFinishStopover == true {
        Button(intent: FinishStopoverIntent()) {
          Label("Done here", systemImage: "checkmark")
            .font(.caption.weight(.bold))
            .foregroundStyle(.black)
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(Color.white, in: Capsule())
        }
        .buttonStyle(.plain)
      }
    }
  }
}

/// Like "Line 3 left without you", in orange so it's seen at a glance
private struct UrgentNotice: View {
  let notice: String

  var body: some View {
    HStack(spacing: 6) {
      Image(systemName: "exclamationmark.triangle.fill")
      Text(notice).lineLimit(2)
      Spacer(minLength: 0)
    }
    .font(.subheadline.weight(.bold))
    .foregroundStyle(.black)
    .padding(.horizontal, 10)
    .padding(.vertical, 6)
    .background(Color.orange, in: RoundedRectangle(cornerRadius: 8))
  }
}

/// The step, or an orange warning while something urgent is said, in the
/// small Dynamic Island
private struct IslandIcon: View {
  let state: JourneyAttributes.ContentState

  var body: some View {
    if urgentNotice(state) != nil {
      Image(systemName: "exclamationmark.triangle.fill").foregroundStyle(.orange)
    } else {
      StepIcon(state: state)
    }
  }
}

/// What to do now, as a picture. A green eye once the bus is in sight.
private struct StepIcon: View {
  let state: JourneyAttributes.ContentState

  var body: some View {
    if isBusInSight(state) {
      Image(systemName: "eye.fill").foregroundStyle(.green)
    } else {
      Image(systemName: name)
    }
  }

  private var name: String {
    switch state.step {
    case "walk": return "figure.walk"
    case "wait", "ride": return "bus.fill"
    case "rental": return state.vehicleMode == "bicycle" ? "bicycle" : "scooter"
    case "stay": return "mappin.and.ellipse"
    case "scheduled": return "clock.fill"
    case "arrived": return "checkmark.circle.fill"
    default: return "location.fill"
    }
  }
}

private struct JourneyLineBadge: View {
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

/// Counts down to what happens next, and stops at 0:00
private struct JourneyCountdown: View {
  let state: JourneyAttributes.ContentState

  var body: some View {
    if let seconds = state.countdownTo {
      let to = journeyDate(seconds)
      // A range can't end before it starts
      Text(timerInterval: min(Date(), to)...to, countsDown: true)
        .multilineTextAlignment(.trailing)
    } else if let arrival = state.arrival, state.step != "arrived" {
      Text(journeyDate(arrival), style: .time)
    } else {
      Text("")
    }
  }
}

/// Like "350 m · the bus leaves 14:32", with a green "In sight" in front
/// once the bus can be seen from the stop
private struct JourneyDetail: View {
  let state: JourneyAttributes.ContentState

  var body: some View {
    HStack(spacing: 4) {
      if isBusInSight(state) {
        Label("In sight", systemImage: "eye.fill")
          .labelStyle(.titleAndIcon)
          .fontWeight(.semibold)
          .foregroundStyle(.green)
          .layoutPriority(1)
        if state.detail != nil { Text("·") }
      }
      if let detail = state.detail { Text(detail) }
    }
    .font(.caption)
    .lineLimit(1)
  }
}

/// Where the trip ends and when, or that a faster route has been found
private struct JourneyFooter: View {
  let state: JourneyAttributes.ContentState

  var body: some View {
    HStack(spacing: 4) {
      // An urgent one is shown above instead
      if let notice = state.notice, state.urgent != true {
        Image(systemName: "bolt.fill").foregroundStyle(.orange)
        Text(notice).foregroundStyle(.orange).fontWeight(.semibold)
      } else if state.step != "arrived" {
        Image(systemName: "flag.checkered")
        Text(state.destination)
        if let arrival = state.arrival {
          Text("·")
          Text(journeyDate(arrival), style: .time).layoutPriority(1)
        }
      }
    }
    .font(.caption2)
    .lineLimit(1)
  }
}

private struct JourneyLockScreenView: View {
  let state: JourneyAttributes.ContentState
  let isStale: Bool

  var body: some View {
    VStack(alignment: .leading, spacing: 10) {
      if let notice = urgentNotice(state) {
        UrgentNotice(notice: notice)
      }
      HStack(alignment: .center, spacing: 8) {
        StepIcon(state: state)
          .font(.body.weight(.semibold))
          .foregroundStyle(.white)
        if let line = state.line { JourneyLineBadge(line: line) }
        VStack(alignment: .leading, spacing: 2) {
          Text(state.headline)
            .font(.headline)
            .foregroundStyle(.white)
            .lineLimit(1)
            .minimumScaleFactor(0.8)
          if isStale {
            Text("Open Bragster to update")
              .font(.caption)
              .foregroundStyle(.white.opacity(0.7))
              .lineLimit(1)
          } else {
            JourneyDetail(state: state)
              .foregroundStyle(.white.opacity(0.7))
          }
        }
        Spacer(minLength: 8)
        if state.countdownTo != nil {
          VStack(alignment: .trailing, spacing: 2) {
            JourneyCountdown(state: state)
              .font(.title2.monospacedDigit().weight(.bold))
              .foregroundStyle(.white)
            if let label = state.countdownLabel {
              Text(label)
                .font(.caption2)
                .foregroundStyle(.white.opacity(0.7))
            }
          }
        }
      }

      if let start = state.progressStart, let end = state.progressEnd {
        let from = journeyDate(start)
        // A range can't end before it starts
        ProgressView(timerInterval: from...max(from, journeyDate(end)), countsDown: false) {
          EmptyView()
        } currentValueLabel: {
          EmptyView()
        }
        .tint(.yellow)
      }

      HStack(alignment: .center, spacing: 8) {
        JourneyFooter(state: state)
          .foregroundStyle(.white.opacity(0.7))
        Spacer(minLength: 4)
        JourneyQuickAction(state: state)
      }
    }
  }
}
