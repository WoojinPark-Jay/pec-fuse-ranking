# Reproducibility Map

This artifact separates executable public components from aggregate records that
cannot be regenerated without restricted operational data.

| Paper component | Public artifact | Reproducibility status |
|---|---|---|
| 25-D PEC candidate record | `docs/feature_dictionary.csv`, `src/pec_fuse/features.py` | Exact implementation |
| ExtraTrees fusion and within-query ranking | `src/pec_fuse/ranking.py` | Exact implementation |
| NDCG@10, Recall@10, MRR, paired user bootstrap | `src/pec_fuse/evaluation.py` | Exact implementation |
| Synthetic end-to-end run | `scripts/run_synthetic_demo.py` | Fully executable |
| Tables 1--3 | `results/paper_tables.json` | Aggregate audit record only |
| Text-reported private diagnostics | `results/paper_additional_diagnostics.json` | Aggregate audit record only |
| MIND-small boundary check | `scripts/run_mind_proxy.py` | Executable public proxy |
| MIND PLM-NRMS-style diagnostic | `results/mind_neural_diagnostic.json`, `docs/MIND_NEURAL_DIAGNOSTIC.md` | Aggregate audit record; standalone runner pending public refactor |
| RQ1--RQ4 evidence map | `docs/PAPER_RQ_REPRODUCIBILITY_MAP.md` | Exact scope and artifact mapping |
| Private platform results | Not released | Not publicly regenerable |

The artifact makes no claim that synthetic data reproduce reported effect sizes.
It also does not claim that MIND reconstructs independent stated preference or
the original platform's private provenance boundary.

## Anonymous review release

If linked during double-anonymous review, publish a clean snapshot through an
anonymous artifact host. Do not include account names, commit identities, local
paths, private issue links, or acknowledgments that reveal authorship. Replace
the anonymous location with the archival repository only when the review policy
permits de-anonymization.

## Private candidate-aware neural diagnostic

The private-platform audit holds the candidate pools, temporal split, frozen BGE-M3 vectors, and query metrics fixed while replacing the final scorer with a history self-attention model using candidate-conditioned pooling. See `PRIVATE_CANDIDATE_AWARE_NEURAL_AUDIT.md`, `../configs/private_candidate_aware_neural.json`, and `../results/private_candidate_aware_neural_audit.json`. This is an aggregate-only record because the source rows contain private operational evidence.

## Candidate-pool resampling

Seed 42 was fixed before held-out scoring and defines the headline pool. The robustness audit rebuilds train, validation, and test candidate frames under seeds 7, 13, 42, 101, and 202, refits each model on rebuilt train-plus-validation rows, and keeps validation-selected configurations and learner seed fixed. All five pools retain positive PEC-over-control NDCG@10 deltas with user-clustered intervals above zero. See `NEGATIVE_POOL_RESAMPLING_AUDIT.md`, `../configs/negative_pool_resampling.json`, and `../results/negative_pool_resampling_audit.json`.
