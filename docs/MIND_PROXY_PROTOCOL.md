# MIND-small public-data example

This executable proxy maps the interface to public impression logs. It does not recreate independent stated preferences or the private-platform experiment.

## Data and command

Obtain MIND-small from the [dataset website](https://msnews.github.io/) under its terms. Download the **MIND-small training and validation** archives, not MIND-large or a test-only split. Extract training files into `train/` and validation files into `dev/`. These data are not bundled in the repository ZIP. The runner expects:

```text
data/MINDsmall/
  train/news.tsv
  train/behaviors.tsv
  dev/news.tsv
  dev/behaviors.tsv
```

```bash
python -m pip install -e '.[mind]'
python scripts/run_mind_proxy.py \
  --mind-root data/MINDsmall \
  --encoder sentence-transformers/all-MiniLM-L6-v2 \
  --train-limit 30000 --dev-limit 30000 \
  --history-window 50 --unexposed-per-query 10 \
  --popular-pool-size 5000 --batch-size 64 --seed 42
```

Other manuscript encoders are `BAAI/bge-base-en-v1.5` and `BAAI/bge-m3`. Downloading and encoding can be expensive, especially for BGE-M3. SentenceTransformer chooses the available device; a GPU can reduce embedding time. Behavior limits do not restrict the loaded news collection.

## Inputs and evidence mapping

Article text is `title [SEP] abstract`, encoded into L2-normalized vectors.

| Block | Construction |
| --- | --- |
| P proxy, 3 fields | Cosine alignment with the normalized mean-history vector plus candidate category/subcategory history shares |
| E, 3 fields | Logged-slate membership, reciprocal position, and position percentile |
| C, 4 fields | Mean, maximum, top-three mean, and attention-weighted mean of candidate-to-history similarities |
| Controls, 8 fields | Training-derived article/category statistics, history/slate sizes, and text lengths |
| Products, 6 fields | Explicit products of proxy source scores |

Input widths are 11 for `exposure_only`, 15 for `p_c_without_e`, and 24 for `full_pec_proxy`. These are not the private 11/19/25-field designs. Here P and C both depend on history.

## Candidate construction and selection

Logged candidates retain their labels. Each query adds up to ten popular training articles outside its logged slate and history. These are weak negatives, not verified non-exposures. This is an expanded-pool evaluation, not the standard MIND leaderboard protocol. The legacy option `--unexposed-per-query` specifies additions; its name does not establish non-exposure.

Statistics and the popular article pool are computed from the designated training behavior subset. This includes its validation portion but excludes development labels. The first 85% of training behaviors fit selection models; the remaining 15% select among three ExtraTrees configurations by NDCG@10. Selected models refit on all designated training rows before development evaluation.

## Outputs and interpretation

The command prints JSON and writes `outputs/mind_proxy/sentence-transformers__all-MiniLM-L6-v2.json`. Other encoders use corresponding filenames; `--output-dir` changes the destination.

Each model entry contains its feature list, selected configuration, validation NDCG@10, and query-averaged development NDCG@10, Recall@10, and MRR. **This runner outputs point estimates, not bootstrap intervals or neural-model results.** Private-platform bootstrap records are separate artifacts.

Encoder-specific manuscript summaries are in `access/data/mind_text_*_proxy_results.csv`. Record the command, dataset version, dependency versions, and encoder revision with local output. The script does not persist embeddings or capture all environment metadata automatically. Configuration files are descriptive rather than automatically consumed by this CLI.
