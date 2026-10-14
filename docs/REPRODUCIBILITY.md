# Reproducibility Boundaries

The artifact separates three reproducibility levels.

| Level | Included material | What can be checked |
|---|---|---|
| Executable public | `src/pec_fuse/`, `examples/synthetic/`, `scripts/run_synthetic_demo.py` | feature order, deterministic transforms, model fitting, within-query ranking, and metrics |
| Executable neural reference | `src/pec_fuse/neural.py`, `scripts/run_synthetic_neural.py` | candidate-aware history encoding, side-feature variants, query-wise listwise loss, backpropagation, and scoring on generated inputs |
| Executable fusion reference | `src/pec_fuse/fusion.py`, `scripts/run_synthetic_fusion.py` | supervised MLP transformation of five P/C coordinates, latent export, and downstream ranking on generated inputs |
| Executable public proxy | `scripts/run_mind_expanded_membership.py`, `docs/MIND_PROXY_PROTOCOL.md` | fixed 8/14/15/21-field mapping, expanded candidate pools, model selection, refit, and evaluation from MIND rows plus local cached vectors |
| Aggregate private-platform evidence | `access/data/` | reported scores, selections, paired intervals, seed variation, candidate reselection, and data censuses |

The artifact does not release private source rows, individual predictions, embeddings, profile text, click histories, recommendation traces, or fitted models. Reproducing private-platform scores from raw inputs requires authorized access to equivalent source tables.

The synthetic demonstrations verify ExtraTrees and neural implementation behavior but are not performance reproductions. The neural reference accepts precomputed embeddings and contains no private loader or fitted checkpoint. The MIND runner requires separately prepared BGE-M3 and BGE-base vector caches, which are not distributed. MIND changes the meaning of P and E to match available public fields and is therefore a boundary study rather than a replication of private stated-profile/behavioral provenance.

Active manuscript alignment is documented in `ACCESS_ALIGNMENT.md`.
