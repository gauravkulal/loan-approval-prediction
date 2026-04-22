"""Bridge script for Node.js to call the ML prediction pipeline.

Usage (called by Node.js via child_process):
    echo '{"no_of_dependents": 2, ...}' | python model/predict_bridge.py

Reads a JSON payload from stdin, runs inference, writes JSON result to stdout.
"""

import json
import sys
from pathlib import Path

# Ensure the project root is on sys.path so we can import the model package.
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from model.inference import predict_from_payload  # noqa: E402


def main() -> None:
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw)
        result = predict_from_payload(payload)
        sys.stdout.write(json.dumps(result))
    except Exception as exc:
        sys.stdout.write(json.dumps({"error": str(exc)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
