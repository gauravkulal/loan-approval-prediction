"""Bridge script for Node.js to trigger model training.

Usage (called by Node.js via child_process):
    echo '{"test_size": 0.2}' | python model/train_bridge.py

Reads optional config from stdin, trains models, writes JSON result to stdout.
"""

import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from model.train import train_and_save_model  # noqa: E402


def main() -> None:
    try:
        raw = sys.stdin.read().strip()
        config = json.loads(raw) if raw else {}
        test_size = float(config.get("test_size", 0.2))

        result = train_and_save_model(test_size=test_size)

        # Convert Path objects to strings for JSON serialisation.
        serialisable = {}
        for key, value in result.items():
            if isinstance(value, Path):
                serialisable[key] = str(value)
            else:
                serialisable[key] = value

        sys.stdout.write(json.dumps(serialisable))
    except Exception as exc:
        sys.stdout.write(json.dumps({"error": str(exc)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
