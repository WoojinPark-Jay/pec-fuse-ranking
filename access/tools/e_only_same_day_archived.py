from pathlib import Path
import hashlib, json
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression

root = Path('.')
src = root / 'reports/experiments/same_day_loo_popularity_2026_09_10/PRIVATE_feature_frame.pkl'
out = root / 'reports/internal_audits/e_source_2026_10_11'
out.mkdir(parents=True, exist_ok=True)
obj = pd.read_pickle(src)
if not isinstance(obj, pd.DataFrame):
    raise TypeError(f'Expected DataFrame, got {type(obj).__name__}')
df = obj.copy()
cols = list(df.columns)

def pick(*names):
    for name in names:
        if name in df.columns:
            return name
    return None

label = pick('label', 'y', 'clicked', 'target')
query = pick('query_id', 'query', 'qid')
user = pick('user_id', 'user', 'uid')
article = pick('news_id', 'article_id', 'item_id', 'candidate_id')
source_col = pick('candidate_source', 'source')
e_member = pick('same_day_recommended', 'trace_member', 'E_member')
e_rank = pick('reciprocal_rank', 'trace_reciprocal_rank', 'E_rank')
split_col = pick('split', 'partition', 'set')
date_col = pick('date', 'query_date', 'target_date')
required = {'label': label, 'query': query, 'source': source_col, 'e_member': e_member, 'e_rank': e_rank}
missing = [k for k,v in required.items() if v is None]
if missing:
    raise KeyError(f'Missing required semantic columns {missing}; columns={cols}')

if split_col:
    split_norm = df[split_col].astype(str).str.lower()
    test = df[split_norm.eq('test')].copy()
    fit = df[~split_norm.eq('test')].copy()
elif date_col:
    dates = pd.to_datetime(df[date_col])
    test = df[dates > pd.Timestamp('2026-04-30')].copy()
    fit = df[dates <= pd.Timestamp('2026-04-30')].copy()
else:
    raise KeyError('No split or date column found')

for frame in (df, test, fit):
    frame[label] = pd.to_numeric(frame[label], errors='coerce').fillna(0).astype(int)
    frame[e_member] = pd.to_numeric(frame[e_member], errors='coerce').fillna(0.0)
    frame[e_rank] = pd.to_numeric(frame[e_rank], errors='coerce').fillna(0.0)

def agg(frame, group, scope):
    a = frame.groupby(group, dropna=False)[label].agg(rows='size', positives='sum', positive_rate='mean').reset_index()
    a.insert(0, 'scope', scope)
    return a

source_rates = pd.concat([agg(df, source_col, 'all'), agg(test, source_col, 'test')], ignore_index=True)
df['_E_member_binary'] = (df[e_member] > 0).astype(int)
test['_E_member_binary'] = (test[e_member] > 0).astype(int)
fit['_E_member_binary'] = (fit[e_member] > 0).astype(int)
e_rates = pd.concat([agg(df, '_E_member_binary', 'all'), agg(test, '_E_member_binary', 'test')], ignore_index=True)

X_fit = fit[[e_member, e_rank]].to_numpy(float)
y_fit = fit[label].to_numpy(int)
X_test = test[[e_member, e_rank]].to_numpy(float)
clf = LogisticRegression(class_weight='balanced', solver='liblinear', random_state=42, max_iter=1000)
clf.fit(X_fit, y_fit)

# Stable, label-independent tie breaker.
def tie_value(q, a):
    raw = f'{q}|{a}'.encode('utf-8')
    return int.from_bytes(hashlib.sha256(raw).digest()[:8], 'big') / 2**64
if article is None:
    test['_article_fallback'] = np.arange(len(test))
    article = '_article_fallback'
test['_tie'] = [tie_value(q, a) for q,a in zip(test[query], test[article])]
test['_score_random'] = test['_tie']
test['_score_E_positive'] = test[e_member] + test[e_rank] + test['_tie'] * 1e-12
test['_score_nontrace_first'] = -test[e_member] + test['_tie'] * 1e-12
test['_score_inverse_E'] = -(test[e_member] + test[e_rank]) + test['_tie'] * 1e-12
test['_score_E_logistic'] = clf.predict_proba(X_test)[:,1] + test['_tie'].to_numpy() * 1e-12

def metrics(frame, score_col):
    rows=[]
    for q, g in frame.groupby(query, sort=False):
        g = g.sort_values(score_col, ascending=False, kind='mergesort')
        rel = g[label].to_numpy(int)
        total = int(rel.sum())
        if total == 0:
            continue
        top = rel[:10]
        discounts = 1.0 / np.log2(np.arange(2, len(top)+2))
        dcg = float((top * discounts).sum())
        ideal_n = min(total, 10)
        idcg = float((np.ones(ideal_n) / np.log2(np.arange(2, ideal_n+2))).sum())
        positive_ranks = np.flatnonzero(rel) + 1
        rows.append((q, dcg/idcg if idcg else 0.0, float(top.sum()/total), float(1.0/positive_ranks[0])))
    m = pd.DataFrame(rows, columns=[query, 'ndcg@10', 'recall@10', 'mrr'])
    return {'queries': int(len(m)), **{c: float(m[c].mean()) for c in ['ndcg@10','recall@10','mrr']}}

models = {
    'random_deterministic': '_score_random',
    'E_positive_direction': '_score_E_positive',
    'nontrace_first': '_score_nontrace_first',
    'inverse_combined_E': '_score_inverse_E',
    'trained_E_membership_rank_logistic': '_score_E_logistic',
}
metric_rows=[]
for name, score in models.items():
    vals = metrics(test, score)
    metric_rows.append({'model': name, **vals})
metric_df = pd.DataFrame(metric_rows)

source_rates.to_csv(out/'candidate_source_positive_rates.csv', index=False)
e_rates.to_csv(out/'e_membership_positive_rates.csv', index=False)
metric_df.to_csv(out/'e_only_same_day_metrics.csv', index=False)
summary = {
    'status': 'internal_diagnostic_only',
    'source_cache': str(src),
    'cache_sha256': hashlib.sha256(src.read_bytes()).hexdigest(),
    'frame_shape': [int(df.shape[0]), int(df.shape[1])],
    'columns_used': {'label': label, 'query': query, 'user': user, 'article': article, 'candidate_source': source_col, 'E_member': e_member, 'E_rank': e_rank, 'split': split_col, 'date': date_col},
    'test_rows': int(len(test)),
    'test_queries': int(test[query].nunique()),
    'test_users': int(test[user].nunique()) if user else None,
    'logistic_coefficients': {'intercept': float(clf.intercept_[0]), e_member: float(clf.coef_[0,0]), e_rank: float(clf.coef_[0,1])},
    'privacy': 'Only aggregate outputs saved; no candidate-level or user-level rows exported.',
    'candidate_source_rates': source_rates.to_dict(orient='records'),
    'e_membership_rates': e_rates.to_dict(orient='records'),
    'metrics': metric_df.to_dict(orient='records'),
}
(out/'summary.json').write_text(json.dumps(summary, indent=2, ensure_ascii=True), encoding='utf-8')
print(json.dumps(summary, indent=2, ensure_ascii=False))
