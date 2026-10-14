# PEC-Fuse

Code and accompanying materials for **PEC-Fuse: Source-Preserving Evidence Fusion for News Ranking with Partial Recommendation Traces**, an IEEE Access manuscript.

PEC-Fuse keeps stated-profile evidence (P), retained recommendation traces (E), and prior consumption (C) as separate inputs to a news-ranking model. Instead of reducing these sources to one score first, it constructs a feature vector for each user-query-candidate combination and learns to score that vector.

**Explore PEC-Fuse:** [Project page](https://woojinpark-jay.github.io/pec-fuse-ranking/) | [Paper](https://woojinpark-jay.github.io/pec-fuse-ranking/PEC-Fuse-manuscript-v73.pdf) | [Interactive tutorial](https://woojinpark-jay.github.io/pec-fuse-ranking/?view=tutorial&lang=en) | [Live ranking demo](https://woojinpark-jay.github.io/pec-fuse-ranking/?view=tutorial&lang=en#live-demo) | [Versioned reproducibility artifact](https://anonymous.4open.science/r/pec-fuse-ranking-9F34/)

> [!TIP]
> **Try PEC-Fuse interactively in the [live ranking demo](https://woojinpark-jay.github.io/pec-fuse-ranking/?view=tutorial&lang=en#live-demo).**
> Select a reader and scoring model, inspect the resulting news ranking, and trace a candidate score back to its profile, retained-trace, prior-consumption, and control signals. No installation or data upload is required.

**Repository guide:** [Method](README.md#method-at-a-glance) | [Results](README.md#results-and-paper-mapping) | [MIND example](README.md#public-data-example) | [Data availability](docs/DATA_AVAILABILITY.md)

**Versioned reproducibility artifact:** [Browse or download the manuscript-aligned snapshot](https://anonymous.4open.science/r/pec-fuse-ranking-9F34/). The release corresponds to IEEE Access manuscript revision **v73**; this GitHub repository is the canonical source for the same code and aggregate records.

## Interactive tutorial: start here

The public [PEC-Fuse project page](https://woojinpark-jay.github.io/pec-fuse-ranking/) is the canonical entry point for the paper, code, tutorial, live demo, and reproducibility artifact. The [interactive tutorial](https://woojinpark-jay.github.io/pec-fuse-ranking/?view=tutorial&lang=en) connects the paper's notation to concrete candidate rows, works through the main equations, distinguishes computed features from learned quantities, and explains what changes in each model comparison. Readers who want to begin with an example can jump directly to the [live ranking demo](https://woojinpark-jay.github.io/pec-fuse-ranking/?view=tutorial&lang=en#live-demo). Sliders and scenario controls run entirely in the browser; they neither upload data nor retrain the manuscript models. The tutorial source is versioned under [`tutorial/`](tutorial/).

## Method at a glance

```text
User profile + retained trace + earlier clicks + candidate metadata
                              |
                   One feature row per candidate
                              |
                   ExtraTrees candidate scorer
                              |
                  One ranking score per candidate
                              |
                     Sort within each query
```

The complete record has 25 fields: P (1), E (3), C (4), recorded controls Z (11), and explicit products (6). The compact Direct record has 19 fields and omits the six products. For N candidates, the scorer receives an N-by-25 or N-by-19 matrix, not a single user vector. Click labels are training/evaluation targets, not input features.

The operational control has 11 inputs but is **not** the same field set as the 11-field Z block. The shared-context representation audit uses 14 common context fields plus five original or learned semantic coordinates. See the [ordered schema](access/data/feature_dictionary.csv) and [comparison design](access/tables/comparison_design.tex) for exact memberships.

## Quick start

Python 3.10 or newer is required. The synthetic example runs on CPU and needs no private data, model download, or GPU.

**Download using the route you are viewing.**

- **GitHub:** clone the repository with the command below, or use GitHub's Code > Download ZIP.
- **Versioned review artifact:** [open the 4open snapshot](https://anonymous.4open.science/r/pec-fuse-ranking-9F34/), then use the file viewer's **Download full repository as ZIP** button. Extract the archive and open a terminal in the folder containing `pyproject.toml`, `README.md`, and `src/`. The artifact can be used directly without cloning GitHub.

GitHub download only:

```bash
git clone https://github.com/WoojinPark-Jay/pec-fuse-ranking.git
cd pec-fuse-ranking
```

Then, for **either route**, run these commands from the downloaded repository root:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e .
python scripts/run_synthetic_demo.py
```

On Windows PowerShell, activate with `.venv\Scripts\Activate.ps1` instead. Run subsequent commands from the repository root using the same Python environment.

The example reads [synthetic candidate inputs](examples/synthetic/candidate_inputs.csv), constructs ordered features, fits the operational control and Complete PEC, and prints candidate IDs, labels, scores, ranks, and NDCG@10/Recall@10/MRR. Some semantic summaries are supplied in the fixture; this example does not encode raw article text. Its small illustrative scores are not manuscript results.

The candidate-aware neural architecture and its query-wise training loop are also executable on generated, non-private inputs:

```bash
python -m pip install -e '.[neural]'
python scripts/run_synthetic_neural.py
```

This command trains matched neural-control and neural-PEC variants from scratch on synthetic embeddings and side features. It exercises history self-attention, candidate-conditioned pooling, the candidate/user interaction record, listwise loss, backpropagation, gradient clipping, scoring, and within-query evaluation. It does **not** download BGE-M3, expose operational rows, load a manuscript checkpoint, or reproduce the reported private-platform scores. See the [neural audit guide](docs/PRIVATE_CANDIDATE_AWARE_NEURAL_AUDIT.md).

The learned early-fusion MLP is separately executable so its representation-learning step is not hidden inside an unpublished pipeline:

```bash
python scripts/run_synthetic_fusion.py
```

The command learns a 5-D latent representation from five synthetic P/C coordinates, joins it to 14 shared context fields, and fits the downstream ExtraTrees scorer. It also fits the equal-width 19-D Direct path for orientation. These generated metrics illustrate the code path only and are not manuscript results.

To inspect released results without retraining, run `python scripts/render_access_summary.py`. For an unchanged GitHub checkout, GitHub ZIP, or versioned artifact ZIP, run:

```bash
python scripts/check_access_aggregates.py
```

This checks release-file SHA-256 hashes, feature order, and selected aggregate arithmetic. It reports `status: passed` only when those checks pass; it does not re-run private experiments. See the [walkthrough](docs/GETTING_STARTED.md) for inputs, outputs, and file roles.

## Results and paper mapping

This release is aligned with manuscript revision **v73**. Appendix C-B includes a trace-only diagnostic: on the same-day pool, an E-only logistic score reaches 0.5007 NDCG@10, well below the operational control (0.7499) and Complete PEC (0.7717), so trace membership is an exploitable pool cue but does not explain the headline result. The headline improvements below are Complete PEC minus the operational control, in NDCG@10 units, not percentage changes:

| Candidate regime | NDCG@10 improvement |
| --- | ---: |
| Recent-window | +0.0662 |
| Same-day | +0.0218 |

Both paired 95% intervals exclude zero; the full scores and intervals are in [core metrics](access/data/core_test_metrics.csv) and [paired comparisons](access/data/core_user_bootstrap.csv). These results concern the manuscript's retrospective candidate-pool evaluation.

The compact 19-D Direct alternative is competitive with Complete PEC. The equal-width Direct versus learned 5-D comparison favors Direct in recent-window, while the same-day interval includes zero. This supports the tested source-preserving representation, not universal superiority over learned fusion. See the [current comparison table](access/tables/direct_complete.tex).

The expanded-pool MIND boundary audit uses four nested public-proxy records with 8, 14, 15, and 21 fields. Under the main BGE-M3 encoder, Full PEC reaches 0.3828 NDCG@10 versus 0.3797 for Direct; the paired user-clustered explicit-product gain is +0.0031 [0.0019, 0.0043]. BGE-base shows the same positive direction. These are nominal 95% intervals from 10,000 bootstrap replicates. MIND P and C are both history-derived, and E records logged-slate membership rather than causal exposure, so this is a public boundary audit rather than a matched replication of the private schema.

| Question | Where to look |
| --- | --- |
| Which features reach each model? | [Feature schema](access/data/feature_dictionary.csv), [comparison design](access/tables/comparison_design.tex) |
| What changes when semantic coordinates are transformed? | [Fusion protocol](access/data/fusion_protocol.json), [representation comparisons](access/tables/direct_complete.tex) |
| Does C help when P and E are removed together? | [Joint-removal records](access/data/joint_pe_user_bootstrap.csv) |
| What happens when candidates are reselected? | [Fixed-model reselection](docs/SAME_DAY_TIE_ORDER.md) |
| Does PEC help a neural scorer? | [Neural input audit](docs/PRIVATE_CANDIDATE_AWARE_NEURAL_AUDIT.md) |
| What transfers to public data? | [MIND protocol](docs/MIND_PROXY_PROTOCOL.md) |

The [artifact map](docs/PAPER_RQ_REPRODUCIBILITY_MAP.md), [result-file guide](docs/ACCESS_RESULT_FILES.md), and [alignment notes](docs/ACCESS_ALIGNMENT.md) connect remaining tables to their records. Headline and representation-audit scores come from different selected fits and must not be interchanged.

## Public-data example

Obtain MIND-small under its [dataset terms](https://msnews.github.io/) and place `MINDsmall_train/` and `MINDsmall_dev/` under one local root. Prepare the two documented BGE embedding caches locally; cached vectors are not distributed.

```bash
python -m pip install -e .
python scripts/run_mind_expanded_membership.py \
  --mind-root data/MINDsmall \
  --output outputs/mind_expanded_final
```

The runner consumes local BGE-M3 and BGE-base vector caches, executes the fixed chronological selection/refit protocol, and never overwrites an existing output directory. The [protocol guide](docs/MIND_PROXY_PROTOCOL.md) documents cache names, feature blocks, candidate expansion, and released results.

MIND uses history-derived profile proxies and expanded logged slates. It is a public-data boundary study, not the private experiment or a standard MIND leaderboard evaluation.

## Figures

```bash
python -m pip install -e '.[figures]'
python access/tools/make_figures.py
```

This regenerates the protocol, aggregate plots, and synthetic feature example under `access/figures/`. Figure 1 is an independently prepared architecture graphic and is not generated by this command. Font fallback can change typography; no proprietary fonts are distributed.

## Repository layout

| Path | Role |
| --- | --- |
| `src/pec_fuse/` | Feature construction, ExtraTrees and candidate-aware neural scorers, metrics, bootstrap, and tie-order utilities |
| `scripts/` | ExtraTrees and neural synthetic demos, fixed-protocol MIND runner, aggregate checker, and result summary |
| `examples/synthetic/` | Non-private example rows |
| `configs/` | Demo settings and documented audit/proxy configurations |
| `tutorial/` | Source for the bilingual interactive paper tutorial |
| `access/data/` | Manuscript aggregate records |
| `access/tables/` | Current manuscript table fragments |
| `access/tools/` | Figure generators and restricted-input calculation utility |
| `docs/` | Protocols, walkthrough, paper mapping, and release scope |

## Reproducibility and data access

The release includes executable ExtraTrees and candidate-aware neural synthetic examples, a public MIND boundary study, feature/evaluation code, configurations, aggregate results, and table/figure sources. Private operational rows, per-query predictions, embeddings, and fitted private models are not distributed. The public commands therefore demonstrate the model definitions and learning procedures and inspect reported evidence, but cannot regenerate private-platform scores from raw data. [Reproducibility scope](docs/REPRODUCIBILITY.md) | [Data availability](docs/DATA_AVAILABILITY.md)

## License, citation, and questions

The repository code is released under the [MIT License](LICENSE). MIND and locally obtained encoder weights or vector caches retain their own licenses and terms. Please identify the repository URL and commit when referring to this software. A publication-specific citation will be added when final bibliographic details are available; the manuscript is not represented here as an accepted article.

For questions or reproducibility issues, use [GitHub Issues](https://github.com/WoojinPark-Jay/pec-fuse-ranking/issues) and include the command, Python/package versions, and a non-private error example. Do not attach operational data or credentials.
