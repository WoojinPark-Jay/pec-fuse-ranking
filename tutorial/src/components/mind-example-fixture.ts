export type MindExampleVector = readonly [number, number];
export type MindExampleArticle = {
  id: string; title: string; abstract: string; category: string; sub: string;
  vector: MindExampleVector; member: number; label: number;
  counts: readonly [number, number, number, number, number, number];
};

export const mindExampleHistory = [
  { id: "H1", title: "New AI chips", category: "technology", sub: "ai", vector: [1, 0] },
  { id: "H2", title: "Laptop battery test", category: "technology", sub: "devices", vector: [0.6, 0.8] },
  { id: "H3", title: "Weekend football", category: "sports", sub: "football", vector: [0, 1] },
] as const;

export const mindExampleCandidateA = {
  id: "A",
  title: "AI tools for news",
  abstract: "A newsroom tests an AI tool.",
  category: "technology",
  sub: "ai",
  vector: [0.8, 0.6],
  member: 1,
  label: 1,
  // Article, category, and subcategory click/impression pairs.
  counts: [3, 18, 17, 98, 7, 48],
} as const;

export const display4 = (value: number) => value.toFixed(4);
export const dot = (a: MindExampleVector, b: MindExampleVector) => a[0] * b[0] + a[1] * b[1];
export const history = mindExampleHistory;
export const candidates: readonly MindExampleArticle[] = [
  mindExampleCandidateA,
  { id: "B", title: "Football final", abstract: "A late goal decides the final.", category: "sports", sub: "football", vector: [0, 1], member: 1, label: 0, counts: [1, 8, 11, 98, 4, 48] },
  { id: "C", title: "Market update", abstract: "Markets close after a busy session.", category: "business", sub: "markets", vector: [1, 0], member: 0, label: 0, counts: [0, 8, 7, 98, 2, 48] },
];
export const names = [
  "article_ctr", "log_article_impressions", "category_ctr", "subcategory_ctr",
  "log_history_length", "log_title_characters", "log_abstract_characters",
  "P_mean_vector_cosine", "P_category_share", "P_subcategory_share",
  "C_mean", "C_max", "C_top3", "C_attention", "E_slate_member",
  "P_sem_x_E", "C_mean_x_E", "C_max_x_E", "C_attention_x_E",
  "P_sem_x_C_mean", "P_sem_x_C_attention",
] as const;
export const mean: MindExampleVector = [
  history.reduce((sum, item) => sum + item.vector[0], 0) / history.length,
  history.reduce((sum, item) => sum + item.vector[1], 0) / history.length,
];
export const norm = Math.hypot(...mean);

export function computeValues(candidate: MindExampleArticle) {
  const similarities = history.map(item => dot(candidate.vector, item.vector));
  const maximum = Math.max(...similarities);
  const attentionTemperature = 0.18;
  const exponentials = similarities.map(value => Math.exp((value - maximum) / attentionTemperature));
  const denominator = exponentials.reduce((sum, value) => sum + value, 0);
  const weights = exponentials.map(value => value / denominator);
  const attention = similarities.reduce((sum, value, index) => sum + value * weights[index], 0);
  const p = dot(candidate.vector, mean) / norm;
  const cMean = similarities.reduce((sum, value) => sum + value, 0) / history.length;
  const top = [...similarities].sort((a, b) => b - a).slice(0, 3);
  const categoryMatches = history.filter(item => item.category === candidate.category).length;
  const subcategoryMatches = history.filter(item => item.sub === candidate.sub).length;
  const [ac, ai, cc, ci, sc, si] = candidate.counts;

  // Keep every intermediate unrounded; display4 is only for rendered text.
  const fields = {
    article_ctr: (ac + 1) / (ai + 2),
    log_article_impressions: Math.log1p(ai),
    category_ctr: (cc + 1) / (ci + 2),
    subcategory_ctr: (sc + 1) / (si + 2),
    log_history_length: Math.log1p(history.length),
    log_title_characters: Math.log1p(candidate.title.length),
    log_abstract_characters: Math.log1p(candidate.abstract.length),
    P_mean_vector_cosine: p,
    P_category_share: categoryMatches / history.length,
    P_subcategory_share: subcategoryMatches / history.length,
    C_mean: cMean,
    C_max: maximum,
    C_top3: top.reduce((sum, value) => sum + value, 0) / top.length,
    C_attention: attention,
    E_slate_member: candidate.member,
    P_sem_x_E: p * candidate.member,
    C_mean_x_E: cMean * candidate.member,
    C_max_x_E: maximum * candidate.member,
    C_attention_x_E: attention * candidate.member,
    P_sem_x_C_mean: p * cMean,
    P_sem_x_C_attention: p * attention,
  };

  return {
    fields,
    values: names.map(name => fields[name]),
    mean, norm, similarities, weights, attentionTemperature, categoryMatches, subcategoryMatches,
  };
}

export const mindExampleCandidateACalculation = computeValues(mindExampleCandidateA);
export const mindExampleCandidateAValues = mindExampleCandidateACalculation.fields;
