# IEEE Access Manuscript Alignment

This release aligns the public artifact with IEEE Access manuscript revision v32, **PEC-Fuse: Source-Preserving Evidence Fusion for News Ranking with Partial Recommendation Traces**. The aggregate experiment records remain unchanged from the v29 experiment freeze; subsequent revisions updated presentation and manuscript metadata.

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
