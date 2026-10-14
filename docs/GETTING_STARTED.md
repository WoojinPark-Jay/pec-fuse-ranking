# Following an example from inputs to rankings

## 1. Run the synthetic example first

Follow the root [installation instructions](../README.md#quick-start), then run `python scripts/run_synthetic_demo.py` from the repository root.

On GitHub, clone the repository or download its ZIP. In the versioned review artifact, choose **Download full repository as ZIP** in the file viewer, extract it, and open a terminal in the directory containing `pyproject.toml`, `README.md`, and `src/`. The archive's top-level folder name may differ from the GitHub repository name. The artifact can be used directly without cloning GitHub.

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

### Run the candidate-aware neural reference

Install the optional PyTorch dependency and run the synthetic neural command:

```bash
python -m pip install -e '.[neural]'
python scripts/run_synthetic_neural.py
```

| Stage | File | What happens |
| --- | --- | --- |
| Generate | `scripts/run_synthetic_neural.py` | Creates synthetic article embeddings, padded histories, query groups, control fields, PEC fields, and one positive label per query. |
| Define | `src/pec_fuse/neural.py` | Projects frozen input embeddings, self-attends over history, pools history for each candidate, and forms candidate/user interaction records. |
| Fit | `src/pec_fuse/neural.py` | Minimizes query-wise listwise cross-entropy with AdamW, backpropagation, and gradient clipping. |
| Compare | `scripts/run_synthetic_neural.py` | Fits matched neural-control and neural-PEC variants, then prints losses and ranking metrics. |

The command is a CPU-scale implementation check. It does not load operational records, BGE-M3 weights, private embeddings, or fitted manuscript parameters, and its metrics are not paper results.

### Run the learned early-fusion MLP reference

The same optional environment also exposes the learned fusion path:

```bash
python scripts/run_synthetic_fusion.py
```

`src/pec_fuse/fusion.py` trains an MLP prediction head from five P/C coordinates and exports its learned 5-D latent record. The example combines that record with 14 context fields before fitting the downstream ExtraTrees scorer, keeping representation learning distinct from final ranking. It compares the code path with an equal-width Direct record only as a synthetic implementation demonstration.

## 2. Separate demonstration results from paper results

`python scripts/render_access_summary.py` reads stored CSVs without training models. The aggregate checker verifies the distributed release:

| Download | Command | Meaning of success |
| --- | --- | --- |
| Unchanged GitHub checkout, GitHub ZIP, or versioned artifact ZIP | `python scripts/check_access_aggregates.py` | Release-file hashes and the implemented schema/arithmetic checks pass. |

The SHA-256 manifest describes the distributed release bytes. The checker is strict and never automatically skips a mismatch. Do not regenerate a manifest merely to make a modified download pass as the original.

The checker does not independently reproduce private experiments or provide a comprehensive privacy/security audit. Run it without Python's `-O` optimization flag, because its arithmetic checks use assertions.

The small synthetic fixture should not match manuscript scores. To study a reported comparison, start with the [question-to-artifact map](PAPER_RQ_REPRODUCIBILITY_MAP.md), then inspect the named CSV and protocol. Variation across model seeds and user-bootstrap intervals describe different uncertainty sources.

## 3. Read feature widths correctly

For N candidates, Complete PEC receives an N-by-25 matrix. Direct receives N-by-19. Both output N scores. Removing columns changes row width, not candidate count.

Scalar-audit Direct is 17-D; shared-context Direct is 19-D. These are different comparison designs. The operational 11-field control and 11-field Z block are also different sets. Use the [comparison design](../access/tables/comparison_design.tex), not the dimension alone, to determine membership.

## 4. Move to MIND after the small example

The [MIND guide](MIND_PROXY_PROTOCOL.md) explains data placement, required local BGE vector caches, the fixed 60,000/30,000 behavior protocol, and output files. Changing limits, feature columns, candidate expansion, or cached vectors creates a different experiment.

The released runner records the command-relevant protocol, package versions, raw-data hashes, embedding-cache hashes, and output metadata. It refuses to overwrite an existing output directory.

## Common setup issues

| Symptom | Action |
| --- | --- |
| `No module named pec_fuse` | Activate the intended environment and run `python -m pip install -e .` from the root. |
| Missing BGE vector cache | Prepare the exact `.npz` files listed in `MIND_PROXY_PROTOCOL.md`; the release does not redistribute embeddings. |
| Missing `torch` for the neural example | Install `python -m pip install -e '.[neural]'`. |
| Missing plotting dependencies | Install `python -m pip install -e '.[figures]'`. |
| Missing TSV files | Check `MINDsmall_train/` and `MINDsmall_dev/` under `--mind-root`. |
| Hash mismatch after editing | Compare with a clean checkout of the same release; a locally changed file is no longer the distributed file. |

Dependencies specify minimums, not a fully pinned historical environment. Library/model revisions may change numeric results. Keep downloaded data and local outputs in ignored directories; do not commit private rows.
