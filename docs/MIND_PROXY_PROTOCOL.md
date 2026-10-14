# Fixed Expanded-Pool MIND Boundary Audit

## Purpose and interpretation

The MIND experiment tests whether the source-preserving interface remains useful when public-data evidence has different semantics. It is not a matched replication of the private 25-field schema. MIND has no independent stated profile: P and C are both derived from pre-impression click history, while E is a single logged-slate membership indicator. E distinguishes logged candidates from added candidates; it is not a causal exposure label.

## Required local inputs

Place the official `MINDsmall_train/` and `MINDsmall_dev/` directories under one root. Each must retain its distributed `news.tsv` and `behaviors.tsv` files. The runner also expects these local caches:

```text
cache/mind_proxy_text/bge_m3_mind_news_vectors.npz
cache/mind_proxy_text/bge_base_mind_news_vectors.npz
```

The caches correspond to `BAAI/bge-m3` and `BAAI/bge-base-en-v1.5`. They are intentionally not distributed because model weights, article text, and cached embeddings retain their own terms and can be large. The released protocol records their SHA-256 hashes.

## Fixed run

```bash
python -m pip install -e .
python scripts/run_mind_expanded_membership.py \
  --mind-root /path/containing/MINDsmall_train_and_MINDsmall_dev \
  --output outputs/mind_expanded_final \
  --jobs 4
```

The output directory must not already exist. `--jobs` changes parallel execution only. Other protocol changes create a different experiment and should be reported as such.

## Data split and candidate construction

- The first 60,000 training behaviors are split chronologically into 51,000 fitting and 9,000 validation behaviors.
- After configuration selection, the chosen estimator is refit on all 60,000 training behaviors and evaluated on 30,000 development behaviors.
- CTR and popularity statistics use only the fitting partition during selection and all training behaviors during refit; development labels never enter feature statistics.
- History uses the last 30 listed pre-impression clicks, retaining repeated events.
- Each logged slate is expanded with up to 10 uniformly sampled articles from the 5,000 most-impressed training articles, excluding the entire logged slate and listed history.
- A zero label means no observed click in the constructed pool. It is not verified dislike or verified non-exposure.

## Nested feature records

| Configuration | Fields | Contents |
| --- | ---: | --- |
| Controls+E | 8 | seven operational controls plus logged-slate membership E |
| P+C Direct | 14 | seven controls, three history-derived P fields, and four candidate-to-history C fields |
| P+E+C Direct | 15 | P+C Direct plus E |
| Full PEC proxy | 21 | P+E+C Direct plus six deterministic product fields |

The seven controls are article CTR, log article impressions, category CTR, subcategory CTR, log history length, log title length, and log abstract length. P contains mean-history cosine, category share, and subcategory share. C contains mean, maximum, top-three mean, and attention-weighted candidate-to-history cosine. The six products are four E products and two P-C products.

Public P and C denote representation roles rather than independently recorded provenance. Because MIND has no stated-profile vector, the cosine with the normalized unweighted mean-history vector serves as the profile-like P alignment. Public C mean is the arithmetic mean of the individual candidate-history cosines, so `C_mean = ||mean_history||_2 * p`. The two fields induce the same candidate ordering within a query, while C mean retains the query-level history-concentration magnitude removed by normalization. They are related summaries of the same click history, not independent evidence sources. This is an adapted proxy design, not an equivalence claim between private and public sources.

This nesting identifies four planned contrasts: adding P/C to Controls+E, adding E to fixed P/C, adding six explicit products to Direct, and comparing Full with Controls+E. ExtraTrees can learn interactions without product columns, so the third contrast is specifically an explicit-product gain. Some contrasts are algebraically related through shared endpoints; for example, Full minus Controls+E equals Full minus Direct plus Direct minus Controls+E. They remain conditional predictive comparisons rather than independent component contributions: fitted configurations are independently selected and each addition is evaluated on the blocks retained at that endpoint.

## Released results

`access/data/mind_expanded_results.csv` contains the BGE-M3 main analysis and BGE-base sensitivity analysis. Under BGE-M3, NDCG@10 is 0.3265, 0.3409, 0.3797, and 0.3828 for the four records above. Full minus Direct is +0.0031 with nominal paired user-clustered 95% CI [0.0019, 0.0043]. BGE-base shows the same positive direction, with Full minus Direct +0.0109 [0.0096, 0.0122].

`access/data/mind_expanded_user_bootstrap.json` records 10,000 user-clustered percentile-bootstrap replicates, seed 20261014, 30,000 queries, and 25,003 users. The intervals condition on fitted models and the fixed candidate pool, use no multiplicity adjustment, and do not include training-seed or candidate-reselection uncertainty.

The protocol, diagnostics, and candidate audits are distributed alongside the results. Per-query predictions and embedding caches are not released.
