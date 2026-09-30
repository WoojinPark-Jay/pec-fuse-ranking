# PEC-Fuse: IEEE Access Reproducibility Artifact

This repository is the official implementation and reproducibility artifact for the IEEE Access manuscript **PEC-Fuse: Source-Preserving Evidence Fusion for News Ranking with Partial Recommendation Traces**. It provides the public implementation contract, executable non-private demonstrations, manuscript-aligned aggregate results, generated table fragments, and feature/evaluation specifications.

The release is aligned with manuscript revision v32. Revisions after the v29 experiment freeze changed presentation and manuscript metadata, not the aggregate result records distributed here.

## What this artifact supports

- the ordered 25-field Complete PEC record and compact 19-field Direct record;
- deterministic trace, count-summary, consumption, and interaction features;
- within-query NDCG@10, Recall@10, and MRR;
- paired user-clustered bootstrap intervals;
- 1/2/4/5-dimensional learned-fusion audits;
- Direct 19-D versus Complete 25-D comparisons;
- joint profile/trace-removal audits;
- fixed-model same-day candidate reselection;
- neural-input and public MIND boundary analyses;
- executable synthetic and MIND-small public pipelines.

The private platform logs are not distributed. The artifact reproduces the method and evaluation contract and exposes aggregate evidence; it does not claim public regeneration of private row-level results.

## Quick start

```bash
python --version  # Python 3.10 or newer is required
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -e .
python scripts/run_synthetic_demo.py
python scripts/check_access_aggregates.py
python scripts/render_access_summary.py
```

The synthetic run prints candidate-level feature records, within-query rankings, and ranking metrics. The aggregate checker validates the supplied result schemas and privacy boundary, and the summary renderer prints the manuscript-facing results. The synthetic run is an interface demonstration, not evidence for a performance claim.

## Active IEEE Access bundle

The current manuscript-aligned records are under `access/data/`.

- `core_test_metrics.csv` and `core_user_bootstrap.csv`: headline scores and paired intervals;
- `fusion_*`: multidimensional fusion protocols, selections, seed metrics, and paired intervals;
- `direct_complete_user_bootstrap.csv`: 19-D Direct versus 25-D Complete;
- `joint_pe_*`: joint profile/trace-removal protocol, selections, census, seed metrics, and paired intervals;
- `pool_*`: fixed-model candidate-reselection manifests, scores, and paired differences;
- `mind_text_*_proxy_results.csv`: encoder-specific public boundary results;
- `neural_user_bootstrap.csv`: candidate-aware neural input audit;
- `feature_dictionary.csv`: ordered estimator schema.

Generated manuscript fragments are under `access/tables/`, and plot/protocol code is under `access/tools/`. See `access/README.md`, `docs/ACCESS_RESULT_FILES.md`, and `docs/ACCESS_ALIGNMENT.md` for detailed mappings.

## Executable entry points

`python scripts/run_synthetic_demo.py` constructs source-preserving records from supplied synthetic candidate inputs, fits control and PEC models, ranks within query, and reports NDCG@10, Recall@10, and MRR.

After separately obtaining MIND-small, arrange it as `data/MINDsmall/{train,dev}/{news.tsv,behaviors.tsv}` and run:

```bash
pip install -e '.[mind]'
python scripts/run_mind_proxy.py \
  --mind-root data/MINDsmall \
  --encoder sentence-transformers/all-MiniLM-L6-v2
```

MIND does not contain independent stated-profile fields matching the private P block. This is a boundary study over available public evidence, not a replication of the private-platform setting.

## Repository map

```text
access/data/              Active IEEE Access aggregate records
access/tables/            Generated manuscript table fragments
access/tools/             Figure, protocol, and worked-example code
configs/                  Public demo and proxy settings
examples/synthetic/       Non-private candidate-row fixture
scripts/                  Public executable entry points
src/pec_fuse/             Feature, ranking, evaluation, MIND, and tie-order code
docs/                     Active IEEE Access documentation
```

## Data boundary

No private user profile, click, recommendation, article text, identifier, candidate row, embedding, prediction row, credential, or fitted private model belongs in this repository. See `docs/DATA_AVAILABILITY.md` and `docs/REPRODUCIBILITY.md`.
