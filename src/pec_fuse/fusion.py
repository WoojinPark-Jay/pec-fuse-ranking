"""Public supervised MLP fusion transform for the five P/C coordinates."""

from __future__ import annotations

from dataclasses import dataclass

import torch
from torch import Tensor, nn
from torch.nn import functional as F


class MLPFusionTransformer(nn.Module):
    """Map five source coordinates to a learned latent record.

    The prediction head supplies supervision during fitting. Downstream rankers
    can consume either the multidimensional latent record or the scalar sigmoid
    output, making the distinction between representation learning and final
    candidate scoring explicit.
    """

    def __init__(
        self,
        *,
        input_dim: int = 5,
        hidden_dim: int = 8,
        latent_dim: int = 5,
    ) -> None:
        super().__init__()
        self.hidden = nn.Linear(input_dim, hidden_dim)
        self.latent = nn.Linear(hidden_dim, latent_dim)
        self.head = nn.Linear(latent_dim, 1)

    def encode(self, source_features: Tensor) -> Tensor:
        hidden = F.gelu(self.hidden(source_features))
        return F.gelu(self.latent(hidden))

    def forward(self, source_features: Tensor) -> Tensor:
        return self.head(self.encode(source_features)).squeeze(-1)

    @torch.no_grad()
    def transform(self, source_features: Tensor, *, output: str = "latent") -> Tensor:
        self.eval()
        if output == "latent":
            return self.encode(source_features)
        if output == "scalar":
            return torch.sigmoid(self(source_features)).unsqueeze(-1)
        raise ValueError("output must be 'latent' or 'scalar'")


@dataclass(frozen=True)
class FusionTrainingConfig:
    max_epochs: int = 80
    learning_rate: float = 1e-3
    weight_decay: float = 1e-3
    seed: int = 42


def fit_mlp_fusion(
    model: MLPFusionTransformer,
    source_features: Tensor,
    labels: Tensor,
    *,
    config: FusionTrainingConfig,
) -> list[float]:
    """Fit the fusion transform with pointwise binary supervision."""

    torch.manual_seed(config.seed)
    optimizer = torch.optim.AdamW(
        model.parameters(),
        lr=config.learning_rate,
        weight_decay=config.weight_decay,
    )
    losses: list[float] = []
    model.train()
    for _ in range(config.max_epochs):
        optimizer.zero_grad(set_to_none=True)
        loss = F.binary_cross_entropy_with_logits(model(source_features), labels.float())
        loss.backward()
        optimizer.step()
        losses.append(float(loss.detach()))
    return losses

