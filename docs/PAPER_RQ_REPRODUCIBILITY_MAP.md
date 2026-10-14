# IEEE Access Question-to-Artifact Map

| Manuscript question | Public implementation | Active aggregate evidence in `access/data/` |
|---|---|---|
| Does PEC improve the operational control? | `src/pec_fuse/{features,ranking,evaluation}.py` | `core_test_metrics.csv`, `core_user_bootstrap.csv` |
| Is the result limited to scalar compression baselines? | ordered schema and ranking contract | `fusion_*`, `direct_complete_user_bootstrap.csv` |
| Does Direct outperform learned fusion at equal scorer width? | 14 shared context fields plus five original or learned coordinates | `fusion_seed_metrics.csv` for scores; `access/tables/direct_complete.tex` for added rounded intervals |
| Does consumption evidence remain useful without profile and trace inputs? | consumption transforms in `features.py` | `joint_pe_*` |
| Is the result tied to one same-day tie ordering? | `src/pec_fuse/tie_order.py` | `pool_manifest.json`, `pool_metrics.csv`, `pool_paired_differences.csv` |
| Is the input useful outside ExtraTrees? | model-independent feature contract | `neural_user_bootstrap.csv` |
| Do source-preserving public proxies help under changed MIND evidence semantics? | `scripts/run_mind_expanded_membership.py`, `docs/MIND_PROXY_PROTOCOL.md` | `mind_expanded_results.csv`, `mind_expanded_user_bootstrap.json`, and MIND audit JSON files |

Private-platform experiments are represented by aggregate records rather than public row-level regeneration.
