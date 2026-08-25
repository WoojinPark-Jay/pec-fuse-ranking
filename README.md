# PEC-Fuse Reproducibility Package

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
- a fully synthetic end-to-end example; and
- the protocol boundary for the public MINDsmall proxy.

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
```

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
configs/                 Frozen broad-regime ExtraTrees settings
docs/                    Feature and data-availability documentation
examples/synthetic/      Non-private candidate-row fixture
scripts/                 Executable demonstrations
src/pec_fuse/            Feature, ranking, and evaluation library
```

## Data boundary

See `docs/DATA_AVAILABILITY.md`. No private user profile, click, recommendation,
article-text, identifier, or row-level platform data belongs in this repository.

