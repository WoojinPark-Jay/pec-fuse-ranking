"""Print the active IEEE Access aggregate summary without private rows."""

from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "access" / "data"


def show(title: str, filename: str) -> None:
    print(f"\n{title}\n{'=' * len(title)}")
    frame = pd.read_csv(DATA / filename)
    print(frame.to_string(index=False))


def main() -> None:
    show("Headline and compression metrics", "core_test_metrics.csv")
    show("Primary paired intervals", "core_user_bootstrap.csv")
    show("Multidimensional fusion intervals", "fusion_paired_intervals.csv")
    show("Direct 19-D versus Complete 25-D", "direct_complete_user_bootstrap.csv")
    show("Joint profile/trace removal", "joint_pe_user_bootstrap.csv")
    show("Candidate reselection", "pool_paired_differences.csv")


if __name__ == "__main__":
    main()
