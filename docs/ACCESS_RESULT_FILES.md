# Active Access Result Files

All active manuscript records are under `access/data/`.

| File group | Contents |
|---|---|
| `core_*` | selected configurations, absolute metrics, and paired user-cluster intervals |
| `supplementary_user_bootstrap.csv` | trace-absence, no-E, profile-removal, and related diagnostics |
| `fusion_*` | protocol, data census, selected settings, seed metrics, summary, and paired intervals for widths 1/2/4/5 |
| `direct_complete_user_bootstrap.csv` | Complete-minus-Direct intervals with shared context and seed conditioning |
| `joint_pe_*` | protocol, feature lists, split census, selected settings, seed metrics, and paired intervals |
| `pool_*` | reselection seeds, fingerprints, changed-row counts, absolute scores, and paired differences |
| `neural_user_bootstrap.csv` | candidate-aware neural input comparison |
| `mind_text_*_proxy_results.csv` | MiniLM, BGE-base, and BGE-M3 public proxy results |
| `feature_dictionary.csv` | ordered estimator fields and definitions |
| `thresholds_*.json` | diagnostic thresholds for the two candidate regimes |

These files contain aggregate or configuration records, not individual user rows. Unrounded values are retained where supplied by the experiment record.

Added Direct-versus-learned-5-D intervals are supplied at manuscript precision in [the current table](../access/tables/direct_complete.tex), not a separate unrounded CSV. See [alignment notes](ACCESS_ALIGNMENT.md). Seed-score CSVs alone cannot regenerate paired user-bootstrap intervals.
