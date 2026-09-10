# Corrected private-platform audit

The current aggregate tables use March-31 popularity during January-March
training and April validation. Final refits use January-April rows with
April-30 popularity, and the original May-June pools. This is a post-hoc
correction on an already inspected test set, not an independent confirmation.

The original private headline scores were not exactly reproduced by refitting
their archived settings. The corrected headline fits were independently refit
again and reproduced to an absolute tolerance of 1e-8 in NDCG@10. Historical
values must not be substituted for this revision's aggregate records.

## Completed

- Headline control and PEC selections; secondary metrics and E=0 evaluation.
- Collapsed, direct-separated and scalar learned-early-fusion comparisons.
- No-E control/PEC selection, no-E early fusion, and matched E removal.
- User-clustered disagreement and threshold-sensitivity diagnostics.
- Profile removal, mean-history comparison, grouped permutation and model seeds.
- Candidate-aware neural audit with the original 16-setting grid per variant.
- Validation-reselected XGBoost comparison.

## Not established

- Candidate-pool redraws stopped on missing cached embeddings. Model-seed
  stability is not candidate-pool robustness. No corrected five-pool claim is made.
- The historical 5-D hidden-latent audit is not used as capacity-matched evidence;
  alignment of hidden coordinates across cross-fitting models is unresolved.
- A favorable full-interface result does not isolate source identity from
  interactions, feature count or learner capacity. Null comparisons are retained.
- MIND is a separate, unchanged public proxy, not independent P/C replication.

## Reading the tables

Table 1 uses 150-setting headline selection. Table 2's collapsed comparison
uses an eight-setting tree grid; its no-E rows use a separately selected no-E
PEC model. Thus its decomposed score is not necessarily Table 1's score.
Each comparison uses identical candidate rows and queries on both sides.
Table 3 uses clicked labels to define exploratory diagnostic subgroups, not
a deployable query-selection rule. The high-minus-other interval resamples
users jointly across both groups. No multiple-comparison correction is claimed.

Full aggregate results, including non-significant and negative values, are in
`../results/corrected/`. Search definitions are in
`../configs/corrected_audit_protocol.json`; selected settings are beside it.
The artifact does not release private data or claim public regeneration of
private-platform scores. Older frozen manuscripts are not silently updated.
