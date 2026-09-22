# Reproducibility Boundaries

The artifact separates three reproducibility levels.

| Level | Included material | What can be checked |
|---|---|---|
| Executable public | `src/pec_fuse/`, `examples/synthetic/`, `scripts/run_synthetic_demo.py` | feature order, deterministic transforms, model fitting, within-query ranking, and metrics |
| Executable public proxy | `scripts/run_mind_proxy.py`, `docs/MIND_PROXY_PROTOCOL.md` | mapping of the interface to available MIND fields and public-data evaluation |
| Aggregate private-platform evidence | `access/data/` | reported scores, selections, paired intervals, seed variation, candidate reselection, and data censuses |

The artifact does not release private source rows, individual predictions, embeddings, profile text, click histories, recommendation traces, or fitted models. Reproducing private-platform scores from raw inputs requires authorized access to equivalent source tables.

The synthetic demonstration verifies implementation behavior but is not a performance reproduction. The MIND experiment changes the meaning of P and E to match available public fields and is therefore a boundary study rather than a replication of private stated-profile/behavioral provenance.

Active manuscript alignment is documented in `ACCESS_ALIGNMENT.md`. Prior short-paper records are preserved only under `history/wsdm_v101/`.
