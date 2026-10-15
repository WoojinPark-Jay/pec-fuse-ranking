# IEEE Access aggregate release

This directory accompanies IEEE Access manuscript revision v81 and is the active aggregate release for PEC-Fuse. Tables, aggregate records, and protocol files follow the current manuscript presentation.

## Contents and paper mapping

| Records in `data/` | Use |
| --- | --- |
| `feature_dictionary.csv` | Exact ordered 25-field estimator schema, not an importance ranking |
| `fusion_data_census.csv` | Split census |
| `core_test_metrics.csv`, `core_user_bootstrap.csv` | Core absolute scores, compression/no-E comparisons, and paired intervals |
| `core_selected_configs.json` | Selected core estimators |
| `fusion_protocol.json`, `fusion_selected_configs.json` | Shared-context multidimensional audit and validation selections |
| `fusion_seed_metrics.csv`, `fusion_test_summary.csv`, `fusion_paired_intervals.csv` | Final-seed metrics and interval variants |
| `direct_complete_user_bootstrap.csv` | Complete 25-D minus Direct 19-D comparisons |
| `tables/direct_complete.tex` (outside `data/`) | Added Direct-minus-learned-5-D intervals at manuscript precision; see [alignment notes](../docs/ACCESS_ALIGNMENT.md) |
| `joint_pe_*` | Joint profile/trace-removal protocol, census, selected fits, seed metrics, and paired intervals |
| `neural_user_bootstrap.csv`, `supplementary_user_bootstrap.csv` | Neural-input and supplementary comparisons |
| `disagreement_user_bootstrap.csv`, `thresholds_*.json` | High-profile/trace-absence diagnostic |
| `pool_metrics.csv`, `pool_paired_differences.csv`, `pool_manifest.json` | Fixed-model candidate-reselection scores, deltas, and intervals |
| `mind_expanded_results.csv`, `mind_expanded_user_bootstrap.json` | BGE-M3 main and BGE-base sensitivity results for the 8/14/15/21-field MIND boundary audit |
| `mind_expanded_protocol.json`, `mind_membership_diagnostics.json`, `mind_*_candidate_audit.json` | Fixed MIND construction, provenance, and candidate-pool diagnostics |

The `tables/` directory contains generated manuscript table fragments. Supporting fragments not included by the manuscript are not additional experiments. `tools/` contains plot generators, shared styling, and one paired-calculation script that requires restricted per-query inputs not distributed in this repository. Figure 1 is an independent vector architecture and is not regenerated here.

Run `python scripts/check_access_aggregates.py` from the repository root to check the supplied Access records. Run `python scripts/render_access_summary.py` for a compact textual summary and `PYTHONPATH=src python scripts/run_synthetic_demo.py` for the public feature/ranking example. These checks do not recreate private experiments.

## Interpretation and definitions

- The legacy internal key `popularity_matched` means same-day candidate expansion, not guaranteed popular or hard negatives.
- `pool_manifest.json:new_candidate_rows` counts query-item pairs newly present relative to the original pool, not additions plus removals.
- Pool headline comparisons use fixed headline fits; compression comparisons use separately selected audit fits.
- Complete-minus-Direct and multidimensional intervals average query-level differences over the same five final seeds and then resample users.
- Scalar comparisons change feature sets. The multidimensional audit provides the more direct shared-context representation comparison.

## Reproduction boundary

This release contains aggregate records, configurations, public feature/evaluation code, generated table and figure code, and synthetic examples. It excludes private source rows, article text, embeddings, user/query-level predictions, credentials, and fitted private models. Recomputing private-platform intervals or retraining private experiments requires authorized private inputs. All distributed files are covered by the root `RELEASE_MANIFEST.json` SHA-256 inventory.
