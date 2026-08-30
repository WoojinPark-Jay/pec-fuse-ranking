# MIND-small Public Proxy Protocol

The MINDsmall experiment is a portability probe, not a replication of the
private stated-preference experiment.

## Evidence mapping

- **P proxy:** cosine alignment with the normalized mean history embedding, plus
  category and subcategory affinity.
- **E:** logged-slate membership, reciprocal rank, and rank percentile.
- **C:** mean, maximum, top-three, and attention-weighted similarities to prior
  clicked news.
- **Controls:** training-derived popularity, history length, impression size,
  category/subcategory statistics, and article-length metadata.

Because P and C are both history-derived in MIND, a positive result supports the
direction of source-separated fusion under public impression logs but does not
establish transfer of an independent stated-preference channel.

## Evaluation contract

1. Build article representations without using dev labels.
2. Derive popularity controls from the designated training behaviors.
3. Tune model settings only on the validation portion of training impressions.
4. Evaluate once on held-out dev impressions.
5. Report query-averaged NDCG@10, Recall@10, and MRR.
6. Use paired clustered bootstrap intervals for model deltas.

Any public MIND release must state the exact data version, behavior-row limits,
history window, encoder checkpoint, cache key, random seed, and selected model
configuration.

## Candidate construction

Logged candidates retain their click labels. Each expanded query adds up to ten
popular training articles occurring in neither its logged slate nor its history.
These additions are weak negatives: they mean only that no positive was observed
in the constructed pool, not dislike or verified non-exposure.

Popularity statistics and the added pool come from training only. The first 85%
of limited training behaviors select ExtraTrees hyperparameters; the remaining
15% form validation, and labeled development is evaluated once. Defaults are
30,000 training and 30,000 development impressions, a 50-item history window,
ten added candidates, a 5,000-article popular pool, and random seed 42.

## Encoders and comparisons

- `sentence-transformers/all-MiniLM-L6-v2`
- `BAAI/bge-base-en-v1.5`
- `BAAI/bge-m3`

Article text is `title [SEP] abstract` and embeddings are L2-normalized. Each
encoder compares exposure-only, history-derived `P_proxy + C` without E, and the
full `P_proxy + E + C` proxy.

## PLM-NRMS-style diagnostic

A separate diagnostic holds the expanded MiniLM candidate pool fixed and
compares a frozen-PLM, self-attentive history encoder with the
validation-selected PEC proxy and their validation-selected percentile fusion.
The committed outcome is documented in `MIND_NEURAL_DIAGNOSTIC.md` and
`../results/mind_neural_diagnostic.json`.

This comparison is not a private-platform baseline, a full NRMS reproduction,
or evidence that neural recommenders are generally inferior. Its purpose is
only to record whether that history-only neural score adds held-out signal on
the same public partial-exposure proxy pool.
