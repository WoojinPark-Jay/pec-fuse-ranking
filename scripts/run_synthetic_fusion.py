"""Fit public MLP fusion and downstream rankers on synthetic candidate rows."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd
import torch
from sklearn.ensemble import ExtraTreesClassifier

from pec_fuse import aggregate_metrics, query_metrics, rank_within_query
from pec_fuse.fusion import FusionTrainingConfig, MLPFusionTransformer, fit_mlp_fusion


ROOT = Path(__file__).resolve().parents[1]


def make_rows(config: dict) -> dict[str, np.ndarray]:
    rng = np.random.default_rng(config["seed"])
    query_count = config["train_queries"] + config["test_queries"]
    candidates_per_query = config["candidates_per_query"]
    sources = []
    contexts = []
    labels = []
    query_ids = []
    train_mask = []

    for query_id in range(query_count):
        source = rng.normal(size=(candidates_per_query, config["source_dim"]))
        context = rng.normal(size=(candidates_per_query, config["context_dim"]))
        relevance = (
            0.65 * source[:, 0] * source[:, 1]
            + 0.40 * np.maximum(source[:, 2], 0.0)
            - 0.30 * source[:, 3] ** 2
            + 0.25 * context[:, 0]
            + rng.normal(scale=0.12, size=candidates_per_query)
        )
        positive = int(np.argmax(relevance))
        for candidate_index in range(candidates_per_query):
            sources.append(source[candidate_index])
            contexts.append(context[candidate_index])
            labels.append(1 if candidate_index == positive else 0)
            query_ids.append(query_id)
            train_mask.append(query_id < config["train_queries"])

    return {
        "source": np.asarray(sources, dtype=np.float32),
        "context": np.asarray(contexts, dtype=np.float32),
        "label": np.asarray(labels, dtype=np.int64),
        "query_id": np.asarray(query_ids, dtype=np.int64),
        "is_train": np.asarray(train_mask, dtype=bool),
    }


def fit_ranker(features: np.ndarray, labels: np.ndarray, config: dict) -> ExtraTreesClassifier:
    model = ExtraTreesClassifier(
        random_state=config["seed"],
        n_jobs=-1,
        class_weight="balanced_subsample",
        **config["downstream"],
    )
    model.fit(features, labels)
    return model


def evaluate(name: str, frame: pd.DataFrame, scores: np.ndarray) -> None:
    ranked = rank_within_query(frame, scores, score_col="score")
    metrics = aggregate_metrics(query_metrics(ranked, score_col="score"))
    print(name, metrics)


def main() -> None:
    config = json.loads((ROOT / "configs" / "synthetic_mlp_fusion.json").read_text())
    rows = make_rows(config)
    train = rows["is_train"]
    test = ~train

    torch.manual_seed(config["seed"])
    fuser = MLPFusionTransformer(**config["model"])
    losses = fit_mlp_fusion(
        fuser,
        torch.from_numpy(rows["source"][train]),
        torch.from_numpy(rows["label"][train]),
        config=FusionTrainingConfig(seed=config["seed"], **config["training"]),
    )
    latent = fuser.transform(torch.from_numpy(rows["source"]), output="latent").numpy()

    direct_features = np.concatenate([rows["context"], rows["source"]], axis=1)
    learned_features = np.concatenate([rows["context"], latent], axis=1)
    direct = fit_ranker(direct_features[train], rows["label"][train], config)
    learned = fit_ranker(learned_features[train], rows["label"][train], config)

    frame = pd.DataFrame(
        {
            "query_id": rows["query_id"][test],
            "user_id": rows["query_id"][test],
            "candidate_id": np.arange(int(test.sum())),
            "label": rows["label"][test],
        }
    )
    print(f"mlp_fusion: loss {losses[0]:.4f} -> {losses[-1]:.4f}")
    evaluate("direct_19d", frame, direct.predict_proba(direct_features[test])[:, 1])
    evaluate("learned_5d_19d", frame, learned.predict_proba(learned_features[test])[:, 1])
    print(
        "Synthetic training exposes the MLP transform and downstream fit; "
        "its metrics are not manuscript results."
    )


if __name__ == "__main__":
    main()
