# IEEE Access Manuscript Alignment

This release aligns the public artifact with IEEE Access manuscript revision v38, **PEC-Fuse: Source-Preserving Evidence Fusion for News Ranking with Partial Recommendation Traces**. Existing aggregate CSV values are preserved. Table fragments and figure generators follow the current manuscript, including the added equal-width Direct-versus-learned-5-D comparison.

## Equal-width comparison availability

`access/tables/direct_complete.tex` reports Direct minus learned 5-D NDCG@10: +0.0041 [0.0009, 0.0068] for recent-window and +0.0030 [-0.0028, 0.0088] for same-day. Both scorers have 19 inputs. These added intervals are distributed at manuscript precision in the table; a separate unrounded bootstrap record for this contrast is not included. They cannot be recovered by subtracting other interval endpoints. `fusion_seed_metrics.csv` supplies seed-specific absolute scores, not the paired per-query inputs needed to recalculate these intervals.

Absolute scores are means of seed-specific aggregate metrics. Paired intervals first average within-query differences across five fixed seeds, then resample users. Reported deltas use unrounded values. These are representation-audit fits, not headline fits.

## Primary evidence

- Complete PEC versus operational control: `core_test_metrics.csv` and `core_user_bootstrap.csv`.
- Complete PEC versus collapsed and learned scalar representations: core and supplementary aggregate records.
- Learned fusion at widths 1, 2, 4, and 5: `fusion_protocol.json`, `fusion_selected_configs.json`, `fusion_seed_metrics.csv`, and `fusion_paired_intervals.csv`.
- Shared-context Direct 19-D versus Complete 25-D: `direct_complete_user_bootstrap.csv`.
- Joint profile/trace removal: all `joint_pe_*` records.
- Fixed-model same-day candidate reselection: `pool_manifest.json`, `pool_metrics.csv`, and `pool_paired_differences.csv`.
- Candidate-aware neural input audit: `neural_user_bootstrap.csv`.
- Public evidence-definition boundary: the three `mind_text_*_proxy_results.csv` files.

## Interpretation boundary

The artifact supports a source-preserving input and evaluation interface. It does not claim causal exposure correction, universal superiority of every 25-field component, or equivalence between MIND proxy evidence and private stated-profile provenance.

The internal key `popularity_matched` denotes the manuscript's same-day candidate expansion and does not assert verified hard negatives.
