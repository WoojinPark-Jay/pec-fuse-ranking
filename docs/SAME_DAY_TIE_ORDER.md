# Fixed-model same-day candidate-reselection sensitivity

This completed audit reselects same-day introduced candidates after changing tie order. It changes candidate membership, not merely display order or learner seed.

## Design

The original same-day pool is reproduced from source tables before perturbation. Test-date article arrays are permuted using each of five seeds, followed by the existing stable descending frozen-popularity sort and candidate budget. Positive and retained-trace identities, query sets, and per-query counts remain fixed: 1,040 queries, 369 users, and 21,207 candidate rows per pool.

Let `Q_original` and `Q_seed` be sets of distinct `(query_id, news_id)` pairs. The reported replacement count is `len(Q_seed - Q_original)`, the number of pairs newly entering the reselected pool. It is not additions plus removals.

| Tie-order seed | Newly entering query-item pairs |
| --- | ---: |
| 7 | 10,004 |
| 13 | 10,069 |
| 42 | 10,019 |
| 101 | 10,008 |
| 202 | 10,053 |

The already selected model configurations are fitted once on the original January-April frame and frozen across all test pools. Headline PEC/control and audit PEC/collapsed use their respective selected fits.

## Results

All entries are query-averaged NDCG@10 differences with 2,000 paired user-clustered bootstrap replicates and 95% percentile intervals.

| Tie order | Headline PEC - control | Complete audit PEC - collapsed |
| --- | --- | --- |
| Original | +.0218 [.0080, .0363] | +.0107 [.0009, .0206] |
| 7 | +.0677 [.0524, .0842] | +.0300 [.0208, .0396] |
| 13 | +.0747 [.0614, .0891] | +.0238 [.0145, .0336] |
| 42 | +.0654 [.0513, .0804] | +.0266 [.0155, .0375] |
| 101 | +.0758 [.0614, .0912] | +.0304 [.0213, .0404] |
| 202 | +.0638 [.0495, .0799] | +.0272 [.0177, .0372] |

Randomized seed 42 is not the original source-file ordering. Full scores, Recall@10, MRR, and unrounded intervals are in `../access/data/pool_metrics.csv` and `pool_paired_differences.csv`. The result supports relative robustness to this tie-order perturbation; it does not claim invariance to all candidate-generation choices.

`../src/pec_fuse/tie_order.py` exposes the perturbation and stable-selection logic. Private identifiers, source text, candidate rows, embeddings, per-user predictions, model files, and local paths are excluded.
