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

## Temporal contract

For a target user-day:

- target-day clicks define positive labels;
- prior consumption uses clicks strictly before the target day;
- retained exposure uses only the target-day retained recommendation trace;
- profile evidence is the exported snapshot available to the experiment; and
- popularity and candidate construction use their designated training window.

A weak negative means that no target-day positive was observed for that
candidate in the evaluation pool. It does not mean dislike or verified
non-exposure.

## Public proxy

MINDsmall can support a bounded public proxy using impression rank and prior
click history. It does not contain an independent stated-preference source and
therefore cannot replicate the private P channel. See `MIND_PROXY_PROTOCOL.md`.

