# Following an example from inputs to rankings

## 1. Run the synthetic example first

Follow the root [installation instructions](../README.md#quick-start), then run `python scripts/run_synthetic_demo.py` from the repository root.

| Stage | File | What happens |
| --- | --- | --- |
| Input | `examples/synthetic/candidate_inputs.csv` | One candidate per user-query-row; `split` selects train/test and `label` is the observed-click target. All values are synthetic. |
| Features | `src/pec_fuse/features.py` | Constructs features from supplied inputs; semantic summaries in this fixture are already supplied. |
| Input order | `src/pec_fuse/schema.py` | Defines the exact 25-column record and comparison subsets. |
| Fit | `src/pec_fuse/ranking.py`, `configs/extra_trees.json` | Fits separate control and PEC ExtraTrees models on training rows. |
| Score | `src/pec_fuse/ranking.py` | Produces one positive-class score per test candidate. |
| Rank/evaluate | `src/pec_fuse/evaluation.py` | Sorts candidates within query and computes ranking metrics. |

The printed `pec_fuse_score` is a model output, not an input feature or a calibrated click-through rate. A larger score ranks a candidate earlier within its query. `rank` is one-based; `label` is kept for evaluation. Zero means no observed positive, not verified dislike.

No notebook is required for these commands. The editable installation makes `pec_fuse` importable in the active Python environment. If a notebook cannot import it, use the same environment as its kernel rather than moving individual `.py` files into the notebook folder.

## 2. Separate demonstration results from paper results

`python scripts/render_access_summary.py` reads stored CSVs without training models. `python scripts/check_access_aggregates.py` checks the release inventory and specified arithmetic relationships. Passing it validates those checks only, not private experiments or a comprehensive privacy audit.

The small synthetic fixture should not match manuscript scores. To study a reported comparison, start with the [question-to-artifact map](PAPER_RQ_REPRODUCIBILITY_MAP.md), then inspect the named CSV and protocol. Variation across model seeds and user-bootstrap intervals describe different uncertainty sources.

## 3. Read feature widths correctly

For N candidates, Complete PEC receives an N-by-25 matrix. Direct receives N-by-19. Both output N scores. Removing columns changes row width, not candidate count.

Scalar-audit Direct is 17-D; shared-context Direct is 19-D. These are different comparison designs. The operational 11-field control and 11-field Z block are also different sets. Use the [comparison design](../access/tables/comparison_design.tex), not the dimension alone, to determine membership.

## 4. Move to MIND after the small example

The [MIND guide](MIND_PROXY_PROTOCOL.md) explains data placement, downloads, runtime options, and JSON output. Smaller `--train-limit`/`--dev-limit` values are useful for exploration but change the experiment. The encoder still represents the loaded news collection, so smaller behavior limits do not eliminate embedding cost. If a tiny subset lacks both classes or valid queries, enlarge it.

CLI values control the MIND run; configuration documents are not automatically loaded. Record the command, package versions, encoder revision, and output for each local run.

## Common setup issues

| Symptom | Action |
| --- | --- |
| `No module named pec_fuse` | Activate the intended environment and run `python -m pip install -e .` from the root. |
| Missing `sentence_transformers` | Install `python -m pip install -e '.[mind]'`. |
| Missing plotting dependencies | Install `python -m pip install -e '.[figures]'`. |
| Missing TSV files | Check `news.tsv` and `behaviors.tsv` in both `train/` and `dev/` under `--mind-root`. |
| Encoder download failure | Check network access and the selected model's availability/terms. |
| Hash mismatch after editing | Compare with a clean checkout of the same release; a locally changed file is no longer the distributed file. |

Dependencies specify minimums, not a fully pinned historical environment. Library/model revisions may change numeric results. Keep downloaded data and local outputs in ignored directories; do not commit private rows.
