# MIND PLM-NRMS-Style Neural Diagnostic

This diagnostic uses the same expanded MIND-small candidate pool for all three
scorers. Article representations are frozen MiniLM vectors. The neural scorer
uses an NRMS-style self-attentive history encoder and listwise training.
PEC-Fuse is the validation-selected ExtraTrees public proxy. Late fusion is
selected on validation using within-query percentile scores.

## Held-out results

| Model | NDCG@10 | Recall@10 | MRR | Queries |
|---|---:|---:|---:|---:|
| PLM-NRMS-style | 0.2530 | 0.4795 | 0.2248 | 6,000 |
| PEC-Fuse proxy | 0.4142 | 0.6441 | 0.3795 | 6,000 |
| PLM-NRMS-style + PEC | 0.4142 | 0.6441 | 0.3795 | 6,000 |

PEC minus PLM-NRMS-style is +0.1612 NDCG@10 with user-clustered
95% CI [+0.1530, +0.1699]. Validation selects neural fusion weight 0.

## Fixed scope

- Train behavior limit: 12,000.
- Held-out development behavior limit: 6,000.
- Training split: first 85% fit, remaining 15% validation.
- History window: 30.
- Added weak negatives per query: 10.
- Neural selection: hidden sizes 64 and 128 with four attention heads.
- Selected neural configuration: hidden size 128, dropout 0.1,
  learning rate 0.0007, four epochs.

This is a reranking diagnostic, not a MIND leaderboard result or a direct
private-platform baseline. Both MIND proxy preference and consumption are
history-derived. The result therefore does not establish that neural news
recommenders are generally inferior or reproduce independent P/C provenance.

## Release status

The exact aggregate result and audit parameters are committed. The original
runner currently depends on internal cache-building helpers, so this clean
snapshot does not expose a broken command. A standalone public runner should be
added only after those dependencies are refactored into this repository.
