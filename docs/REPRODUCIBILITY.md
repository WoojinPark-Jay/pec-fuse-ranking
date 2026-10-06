# Reproducibility Boundaries

The artifact separates three reproducibility levels.

| Level | Included material | What can be checked |
|---|---|---|
| Executable public | `src/pec_fuse/`, `examples/synthetic/`, `scripts/run_synthetic_demo.py` | feature order, deterministic transforms, model fitting, within-query ranking, and metrics |
| Executable neural reference | `src/pec_fuse/neural.py`, `scripts/run_synthetic_neural.py` | candidate-aware history encoding, side-feature variants, query-wise listwise loss, backpropagation, and scoring on generated inputs |
| Executable public proxy | `scripts/run_mind_proxy.py`, `docs/MIND_PROXY_PROTOCOL.md` | mapping of the interface to available MIND fields and public-data evaluation |
| Aggregate private-platform evidence | `access/data/` | reported scores, selections, paired intervals, seed variation, candidate reselection, and data censuses |

The artifact does not release private source rows, individual predictions, embeddings, profile text, click histories, recommendation traces, or fitted models. Reproducing private-platform scores from raw inputs requires authorized access to equivalent source tables.

The synthetic demonstrations verify ExtraTrees and neural implementation behavior but are not performance reproductions. The neural reference accepts precomputed embeddings and contains no private loader or fitted checkpoint. The MIND experiment changes the meaning of P and E to match available public fields and is therefore a boundary study rather than a replication of private stated-profile/behavioral provenance.

Active manuscript alignment is documented in `ACCESS_ALIGNMENT.md`.

## Original release versus anonymized download

GitHub users can clone the repository or download its ZIP. Anonymous-artifact users should use **Download full repository as ZIP** in the file viewer and extract the archive before installing from its root. A masked clone URL is not executable and is not required for the ZIP route.

`python scripts/check_access_aggregates.py` checks original release-file hashes and the implemented schema/arithmetic relationships. An anonymizing host can rewrite names or URLs, so its ZIP is not necessarily byte-identical to the original manifest. For that route, use `python scripts/check_access_aggregates.py --data-only`.

Data-only mode skips all file-hash verification explicitly, reports that skipped scope, and still runs feature-order, aggregate-schema, and specified arithmetic checks. It does not authenticate files, establish equality to the original release, or recompute private-platform results. The default full check remains strict; a mismatch in an original GitHub download should be investigated rather than automatically bypassed.
