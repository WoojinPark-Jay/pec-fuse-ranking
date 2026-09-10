# Private candidate-aware neural audit

This is an input-and-protocol-matched diagnostic, not exact NRMS reproduction
or exhaustive neural tuning. The encoder is frozen BGE-M3. History self-attention
and candidate-conditioned pooling feed a query-wise listwise scorer.

Selection uses January-March training and April validation with March-31
popularity. The original grid is unchanged: widths 64/96, heads 2/4, dropout
0.05/0.10 and learning rate 0.0005/0.001, with fixed weight decay 0.0001.
There are 16 configurations per feature variant and regime, at most 14 epochs,
patience 3. History-only, controls and full-PEC variants are all retained.
The preferred variant is selected by validation, not by its test score.

Final models refit January-April with April-30 popularity and are evaluated
on the previously inspected May-June pools. See `CUTOFF_CORRECTION.md`.
Learner family and optimization objective differ from ExtraTrees.

Exact aggregate scores and user-bootstrap comparisons are in
`../results/private_candidate_aware_neural_audit.json` and `../results/corrected/`.
Selected settings and epochs are in `../configs/corrected_neural_selection.json`.
These are aggregate audit records, not a public private-data training pipeline.
