"use client";

import { useMemo, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import "./mind-data-microscope.css";
import {
  display4,
  history,
  mindExampleCandidateA as candidate,
  mindExampleCandidateAValues as values,
  mindExampleCandidateACalculation as calculation,
} from "./mind-example-fixture";

type Lang = "ko" | "en";
type Source = "behavior" | "news" | "row";
type Group = "raw" | "control" | "P" | "E" | "C" | "product";
type Field = {
  name: string;
  labelKo: string;
  labelEn: string;
  sample: string;
  dataType: string;
  group: Group;
  meaningKo: string;
  meaningEn: string;
  useKo: string;
  useEn: string;
  boundaryKo: string;
  boundaryEn: string;
  route?: string;
  routeKo?: string;
  routeEn?: string;
  used?: boolean;
};

type Calculation = {
  labelKo: string;
  labelEn: string;
  formula: string;
  substitution: string;
  result?: string;
  resultKo?: string;
  resultEn?: string;
  detailKo: string;
  detailEn: string;
};

const [articleClicks, articleImpressions, categoryClicks, categoryImpressions, subcategoryClicks, subcategoryImpressions] = candidate.counts;
const similarities = calculation.similarities.map(display4);
const productSubstitution = (left: number, right: number) => String.raw`${display4(left)}\times${display4(right)}`;
const encoderFormula = String.raw`\mathbf v_i=f_{\mathrm{BGE}}(\operatorname{truncate}_{512\,\mathrm{chars}}(title_i\Vert abstract_i\Vert c_i\Vert s_i)),\quad\mathrm{max\_seq\_length}=192`;

const calculationDetails: Record<string, Calculation> = {
  impression_id: { labelKo: "그룹 생성 규칙", labelEn: "GROUPING RULE", formula: String.raw`q=\text{one impression}`, substitution: String.raw`\texttt{I-20485}\longrightarrow q_{20485}`, resultKo: "후보 A·B·…를 같은 query로 묶음", resultEn: "Group candidates A, B, … into one query", detailKo: "산술 계산은 하지 않습니다. 같은 impression_id의 후보끼리만 점수를 비교하고 순위를 매깁니다.", detailEn: "No arithmetic is applied. Candidates sharing an impression ID are scored and ranked within that query." },
  user_id: { labelKo: "군집 생성 규칙", labelEn: "CLUSTERING RULE", formula: String.raw`\mathcal Q_u=\{q:q\text{ belongs to user }u\}`, substitution: String.raw`u=\texttt{U-017}\Rightarrow\mathcal Q_u=\{q_1,q_2,\ldots\}`, resultKo: "bootstrap에서 이 query 묶음을 함께 재표집", resultEn: "Resample this query cluster together in the bootstrap", detailKo: "한 사용자의 여러 impression을 독립 표본처럼 흩어 놓지 않고 하나의 군집으로 다룹니다. scorer 입력에는 들어가지 않습니다.", detailEn: "All impressions from one user form one uncertainty cluster rather than independent samples. This ID is not a scorer feature." },
  time: { labelKo: "시간 분할 규칙", labelEn: "TEMPORAL SPLIT", formula: String.raw`60{,}000=51{,}000_{\mathrm{fit}}+9{,}000_{\mathrm{validation}}`, substitution: String.raw`\operatorname{sort}_{\mathrm{time}}(\text{first 60,000 train rows})`, resultKo: "앞 85% fitting · 뒤 15% validation", resultEn: "Earlier 85% for fitting · later 15% for validation", detailKo: "시각으로 정렬한 뒤 앞부분으로 모델을 맞추고 뒷부분으로 설정을 고릅니다. 후보의 recency 점수나 history별 시간 감쇠값으로 쓰지는 않습니다.", detailEn: "Rows are sorted by time, with the earlier 85% used for fitting and later 15% for validation. The timestamp is not a candidate recency or history-decay feature." },
  history: { labelKo: "이력 절단 규칙", labelEn: "HISTORY WINDOW", formula: String.raw`H_q=\operatorname{last}_{30}(\text{listed prior clicks})`, substitution: String.raw`[H_1,H_2,H_3]\longrightarrow H_q=[H_1,H_2,H_3]`, resultKo: "P 3개 · C 4개 · log history length 생성", resultEn: "Produce 3 P fields · 4 C fields · log history length", detailKo: "30개보다 길면 가장 뒤의 30개만 의미 피처 계산에 씁니다. 빈 history이면 P와 C 일곱 값을 모두 0으로 둡니다.", detailEn: "Only the last 30 listed items build semantic fields. Empty history produces zero for all three P and four C fields." },
  impressions: { labelKo: "파싱과 분리", labelEn: "PARSE AND SEPARATE", formula: String.raw`\texttt{newsID-label}\longrightarrow(i,y_i),\qquad E_i=1`, substitution: String.raw`\texttt{A-1\ B-0}\longrightarrow[(A,1),(B,0)]`, resultKo: "후보=[A,B] · y=[1,0] · E=[1,1]", resultEn: "candidates=[A,B] · y=[1,0] · E=[1,1]", detailKo: "뒤의 1/0은 정답 y이고, 원래 slate에 있었다는 사실은 별도 입력 E입니다. 따라서 A와 B는 E가 같지만 y가 다릅니다.", detailEn: "The suffix is target y, while original-slate membership is input E. A and B therefore share E but have different labels." },
  news_id: { labelKo: "테이블 결합", labelEn: "TABLE JOIN", formula: String.raw`\text{behavior.newsID}\;\Join\;\text{news.newsID}`, substitution: String.raw`A\longrightarrow(\text{category, subcategory, title, abstract})`, resultKo: "기사 A의 텍스트·분류·벡터를 연결", resultEn: "Attach article A's text, taxonomy, and vector", detailKo: "ID 문자열 자체를 모델에 넣지 않고 다른 기사 정보를 찾아오는 키로만 사용합니다.", detailEn: "The string ID is only a join key; it is not entered into the model." },
  category: { labelKo: "세 갈래 변환", labelEn: "THREE DOWNSTREAM USES", formula: String.raw`c_i\longrightarrow\{P_{\mathrm{cat}},\;\mathrm{CTR}_{c_i},\;f_{\mathrm{enc}}(c_i)\}`, substitution: String.raw`c_i=\text{${candidate.category}}`, resultKo: "동일 category 비율 · category CTR · 기사 벡터", resultEn: "category-match share · category CTR · article vector", detailKo: "원문 category를 숫자로 직접 넣지 않고 history 일치 비율, 학습 측 CTR, 인코더 입력으로 각각 변환합니다.", detailEn: "The raw category is transformed into a history share, training-side CTR, and encoder text rather than entered directly." },
  subcategory: { labelKo: "세 갈래 변환", labelEn: "THREE DOWNSTREAM USES", formula: String.raw`s_i\longrightarrow\{P_{\mathrm{subcat}},\;\mathrm{CTR}_{s_i},\;f_{\mathrm{enc}}(s_i)\}`, substitution: String.raw`s_i=\text{${candidate.sub}}`, resultKo: "동일 subcategory 비율 · subcategory CTR · 기사 벡터", resultEn: "subcategory-match share · subcategory CTR · article vector", detailKo: "상위 category와 별개로 더 세밀한 일치 비율과 CTR을 만듭니다.", detailEn: "The finer label independently produces a history share and CTR." },
  title: { labelKo: "벡터와 길이 생성", labelEn: "VECTOR AND LENGTH", formula: String.raw`${encoderFormula},\quad z=\ln(1+|title_i|)`, substitution: String.raw`|\text{${candidate.title}}|=${candidate.title.length}`, resultKo: `캐시 BGE 벡터 · ln(${candidate.title.length + 1})=${display4(values.log_title_characters)}`, resultEn: `cached BGE vector · ln(${candidate.title.length + 1})=${display4(values.log_title_characters)}`, detailKo: "표시한 텍스트 전체의 문자 수를 사용합니다. 인코더 입력은 제목 → 초록 → category → subcategory 순서이며 결합 텍스트를 512자로 자르고 max sequence length 192를 적용했습니다. runner는 캐시 벡터를 읽으며 ExtraTrees에는 P/C와 문자 수 로그만 전달합니다.", detailEn: "Character counts use the complete displayed text. Encoder input order was title → abstract → category → subcategory, with concatenated text truncated to 512 characters and max sequence length 192. The runner loads cached vectors; ExtraTrees receives P/C and log character lengths." },
  abstract: { labelKo: "벡터와 길이 생성", labelEn: "VECTOR AND LENGTH", formula: String.raw`${encoderFormula},\quad z=\ln(1+|abstract_i|)`, substitution: String.raw`|\text{${candidate.abstract}}|=${candidate.abstract.length}`, resultKo: `캐시 BGE 벡터 · ln(${candidate.abstract.length + 1})=${display4(values.log_abstract_characters)}`, resultEn: `cached BGE vector · ln(${candidate.abstract.length + 1})=${display4(values.log_abstract_characters)}`, detailKo: "표시한 텍스트 전체의 문자 수를 사용합니다. 인코더 입력은 제목 → 초록 → category → subcategory 순서이며 결합 텍스트를 512자로 자르고 max sequence length 192를 적용했습니다. runner는 캐시 벡터를 읽으며 ExtraTrees에는 P/C와 문자 수 로그만 전달합니다.", detailEn: "Character counts use the complete displayed text. Encoder input order was title → abstract → category → subcategory, with concatenated text truncated to 512 characters and max sequence length 192. The runner loads cached vectors; ExtraTrees receives P/C and log character lengths." },
  url: { labelKo: "이 proxy의 처리", labelEn: "PROXY HANDLING", formula: String.raw`\texttt{url}\longrightarrow\varnothing`, substitution: String.raw`\texttt{https://www.msn.com/\ldots}`, resultKo: "최종 입력 21개에 포함되지 않음", resultEn: "Not included in the final 21-field input", detailKo: "URL이나 도메인에서 어떤 숫자도 만들지 않습니다.", detailEn: "No numeric feature is derived from the URL or domain." },
  title_entities: { labelKo: "이 proxy의 처리", labelEn: "PROXY HANDLING", formula: String.raw`\texttt{title\_entities}\longrightarrow\varnothing`, substitution: String.raw`\texttt{JSON\ annotations}`, resultKo: "최종 입력 21개에 포함되지 않음", resultEn: "Not included in the final 21-field input", detailKo: "entity embedding이나 지식그래프 피처를 추가하지 않습니다.", detailEn: "No entity embedding or knowledge-graph feature is added." },
  abstract_entities: { labelKo: "이 proxy의 처리", labelEn: "PROXY HANDLING", formula: String.raw`\texttt{abstract\_entities}\longrightarrow\varnothing`, substitution: String.raw`\texttt{JSON\ annotations}`, resultKo: "최종 입력 21개에 포함되지 않음", resultEn: "Not included in the final 21-field input", detailKo: "원파일에는 있지만 scorer는 읽지 않습니다.", detailEn: "The field exists in the source file but is not read by the scorer." },

  article_ctr: { labelKo: "Laplace-smoothed CTR", labelEn: "LAPLACE-SMOOTHED CTR", formula: String.raw`\mathrm{CTR}_i=\frac{clicks_i+1}{impressions_i+2}`, substitution: String.raw`\frac{${articleClicks}+1}{${articleImpressions}+2}=\frac{${articleClicks + 1}}{${articleImpressions + 2}}`, result: display4(values.article_ctr), detailKo: "validation 선택 때는 fitting 51,000개, 최종 평가 때는 train 60,000개 logged slate만 집계합니다. Development 라벨은 들어가지 않습니다.", detailEn: "Statistics use 51,000 fitting impressions for selection and all 60,000 training impressions after refit. Development labels never enter." },
  log_article_impressions: { labelKo: "Count 로그 압축", labelEn: "LOG COUNT", formula: String.raw`z_i=\ln(1+impressions_i)`, substitution: String.raw`\ln(1+${articleImpressions})=\ln(${articleImpressions + 1})`, result: display4(values.log_article_impressions), detailKo: "로그는 큰 count 차이를 완화하지만 기사 인기 순서는 보존합니다.", detailEn: "The log compresses large count gaps while preserving count order." },
  category_ctr: { labelKo: "Category-smoothed CTR", labelEn: "CATEGORY-SMOOTHED CTR", formula: String.raw`\mathrm{CTR}_{c_i}=\frac{clicks_{c_i}+1}{impressions_{c_i}+2}`, substitution: String.raw`\frac{${categoryClicks}+1}{${categoryImpressions}+2}=\frac{${categoryClicks + 1}}{${categoryImpressions + 2}}`, result: display4(values.category_ctr), detailKo: "후보 기사와 같은 category의 모든 학습 측 logged 노출을 합쳐 계산합니다.", detailEn: "Counts aggregate training-side logged impressions sharing the candidate category." },
  subcategory_ctr: { labelKo: "Subcategory-smoothed CTR", labelEn: "SUBCATEGORY-SMOOTHED CTR", formula: String.raw`\mathrm{CTR}_{s_i}=\frac{clicks_{s_i}+1}{impressions_{s_i}+2}`, substitution: String.raw`\frac{${subcategoryClicks}+1}{${subcategoryImpressions}+2}=\frac{${subcategoryClicks + 1}}{${subcategoryImpressions + 2}}`, result: display4(values.subcategory_ctr), detailKo: "후보와 같은 세부 분류의 학습 측 click/impression을 집계합니다.", detailEn: "Counts aggregate training-side clicks and impressions sharing the candidate subcategory." },
  log_history_length: { labelKo: "History 길이 로그", labelEn: "LOG HISTORY LENGTH", formula: String.raw`z_H=\ln(1+|H_q|)`, substitution: String.raw`\ln(1+${history.length})=\ln(${history.length + 1})`, result: display4(values.log_history_length), detailKo: "여기서 |H|는 의미 피처에 실제로 사용한 최대 30개 history의 길이입니다.", detailEn: "Here |H| is the length of the at-most-30 history actually used for semantic fields." },
  log_title_characters: { labelKo: "제목 길이 로그", labelEn: "LOG TITLE LENGTH", formula: String.raw`z_{title}=\ln(1+|title_i|)`, substitution: String.raw`\ln(1+${candidate.title.length})=\ln(${candidate.title.length + 1})`, result: display4(values.log_title_characters), detailKo: "token 수가 아니라 문자열 문자 수를 셉니다.", detailEn: "The runner counts characters, not tokens." },
  log_abstract_characters: { labelKo: "초록 길이 로그", labelEn: "LOG ABSTRACT LENGTH", formula: String.raw`z_{abstract}=\ln(1+|abstract_i|)`, substitution: String.raw`\ln(1+${candidate.abstract.length})=\ln(${candidate.abstract.length + 1})`, result: display4(values.log_abstract_characters), detailKo: "빈 초록은 ln(1)=0이 됩니다.", detailEn: "An empty abstract gives ln(1)=0." },
  P_mean_vector_cosine: { labelKo: "평균 이력 방향과 후보의 cosine", labelEn: "MEAN-HISTORY DIRECTION COSINE", formula: String.raw`\bar{\mathbf h}=\frac1{|H|}\sum_j\mathbf v_j,\quad P_1=\mathbf v_i^\top\frac{\bar{\mathbf h}}{\lVert\bar{\mathbf h}\rVert_2}`, substitution: String.raw`\begin{gathered}H=[${history.map(item => `(${item.vector.map(display4).join(",")})`).join(",")}],\quad\mathbf v_i=(${candidate.vector.map(display4).join(",")})\\\bar{\mathbf h}\approx(${calculation.mean.map(display4).join(",")}),\quad P_1\approx\frac{${candidate.vector.map((value, index) => `${display4(value)}\\times${display4(calculation.mean[index])}`).join("+")}}{${display4(calculation.norm)}}\end{gathered}`, result: display4(values.P_mean_vector_cosine), detailKo: "평균 벡터는 query마다 한 번 만들지만 후보 벡터와의 cosine은 후보마다 다시 계산합니다. 독립 stated profile은 아닙니다.", detailEn: "The mean vector is built once per query, but its cosine is recomputed for every candidate. This is not an independent stated profile." },
  P_category_share: { labelKo: "Category 일치 비율", labelEn: "CATEGORY MATCH SHARE", formula: String.raw`P_2=\frac{\sum_{j\in H}\mathbf1[c_j=c_i]}{|H|}`, substitution: String.raw`\frac{${history.map(item => `\\mathbf1[\\text{${item.category}}=\\text{${candidate.category}}]`).join("+")}}{${history.length}}=\frac{${calculation.categoryMatches}}{${history.length}}`, result: display4(values.P_category_share), detailKo: "후보의 category와 같은 history 기사의 비율입니다.", detailEn: "Fraction of history items sharing the candidate category." },
  P_subcategory_share: { labelKo: "Subcategory 일치 비율", labelEn: "SUBCATEGORY MATCH SHARE", formula: String.raw`P_3=\frac{\sum_{j\in H}\mathbf1[s_j=s_i]}{|H|}`, substitution: String.raw`\frac{${history.map(item => `\\mathbf1[\\text{${item.sub}}=\\text{${candidate.sub}}]`).join("+")}}{${history.length}}=\frac{${calculation.subcategoryMatches}}{${history.length}}`, result: display4(values.P_subcategory_share), detailKo: "상위 category가 같아도 subcategory가 다르면 일치로 세지 않습니다.", detailEn: "A shared top-level category does not count when subcategories differ." },
  C_mean: { labelKo: "개별 cosine의 산술평균", labelEn: "ARITHMETIC MEAN OF COSINES", formula: String.raw`C_{mean}=\frac1{|H|}\sum_{j\in H}s_{ij},\quad s_{ij}=\mathbf v_i^\top\mathbf v_j`, substitution: String.raw`\frac{${similarities.join("+")}}{${history.length}}`, result: display4(values.C_mean), detailKo: "먼저 후보와 history 기사 각각의 cosine을 구한 뒤 그 숫자들을 평균합니다.", detailEn: "Compute one cosine per history item, then average those scalars." },
  C_max: { labelKo: "가장 강한 한 개의 일치", labelEn: "STRONGEST SINGLE MATCH", formula: String.raw`C_{max}=\max_{j\in H}s_{ij}`, substitution: String.raw`\max(${similarities.join(",")})`, result: display4(values.C_max), detailKo: "history 전체 평균이 낮아도 후보와 매우 가까운 과거 기사 하나가 있는지 포착합니다.", detailEn: "Captures one very close prior article even when the overall history mean is lower." },
  C_top3: { labelKo: "상위 최대 3개 평균", labelEn: "TOP-THREE MEAN", formula: String.raw`C_{top3}=\frac1{k}\sum_{s\in\operatorname{Top}_k(\mathbf s_i)}s,\quad k=\min(3,|H|)`, substitution: String.raw`k=${Math.min(3, history.length)},\quad\frac{${[...calculation.similarities].sort((a, b) => b - a).slice(0, 3).map(display4).join("+")}}{${Math.min(3, history.length)}}`, result: display4(values.C_top3), detailKo: "history가 1개나 2개뿐이면 존재하는 값만 평균합니다.", detailEn: "If history has one or two items, all available similarities are averaged." },
  C_attention: { labelKo: "Similarity-softmax 가중평균", labelEn: "SIMILARITY-SOFTMAX WEIGHTED MEAN", formula: String.raw`a_{ij}=\frac{e^{s_{ij}/0.18}}{\sum_k e^{s_{ik}/0.18}},\quad C_{attn}=\sum_j a_{ij}s_{ij}`, substitution: String.raw`\begin{gathered}\mathbf s_i=[${similarities.join(",")}],\quad\mathbf a_i\approx[${calculation.weights.map(display4).join(",")}]\\C_{attn}\approx${calculation.weights.map((weight, index) => `${display4(weight)}\\times${similarities[index]}`).join("+")}\end{gathered}`, result: display4(values.C_attention), detailKo: "MIND에는 history 항목별 정확한 클릭 시각이 없어 private 식의 시간 감쇠 ρ는 사용하지 않습니다. 후보가 바뀌면 similarity와 가중치도 바뀝니다.", detailEn: "MIND lacks exact per-history click times, so it omits the private formula's age decay. Similarities and weights change with the candidate." },
  E_slate_member: { labelKo: "후보 출처 표시", labelEn: "CANDIDATE ORIGIN", formula: String.raw`E_i=\mathbf1[i\in\text{original logged slate}]`, substitution: String.raw`i=${candidate.id}\in\{A,B\}`, result: display4(values.E_slate_member), detailKo: "원래 slate의 A-1과 B-0은 모두 E=1입니다. 뒤의 클릭 라벨은 y이며 E와 별개입니다.", detailEn: "Both A-1 and B-0 from the logged slate receive E=1. Their click suffix is target y, not E." },
  P_sem_x_E: { labelKo: "고정 product", labelEn: "FIXED PRODUCT", formula: String.raw`\psi_1=P_1E`, substitution: productSubstitution(values.P_mean_vector_cosine, values.E_slate_member), result: display4(values.P_sem_x_E), detailKo: "새 관측값이나 학습된 hidden feature가 아니라 두 기존 입력의 곱입니다.", detailEn: "A deterministic product of two existing fields, not new evidence or a learned hidden feature." },
  C_mean_x_E: { labelKo: "고정 product", labelEn: "FIXED PRODUCT", formula: String.raw`\psi_2=C_{mean}E`, substitution: productSubstitution(values.C_mean, values.E_slate_member), result: display4(values.C_mean_x_E), detailKo: "추가 후보 E=0에서는 이 값도 0입니다.", detailEn: "This field becomes zero for added candidates with E=0." },
  C_max_x_E: { labelKo: "고정 product", labelEn: "FIXED PRODUCT", formula: String.raw`\psi_3=C_{max}E`, substitution: productSubstitution(values.C_max, values.E_slate_member), result: display4(values.C_max_x_E), detailKo: "E가 1일 때만 C max가 이 interaction 좌표에 남습니다.", detailEn: "C max survives in this interaction only when E=1." },
  C_attention_x_E: { labelKo: "고정 product", labelEn: "FIXED PRODUCT", formula: String.raw`\psi_4=C_{attn}E`, substitution: productSubstitution(values.C_attention, values.E_slate_member), result: display4(values.C_attention_x_E), detailKo: "E=0이면 C attention 자체는 남지만 이 곱만 0이 됩니다.", detailEn: "With E=0, C attention remains but this product becomes zero." },
  P_sem_x_C_mean: { labelKo: "고정 product", labelEn: "FIXED PRODUCT", formula: String.raw`\psi_5=P_1C_{mean}`, substitution: productSubstitution(values.P_mean_vector_cosine, values.C_mean), result: display4(values.P_sem_x_C_mean), detailKo: "E를 포함하지 않으므로 추가 후보에서도 0으로 사라지지 않습니다.", detailEn: "Because E is absent, this product remains available for added candidates." },
  P_sem_x_C_attention: { labelKo: "고정 product", labelEn: "FIXED PRODUCT", formula: String.raw`\psi_6=P_1C_{attn}`, substitution: productSubstitution(values.P_mean_vector_cosine, values.C_attention), result: display4(values.P_sem_x_C_attention), detailKo: "P와 C가 같은 history에서 파생됐다는 MIND의 경계는 이 곱에도 그대로 적용됩니다.", detailEn: "The MIND boundary that P and C share history provenance also applies to this product." },
};

function MathBlock({ tex }: { tex: string }) {
  return <div className="mdi-formula" dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { displayMode: true, throwOnError: false, strict: false }) }} />;
}

const behaviorFields: Field[] = [
  { name: "impression_id", labelKo: "Impression ID", labelEn: "Impression ID", sample: "I-20485", dataType: "string", group: "raw", meaningKo: "한 번의 추천 화면을 식별합니다. 이 impression 하나가 ranking query 하나입니다.", meaningEn: "Identifies one recommendation impression, which becomes one ranking query.", useKo: "query key를 만들고 같은 impression의 후보들을 한 묶음으로 점수화·정렬합니다.", useEn: "Forms the query key and groups candidates for within-impression scoring and sorting.", boundaryKo: "모델에 넣는 숫자 피처가 아니며 사용자 ID와도 다릅니다.", boundaryEn: "It is neither a numeric scorer feature nor a user identifier.", route: "raw query id → query grouping" },
  { name: "user_id", labelKo: "User ID", labelEn: "User ID", sample: "U-017", dataType: "string", group: "raw", meaningKo: "여러 impression이 같은 사용자에게서 나왔는지 연결합니다.", meaningEn: "Links multiple impressions that belong to the same reader.", useKo: "사용자 단위 bootstrap에서 같은 사용자의 query들을 함께 재표집하는 군집 키로 사용합니다.", useEn: "Acts as the cluster key so all impressions from a sampled user move together in the bootstrap.", boundaryKo: "ExtraTrees 입력 피처가 아니며 사용자 자체를 embedding한 값도 아닙니다.", boundaryEn: "It is not an ExtraTrees feature or a learned user embedding.", route: "raw user id → uncertainty clustering" },
  { name: "time", labelKo: "Impression 시각", labelEn: "Impression time", sample: "11/15/2019 9:24:00 AM", dataType: "datetime", group: "raw", meaningKo: "추천 화면이 기록된 시각입니다.", meaningEn: "Timestamp of the logged impression.", useKo: "학습 60,000개 impression을 시간순으로 정렬해 앞 51,000개 fitting과 뒤 9,000개 validation으로 나눕니다.", useEn: "Chronologically orders 60,000 training impressions before the 51,000/9,000 fit-validation split.", boundaryKo: "후보별 recency 피처로 직접 들어가지는 않으며 history 항목별 정확한 나이 감쇠에도 쓰지 않습니다.", boundaryEn: "It is not a candidate recency feature and does not supply per-history-item age decay.", route: "timestamp → temporal split" },
  { name: "history", labelKo: "이전 클릭 History", labelEn: "Prior-click history", sample: history.map(item => item.id).join(" "), dataType: "space-separated news IDs", group: "raw", meaningKo: "현재 impression 전에 이 사용자가 클릭한 기사 ID 목록입니다.", meaningEn: "News IDs clicked by the user before the current impression.", useKo: "마지막 최대 30개를 사용해 P 3개와 C 4개를 만들고, 전체 listed history는 추가 후보 추출에서 제외합니다.", useEn: "The last 30 build three P and four C fields; the full listed history is excluded from candidate additions.", boundaryKo: "독립적인 stated profile이 아닙니다. MIND에서는 P와 C가 모두 이 한 컬럼에서 파생됩니다.", boundaryEn: "This is not an independently stated profile. Both MIND P and C derive from this one column.", route: "history IDs → P · C · log history length" },
  { name: "impressions", labelKo: "후보와 클릭 라벨", labelEn: "Candidates and click labels", sample: "A-1 B-0", dataType: "newsID-label pairs", group: "raw", meaningKo: "원래 slate의 기사 ID와 클릭 여부를 1/0으로 함께 기록합니다.", meaningEn: "Stores each original-slate news ID with its binary click label.", useKo: "기사 ID는 original candidate가 되고 slate 소속으로 E=1을 받습니다. 뒤의 1/0은 학습·평가 정답 y로 분리합니다.", useEn: "News IDs become original candidates with E=1; the trailing 1/0 is separated as training/evaluation target y.", boundaryKo: "E와 y는 같은 값이 아닙니다. A-1과 B-0은 둘 다 E=1이지만 y는 다릅니다.", boundaryEn: "E and y are different: A-1 and B-0 both have E=1 but different targets.", route: "slate IDs → E / suffix labels → y" },
];

const newsFields: Field[] = [
  { name: "news_id", labelKo: "News ID", labelEn: "News ID", sample: candidate.id, dataType: "string", group: "raw", meaningKo: "기사 한 건을 식별하고 behavior의 history·impressions와 연결하는 join key입니다.", meaningEn: "Article identifier and join key for history and impressions.", useKo: "후보·history ID를 기사 텍스트, 분류, 캐시 벡터와 연결합니다.", useEn: "Joins candidate and history IDs to text, taxonomy, and cached vectors.", boundaryKo: "ID 자체는 ExtraTrees 숫자 피처가 아닙니다.", boundaryEn: "The identifier itself is not a numeric scorer feature.", route: "news id → joins all article data" },
  { name: "category", labelKo: "Category", labelEn: "Category", sample: candidate.category, dataType: "string", group: "raw", meaningKo: "MIND가 제공하는 상위 기사 분류입니다.", meaningEn: "Top-level MIND news category.", useKo: "후보와 같은 category를 가진 history 비율 P₂, category CTR, 그리고 캐시 embedding 입력에 사용합니다.", useEn: "Used for P₂ category share, category CTR, and the archived embedding input.", boundaryKo: "카테고리 이름을 그대로 숫자로 넣는 것이 아니라 비율·CTR·텍스트 표현으로 변환합니다.", boundaryEn: "The raw label is transformed into shares, CTR, or text representation rather than entered directly.", route: "category → P₂ · category CTR · embedding text" },
  { name: "subcategory", labelKo: "Subcategory", labelEn: "Subcategory", sample: candidate.sub, dataType: "string", group: "raw", meaningKo: "상위 category보다 세밀한 기사 분류입니다.", meaningEn: "Finer taxonomy nested under category.", useKo: "후보와 같은 subcategory의 history 비율 P₃, subcategory CTR, 캐시 embedding 입력에 사용합니다.", useEn: "Used for P₃ subcategory share, subcategory CTR, and the archived embedding input.", boundaryKo: "Category와 별도 피처이며 둘을 하나의 숫자로 합치지 않습니다.", boundaryEn: "It remains separate from category rather than being collapsed into one field.", route: "subcategory → P₃ · subcategory CTR · embedding text" },
  { name: "title", labelKo: "기사 제목", labelEn: "Title", sample: candidate.title, dataType: `text · ${candidate.title.length} characters`, group: "raw", meaningKo: "기사 제목 원문입니다.", meaningEn: "Raw article headline.", useKo: "캐시 BGE 벡터 생성 입력과 log title character count에 사용합니다.", useEn: "Feeds the archived BGE vector and log title-character count.", boundaryKo: "ExtraTrees가 제목 문자열을 직접 읽는 것이 아니라 벡터와 길이 피처를 받습니다.", boundaryEn: "ExtraTrees receives a cached vector-derived summary and length, not the raw string.", route: "title → cached vector · log title characters" },
  { name: "abstract", labelKo: "기사 초록", labelEn: "Abstract", sample: candidate.abstract, dataType: `text · ${candidate.abstract.length} characters`, group: "raw", meaningKo: "기사 내용을 요약한 짧은 본문입니다.", meaningEn: "Short text summary of the article.", useKo: "캐시 BGE 벡터 생성 입력과 log abstract character count에 사용합니다.", useEn: "Feeds the archived BGE vector and log abstract-character count.", boundaryKo: "전체 기사 본문이 아니며 runner가 이 자리에서 embedding을 새로 만들지도 않습니다.", boundaryEn: "It is not the full article body, and the runner does not regenerate embeddings here.", route: "abstract → cached vector · log abstract characters" },
  { name: "url", labelKo: "기사 URL", labelEn: "URL", sample: "https://www.msn.com/...", dataType: "string", group: "raw", meaningKo: "원본 기사 주소입니다.", meaningEn: "Original article URL.", useKo: "공식 MIND 파일에는 존재하지만 이 공개 proxy runner의 입력에는 사용하지 않습니다.", useEn: "Present in official MIND files but unused by this public proxy runner.", boundaryKo: "URL 도메인이나 문자열에서 별도 피처를 만들지 않습니다.", boundaryEn: "No feature is derived from the URL or its domain.", route: "present in file → unused", used: false },
  { name: "title_entities", labelKo: "제목 Entity JSON", labelEn: "Title entities", sample: "[]", dataType: "JSON", group: "raw", meaningKo: "제목에서 추출된 entity annotation입니다.", meaningEn: "Entity annotations extracted from the title.", useKo: "공식 파일에는 있지만 이 proxy의 21개 입력에는 사용하지 않습니다.", useEn: "Available in MIND but unused in the 21-field proxy.", boundaryKo: "Entity embedding이나 지식그래프 피처를 이 실험에 추가하지 않았습니다.", boundaryEn: "The audit adds no entity embedding or knowledge-graph feature.", route: "present in file → unused", used: false },
  { name: "abstract_entities", labelKo: "초록 Entity JSON", labelEn: "Abstract entities", sample: "[]", dataType: "JSON", group: "raw", meaningKo: "초록에서 추출된 entity annotation입니다.", meaningEn: "Entity annotations extracted from the abstract.", useKo: "공식 파일에는 있지만 이 proxy의 21개 입력에는 사용하지 않습니다.", useEn: "Available in MIND but unused in the 21-field proxy.", boundaryKo: "원자료에 있다는 이유만으로 모델 입력에 들어간 것은 아닙니다.", boundaryEn: "Presence in the source file does not imply inclusion in the scorer.", route: "present in file → unused", used: false },
];

const rowFields: Field[] = [
  ["article_ctr", "Article CTR", "control", "학습 측 기사 클릭·노출 집계의 Laplace-smoothed CTR", "Laplace-smoothed CTR from training-side article clicks and impressions", "기사 클릭·노출 집계 → 평활 CTR", "article click/impression counts → smoothed CTR"],
  ["log_article_impressions", "Log article impressions", "control", "기사의 학습 측 노출 횟수를 log(1+x)로 압축한 값", "Log-compressed training-side impression count for the article", "기사 노출 횟수 → log(1+x)", "article impression count → log(1+x)"],
  ["category_ctr", "Category CTR", "control", "후보와 같은 category의 학습 측 smoothed CTR", "Training-side smoothed CTR for the candidate's category", "category 클릭·노출 집계 → 평활 CTR", "category click/impression counts → smoothed CTR"],
  ["subcategory_ctr", "Subcategory CTR", "control", "후보와 같은 subcategory의 학습 측 smoothed CTR", "Training-side smoothed CTR for the candidate's subcategory", "subcategory 클릭·노출 집계 → 평활 CTR", "subcategory click/impression counts → smoothed CTR"],
  ["log_history_length", "Log history length", "control", "실제 의미 피처 계산에 사용한 history 길이의 log(1+x)", "Log-transformed length of the history used for semantic features", "최대 30개 history → 길이 → log(1+x)", "at-most-30 history → length → log(1+x)"],
  ["log_title_characters", "Log title characters", "control", "제목 문자 수를 log(1+x)로 변환한 값", "Log-transformed title character count", "제목 → 문자 수 → log(1+x)", "title → character count → log(1+x)"],
  ["log_abstract_characters", "Log abstract characters", "control", "초록 문자 수를 log(1+x)로 변환한 값", "Log-transformed abstract character count", "초록 → 문자 수 → log(1+x)", "abstract → character count → log(1+x)"],
  ["P_mean_vector_cosine", "P mean-vector cosine", "P", "정규화한 평균 history 방향과 후보 벡터 사이의 cosine", "Cosine between the candidate vector and normalized mean-history direction", "history 벡터 평균·정규화 + 후보 벡터 → P₁", "mean and normalize history vectors + candidate vector → P₁"],
  ["P_category_share", "P category share", "P", "history 중 후보와 같은 category를 가진 기사의 비율", "Share of history articles matching the candidate category", "history 분류 + 후보 category → P₂", "history taxonomy + candidate category → P₂"],
  ["P_subcategory_share", "P subcategory share", "P", "history 중 후보와 같은 subcategory를 가진 기사의 비율", "Share of history articles matching the candidate subcategory", "history 분류 + 후보 subcategory → P₃", "history taxonomy + candidate subcategory → P₃"],
  ["C_mean", "C mean", "C", "후보와 각 history 기사 사이 cosine의 산술평균", "Arithmetic mean of candidate-to-history cosine similarities", "후보별 history cosine → 평균", "candidate-history cosines → mean"],
  ["C_max", "C maximum", "C", "후보와 history 기사 사이 cosine 중 최댓값", "Maximum candidate-to-history cosine similarity", "후보별 history cosine → 최댓값", "candidate-history cosines → maximum"],
  ["C_top3", "C top-three", "C", "상위 min(3, |H|)개 cosine의 평균", "Mean of the largest min(3, |H|) candidate-to-history cosines", "후보별 history cosine → 상위 최대 3개 평균", "candidate-history cosines → top-three mean"],
  ["C_attention", "C attention", "C", "softmax(similarity/0.18)로 가중한 cosine 평균", "Cosine mean weighted by softmax(similarity/0.18)", "후보별 history cosine → softmax 가중평균", "candidate-history cosines → softmax-weighted mean"],
  ["E_slate_member", "E slate membership", "E", "원래 logged slate 소속이면 1, 추가 후보이면 0인 출처 표시", "Origin indicator: 1 for the logged slate and 0 for an added candidate", "원래 impressions 소속 여부 → E", "original-impression membership → E"],
  ["P_sem_x_E", "P × E", "product", "P₁ alignment와 E의 고정 곱", "Deterministic product of P₁ alignment and E", "P₁ × E", "P₁ × E"],
  ["C_mean_x_E", "C mean × E", "product", "C mean과 E의 고정 곱", "Deterministic product of C mean and E", "C mean × E", "C mean × E"],
  ["C_max_x_E", "C max × E", "product", "C max와 E의 고정 곱", "Deterministic product of C max and E", "C max × E", "C max × E"],
  ["C_attention_x_E", "C attention × E", "product", "C attention과 E의 고정 곱", "Deterministic product of C attention and E", "C attention × E", "C attention × E"],
  ["P_sem_x_C_mean", "P × C mean", "product", "P₁ alignment와 C mean의 고정 곱", "Deterministic product of P₁ alignment and C mean", "P₁ × C mean", "P₁ × C mean"],
  ["P_sem_x_C_attention", "P × C attention", "product", "P₁ alignment와 C attention의 고정 곱", "Deterministic product of P₁ alignment and C attention", "P₁ × C attention", "P₁ × C attention"],
].map(([name, label, group, meaningKo, meaningEn, routeKo, routeEn]) => ({
  name, labelKo: label, labelEn: label, sample: display4(values[name as keyof typeof values]), dataType: "float32", group: group as Group,
  meaningKo, meaningEn,
  useKo: "이 숫자 한 칸이 후보별 ExtraTrees 입력 행에 그대로 들어갑니다.",
  useEn: "This scalar occupies one cell in the candidate-level ExtraTrees row.",
  boundaryKo: group === "product" ? "새 원자료나 학습된 hidden coordinate가 아니라 이미 계산한 필드의 곱입니다." : group === "P" ? "MIND의 P는 stated profile이 아니라 history-derived proxy입니다." : group === "E" ? "인과적 exposure나 실제 examination을 확인한 값이 아닙니다." : "이 값 하나가 클릭 확률이나 최종 ranking score는 아닙니다.",
  boundaryEn: group === "product" ? "A product of existing fields, not new raw data or a learned hidden coordinate." : group === "P" ? "MIND P is a history-derived proxy, not a stated profile." : group === "E" ? "This does not verify causal exposure or examination." : "This single field is neither a click probability nor the final ranking score.",
  routeKo, routeEn,
}));

const sourceInfo: Record<Source, { ko: string; en: string; noteKo: string; noteEn: string; fields: Field[] }> = {
  behavior: { ko: "behaviors.tsv · 5개", en: "behaviors.tsv · 5 columns", noteKo: "한 행은 impression query 하나입니다. history와 original slate가 같은 행에 있지만 역할은 다릅니다.", noteEn: "One row is one impression query. History and the original slate share a row but serve different roles.", fields: behaviorFields },
  news: { ko: "news.tsv · 8개", en: "news.tsv · 8 columns", noteKo: "공식 MIND의 여덟 컬럼을 모두 표시합니다. 이 proxy가 실제로 쓰지 않는 세 컬럼도 함께 구분합니다.", noteEn: "All eight official MIND columns are shown, including three unused by this proxy.", fields: newsFields },
  row: { ko: "최종 후보 행 · 21개", en: "Candidate row · 21 fields", noteKo: "원컬럼을 join하고 통계·벡터 계산을 마친 뒤 ExtraTrees가 받는 float32 스칼라 21개입니다.", noteEn: "Twenty-one float32 scalars passed to ExtraTrees after joins, statistics, and vector calculations.", fields: rowFields },
};

const rawRouteKo: Record<string, string> = {
  impression_id: "원본 query ID → query 묶음 생성",
  user_id: "원본 user ID → 불확실성 추정용 군집",
  time: "기록 시각 → 시간 순서 학습·검증 분할",
  history: "이전 클릭 ID → P · C · log history length",
  impressions: "slate 기사 ID → E / 뒤의 라벨 → y",
  news_id: "기사 ID → 기사 정보 결합",
  category: "category → P₂ · category CTR · embedding 텍스트",
  subcategory: "subcategory → P₃ · subcategory CTR · embedding 텍스트",
  title: "제목 → 캐시 벡터 · 제목 문자 수 로그",
  abstract: "초록 → 캐시 벡터 · 초록 문자 수 로그",
  url: "원파일에 존재 → 이 proxy에서는 미사용",
  title_entities: "원파일에 존재 → 이 proxy에서는 미사용",
  abstract_entities: "원파일에 존재 → 이 proxy에서는 미사용",
};

export function MindDataMicroscope({ lang }: { lang: Lang }) {
  const ko = lang === "ko";
  const [source, setSource] = useState<Source>("behavior");
  const [selected, setSelected] = useState(0);
  const readoutRef = useRef<HTMLElement>(null);
  const current = sourceInfo[source];
  const field = current.fields[selected] ?? current.fields[0];
  const calculation = calculationDetails[field.name];
  const chooseSource = (next: Source) => { setSource(next); setSelected(0); };
  const chooseField = (index: number) => {
    setSelected(index);
    if (window.matchMedia("(max-width: 600px)").matches) {
      requestAnimationFrame(() => readoutRef.current?.scrollIntoView({ block: "start", behavior: "auto" }));
    }
  };
  const fieldNumber = String(selected + 1).padStart(2, "0");
  const grouped = useMemo(() => current.fields.map((item, index) => ({ item, index })), [current]);

  return <section id="mind-data-microscope" className="mdi" aria-labelledby="mdi-title">
    <header className="mdi-heading"><span>MIND DATA MICROSCOPE</span><h4 id="mdi-title">{ko ? "원자료 컬럼을 하나씩 눌러 최종 피처까지 추적하기" : "Inspect each raw column and trace it to the final features"}</h4><p>{ko ? "컬럼 이름만 외우지 말고, 예시 원값이 어느 계산으로 들어가며 무엇으로 해석하면 안 되는지 확인하세요." : "Inspect the sample value, downstream calculation, and interpretation boundary for every column."}</p></header>
    <nav className="mdi-tabs" aria-label={ko ? "MIND 데이터 표 선택" : "Choose a MIND data table"}>{(Object.keys(sourceInfo) as Source[]).map(key => <button type="button" key={key} aria-pressed={source === key} onClick={() => chooseSource(key)}>{ko ? sourceInfo[key].ko : sourceInfo[key].en}</button>)}</nav>
    <p className="mdi-table-note">{ko ? current.noteKo : current.noteEn}</p>

    <div className="mdi-layout">
      <div className={`mdi-column-list is-${source}`} role="listbox" aria-label={ko ? "컬럼 목록" : "Column list"}>{grouped.map(({ item, index }) => <button type="button" key={item.name} className={`is-${item.group}`} aria-selected={selected === index} onClick={() => chooseField(index)}><span>{String(index + 1).padStart(2, "0")}</span><div><b>{ko ? item.labelKo : item.labelEn}</b><code>{item.name}</code></div><em>{item.used === false ? (ko ? "미사용" : "UNUSED") : item.group === "raw" ? "RAW" : item.group.toUpperCase()}</em></button>)}</div>

      <article ref={readoutRef} className={`mdi-readout is-${field.group}`} aria-live="polite">
        <header><span>{fieldNumber} / {current.fields.length} · {field.group === "raw" ? "RAW COLUMN" : `${field.group.toUpperCase()} FIELD`}</span><h5>{ko ? field.labelKo : field.labelEn}</h5><code>{field.name}</code></header>
        <div className="mdi-sample"><span>{ko ? "이 예시 행의 원값" : "SAMPLE VALUE"}</span><strong>{field.sample}</strong><small>{field.dataType}</small></div>
        <dl>
          <div><dt>{ko ? "무엇을 기록하나" : "WHAT IT RECORDS"}</dt><dd>{ko ? field.meaningKo : field.meaningEn}</dd></div>
          <div><dt>{ko ? "실험에서 어떻게 쓰나" : "HOW IT IS USED"}</dt><dd>{ko ? field.useKo : field.useEn}</dd></div>
          <div><dt>{ko ? "이렇게 읽으면 안 됨" : "DO NOT INFER"}</dt><dd>{ko ? field.boundaryKo : field.boundaryEn}</dd></div>
        </dl>
        {calculation && <section className="mdi-calculation" aria-label={ko ? "계산 방법" : "Calculation method"}>
          <header><span>{ko ? "계산 방법" : "CALCULATION"}</span><b>{ko ? calculation.labelKo : calculation.labelEn}</b></header>
          <div className="mdi-calc-step"><span>1</span><div><small>{ko ? "일반식 또는 변환 규칙" : "FORMULA OR TRANSFORM"}</small><MathBlock tex={calculation.formula} /></div></div>
          <div className="mdi-calc-step"><span>2</span><div><small>{ko ? "이 예시의 숫자 대입" : "WORKED SUBSTITUTION"}</small><MathBlock tex={calculation.substitution} /></div></div>
          <div className="mdi-calc-result"><span>{ko ? "최종 결과" : "RESULT"}</span><strong>{ko ? (calculation.resultKo ?? calculation.result) : (calculation.resultEn ?? calculation.result)}</strong></div>
          <p>{ko ? calculation.detailKo : calculation.detailEn}</p>
        </section>}
        <div className="mdi-route"><span>{ko ? "데이터 경로" : "DATA ROUTE"}</span><b>{ko ? (field.routeKo ?? rawRouteKo[field.name] ?? field.route) : (field.routeEn ?? field.route)}</b></div>
      </article>
    </div>

    <footer className="mdi-key"><span><i className="is-raw" />{ko ? "공식 원컬럼" : "raw source column"}</span><span><i className="is-used" />{ko ? "이 proxy에서 사용" : "used by this proxy"}</span><span><i className="is-unused" />{ko ? "파일에는 있으나 미사용" : "present but unused"}</span><p>{ko ? "모든 예시는 위 실습과 같은 후보 A와 H1·H2·H3를 사용합니다. 실제 MIND 행이나 모델 예측값이 아닙니다. 계산은 반올림하지 않은 값으로 수행하며 숫자는 소수점 넷째 자리까지 표시합니다." : "All samples use candidate A and H1/H2/H3 from the worked example, not real MIND rows or model predictions. Calculations use unrounded values; numbers are displayed to four decimal places."}</p></footer>
  </section>;
}
