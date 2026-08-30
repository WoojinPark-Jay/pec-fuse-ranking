# Private Candidate-Aware Neural Audit

## Question

Can a candidate-aware neural history model absorb the ranking signal attributed to the source-separated PEC record?

## Matched protocol

- The candidate pools and calendar-time train/validation/test split match the private-platform PEC-Fuse evaluation.
- Candidate articles and clicked-history articles use the same frozen BGE-M3 vectors.
- History contains clicks strictly before the target day.
- A history self-attention layer is followed by candidate-conditioned pooling and query-wise listwise training.
- Neural width, attention heads, dropout, learning rate, and training epoch are selected on validation only.
- The held-out test window is evaluated once with query-averaged ranking metrics.

The model is described as PLM-NRMS-style. It is an article-level neural history diagnostic, not a claim of exact NRMS reproduction or exhaustive neural tuning.

## Aggregate held-out results

| Regime | History only | + controls | + complete PEC | Final PEC-Fuse |
|---|---:|---:|---:|---:|
| Recent-window | 0.6046 | 0.7509 | 0.7231 | 0.7923 |
| Popularity-hard | 0.5562 | 0.7103 | 0.7308 | 0.7712 |

The validation grid contains 16 configurations: widths {64, 96}, heads {2, 4}, dropout {0.05, 0.10}, and learning rates {0.0005, 0.001}. The final PEC-Fuse scorer remains higher than the strongest neural variant in each regime by 0.0415 and 0.0404 NDCG@10. Complete PEC inputs do not improve the neural scorer in every regime, so the audit does not claim an automatic benefit from adding columns.

## Release boundary

This record releases the architecture definition, validation protocol, configuration, and aggregate results. Inputs, pools, temporal splits, and evaluation are matched; learner family and optimization objective are not. It does not release private candidate rows, article vectors, user profiles, or click histories. The anonymous artifact protects reviewer anonymity; it is not a mechanism for de-identifying user data.
