# Candidate-aware neural input audit

This comparison asks whether PEC features also help a neural scorer. Frozen BGE-M3 article embeddings pass through history self-attention and candidate-conditioned pooling. Candidate/user representations, their elementwise products and absolute differences, and optional side features feed a query-wise listwise scorer.

The variants are history-only, controls, and full PEC. This is a PLM-NRMS-style challenger under the manuscript's input/protocol controls, not an exact reproduction of published NRMS or an exhaustive neural benchmark.

Selection uses January-March training and April validation with March-31 popularity. The documented grid has widths 64/96, heads 2/4, dropout 0.05/0.10, learning rate 0.0005/0.001, fixed weight decay 0.0001, at most 14 epochs, and patience 3. Final fits use January-April and April-30 popularity before May-June evaluation.

The [configuration specification](../configs/private_candidate_aware_neural.json), [paired aggregate comparisons](../access/data/neural_user_bootstrap.csv), and [manuscript table](../access/tables/neural.tex) are included. The private row-level training pipeline and fitted weights are not distributed. The public MIND command does not execute this audit.
