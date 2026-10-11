# Candidate-aware neural input audit

This comparison asks whether PEC features also help a neural scorer. Frozen BGE-M3 article embeddings pass through history self-attention and candidate-conditioned pooling. Candidate/user representations, their elementwise products and absolute differences, and optional side features feed a query-wise listwise scorer.

The variants are history-only, controls, and full PEC. This is a PLM-NRMS-style challenger under the manuscript's input/protocol controls, not an exact reproduction of published NRMS or an exhaustive neural benchmark.

Selection uses January-March training and April validation with March-31 popularity. The documented grid has widths 64/96, heads 2/4, dropout 0.05/0.10, learning rate 0.0005/0.001, fixed weight decay 0.0001, at most 14 epochs, and patience 3. Final fits use January-April and April-30 popularity before May-June evaluation.

The [configuration specification](../configs/private_candidate_aware_neural.json), [paired aggregate comparisons](../access/data/neural_user_bootstrap.csv), and [manuscript table](../access/tables/neural.tex) are included. Private row-level loaders, operational embeddings, per-query predictions, and fitted weights are not distributed. The public MIND command does not execute this audit.

## Executable public reference

The repository now publishes the model definition and learning procedure independently of private data:

- [`src/pec_fuse/neural.py`](../src/pec_fuse/neural.py) implements the projection layer, multi-head history self-attention, candidate-conditioned additive pooling, candidate/user/product/absolute-difference record, optional side-feature path, query-wise listwise cross-entropy, AdamW update, and gradient clipping.
- [`scripts/run_synthetic_neural.py`](../scripts/run_synthetic_neural.py) generates non-private query groups and trains matched 11-D control and 25-D PEC-side variants from scratch.
- [`configs/synthetic_candidate_aware_neural.json`](../configs/synthetic_candidate_aware_neural.json) records the small CPU demonstration settings.

Run it from the repository root:

```bash
python -m pip install -e '.[neural]'
python scripts/run_synthetic_neural.py
```

The article encoder is deliberately outside the public scorer: callers provide precomputed article embeddings, which reflects the audit's frozen-encoder boundary without requiring raw text or a model download. The synthetic dimensions and generated labels are teaching fixtures, not the private fitting sample, selected paper configuration, reported performance, or a released checkpoint. Consequently, the command makes the architecture and backpropagation path inspectable and executable but does not claim numerical reproduction of the manuscript's private-platform neural results.
