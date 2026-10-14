# IEEE Access Manuscript Alignment

This release aligns the public artifact with IEEE Access manuscript revision v73, **PEC-Fuse: Source-Preserving Evidence Fusion for News Ranking with Partial Recommendation Traces**.

## Private-platform evidence

- Headline Complete PEC versus operational control: `core_test_metrics.csv` and `core_user_bootstrap.csv`.
- Learned and scalar compression audits: `fusion_*`, `direct_complete_user_bootstrap.csv`, and `access/tables/direct_complete.tex`.
- Joint profile/trace removal: `joint_pe_*`.
- Fixed-model same-day candidate reselection: `pool_manifest.json`, `pool_metrics.csv`, and `pool_paired_differences.csv`.
- Candidate-aware neural input audit: `neural_user_bootstrap.csv`.

The 19-field Direct record remains competitive with Complete PEC. Private Full-minus-Direct intervals include zero, so the private audit does not establish an additional benefit from the six explicit product fields. This is not an equivalence claim.

## Public MIND boundary audit

The active public protocol is recorded in `mind_expanded_protocol.json` and implemented by `scripts/run_mind_expanded_membership.py`. Its nested configurations contain 8, 14, 15, and 21 fields. BGE-M3 is the main encoder and BGE-base is the sensitivity encoder; no other encoder result is part of this release.

`mind_expanded_results.csv` supplies absolute scores. `mind_expanded_user_bootstrap.json` supplies 10,000-replicate nominal paired user-clustered intervals. `mind_membership_diagnostics.json` and the two encoder-specific candidate audits document candidate origin and pool construction.

Unlike the private audit, the MIND audit finds a positive Full-minus-Direct explicit-product gain for both encoders. This difference is reported as setting-dependent evidence, not as a contradiction: MIND P and C share history provenance, and MIND E is logged-slate membership rather than the private retained-trace block.

## Interpretation boundary

The artifact supports a source-preserving input and evaluation interface. It does not claim causal exposure correction, universal superiority of every component, equivalence between MIND and private provenance, or numerical reproduction of private results without restricted rows. Headline fits, representation-audit fits, and public-proxy fits are separate and must not be interchanged.
