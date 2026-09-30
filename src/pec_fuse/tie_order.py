"""Core tie-order perturbation, extracted for inspection without private data.

This helper does not reconstruct private candidate features or fitted models.
Supply date keys in the original builder's iteration order. Preserve the
positive/retained-trace sampling and candidate budgets outside this helper.
"""
import numpy as np


def permute_test_dates(news_by_date, seed, cutoff="2026-04-30"):
    """Return shuffled test-date arrays; never mutate input arrays."""
    rng = np.random.default_rng(seed)
    return {
        date: rng.permutation(ids) if date > cutoff else ids
        for date, ids in news_by_date.items()
    }


def select_same_day(permuted_ids, excluded_ids, frozen_popularity, budget):
    """Stable sorting preserves shuffled priority only among tied scores."""
    eligible = [int(i) for i in permuted_ids if int(i) not in excluded_ids]
    eligible.sort(key=lambda i: frozen_popularity.get(i, 0), reverse=True)
    return eligible[:budget]
