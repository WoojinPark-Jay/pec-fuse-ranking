"""Post-hoc Complete minus Direct audit; fixed five seeds, user-cluster bootstrap.
Reads authorized local per-query records; writes aggregate results only. No training.
"""
from pathlib import Path
import numpy as np
import pandas as pd
import argparse
ap=argparse.ArgumentParser()
ap.add_argument('--source',type=Path,required=True,help='Authorized folder of PRIVATE_queries_*.pkl records')
ap.add_argument('--output',type=Path,required=True)
args=ap.parse_args()
SRC=args.source
OUT=args.output
SEEDS=[7,13,42,101,202]
rows=[]
for regime in ['recent_window','popularity_matched']:
    pairs=[]
    for seed in SEEDS:
        full=pd.read_pickle(SRC/f'PRIVATE_queries_{regime}_full_pec_{seed}.pkl').set_index(['user_id','query_id']).sort_index()
        direct=pd.read_pickle(SRC/f'PRIVATE_queries_{regime}_direct_pec_{seed}.pkl').set_index(['user_id','query_id']).sort_index()
        if not full.index.equals(direct.index): raise ValueError('Unmatched queries')
        pairs.append((full,direct))
    for metric in ['ndcg@10','recall@10','mrr']:
        delta=pd.concat([f[metric]-d[metric] for f,d in pairs],axis=1).mean(axis=1)
        sums=delta.groupby(level='user_id',sort=True).sum().to_numpy()
        counts=delta.groupby(level='user_id',sort=True).size().to_numpy()
        rng=np.random.default_rng(42)
        draws=rng.integers(0,len(sums),size=(2000,len(sums)))
        boot=sums[draws].sum(axis=1)/counts[draws].sum(axis=1)
        lo,hi=np.quantile(boot,[.025,.975])
        rows.append(dict(regime=regime,metric=metric,direct_mean=np.mean([d[metric].mean() for f,d in pairs]),complete_mean=np.mean([f[metric].mean() for f,d in pairs]),delta=delta.mean(),user_ci_low=lo,user_ci_high=hi,users=len(sums),queries=len(delta),fixed_seeds='7;13;42;101;202',bootstrap_replicates=2000,bootstrap_seed=42))
pd.DataFrame(rows).to_csv(OUT,index=False)
print(pd.DataFrame(rows).to_string(index=False))
