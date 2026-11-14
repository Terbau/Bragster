import ActivityKit
import SwiftUI
import WidgetKit

@main
struct PadelWidgets: WidgetBundle {
  var body: some Widget {
    PadelLiveActivity()
    BusLiveActivity()
  }
}

/// The current match on one of a padel game's courts, on the Lock Screen and
/// in the Dynamic Island. Each court has its own. Started and updated by the
/// app, see `usePadelLiveActivity`.
struct PadelLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: PadelMatchAttributes.self) { context in
      LockScreenView(attributes: context.attributes, state: context.state)
        .padding(16)
        .activityBackgroundTint(Color.black.opacity(0.75))
        .activitySystemActionForegroundColor(.white)
        .widgetURL(gameURL(context.attributes, context.state))
    } dynamicIsland: { context in
      let state = context.state
      return DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          Text(state.waiting == nil ? matchLabel(state) : context.attributes.gameName)
            .font(.caption.weight(.semibold))
            .foregroundStyle(.secondary)
            .padding(.leading, 4)
        }
        DynamicIslandExpandedRegion(.trailing) {
          if let court = state.court {
            Text(court)
              .font(.caption)
              .foregroundStyle(.secondary)
              .lineLimit(1)
              .padding(.trailing, 4)
          }
        }
        DynamicIslandExpandedRegion(.bottom) {
          if let finished = state.finished {
            Text(finished).font(.subheadline.weight(.semibold))
          } else if let waiting = state.waiting {
            Text(waiting)
              .font(.subheadline)
              .foregroundStyle(.secondary)
          } else {
            VStack(spacing: 6) {
              TeamRow(names: state.team1, rating: state.team1Rating)
              TeamRow(names: state.team2, rating: state.team2Rating)
            }
            .padding(.horizontal, 4)
          }
        }
      } compactLeading: {
        Image(systemName: "figure.tennis")
      } compactTrailing: {
        if state.finished != nil {
          Text("Done").font(.caption.weight(.semibold))
        } else if state.waiting != nil {
          Image(systemName: "hourglass")
        } else {
          Text("\(state.matchNumber)/\(state.matchCount)")
            .font(.caption.monospacedDigit().weight(.semibold))
        }
      } minimal: {
        if state.finished != nil {
          Text("✓").font(.caption.weight(.semibold))
        } else if state.waiting != nil {
          Image(systemName: "hourglass")
        } else {
          Text("\(state.matchNumber)")
            .font(.caption.monospacedDigit().weight(.semibold))
        }
      }
      .widgetURL(gameURL(context.attributes, state))
    }
  }
}

/// Opens the game in the app, with the score of the match shown, see the
/// `match` param of src/app/padel/[gameId]/index.tsx
private func gameURL(
  _ attributes: PadelMatchAttributes,
  _ state: PadelMatchAttributes.ContentState
) -> URL? {
  var components = URLComponents()
  components.scheme = "bragster"
  components.host = "padel"
  components.path = "/\(attributes.gameId)"
  if state.finished == nil, state.waiting == nil, let matchId = state.matchId {
    components.queryItems = [URLQueryItem(name: "match", value: matchId)]
  }
  return components.url
}

private func matchLabel(_ state: PadelMatchAttributes.ContentState) -> String {
  let match = "Match \(state.matchNumber) of \(state.matchCount)"
  if let series = state.series { return "Series \(series) · \(match)" }
  return match
}

private struct LockScreenView: View {
  let attributes: PadelMatchAttributes
  let state: PadelMatchAttributes.ContentState

  var body: some View {
    VStack(alignment: .leading, spacing: 10) {
      HStack(spacing: 6) {
        Image(systemName: "figure.tennis")
        // With a card for each court, the court tells them apart
        if let court = state.court, state.finished == nil {
          Text(court)
            .foregroundStyle(.white)
            .lineLimit(1)
            .layoutPriority(2)
          Text("·")
        }
        Text(attributes.gameName)
          .lineLimit(1)
        Spacer(minLength: 8)
        if state.finished == nil, state.waiting == nil {
          Text(matchLabel(state))
            .monospacedDigit()
            .layoutPriority(1)
        }
      }
      .font(.caption.weight(.semibold))
      .foregroundStyle(.white.opacity(0.7))

      if let finished = state.finished {
        Text(finished)
          .font(.headline)
          .foregroundStyle(.white)
      } else if let waiting = state.waiting {
        Text(waiting)
          .font(.headline)
          .foregroundStyle(.white.opacity(0.8))
      } else {
        VStack(spacing: 6) {
          TeamRow(names: state.team1, rating: state.team1Rating)
          HStack(spacing: 8) {
            Text("vs")
              .font(.caption2.weight(.semibold))
              .foregroundStyle(.white.opacity(0.5))
            Rectangle()
              .fill(.white.opacity(0.15))
              .frame(height: 1)
          }
          TeamRow(names: state.team2, rating: state.team2Rating)
        }

        ProgressView(
          value: Double(max(0, state.matchNumber - 1)),
          total: Double(max(1, state.matchCount))
        )
        .tint(.green)
      }
    }
  }
}

private struct TeamRow: View {
  let names: [String]
  let rating: Int?

  var body: some View {
    HStack(alignment: .firstTextBaseline, spacing: 8) {
      Text(names.joined(separator: " & "))
        .font(.headline)
        .foregroundStyle(.white)
        .lineLimit(1)
        .minimumScaleFactor(0.75)
      Spacer(minLength: 8)
      if let rating {
        HStack(alignment: .firstTextBaseline, spacing: 3) {
          Text("\(rating)")
            .font(.subheadline.monospacedDigit().weight(.semibold))
            .foregroundStyle(.white)
          Text("avg")
            .font(.caption2)
            .foregroundStyle(.white.opacity(0.6))
        }
      }
    }
  }
}
