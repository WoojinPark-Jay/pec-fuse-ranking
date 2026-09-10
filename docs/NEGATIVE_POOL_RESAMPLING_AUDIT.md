# Candidate-pool resampling status

The corrected five-seed audit is **not complete** and no corrected five-pool
robustness claim is made. Seed 42 remains the original headline pool.
The first alternate draw required uncached article vectors; the runner stopped
before model scoring rather than silently substituting zeros. Existing
supplemental caches do not cover all missing articles.

A valid rerun must first establish embedding coverage for every required
candidate and prior-history article with the same frozen encoder, then rebuild
and refit all five pools under a documented coverage policy. Cache filling must
not depend on test outcomes. The original seeds are 7, 13, 42, 101 and 202.

Same-day expansion uses day-t articles, with frozen click counts and source-file
tie order. It is not a demonstrated popularity-hard negative pool. The recent
window includes day t and the preceding three days.

Seven learner-seed runs on a fixed pool answer a different question and cannot
replace this audit. See `CUTOFF_CORRECTION.md` and
`../results/negative_pool_resampling_audit.json`.
