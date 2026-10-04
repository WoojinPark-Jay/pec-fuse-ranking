# Data Availability

## Private platform data

The headline experiments use processed platform tables containing user profile
preferences, click events, retained recommendation traces, and article metadata.
These row-level tables cannot be distributed because they may contain private
behavioral and proprietary operational information.

The public package therefore provides the complete candidate-row contract,
feature derivation, model configuration, evaluation implementation, and a
non-private synthetic fixture. No private identifiers, article text, profile
values, click histories, retained traces, or cached embeddings are included.

Repository publication is not a privacy transformation for user data.
Restricted operational rows must not be committed to this repository or any
public mirror.

## Reproducibility layers

1. **Executable public contract:** the 25-D schema, deterministic transforms,
   ranking and evaluation code, synthetic fixture, and public MIND proxy.
2. **Aggregate audit records:** active paper tables, neural-input comparisons,
   and encoder-specific MIND proxy summaries, without user-level rows.
3. **Restricted evidence:** private platform rows and resulting headline-score
   regeneration, which remain unavailable for privacy and proprietary reasons.

This separation lets readers inspect the method without implying that public
hosting makes operational records safe to distribute.

## Temporal contract

For a target user-day:

- target-day clicks define positive labels;
- prior consumption uses clicks strictly before the target day;
- retained exposure uses only the target-day retained recommendation trace;
- profile evidence is the exported snapshot available to the experiment; and
- popularity and same-day candidate selection use March-31 counts during model selection and April-30 counts for the January-April refit and May-June test; these are window aggregates, not within-training-day causal features.

A weak negative means that no target-day positive was observed for that
candidate in the evaluation pool. It does not mean dislike or verified
non-exposure.

## Public proxy

MINDsmall can support a bounded public proxy using impression rank and prior
click history. It does not contain an independent stated-preference source and
therefore cannot replicate the private P channel. See `MIND_PROXY_PROTOCOL.md`.
