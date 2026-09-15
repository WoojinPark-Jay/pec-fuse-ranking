# IEEE Access aggregate release

This directory accompanies the Access manuscript revision v9 (2026-09-15). It extends the existing WSDM artifact without replacing its historical results. All empirical values are unchanged from Access v8 / PDF57.

## Contents and paper mapping

| Records in `data/` | Use |
| --- | --- |
| `feature_dictionary.csv` | Exact ordered 25-field estimator schema (Table 13), not an importance ranking |
| `fusion_data_census.csv` | Split census (Table 1) |
| `core_test_metrics.csv`, `core_user_bootstrap.csv` | Core absolute scores, compression / no-E comparisons and paired intervals |
| `core_selected_configs.json` | Selected core estimators |
| `fusion_protocol.json`, `fusion_selected_configs.json` | Shared-context multidimensional audit and validation selections |
| `fusion_seed_metrics.csv`, `fusion_test_summary.csv`, `fusion_paired_intervals.csv` | All final-seed metrics and interval variants, including null / negative findings |
| `direct_complete_user_bootstrap.csv` | Complete 25-D minus Direct 19-D, all three metrics (Table 7 and supporting records) |
| `neural_user_bootstrap.csv`, `supplementary_user_bootstrap.csv` | Neural input effects and supplementary comparisons |
| `disagreement_user_bootstrap.csv`, `thresholds_*.json` | Outcome-defined high-profile / trace-absence diagnostic |
| `pool_metrics.csv`, `pool_paired_differences.csv`, `pool_manifest.json` | Absolute scores, deltas and user-clustered intervals for each fixed-model pool |
| `mind_text_*_proxy_results.csv` | Three-encoder MIND boundary results |

The `tables/` directory contains the manuscript's generated table fragments. Files not included by the manuscript (for example `fusion_scores.tex` or `learner_seeds.tex`) are supporting fragments, not extra reported experiments. `tools/` contains plot generators, shared styling, and the complete-minus-Direct interval calculation. Install matplotlib and fonttools in addition to the root dependencies to regenerate plots. Plot scripts create files in `figures/`; Figure 1 is an independent vector architecture and is not regenerated here.

Run `python scripts/check_access_aggregates.py` from the repository root to check file integrity, schema size, seed-level aggregation, and stored effect arithmetic. Run `PYTHONPATH=src python scripts/run_synthetic_demo.py` for the public feature/ranking example. These checks do not recreate the private experiments.

## Interpretation and definitions

- The legacy key `popularity_matched` means same-day candidate expansion, not a guarantee of popular or difficult negatives.
- `pool_manifest.json:new_candidate_rows` is the number of query-item pairs newly present relative to the original pool. It is not additions plus removals. Queries, positives, retained-trace candidates and pool sizes remain fixed.
- Pool headline comparisons use fixed headline fits. Pool compression comparisons use the separately selected audit PEC and collapsed fits, not the headline PEC fit.
- Complete-minus-Direct and manuscript multidimensional intervals average query-level differences over the same five final seeds, then resample users. They do not include uncertainty over new training seeds. Other recorded interval variants remain available in the unmodified aggregate file.
- `fusion_protocol.json` is an archived execution record. Its original local-work scope notes describe execution at that time, not a prohibition on this later aggregate release. Paths beginning with `reports/` identify source records, not distributed private data.
- Scalar comparisons change feature sets (12-D compressed / 17-D Direct / 25-D complete). The multidimensional audit shares 14 context fields (19-D Direct / 25-D complete). These are not all identical-capacity estimators.

## Reproduction boundary

This release contains aggregate records, configuration, public feature/evaluation code, figure code and synthetic examples. No private source rows, article text, embeddings, user/query-level predictions, credentials or trained private models are included. The scripts requiring private per-query pickles must only be run on trusted, authorized local records; pickle files are not safe to load from untrusted sources. Recomputing reported private-platform intervals or retraining all private experiments still requires authorized private inputs. The public synthetic demo is a contract demonstration, not evidence for the manuscript's scores.

All release files are covered by the root `RELEASE_MANIFEST.json` SHA-256 inventory. WSDM records elsewhere in the repository are preserved separately.

## Public-interface corrections in this release

The feature dictionary now quotes comma-containing interval strings as valid CSV. The synthetic library's `STRONG_CONTROL_FEATURES` is aligned to the recorded 11-field operational control B; the former 14-field grouping is explicitly represented by `SHARED_CONTEXT_FEATURES` H. This corrects the old public demonstration, not the private experiment records or paper scores. The ordered 25-field PEC input is unchanged. The historical configuration key `popularity_hard` in `configs/extra_trees.json` refers to the same-day headline fit; `access/data/core_test_metrics.csv` records the current regime names and the same estimator settings.
