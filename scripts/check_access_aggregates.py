"""Validate distributed aggregate arithmetic; does not reproduce private training."""
from pathlib import Path
import hashlib
import json
import sys
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "access" / "data"
sys.path.insert(0, str(ROOT / "src"))
from pec_fuse.schema import FEATURES_25, STRONG_CONTROL_FEATURES, SHARED_CONTEXT_FEATURES

def main():
    manifest = json.loads((ROOT / "RELEASE_MANIFEST.json").read_text())
    for name, expected in manifest["files"].items():
        assert hashlib.sha256((ROOT / name).read_bytes()).hexdigest() == expected, name
    schema = pd.read_csv(DATA / "feature_dictionary.csv")
    assert len(schema) == 25 and schema["feature"].is_unique
    assert schema["order"].tolist() == list(range(1, 26))
    assert tuple(schema["feature"]) == FEATURES_25
    assert len(STRONG_CONTROL_FEATURES) == 11
    assert len(SHARED_CONTEXT_FEATURES) == 14
    protocol = json.loads((DATA / "fusion_protocol.json").read_text())
    assert list(SHARED_CONTEXT_FEATURES) == protocol["common_features"]
    for path in DATA.glob("*.csv"):
        frame = pd.read_csv(path)
        assert not {"user_id", "query_id", "candidate_id", "article_id"}.intersection(frame.columns), path.name
    seeds = pd.read_csv(DATA / "fusion_seed_metrics.csv")
    assert len(seeds) == 60
    assert set(seeds["seed"]) == {7, 13, 42, 101, 202}
    assert seeds.groupby(["regime", "model"])["seed"].nunique().eq(5).all()
    mean = seeds.groupby(["regime", "model"])[["ndcg@10", "recall@10", "mrr"]].mean()
    fusion = pd.read_csv(DATA / "fusion_paired_intervals.csv")
    for r in fusion.itertuples():
        d = mean.loc[(r.regime, r.left), r.metric] - mean.loc[(r.regime, r.right), r.metric]
        assert np.isclose(d, r.delta, atol=1e-12, rtol=0)
        assert r.user_ci_low <= r.user_ci_high
    direct = pd.read_csv(DATA / "direct_complete_user_bootstrap.csv")
    for r in direct.itertuples():
        a = mean.loc[(r.regime, "full_pec"), r.metric]
        b = mean.loc[(r.regime, "direct_pec"), r.metric]
        assert np.isclose(a, r.complete_mean, atol=1e-12, rtol=0)
        assert np.isclose(b, r.direct_mean, atol=1e-12, rtol=0)
        assert np.isclose(a-b, r.delta, atol=1e-12, rtol=0)
        assert r.user_ci_low <= r.user_ci_high
    pools = pd.read_csv(DATA / "pool_metrics.csv", dtype={"seed": str}).set_index(["seed", "model"])
    for r in pd.read_csv(DATA / "pool_paired_differences.csv", dtype={"seed": str}).itertuples():
        left, right = r.comparison.split("-")
        d = pools.loc[(r.seed, left), r.metric] - pools.loc[(r.seed, right), r.metric]
        assert np.isclose(d, r.delta, atol=1e-12, rtol=0)
        assert r.ci_low <= r.ci_high
    manifest_pools = json.loads((DATA / "pool_manifest.json").read_text())
    assert {r["seed"] for r in manifest_pools} == {7,13,42,101,202}
    assert all(r["rows"] == 21207 and r["queries"] == 1040 for r in manifest_pools)
    print(json.dumps({"revision": manifest["revision"], "hashed_files": len(manifest["files"]),
        "ordered_features": 25, "fusion_seed_records": len(seeds),
        "fusion_comparisons": len(fusion),
        "direct_comparisons": len(direct), "pool_score_rows": len(pools),
        "status": "passed", "scope": "aggregate integrity and arithmetic; not private experiment reproduction"}, indent=2))

if __name__ == "__main__":
    main()
