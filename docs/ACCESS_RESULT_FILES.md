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
| `mind_expanded_results.csv` | BGE-M3 main and BGE-base sensitivity scores for Controls+E 8-D, P+C Direct 14-D, P+E+C Direct 15-D, and Full PEC proxy 21-D |
| `mind_expanded_user_bootstrap.json` | 10,000-replicate nominal paired user-clustered intervals for P/C, E, explicit-product, and full-record contrasts |
| `mind_expanded_protocol.json`, `mind_membership_diagnostics.json`, `mind_*_candidate_audit.json` | Fixed protocol, source hashes, schema, membership diagnostics, and candidate audits |
| `feature_dictionary.csv` | ordered estimator fields and definitions |
| `thresholds_*.json` | diagnostic thresholds for the two candidate regimes |

These files contain aggregate or configuration records, not individual user rows. Unrounded values are retained where supplied by the experiment record.
