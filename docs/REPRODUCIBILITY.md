# Reproducibility map

Current private-platform aggregates are the cutoff-corrected revision described
in `CUTOFF_CORRECTION.md`. An older frozen paper may contain superseded values.

| Component | Public artifact | Status |
|---|---|---|
| Candidate feature contract | `feature_dictionary.csv`, `../src/pec_fuse/features.py` | Executable contract |
| Ranking and evaluation | `../src/pec_fuse/` | Executable components |
| Synthetic example | `../scripts/run_synthetic_demo.py` | Executable, not empirical replication |
| Private tables and diagnostics | `../results/`, `../configs/` | Aggregate records only |
| MIND proxy | `../scripts/run_mind_proxy.py` | Separate public boundary check |
| Private neural audit | `PRIVATE_CANDIDATE_AWARE_NEURAL_AUDIT.md` | Aggregate record, private rows unavailable |
| Five-pool robustness | `NEGATIVE_POOL_RESAMPLING_AUDIT.md` | Corrected rerun incomplete |

Raw profiles, histories, recommendation records, article text, embeddings and
per-query predictions are not released. Code and aggregate results do not make
private-platform scores publicly regenerable. Anonymous hosting hides author
identity; it does not anonymize user data. MIND cannot recover independent
private stated-preference and consumption provenance.
