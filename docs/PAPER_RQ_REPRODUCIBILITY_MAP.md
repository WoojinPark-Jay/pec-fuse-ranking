# IEEE Access Question-to-Artifact Map

| Manuscript question | Public implementation | Active aggregate evidence in `access/data/` |
|---|---|---|
| Does PEC improve the operational control? | `src/pec_fuse/{features,ranking,evaluation}.py` | `core_test_metrics.csv`, `core_user_bootstrap.csv` |
| Is the result limited to scalar compression baselines? | ordered schema and ranking contract | `fusion_*`, `direct_complete_user_bootstrap.csv` |
| Does consumption evidence remain useful without profile and trace inputs? | consumption transforms in `features.py` | `joint_pe_*` |
| Is the result tied to one same-day tie ordering? | `src/pec_fuse/tie_order.py` | `pool_manifest.json`, `pool_metrics.csv`, `pool_paired_differences.csv` |
| Is the input useful outside ExtraTrees? | model-independent feature contract | `neural_user_bootstrap.csv` |
| Does the complete interface transfer unchanged to MIND? | `src/pec_fuse/mind.py`, `scripts/run_mind_proxy.py` | `mind_text_*_proxy_results.csv` |

Private-platform experiments are represented by aggregate records rather than public row-level regeneration. Earlier short-paper records are historical provenance, not active Access evidence.
