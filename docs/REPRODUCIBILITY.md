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
| MIND-small boundary check | `scripts/run_mind_proxy.py` | Executable public proxy |
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
