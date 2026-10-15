"""
python -m padel_analyzer analyze VIDEO [--debug PNG]   prints the result as JSON
python -m padel_analyzer worker                        analyses videos from the queue
"""

from __future__ import annotations

import argparse
import json
import logging


def main() -> None:
    parser = argparse.ArgumentParser(prog="padel_analyzer")
    commands = parser.add_subparsers(dest="command", required=True)
    analyze_parser = commands.add_parser("analyze", help="Analyse a video file")
    analyze_parser.add_argument("video")
    analyze_parser.add_argument(
        "--debug", metavar="PNG", help="Draw the activity and rallies"
    )
    commands.add_parser("worker", help="Analyse the videos waiting in the queue")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    # The Azure SDK logs every request at INFO
    logging.getLogger("azure").setLevel(logging.WARNING)
    if args.command == "analyze":
        from .analysis import analyze, draw_debug

        result, timeline, rallies = analyze(args.video)
        if args.debug:
            draw_debug(timeline, rallies, args.debug)
        print(json.dumps(result, indent=2))
    else:
        from .worker import run

        run()


if __name__ == "__main__":
    main()
