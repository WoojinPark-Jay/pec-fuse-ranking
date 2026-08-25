# MINDsmall Public Proxy Protocol

The MINDsmall experiment is a portability probe, not a replication of the
private stated-preference experiment.

## Evidence mapping

- **P proxy:** candidate alignment with a profile derived from prior clicked news.
- **E:** candidate membership and reciprocal rank in the logged impression.
- **C:** candidate-aware similarities to prior clicked news.
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

