#!/usr/bin/env python3
"""Render committed paper aggregates without implying raw-data access."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def signed(value: float) -> str:
    return f"{value:+.4f}"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--source", type=Path, default=ROOT / "results" / "paper_tables.json"
    )
    args = parser.parse_args()
    data = json.loads(args.source.read_text())

    print("TABLE 1: held-out NDCG@10")
    print("Regime | Control | PEC-Fuse | Delta | 95% CI")
    for row in data["table_1"]:
        print(
            f"{row['regime']} | {row['control']:.4f} | {row['pec_fuse']:.4f} | "
            f"{signed(row['delta'])} | [{row['ci_low']:.4f}, {row['ci_high']:.4f}]"
        )

    print("\nTABLE 2: representation and trace-replay diagnostics")
    print("Protocol | Regime | Reference | Decomposed | Delta | 95% CI")
    for row in data["table_2"]:
        print(
            f"{row['protocol']} | {row['regime']} | {row['reference']:.4f} | "
            f"{row['decomposed']:.4f} | {signed(row['delta'])} | "
            f"[{row['ci_low']:.4f}, {row['ci_high']:.4f}]"
        )

    print("\nTABLE 3: source-disagreement test")
    print("Regime | High-P/low-E | Other | Difference | 95% CI")
    for row in data["table_3"]:
        print(
            f"{row['regime']} | {signed(row['high_p_low_e'])} | "
            f"{signed(row['other'])} | {signed(row['difference'])} | "
            f"[{row['ci_low']:.4f}, {row['ci_high']:.4f}]"
        )


if __name__ == "__main__":
    main()
