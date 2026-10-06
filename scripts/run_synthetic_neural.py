"""Train the public candidate-aware neural scorer on synthetic query data."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd
import torch

from pec_fuse import aggregate_metrics, query_metrics, rank_within_query
from pec_fuse.neural import (
    CandidateAwareNeuralScorer,
    NeuralTrainingConfig,
    fit_querywise,
    score_candidates,
)


ROOT = Path(__file__).resolve().parents[1]


def make_synthetic_queries(config: dict) -> dict[str, torch.Tensor]:
    """Create non-private embeddings, histories, controls, PEC fields, and labels."""

    rng = np.random.default_rng(config["seed"])
    train_queries = config["train_queries"]
    test_queries = config["test_queries"]
    query_count = train_queries + test_queries
    candidates_per_query = config["candidates_per_query"]
    embedding_dim = config["embedding_dim"]
    max_history = config["max_history"]
    control_dim = config["variants"]["control_side_dim"]
    pec_dim = config["variants"]["pec_side_dim"]

    candidates = []
    histories = []
    masks = []
    controls = []
    pec_features = []
    labels = []
    query_ids = []
    is_train = []

    for query_id in range(query_count):
        history_length = int(rng.integers(max_history // 2, max_history + 1))
        real_history = rng.normal(size=(history_length, embedding_dim))
        padded_history = np.zeros((max_history, embedding_dim), dtype=np.float32)
        padded_history[:history_length] = real_history
        history_mask = np.arange(max_history) < history_length
        intent = real_history.mean(axis=0)

        query_candidates = rng.normal(size=(candidates_per_query, embedding_dim))
        query_controls = rng.normal(size=(candidates_per_query, control_dim))
        extra_pec = rng.normal(size=(candidates_per_query, pec_dim - control_dim))
        query_pec = np.concatenate([query_controls, extra_pec], axis=1)
        latent_relevance = (
            query_candidates @ intent / np.sqrt(embedding_dim)
            + 0.35 * query_controls[:, 0]
            + 0.80 * extra_pec[:, 0]
            - 0.45 * extra_pec[:, 1]
            + rng.normal(scale=0.15, size=candidates_per_query)
        )
        positive = int(np.argmax(latent_relevance))

        for candidate_index in range(candidates_per_query):
            candidates.append(query_candidates[candidate_index])
            histories.append(padded_history)
            masks.append(history_mask)
            controls.append(query_controls[candidate_index])
            pec_features.append(query_pec[candidate_index])
            labels.append(1.0 if candidate_index == positive else 0.0)
            query_ids.append(query_id)
            is_train.append(query_id < train_queries)

    def tensor(values: list, *, dtype: torch.dtype = torch.float32) -> torch.Tensor:
        return torch.as_tensor(np.asarray(values), dtype=dtype)

    return {
        "candidate": tensor(candidates),
        "history": tensor(histories),
        "mask": tensor(masks, dtype=torch.bool),
        "control": tensor(controls),
        "pec": tensor(pec_features),
        "label": tensor(labels),
        "query_id": tensor(query_ids, dtype=torch.long),
        "is_train": tensor(is_train, dtype=torch.bool),
    }


def train_variant(
    name: str,
    side_features: torch.Tensor,
    data: dict[str, torch.Tensor],
    config: dict,
) -> tuple[np.ndarray, list[float]]:
    torch.manual_seed(config["seed"])
    model = CandidateAwareNeuralScorer(
        embedding_dim=config["embedding_dim"],
        side_dim=side_features.shape[1],
        **config["model"],
    )
    train = data["is_train"]
    training = NeuralTrainingConfig(seed=config["seed"], **config["training"])
    losses = fit_querywise(
        model,
        candidate_embeddings=data["candidate"][train],
        history_embeddings=data["history"][train],
        history_mask=data["mask"][train],
        side_features=side_features[train],
        labels=data["label"][train],
        query_ids=data["query_id"][train],
        config=training,
    )
    test = ~train
    scores = score_candidates(
        model,
        candidate_embeddings=data["candidate"][test],
        history_embeddings=data["history"][test],
        history_mask=data["mask"][test],
        side_features=side_features[test],
    )
    print(f"{name}: loss {losses[0]:.4f} -> {losses[-1]:.4f}")
    return scores.cpu().numpy(), losses


def main() -> None:
    config = json.loads(
        (ROOT / "configs" / "synthetic_candidate_aware_neural.json").read_text()
    )
    data = make_synthetic_queries(config)
    control_scores, _ = train_variant("neural_control", data["control"], data, config)
    pec_scores, _ = train_variant("neural_pec", data["pec"], data, config)

    test = ~data["is_train"]
    frame = pd.DataFrame(
        {
            "query_id": data["query_id"][test].numpy(),
            "candidate_id": np.arange(int(test.sum())),
            "label": data["label"][test].numpy().astype(int),
        }
    )
    for name, scores in (("neural_control", control_scores), ("neural_pec", pec_scores)):
        ranked = rank_within_query(frame, scores, score_col="score")
        metrics = aggregate_metrics(query_metrics(ranked, score_col="score"))
        print(name, metrics)

    sample = rank_within_query(frame, pec_scores, score_col="neural_pec_score")
    first_query = int(sample["query_id"].min())
    print(sample[sample["query_id"].eq(first_query)].to_string(index=False))
    print(
        "Synthetic training verifies the public architecture and learning loop; "
        "it does not reproduce private-platform results or fitted weights."
    )


if __name__ == "__main__":
    main()

