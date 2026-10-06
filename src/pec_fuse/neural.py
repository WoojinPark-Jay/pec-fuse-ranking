"""Public candidate-aware neural scorer and query-wise training utilities.

This module accepts precomputed article embeddings. It intentionally contains no
private-platform loader, raw text, fitted checkpoint, or operational identifier.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence

import torch
from torch import Tensor, nn
from torch.nn import functional as F


class CandidateAwareNeuralScorer(nn.Module):
    """Candidate-conditioned history scorer with optional side features.

    The record sent to the final MLP is ``[candidate, user, candidate * user,
    abs(candidate - user), side_features]``. Article embeddings are supplied by
    the caller, so a frozen encoder can be used without coupling this reference
    implementation to a particular text model or private data source.
    """

    def __init__(
        self,
        *,
        embedding_dim: int,
        side_dim: int,
        hidden_dim: int = 64,
        num_heads: int = 4,
        dropout: float = 0.1,
    ) -> None:
        super().__init__()
        if hidden_dim % num_heads:
            raise ValueError("hidden_dim must be divisible by num_heads")
        if side_dim < 0:
            raise ValueError("side_dim must be non-negative")

        self.side_dim = side_dim
        self.article_projection = nn.Sequential(
            nn.Linear(embedding_dim, hidden_dim),
            nn.GELU(),
            nn.LayerNorm(hidden_dim),
        )
        self.history_attention = nn.MultiheadAttention(
            hidden_dim,
            num_heads,
            dropout=dropout,
            batch_first=True,
        )
        self.history_norm = nn.LayerNorm(hidden_dim)
        self.history_key = nn.Linear(hidden_dim, hidden_dim, bias=False)
        self.candidate_query = nn.Linear(hidden_dim, hidden_dim, bias=False)
        self.pooling_score = nn.Linear(hidden_dim, 1, bias=False)
        record_dim = 4 * hidden_dim + side_dim
        self.scorer = nn.Sequential(
            nn.Linear(record_dim, hidden_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, 1),
        )

    def forward(
        self,
        candidate_embeddings: Tensor,
        history_embeddings: Tensor,
        history_mask: Tensor,
        side_features: Tensor | None = None,
    ) -> Tensor:
        """Return one uncalibrated ranking score per candidate.

        ``history_mask`` is boolean with ``True`` for a real history position.
        Every row must contain at least one real position.
        """

        if history_mask.dtype is not torch.bool:
            raise TypeError("history_mask must be a boolean tensor")
        if not torch.all(history_mask.any(dim=1)):
            raise ValueError("each candidate requires at least one history item")

        candidate = self.article_projection(candidate_embeddings)
        history = self.article_projection(history_embeddings)
        encoded, _ = self.history_attention(
            history,
            history,
            history,
            key_padding_mask=~history_mask,
            need_weights=False,
        )
        encoded = self.history_norm(history + encoded)

        pooling_logits = self.pooling_score(
            torch.tanh(
                self.history_key(encoded)
                + self.candidate_query(candidate).unsqueeze(1)
            )
        ).squeeze(-1)
        pooling_logits = pooling_logits.masked_fill(~history_mask, float("-inf"))
        pooling_weights = torch.softmax(pooling_logits, dim=1)
        user = torch.sum(pooling_weights.unsqueeze(-1) * encoded, dim=1)

        record = [candidate, user, candidate * user, torch.abs(candidate - user)]
        if self.side_dim:
            if side_features is None or side_features.shape[-1] != self.side_dim:
                raise ValueError(f"expected side_features with width {self.side_dim}")
            record.append(side_features)
        elif side_features is not None and side_features.shape[-1] != 0:
            raise ValueError("side_features were supplied to a history-only model")
        return self.scorer(torch.cat(record, dim=-1)).squeeze(-1)


def querywise_listwise_loss(scores: Tensor, labels: Tensor, query_ids: Tensor) -> Tensor:
    """Average listwise cross-entropy over queries with at least one positive."""

    losses: list[Tensor] = []
    for query_id in torch.unique(query_ids):
        keep = query_ids.eq(query_id)
        query_labels = labels[keep].float()
        positives = query_labels.sum()
        if positives.item() <= 0:
            continue
        target = query_labels / positives
        losses.append(-(target * F.log_softmax(scores[keep], dim=0)).sum())
    if not losses:
        raise ValueError("no query contains a positive label")
    return torch.stack(losses).mean()


@dataclass(frozen=True)
class NeuralTrainingConfig:
    max_epochs: int = 14
    learning_rate: float = 1e-3
    weight_decay: float = 1e-4
    gradient_clip_norm: float = 5.0
    seed: int = 42


def fit_querywise(
    model: CandidateAwareNeuralScorer,
    *,
    candidate_embeddings: Tensor,
    history_embeddings: Tensor,
    history_mask: Tensor,
    side_features: Tensor | None,
    labels: Tensor,
    query_ids: Tensor,
    config: NeuralTrainingConfig,
) -> list[float]:
    """Fit a scorer with full-batch query-wise listwise cross-entropy."""

    torch.manual_seed(config.seed)
    optimizer = torch.optim.AdamW(
        model.parameters(),
        lr=config.learning_rate,
        weight_decay=config.weight_decay,
    )
    history: list[float] = []
    model.train()
    for _ in range(config.max_epochs):
        optimizer.zero_grad(set_to_none=True)
        scores = model(
            candidate_embeddings,
            history_embeddings,
            history_mask,
            side_features,
        )
        loss = querywise_listwise_loss(scores, labels, query_ids)
        loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(), config.gradient_clip_norm)
        optimizer.step()
        history.append(float(loss.detach()))
    return history


@torch.no_grad()
def score_candidates(
    model: CandidateAwareNeuralScorer,
    *,
    candidate_embeddings: Tensor,
    history_embeddings: Tensor,
    history_mask: Tensor,
    side_features: Tensor | None,
) -> Tensor:
    """Score candidates without updating fitted parameters."""

    model.eval()
    return model(
        candidate_embeddings,
        history_embeddings,
        history_mask,
        side_features,
    )

