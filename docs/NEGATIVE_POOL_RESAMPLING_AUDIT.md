# Candidate-Pool Resampling Audit

## Question

Does the PEC-Fuse advantage survive alternative weak-negative candidate pools?

## Protocol

Seed 42 was fixed before held-out scoring and defines the headline candidate pool. Candidate seeds 7, 13, 42, 101, and 202 rebuild the training, validation, and held-out candidate frames. Validation-selected ExtraTrees configurations, the learner seed, feature schema, encoder, temporal boundaries, and evaluation metrics remain fixed; each model is refit on the rebuilt training-plus-validation rows. Complete sorted-row fingerprints confirm five distinct pools in each broad regime.

Recent-window resamples eligible introduced recent articles and capped retained-trace negatives. Popularity-hard keeps its introduced top-popular weak set deterministic but resamples retained-trace negatives when their count exceeds the per-query cap.

## Results

| Regime | Distinct pools | Mean delta | SD | Range | Positive | CI above zero |
|---|---:|---:|---:|---:|---:|---:|
| Recent-window | 5 | +0.1414 | 0.0393 | [+0.0724, +0.1710] | 5/5 | 5/5 |
| Popularity-hard | 5 | +0.0429 | 0.0068 | [+0.0385, +0.0551] | 5/5 | 5/5 |

The direction is robust to candidate construction. The larger recent-window range also demonstrates that the absolute effect size is pool-sensitive; the main paper therefore retains the predefined seed-42 result as its headline and uses this audit only as directional robustness evidence.
