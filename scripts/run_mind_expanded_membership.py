"""Fixed-protocol expanded-slate MIND comparison; never overwrites prior runs."""
import os
for _key in ("OMP_NUM_THREADS", "OPENBLAS_NUM_THREADS", "MKL_NUM_THREADS", "VECLIB_MAXIMUM_THREADS"):
    os.environ[_key] = "1"

import argparse
import csv
import hashlib
import json
import platform
import time
import traceback
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import sklearn
from sklearn.ensemble import ExtraTreesClassifier
from threadpoolctl import threadpool_limits


ROOT = Path(__file__).resolve().parents[1]
FEATURES = [
    "article_ctr", "log_article_impressions", "category_ctr", "subcategory_ctr",
    "log_history_length", "log_title_characters", "log_abstract_characters",
    "P_mean_vector_cosine", "P_category_share", "P_subcategory_share",
    "C_mean", "C_max", "C_top3", "C_attention", "E_slate_member",
    "P_sem_x_E", "C_mean_x_E", "C_max_x_E", "C_attention_x_E",
    "P_sem_x_C_mean", "P_sem_x_C_attention",
]
MODELS = {
    "Controls_E_8": list(range(7)) + [14],
    "PC_Direct_14": list(range(14)),
    "PEC_Direct_15": list(range(15)),
    "Full_PEC_proxy_21": list(range(21)),
}
GRID = [
    dict(n_estimators=240, max_depth=10, min_samples_leaf=2),
    dict(n_estimators=240, max_depth=18, min_samples_leaf=2),
    dict(n_estimators=420, max_depth=12, min_samples_leaf=3),
    dict(n_estimators=420, max_depth=None, min_samples_leaf=4),
]


def dump(path, obj):
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(obj, indent=2, ensure_ascii=True), encoding="utf-8")
    tmp.replace(path)


def digest(path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(8 * 1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def query_seed(query, purpose):
    value = f"42:{purpose}:{query}".encode()
    return int.from_bytes(hashlib.sha256(value).digest()[:8], "little")


def read_behaviors(path, limit, prefix):
    records = []
    with path.open(encoding="utf-8") as f:
        for i, line in enumerate(f):
            if i == limit:
                break
            impression, user, date, history, slate = line.rstrip("\r\n").split("\t")
            pairs = [token.rsplit("-", 1) for token in slate.split()]
            labels = [int(label) for _, label in pairs]
            if not pairs or not set(labels).issubset({0, 1}):
                raise ValueError("Empty or invalid labeled slate")
            records.append(dict(
                query=f"{prefix}:{impression}", date=datetime.strptime(date, "%m/%d/%Y %I:%M:%S %p"),
                history=history.split(), slate=[item for item, _ in pairs], labels=labels,
            ))
    if len(records) != limit:
        raise ValueError(f"Expected {limit} behaviors at {path}")
    return records


def read_news(paths):
    news = {}
    for path in paths:
        with path.open(encoding="utf-8") as f:
            for line in f:
                parts = line.rstrip("\r\n").split("\t")
                if len(parts) < 5:
                    raise ValueError("Invalid news row")
                news.setdefault(parts[0], tuple(parts[1:5]))
    return news


def statistics(records, news):
    counts = [Counter() for _ in range(6)]
    ai, ac, ci, cc, si, sc = counts
    for record in records:
        for item, label in zip(record["slate"], record["labels"]):
            category, subcategory, _, _ = news[item]
            ai[item] += 1
            ac[item] += label
            ci[category] += 1
            cc[category] += label
            si[subcategory] += 1
            sc[subcategory] += label
    pool = sorted(ai, key=lambda item: (-ai[item], item))[:5000]
    controls = {}
    for item, (category, subcategory, title, abstract) in news.items():
        controls[item] = [
            (ac[item] + 1) / (ai[item] + 2), np.log1p(ai[item]),
            (cc[category] + 1) / (ci[category] + 2),
            (sc[subcategory] + 1) / (si[subcategory] + 2),
            0.0, np.log1p(len(title)), np.log1p(len(abstract)),
        ]
    return controls, pool


def plan_candidates(records, pool):
    plans = []
    pool_array = np.asarray(pool, dtype=object)
    for record in records:
        excluded = set(record["slate"]) | set(record["history"])
        rng = np.random.default_rng(query_seed(record["query"], "candidate-sampling"))
        added = []
        # A random permutation followed by rejection is uniform sampling without replacement.
        for item in pool_array[rng.permutation(len(pool_array))]:
            if item not in excluded:
                added.append(str(item))
                if len(added) == 10:
                    break
        items = record["slate"] + added
        labels = np.asarray(record["labels"] + [0] * len(added), dtype=np.uint8)
        tie = np.random.default_rng(query_seed(record["query"], "tie-order")).permutation(len(items))
        plans.append((items, labels, len(record["slate"]), tie))
    return plans


def assemble(records, plans, controls, news, vectors, lookup, label, event):
    rows = sum(len(p[0]) for p in plans)
    X = np.empty((rows, len(FEATURES)), dtype=np.float32)
    y = np.empty(rows, dtype=np.uint8)
    ties = np.empty(rows, dtype=np.int32)
    offsets = [0]
    fingerprint = hashlib.sha256()
    pos = 0
    source_counts = {"logged": dict(rows=0, positives=0), "added": dict(rows=0, positives=0)}
    for q, (record, plan) in enumerate(zip(records, plans)):
        items, labels, logged_count, tie = plan
        size = len(items)
        candidate = vectors[[lookup[item] for item in items]]
        history = record["history"][-30:]
        block = np.zeros((size, len(FEATURES)), dtype=np.float32)
        block[:, :7] = np.asarray([controls[item] for item in items], dtype=np.float32)
        block[:, 4] = np.log1p(len(history))
        if history:
            hist_vectors = vectors[[lookup[item] for item in history]]
            similarities = candidate @ hist_vectors.T
            mean_vector = hist_vectors.mean(axis=0)
            norm = np.linalg.norm(mean_vector)
            if norm > 0:
                block[:, 7] = candidate @ (mean_vector / norm)
            categories = Counter(news[item][0] for item in history)
            subcategories = Counter(news[item][1] for item in history)
            block[:, 8] = [categories[news[item][0]] / len(history) for item in items]
            block[:, 9] = [subcategories[news[item][1]] / len(history) for item in items]
            block[:, 10] = similarities.mean(axis=1)
            block[:, 11] = similarities.max(axis=1)
            k = min(3, len(history))
            block[:, 12] = np.partition(similarities, len(history) - k, axis=1)[:, -k:].mean(axis=1)
            # Fixed candidate-aware attention; no history-age units are inferred from row position.
            logits = similarities / 0.18
            logits -= logits.max(axis=1, keepdims=True)
            weights = np.exp(logits)
            weights /= weights.sum(axis=1, keepdims=True)
            block[:, 13] = (weights * similarities).sum(axis=1)
        block[:logged_count, 14] = 1
        block[:, 15] = block[:, 7] * block[:, 14]
        block[:, 16] = block[:, 10] * block[:, 14]
        block[:, 17] = block[:, 11] * block[:, 14]
        block[:, 18] = block[:, 13] * block[:, 14]
        block[:, 19] = block[:, 7] * block[:, 10]
        block[:, 20] = block[:, 7] * block[:, 13]
        X[pos:pos + size], y[pos:pos + size], ties[pos:pos + size] = block, labels, tie
        fingerprint.update((record["query"] + "\t" + " ".join(items) + "\n").encode())
        fingerprint.update(labels.tobytes())
        source_counts["logged"]["rows"] += logged_count
        source_counts["logged"]["positives"] += int(labels[:logged_count].sum())
        source_counts["added"]["rows"] += size - logged_count
        pos += size
        offsets.append(pos)
        if (q + 1) % 10000 == 0:
            event("feature_progress", split=label, queries=q + 1)
    if not np.isfinite(X).all():
        raise ValueError("Nonfinite features")
    for counts in source_counts.values():
        counts["positive_rate"] = counts["positives"] / max(counts["rows"], 1)
    return dict(X=X, y=y, ties=ties, offsets=np.asarray(offsets, dtype=np.int64),
                queries=[r["query"] for r in records], fingerprint=fingerprint.hexdigest(), sources=source_counts)


def evaluate(data, scores):
    lengths = np.diff(data["offsets"])
    groups = np.repeat(np.arange(len(lengths)), lengths)
    order = np.lexsort((data["ties"], -scores, groups))
    ranks = np.arange(len(order)) - np.repeat(data["offsets"][:-1], lengths) + 1
    labels = data["y"][order]
    discounts = np.where(ranks <= 10, 1 / np.log2(ranks + 1), 0)
    dcg = np.add.reduceat(labels * discounts, data["offsets"][:-1])
    positives = np.add.reduceat(data["y"].astype(np.int64), data["offsets"][:-1])
    ideal = np.r_[0, np.cumsum(1 / np.log2(np.arange(1, 11) + 1))]
    idcg = ideal[np.minimum(positives, 10)]
    ndcg = np.divide(dcg, idcg, out=np.zeros_like(dcg), where=idcg > 0)
    hits = np.add.reduceat(labels * (ranks <= 10), data["offsets"][:-1])
    recall = np.divide(hits, positives, out=np.zeros(len(lengths)), where=positives > 0)
    first = np.minimum.reduceat(np.where(labels == 1, ranks, np.inf), data["offsets"][:-1])
    mrr = 1 / first
    return dict(queries=len(lengths), zero_positive_queries=int((positives == 0).sum()),
                ndcg10=float(ndcg.mean()), recall10=float(recall.mean()), mrr=float(mrr.mean())), (ndcg, recall, mrr)


def train_score(fit, target, columns, config, jobs, event, tag):
    event("fit_start", tag=tag, config=config, rows=len(fit["y"]))
    model = ExtraTreesClassifier(**config, random_state=42, n_jobs=jobs,
                                class_weight="balanced_subsample", bootstrap=False, max_features="sqrt")
    model.fit(fit["X"][:, columns], fit["y"])
    class_index = list(model.classes_).index(1)
    scores = model.predict_proba(target["X"][:, columns])[:, class_index]
    event("fit_complete", tag=tag)
    return scores


def run(args):
    output = args.output
    output.mkdir(parents=True, exist_ok=True)
    protocol_path = output / "protocol.json"
    if protocol_path.exists():
        raise FileExistsError("Existing run: refusing to overwrite")
    start = time.monotonic()

    def event(name, **values):
        entry = dict(event=name, elapsed_seconds=round(time.monotonic() - start, 2), **values)
        line = json.dumps(entry)
        print(line, flush=True)
        with (output / "events.jsonl").open("a") as f:
            f.write(line + "\n")

    raw_paths = [args.mind_root / f"MINDsmall_{s}" / f for s in ("train", "dev") for f in ("behaviors.tsv", "news.tsv")]
    protocol = dict(
        status="running", started_utc=datetime.now(timezone.utc).isoformat(),
        encoders=["bge_m3", "bge_base"], model_columns={k: [FEATURES[i] for i in v] for k, v in MODELS.items()},
        grid=GRID, seed=42, jobs=args.jobs, train=60000, fitting=51000, validation=9000, development=30000,
        sampling="First 60000 training file rows, stably sorted by timestamp, then chronological 85/15 split; first 30000 development file rows",
        history="Last 30 listed pre-impression clicks; repeated events retained; empty history gives zero P/C",
        P="Normalized mean-history vector cosine, category history share, subcategory history share",
        C="Mean, maximum, top-three mean, softmax(similarity/0.18)-weighted mean of individual history cosines; no age decay",
        E="Original logged slate membership only; shuffled file order is never a predictor",
        candidate_expansion="Up to 10 uniform draws without replacement from top 5000 training-impressed articles; exclude whole logged slate and entire listed history; query-keyed seed42",
        weak_negatives="Added candidates receive label0, not observed nonclicks or verified non-exposures",
        selection_statistics="CTR and candidate pool from fitting51000 only; logged rows only",
        final_statistics="CTR and candidate pool rebuilt from training60000 after selection; no development labels",
        ctr="Laplace (clicks+1)/(impressions+2), unseen key=0.5; exposures include repeated logged candidates",
        encoding="Reuse archived normalized BGE embeddings; input was title+abstract+category+subcategory, 512-character truncation, max sequence192; no new embedding fit",
        preprocessing="Raw float32 tabular features, no fitted scaler; ExtraTrees does not require scaling",
        ties="Fixed query-keyed random permutation, independent of labels, source and encoder, used only to break score ties",
        metrics="Mean query NDCG@10, recall@10 and MRR; zero-positive queries included with zero scores",
        diagnostics="Membership-first, membership-last and random-order scores; no fitted diagnostic selection",
        limitations="Expanded-pool experiment; E reveals candidate origin correlated with imposed labels; not causal exposure or independent stated-profile replication",
        versions=dict(python=platform.python_version(), numpy=np.__version__, sklearn=sklearn.__version__),
        source_hashes={
            "scripts/run_mind_expanded_membership.py": digest(Path(__file__)),
            **{
                f"MINDsmall_{split}/{filename}": digest(
                    args.mind_root / f"MINDsmall_{split}" / filename
                )
                for split in ("train", "dev")
                for filename in ("behaviors.tsv", "news.tsv")
            },
        },
    )
    dump(protocol_path, protocol)
    try:
        event("start")
        news = read_news([args.mind_root / f"MINDsmall_{s}" / "news.tsv" for s in ("train", "dev")])
        training = read_behaviors(raw_paths[0], 60000, "train")
        training.sort(key=lambda r: r["date"])
        fitting, validation = training[:51000], training[51000:]
        development = read_behaviors(raw_paths[2], 30000, "dev")
        select_controls, select_pool = statistics(fitting, news)
        final_controls, final_pool = statistics(training, news)
        plans = {
            "fit": plan_candidates(fitting, select_pool),
            "validation": plan_candidates(validation, select_pool),
            "refit": plan_candidates(training, final_pool),
            "dev": plan_candidates(development, final_pool),
        }
        dump(output / "candidate_pools.json", dict(selection=select_pool, final=final_pool))
        results, shared_control, reference_fingerprints = [], None, None
        for encoder in protocol["encoders"]:
            cache = ROOT / "cache" / "mind_proxy_text" / f"{encoder}_mind_news_vectors.npz"
            protocol.setdefault("embedding_hashes", {})[encoder] = digest(cache)
            dump(protocol_path, protocol)
            with np.load(cache, allow_pickle=True) as z:
                ids = z["ids"].tolist()
                vectors = z["embeddings"].astype(np.float32, copy=True)
            if not np.isfinite(vectors).all() or len(set(ids)) != len(ids):
                raise ValueError("Invalid archived embeddings")
            norms = np.linalg.norm(vectors, axis=1, keepdims=True)
            vectors = np.divide(vectors, norms, out=np.zeros_like(vectors), where=norms > 0)
            lookup = {item: i for i, item in enumerate(ids)}
            datasets = {}
            for split, records, controls in (
                ("fit", fitting, select_controls), ("validation", validation, select_controls),
                ("refit", training, final_controls), ("dev", development, final_controls),
            ):
                datasets[split] = assemble(records, plans[split], controls, news, vectors, lookup, f"{encoder}/{split}", event)
            fingerprints = {k: v["fingerprint"] for k, v in datasets.items()}
            if reference_fingerprints is not None and fingerprints != reference_fingerprints:
                raise ValueError("Candidate rows changed across encoders")
            reference_fingerprints = fingerprints
            dump(output / f"{encoder}_candidate_audit.json", {k: dict(fingerprint=v["fingerprint"], rows=len(v["y"]), queries=len(v["queries"]), sources=v["sources"]) for k, v in datasets.items()})
            event("features_ready", encoder=encoder)
            if encoder == "bge_m3":
                diagnostics = {}
                for name, scores in (
                    ("membership_first", datasets["dev"]["X"][:, 14]),
                    ("membership_last", -datasets["dev"]["X"][:, 14]),
                    ("random_order", np.zeros(len(datasets["dev"]["y"]))),
                ):
                    diagnostics[name] = evaluate(datasets["dev"], scores)[0]
                dump(output / "membership_diagnostics.json", diagnostics)
                event("membership_diagnostics", results=diagnostics)
            for model_name, columns in MODELS.items():
                control_hash = None
                if model_name == "Controls_E_8":
                    control_hash = {k: hashlib.sha256(np.ascontiguousarray(v["X"][:, columns]).tobytes()).hexdigest() for k, v in datasets.items()}
                if shared_control is not None and model_name == "Controls_E_8":
                    if shared_control["hashes"] != control_hash:
                        raise ValueError("Control features changed across encoders")
                    row = dict(shared_control["row"], encoder=encoder, reused_control=True)
                    selections = shared_control["selection"]
                    scores = shared_control["scores"]
                    metrics, per_query = evaluate(datasets["dev"], scores)
                else:
                    selections = []
                    for index, config in enumerate(GRID):
                        scores = train_score(datasets["fit"], datasets["validation"], columns, config, args.jobs, event, f"{encoder}/{model_name}/select{index+1}")
                        metrics, _ = evaluate(datasets["validation"], scores)
                        selections.append(dict(config=config, metrics=metrics))
                        dump(output / f"{encoder}_{model_name}_selection.json", selections)
                        event("validation_result", encoder=encoder, model=model_name, config_index=index+1, metrics=metrics)
                    best = max(selections, key=lambda item: item["metrics"]["ndcg10"])
                    scores = train_score(datasets["refit"], datasets["dev"], columns, best["config"], args.jobs, event, f"{encoder}/{model_name}/refit")
                    metrics, per_query = evaluate(datasets["dev"], scores)
                    row = dict(encoder=encoder, model=model_name, fields=len(columns), **metrics,
                               validation_ndcg10=best["metrics"]["ndcg10"], config=json.dumps(best["config"], sort_keys=True), reused_control=False)
                    if model_name == "Controls_E_8":
                        shared_control = dict(hashes=control_hash, row=row, selection=selections, scores=scores.copy())
                dump(output / f"{encoder}_{model_name}_selection.json", selections)
                with (output / f"{encoder}_{model_name}_query_metrics.csv").open("w", newline="") as f:
                    writer = csv.writer(f)
                    writer.writerow(["query", "ndcg10", "recall10", "mrr"])
                    writer.writerows(zip(datasets["dev"]["queries"], *per_query))
                results.append(row)
                with (output / "results.csv").open("w", newline="") as f:
                    writer = csv.DictWriter(f, fieldnames=list(results[0]))
                    writer.writeheader()
                    writer.writerows(results)
                event("dev_result", **row)
            del datasets, vectors
            event("encoder_complete", encoder=encoder)
        protocol.update(status="complete", elapsed_seconds=round(time.monotonic() - start, 2))
        dump(protocol_path, protocol)
        event("complete")
    except BaseException as error:
        protocol.update(status="failed", error=repr(error))
        dump(protocol_path, protocol)
        event("failed", error=repr(error))
        raise


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--mind-root", type=Path, default=Path.home() / "Downloads")
    parser.add_argument("--output", type=Path, default=ROOT / "reports" / "experiments" / "mind_expanded_membership_2026_10_14")
    parser.add_argument("--jobs", type=int, default=4)
    arguments = parser.parse_args()
    with threadpool_limits(limits=1):
        run(arguments)
