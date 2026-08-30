# Paper RQ Reproducibility Map

This map distinguishes executable public evidence from aggregate records that
require restricted operational rows.

| Research question | Paper evidence | Public artifact | Public status |
|---|---|---|---|
| RQ1: broad candidate ranking | Primary held-out control comparison | `results/paper_tables.json`, `scripts/render_paper_tables.py` | Aggregate audit record; metrics and ranking code executable |
| RQ2: separation versus compression | Collapsed and no-E early-fusion comparisons | `results/paper_tables.json`, feature schema and model code | Aggregate audit record; representation contract executable |
| RQ3: where and why separation helps | E=0, no-E, matched-E, joint-latent, and disagreement diagnostics | `results/paper_tables.json`, `results/paper_additional_diagnostics.json`, `docs/feature_dictionary.csv` | Reported aggregates; private slice regeneration unavailable |
| RQ4: public boundary | MIND proxy and PLM-NRMS-style diagnostic | `scripts/run_mind_proxy.py`, `docs/MIND_PROXY_PROTOCOL.md`, `results/mind_neural_diagnostic.json` | ExtraTrees proxy executable; neural result recorded pending standalone refactor |

## Interpretation boundary

- Public MIND does not contain an independent stated-profile channel.
- Synthetic rows demonstrate execution, not the paper's effect sizes.
- Aggregate records let reviewers audit exact reported values but cannot
  regenerate private-platform scores.
- Anonymous hosting removes author identity; it does not de-identify user data.

## RQ3: candidate-aware neural challenger

- Method and claim boundary: `PRIVATE_CANDIDATE_AWARE_NEURAL_AUDIT.md`
- Validation configuration: `../configs/private_candidate_aware_neural.json`
- Aggregate held-out results: `../results/private_candidate_aware_neural_audit.json`
- Scope: identical private candidate pools and temporal split; raw private rows are not released.

## RQ3: candidate-pool sensitivity

- Protocol and interpretation: `NEGATIVE_POOL_RESAMPLING_AUDIT.md`
- Fixed and varied factors: `../configs/negative_pool_resampling.json`
- Aggregate results: `../results/negative_pool_resampling_audit.json`
- Claim boundary: directional robustness, not a pool-invariant effect size.
