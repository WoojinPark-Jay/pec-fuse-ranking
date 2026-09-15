# Fixed-model same-day tie-order sensitivity

This completed audit changes the order of tied same-day introduced candidates,
not the learner seed. It is separate from the incomplete historical full
pool-redraw/refitting audit in NEGATIVE_POOL_RESAMPLING_AUDIT.md.

## Design

The original same-day pool is reproduced from source tables before the
perturbation. Test dates' article arrays are permuted using each of five seeds,
then the existing stable descending frozen-popularity sort and candidate
budget are applied. Thus unequal popularity priorities remain unchanged.
Positive and retained-trace candidate identities and per-query counts stay
fixed: 1,040 queries, 369 users, and 21,207 candidate rows in each pool.

The four already selected model configurations are fitted once on the original
January-April frame and frozen across all test pools. No new hyperparameter
search is performed. Original headline NDCG@10 values reproduce within 1e-9.
Headline PEC/control and audit PEC/collapsed use their respective selected
fits; they are not interchangeable. Configuration details are in
`../configs/same_day_tie_order.json`.

## Results

All entries are query-averaged NDCG@10 differences with 2,000 paired
user-clustered bootstrap replicates and 95% percentile intervals.

| Tie order | Headline PEC - control | Complete audit PEC - collapsed |
| --- | --- | --- |
| Original | +.0218 [.0080, .0363] | +.0107 [.0009, .0206] |
| 7 | +.0677 [.0524, .0842] | +.0300 [.0208, .0396] |
| 13 | +.0747 [.0614, .0891] | +.0238 [.0145, .0336] |
| 42 | +.0654 [.0513, .0804] | +.0266 [.0155, .0375] |
| 101 | +.0758 [.0614, .0912] | +.0304 [.0213, .0404] |
| 202 | +.0638 [.0495, .0799] | +.0272 [.0177, .0372] |

Randomized seed 42 is not the original source-file ordering. All seeds are
reported. Full scores, Recall@10, MRR, and unrounded intervals are stored in
`../results/same_day_tie_order/metrics.csv` and `paired_differences.csv`.

Absolute headline PEC NDCG@10 decreases from .7717 to .7216-.7331; control
decreases more. The result supports relative robustness to this particular
tie-order perturbation, not an increase in absolute performance.

## Scope and reproducibility

This is sensitivity on an already inspected test period, not independent
confirmation or full retraining for each pool. Intervals are conditional on
each pool, not uncertainty over all candidate construction choices. The
complete interface differs from the collapsed model in width and interactions;
the comparison does not isolate source separation alone. No learned early
fusion or neural rerun, trace-negative proportion intervention, or prospective
P/E availability validation is claimed.

`../src/pec_fuse/tie_order.py` exposes the perturbation and stable-selection
logic. The private runner additionally enforces unchanged positives, trace
negatives, and candidate counts; builds semantic features; applies frozen
models; and computes paired intervals. That full runner depends on private
source tables and internal feature caches and is not a one-command public
reproduction. Aggregate tables allow inspection, not independent regeneration
of private scores. Existing public evaluation code documents ranking metrics
and clustered uncertainty.

All 17,644 required articles had embeddings before scoring. Existing caches
supplied most vectors; 191 supplemental vectors were reused and 4,201 were
encoded with frozen local BGE-M3 (192 tokens, 1,400-character text limit,
normalized vectors). The original cache checkpoint revision was not recorded;
same model name/preprocessing does not establish identical checkpoint
provenance. No missing vector was replaced with zero or removed from eligibility.

Private article/user identifiers, source text, candidate rows, embeddings,
per-user predictions, model files, and local paths are excluded from release.
