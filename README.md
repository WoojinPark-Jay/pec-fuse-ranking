# PEC-Fuse

This repository provides the public implementation contract for PEC-Fuse, a
candidate-level second-stage ranker that keeps preference, retained-trace
exposure, prior consumption, structured controls, and selected interactions
separate until learned fusion.

## Release scope

The package includes:

- the exact ordered 25-dimensional candidate record;
- deterministic derivation of exposure, count, and interaction features;
- the validation-selected ExtraTrees configurations for the two broad regimes;
- within-query NDCG@10, Recall@10, and MRR;
- paired user-clustered bootstrap intervals;
- a fully synthetic end-to-end example;
- an executable public MIND-small proxy protocol;
- a documented PLM-NRMS-style diagnostic on the fixed public proxy pool.
- aggregate records for the private-data diagnostics reported in the paper.

The private platform logs are not distributed. Consequently, this package
reproduces the method and evaluation contract, not the private headline result
rows. The synthetic example is for executable inspection and is not evidence
for a performance claim.

## Quick start

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
python scripts/run_synthetic_demo.py
python scripts/render_paper_tables.py
```

The same commands are available as `make demo` and `make tables`.

## Public MIND-small proxy

MIND has no independent stated-profile fields or equivalent private source
provenance. This experiment is therefore a narrower public proxy, not a
reproduction of the private-data headline claim.

After obtaining MIND-small from its official distributor, arrange it as
`data/MINDsmall/{train,dev}/{news.tsv,behaviors.tsv}` and run:

```bash
pip install -e '.[mind]'
python scripts/run_mind_proxy.py \
  --mind-root data/MINDsmall \
  --encoder sentence-transformers/all-MiniLM-L6-v2
```

The other paper encoders are `BAAI/bge-base-en-v1.5` and `BAAI/bge-m3`.
See `docs/MIND_PROXY_PROTOCOL.md` for exact candidate and feature definitions.

## Paper-result records

`results/paper_tables.json` stores the aggregate values reported in Tables 1--3,
and `results/paper_additional_diagnostics.json` records the secondary metrics
and private-data diagnostics reported in the text. `scripts/render_paper_tables.py`
renders Tables 1--3 for auditing. These records do not regenerate private-data
results because raw private rows are unavailable.

## Candidate-row contract

Each row represents one candidate article for one user-day query. Labels are
used only for training and evaluation. Feature construction must not read the
target label. Prior-consumption summaries use events strictly before the target
day, while retained-trace exposure uses the target-day recommendation trace.
Candidates outside that trace receive an exposure block of `[0, 0, 0]`; this
does not imply no encounter or zero relevance.

The exact feature order is defined in `pec_fuse.schema.FEATURES_25` and mirrored
in `docs/feature_dictionary.csv`.

## Model protocol

The primary comparison uses the same candidate rows for both models:

- **Strong control:** retained-trace exposure plus 11 non-semantic controls.
- **PEC-Fuse:** the full 25-dimensional source-separated record.

Hyperparameters are selected on an earlier validation window and then fixed for
the held-out test window. Candidate scores are sorted only within each query.

## Repository map

```text
configs/                 Frozen broad-regime and public-proxy settings
docs/                    Feature and data-availability documentation
examples/synthetic/      Non-private candidate-row fixture
results/                 Committed paper-level aggregate records
scripts/                 Synthetic, table-audit, and MIND entry points
src/pec_fuse/            Feature, ranking, evaluation, and MIND library
```

The component-by-component boundary is documented in
`docs/REPRODUCIBILITY.md`.

For the paper review path, `docs/PAPER_RQ_REPRODUCIBILITY_MAP.md`
maps RQ1--RQ4 to the corresponding public implementation, committed aggregate
record, and stated limitation.

## Public neural diagnostic

`results/mind_neural_diagnostic.json` and
`docs/MIND_NEURAL_DIAGNOSTIC.md` record the validation-selected
PLM-NRMS-style comparison reported as a bounded MIND diagnostic. The clean
snapshot does not claim one-command reproduction of this diagnostic yet:
the original runner depends on internal cache-building helpers that must be
refactored before public release. The executable ExtraTrees MIND proxy remains
the public baseline contract.

## Data boundary

See `docs/DATA_AVAILABILITY.md`. No private user profile, click, recommendation,
article-text, identifier, or row-level platform data belongs in this repository.

## Private candidate-aware neural audit

The aggregate-only matched neural diagnostic is documented in `docs/PRIVATE_CANDIDATE_AWARE_NEURAL_AUDIT.md`, with configuration in `configs/private_candidate_aware_neural.json` and results in `results/private_candidate_aware_neural_audit.json`. Private candidate rows, embeddings, profiles, and histories are not included.

## Candidate-pool resampling audit

Seed 42 was fixed before held-out scoring and defines the headline pool. Seeds 7, 13, 42, 101, and 202 rebuild private training, validation, and test candidate frames; validation-selected configurations and the learner seed remain fixed, and each model is refit on the rebuilt training-plus-validation rows. See `docs/NEGATIVE_POOL_RESAMPLING_AUDIT.md`, `configs/negative_pool_resampling.json`, and `results/negative_pool_resampling_audit.json`. Only aggregate results and protocol metadata are released.
