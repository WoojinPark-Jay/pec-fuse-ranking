# PEC-Fuse

Code and accompanying materials for **PEC-Fuse: Source-Preserving Evidence Fusion for News Ranking with Partial Recommendation Traces**, an IEEE Access manuscript.

PEC-Fuse keeps stated-profile evidence (P), retained recommendation traces (E), and prior consumption (C) as separate inputs to a news-ranking model. Instead of reducing these sources to one score first, it constructs a feature vector for each user-query-candidate combination and learns to score that vector.

**Explore PEC-Fuse:** [Interactive tutorial](https://woojinpark-jay.github.io/pec-fuse-ranking/) | [Try the live ranking demo](https://woojinpark-jay.github.io/pec-fuse-ranking/#live-demo) | [Quick start](README.md#quick-start) | [Reproducibility](docs/REPRODUCIBILITY.md)

> [!TIP]
> **Try PEC-Fuse interactively in the [live ranking demo](https://woojinpark-jay.github.io/pec-fuse-ranking/#live-demo).**
> Select a reader and scoring model, inspect the resulting news ranking, and trace a candidate score back to its profile, retained-trace, prior-consumption, and control signals. No installation or data upload is required.

**Repository guide:** [Method](README.md#method-at-a-glance) | [Results](README.md#results-and-paper-mapping) | [MIND example](README.md#public-data-example) | [Data availability](docs/DATA_AVAILABILITY.md)

## Interactive tutorial: start here

The public [PEC-Fuse interactive tutorial](https://woojinpark-jay.github.io/pec-fuse-ranking/) is the recommended visual introduction to the project. It connects the paper's notation to concrete candidate rows, works through the main equations, distinguishes computed features from learned quantities, and explains what changes in each model comparison. Readers who want to begin with an example can jump directly to the [live ranking demo](https://woojinpark-jay.github.io/pec-fuse-ranking/#live-demo). Sliders and scenario controls run entirely in the browser; they neither upload data nor retrain the manuscript models. The tutorial source is versioned under [`tutorial/`](tutorial/).

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

The operational control has 11 inputs but is **not** the same field set as the 11-field Z block. The shared-context representation audit uses 14 common context fields plus five original or learned semantic coordinates. See the [ordered schema](docs/feature_dictionary.csv) and [comparison design](access/tables/comparison_design.tex) for exact memberships.

## Quick start

Python 3.10 or newer is required. The synthetic example runs on CPU and needs no private data, model download, or GPU.

**Download using the route you are viewing.**

- **GitHub:** clone the repository with the command below, or use GitHub's Code > Download ZIP.
- **Anonymous artifact:** use the file viewer's **Download full repository as ZIP** button. Extract the archive and open a terminal in the folder containing `pyproject.toml`, `README.md`, and `src/`. No access to the original GitHub repository is required. If a URL is replaced with `XXXX`, do not run that clone command; use the ZIP route instead.

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

To inspect released results without retraining, run `python scripts/render_access_summary.py`. Choose the appropriate check for your download:

**Unchanged GitHub checkout or GitHub ZIP:**

```bash
python scripts/check_access_aggregates.py
```

This checks original release-file SHA-256 hashes, feature order, and selected aggregate arithmetic.

**ZIP downloaded from the anonymous artifact:**

```bash
python scripts/check_access_aggregates.py --data-only
```

Anonymization can replace names and links, changing file bytes without changing the experiment. `--data-only` explicitly skips file hashes but retains the feature/schema and aggregate-arithmetic checks. Its output reports `verification_mode: data_only`, `file_hash_verification: skipped`, and `hashed_files: 0`. A passing data-only check does **not** establish file integrity or equality to the original release. Full mode never silently skips a hash mismatch; do not use this option to dismiss unexplained changes in an original GitHub download.

Both modes report `status: passed` only for their stated scope. Neither re-runs private experiments. See the [walkthrough](docs/GETTING_STARTED.md) for inputs, outputs, and file roles.

## Results and paper mapping

This release is aligned with manuscript revision **v35**. The headline improvements below are Complete PEC minus the operational control, in NDCG@10 units, not percentage changes:

| Candidate regime | NDCG@10 improvement |
| --- | ---: |
| Recent-window | +0.0662 |
| Same-day | +0.0218 |

Both paired 95% intervals exclude zero; the full scores and intervals are in [core metrics](access/data/core_test_metrics.csv) and [paired comparisons](access/data/core_user_bootstrap.csv). These results concern the manuscript's retrospective candidate-pool evaluation.

The compact 19-D Direct alternative is competitive with Complete PEC. The equal-width Direct versus learned 5-D comparison favors Direct in recent-window, while the same-day interval includes zero. This supports the tested source-preserving representation, not universal superiority over learned fusion. See the [current comparison table](access/tables/direct_complete.tex).

| Question | Where to look |
| --- | --- |
| Which features reach each model? | [Feature schema](docs/feature_dictionary.csv), [comparison design](access/tables/comparison_design.tex) |
| What changes when semantic coordinates are transformed? | [Fusion protocol](access/data/fusion_protocol.json), [representation comparisons](access/tables/direct_complete.tex) |
| Does C help when P and E are removed together? | [Joint-removal records](access/data/joint_pe_user_bootstrap.csv) |
| What happens when candidates are reselected? | [Fixed-model reselection](docs/SAME_DAY_TIE_ORDER.md) |
| Does PEC help a neural scorer? | [Neural input audit](docs/PRIVATE_CANDIDATE_AWARE_NEURAL_AUDIT.md) |
| What transfers to public data? | [MIND protocol](docs/MIND_PROXY_PROTOCOL.md) |

The [artifact map](docs/PAPER_RQ_REPRODUCIBILITY_MAP.md), [result-file guide](docs/ACCESS_RESULT_FILES.md), and [alignment notes](docs/ACCESS_ALIGNMENT.md) connect remaining tables to their records. Headline and representation-audit scores come from different selected fits and must not be interchanged.

## Public-data example

Obtain MIND-small under its [dataset terms](https://msnews.github.io/) and arrange `news.tsv` and `behaviors.tsv` under both `data/MINDsmall/train/` and `data/MINDsmall/dev/`.

If the anonymous viewer masks the external link, search for **Microsoft News Dataset (MIND)**, open the official Microsoft Research dataset website, and download the **MIND-small training and validation** archives under its terms. Extract the training files into `train/` and validation files into `dev/`. These third-party data are separate from the repository ZIP; do not try to open a masked `XXXX` link.

```bash
python -m pip install -e '.[mind]'
python scripts/run_mind_proxy.py \
  --mind-root data/MINDsmall \
  --encoder sentence-transformers/all-MiniLM-L6-v2
```

This downloads an encoder and runs model selection and evaluation. It is substantially heavier than the synthetic example. Output is written to `outputs/mind_proxy/sentence-transformers__all-MiniLM-L6-v2.json`; the [protocol guide](docs/MIND_PROXY_PROTOCOL.md) explains the options and results.

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
| `src/pec_fuse/` | Feature construction, scorer, metrics, bootstrap, MIND proxy, tie-order utilities |
| `scripts/` | Synthetic demo, MIND run, aggregate checker, result summary |
| `examples/synthetic/` | Non-private example rows |
| `configs/` | Demo settings and documented audit/proxy configurations |
| `tutorial/` | Source for the bilingual interactive paper tutorial |
| `access/data/` | Manuscript aggregate records |
| `access/tables/` | Current manuscript table fragments |
| `access/tools/` | Figure generators and restricted-input calculation utility |
| `docs/` | Protocols, walkthrough, paper mapping, and release scope |

## Reproducibility and data access

The release includes executable synthetic and MIND examples, feature/evaluation code, configurations, aggregate results, and table/figure sources. Private operational rows, per-query predictions, embeddings, and fitted private models are not distributed. The public commands therefore demonstrate the implementation and inspect reported evidence, but cannot regenerate private-platform scores from raw data. [Reproducibility scope](docs/REPRODUCIBILITY.md) | [Data availability](docs/DATA_AVAILABILITY.md)

## License, citation, and questions

The repository code is released under the [MIT License](LICENSE). MIND and downloaded encoders retain their own licenses and terms. Please identify the repository URL and commit when referring to this software. A publication-specific citation will be added when final bibliographic details are available; the manuscript is not represented here as an accepted article.

For questions or reproducibility issues, use [GitHub Issues](https://github.com/WoojinPark-Jay/pec-fuse-ranking/issues) and include the command, Python/package versions, and a non-private error example. Do not attach operational data or credentials.

Anonymous reviewers should use the review venue's communication channel if the repository/contact links are masked. The anonymous hosting service's bug-report link is for hosting problems, not scientific questions about this manuscript.
