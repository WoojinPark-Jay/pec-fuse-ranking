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
    if not __debug__:
        raise SystemExit("Run without -O or PYTHONOPTIMIZE; aggregate assertions must be enabled.")
    manifest = json.loads((ROOT / "RELEASE_MANIFEST.json").read_text())
    assert manifest["file_count"] == len(manifest["files"])
    hashed_files = 0
    for name, expected in manifest["files"].items():
        path = ROOT / name
        if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != expected:
            raise SystemExit(
                f"Release file missing or SHA-256 mismatch: {name}\n"
                "Use an unchanged checkout or archive of this release for verification."
            )
        hashed_files += 1
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
    mind_protocol = json.loads((DATA / "mind_expanded_protocol.json").read_text())
    expected_widths = {"Controls_E_8": 8, "PC_Direct_14": 14,
                       "PEC_Direct_15": 15, "Full_PEC_proxy_21": 21}
    assert {name: len(cols) for name, cols in mind_protocol["model_columns"].items()} == expected_widths
    assert mind_protocol["encoders"] == ["bge_m3", "bge_base"]
    assert (mind_protocol["fitting"], mind_protocol["validation"], mind_protocol["development"]) == (51000, 9000, 30000)
    runner = ROOT / "scripts" / "run_mind_expanded_membership.py"
    runner_hash = hashlib.sha256(runner.read_bytes()).hexdigest()
    assert mind_protocol["source_hashes"]["scripts/run_mind_expanded_membership.py"] == runner_hash
    assert mind_protocol["source_hashes"] == {
        "scripts/run_mind_expanded_membership.py": runner_hash,
        "MINDsmall_train/behaviors.tsv": "a424547c8fa17c9ea4879c2110221c2b2f2709f4f7615ede0b0d8e4765158658",
        "MINDsmall_train/news.tsv": "cd49d7da275e9c405f627d75a0de9d4ec6ad43ff8a8db5d23a447591676e09d6",
        "MINDsmall_dev/behaviors.tsv": "b6c460e33b1a8693252ded6e626da7d3ccf78920eea2ec11889020bb7d8443ef",
        "MINDsmall_dev/news.tsv": "e5d144667558c449d16084fe6bfa01940c2f5d5785ea9f9110292bc3b94eb822",
    }
    mind = pd.read_csv(DATA / "mind_expanded_results.csv")
    assert set(mind["encoder"]) == {"bge_m3", "bge_base"}
    assert set(mind["model"]) == set(expected_widths)
    assert len(mind) == 8 and mind["queries"].eq(30000).all()
    assert all(int(r.fields) == expected_widths[r.model] for r in mind.itertuples())
    for encoder in ("bge_m3", "bge_base"):
        scores = mind[mind["encoder"] == encoder].set_index("model")["ndcg10"]
        assert scores["Full_PEC_proxy_21"] > scores["PEC_Direct_15"] > scores["Controls_E_8"]
    mind_bootstrap = json.loads((DATA / "mind_expanded_user_bootstrap.json").read_text())
    assert mind_bootstrap["replicates"] == 10000
    assert (mind_bootstrap["queries"], mind_bootstrap["users"]) == (30000, 25003)
    assert mind_bootstrap["multiplicity"].startswith("Nominal intervals")
    ndcg_products = [r for r in mind_bootstrap["results"]
                     if r["comparison"] == "products_added" and r["metric"] == "ndcg10"]
    assert len(ndcg_products) == 2 and all(r["excludes_zero"] and r["difference"] > 0 for r in ndcg_products)
    print(json.dumps({"revision": manifest["revision"], "hashed_files": hashed_files,
        "verification_mode": "full_release",
        "file_hash_verification": "passed",
        "aggregate_checks": "passed",
        "ordered_features": 25, "fusion_seed_records": len(seeds),
        "fusion_comparisons": len(fusion),
        "direct_comparisons": len(direct), "pool_score_rows": len(pools),
        "mind_score_rows": len(mind), "mind_bootstrap_replicates": mind_bootstrap["replicates"],
        "status": "passed",
        "scope": "release file hashes plus aggregate schema and arithmetic; "
                 "not private experiment reproduction"}, indent=2))

if __name__ == "__main__":
    main()
