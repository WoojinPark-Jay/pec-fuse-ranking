# Current WSDM release alignment

The active WSDM short-paper release uses the cutoff-corrected aggregate records. The final wording describes the **complete source-preserving representation**, not an isolated effect of source identity. No empirical result changes in the wording revision.

## Headline and compression checks

All entries below are NDCG@10 differences. Internal `popularity_matched` means Same-day expansion.

| Comparison | Regime | Delta | Paired user-clustered 95% CI |
|---|---|---:|---|
| headline_full_vs_control | recent_window | +0.0662 | [0.0523, 0.0793] |
| headline_full_vs_control | popularity_matched | +0.0218 | [0.0080, 0.0363] |
| full_vs_collapsed | recent_window | +0.0133 | [0.0047, 0.0215] |
| full_vs_collapsed | popularity_matched | +0.0107 | [0.0009, 0.0206] |
| full_vs_learned_early | recent_window | +0.0121 | [0.0048, 0.0198] |
| full_vs_learned_early | popularity_matched | +0.0125 | [0.0011, 0.0248] |
| E0_full_vs_control | recent_window | +0.0660 | [0.0517, 0.0792] |
| E0_full_vs_control | popularity_matched | +0.0222 | [0.0066, 0.0373] |
| pc_no_e_vs_control_no_e | recent_window | +0.0655 | [0.0474, 0.0826] |
| pc_no_e_vs_control_no_e | popularity_matched | +0.0874 | [0.0694, 0.1058] |
| matched_full_vs_no_e | recent_window | +0.1085 | [0.0900, 0.1260] |
| matched_full_vs_no_e | popularity_matched | +0.1382 | [0.1133, 0.1638] |
| no_e_decomp_vs_early | recent_window | +0.0086 | [-0.0010, 0.0180] |
| no_e_decomp_vs_early | popularity_matched | +0.0288 | [0.0146, 0.0423] |

Table 1 uses the headline-selected fits; Table 2 uses the separately selected diagnostic fits; Table 3 is an exploratory outcome-defined disagreement analysis. Complete-interface and compressed baselines differ in width and interactions. Direct separation without interactions is retained in the full aggregate records.

## Additional evidence

- Neural PEC minus neural controls: +.0385 / +.0488, with positive intervals in both regimes. See `../results/corrected/neural_user_bootstrap.csv`.
- Seven learner seeds on fixed pools: 7/7 positive in Recent-window, 6/7 in Same-day. This is not five-pool robustness.
- Corrected five-pool redraws are incomplete. Historical hidden-latent results are not current capacity-matched evidence.
- MIND remains a separate public proxy; P+C without E is stronger there.

## Protocol and release boundary

Selection uses March-31 popularity; January-April refits use April-30 popularity and the original May-June pools. This is a post-hoc correction on an inspected test set. See `CUTOFF_CORRECTION.md` and `../configs/corrected_audit_protocol.json`.

This release contains code, configurations, aggregate results and synthetic examples only. It contains no private source rows, per-user predictions, embeddings or trained models. The source feature contract and aggregate records do not enable public regeneration of private-platform scores. Null and negative aggregate findings are retained.
