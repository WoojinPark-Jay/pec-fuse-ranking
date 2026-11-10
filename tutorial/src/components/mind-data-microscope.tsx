"use client";

import { useMemo, useState } from "react";
import "./mind-data-microscope.css";

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
  route: string;
  used?: boolean;
};

const behaviorFields: Field[] = [
  { name: "impression_id", labelKo: "Impression ID", labelEn: "Impression ID", sample: "I-20485", dataType: "string", group: "raw", meaningKo: "한 번의 추천 화면을 식별합니다. 이 impression 하나가 ranking query 하나입니다.", meaningEn: "Identifies one recommendation impression, which becomes one ranking query.", useKo: "query key를 만들고 같은 impression의 후보들을 한 묶음으로 점수화·정렬합니다.", useEn: "Forms the query key and groups candidates for within-impression scoring and sorting.", boundaryKo: "모델에 넣는 숫자 피처가 아니며 사용자 ID와도 다릅니다.", boundaryEn: "It is neither a numeric scorer feature nor a user identifier.", route: "raw query id → query grouping" },
  { name: "user_id", labelKo: "User ID", labelEn: "User ID", sample: "U-017", dataType: "string", group: "raw", meaningKo: "여러 impression이 같은 사용자에게서 나왔는지 연결합니다.", meaningEn: "Links multiple impressions that belong to the same reader.", useKo: "사용자 단위 bootstrap에서 같은 사용자의 query들을 함께 재표집하는 군집 키로 사용합니다.", useEn: "Acts as the cluster key so all impressions from a sampled user move together in the bootstrap.", boundaryKo: "ExtraTrees 입력 피처가 아니며 사용자 자체를 embedding한 값도 아닙니다.", boundaryEn: "It is not an ExtraTrees feature or a learned user embedding.", route: "raw user id → uncertainty clustering" },
  { name: "time", labelKo: "Impression 시각", labelEn: "Impression time", sample: "11/15/2019 9:24:00 AM", dataType: "datetime", group: "raw", meaningKo: "추천 화면이 기록된 시각입니다.", meaningEn: "Timestamp of the logged impression.", useKo: "학습 60,000개 impression을 시간순으로 정렬해 앞 51,000개 fitting과 뒤 9,000개 validation으로 나눕니다.", useEn: "Chronologically orders 60,000 training impressions before the 51,000/9,000 fit-validation split.", boundaryKo: "후보별 recency 피처로 직접 들어가지는 않으며 history 항목별 정확한 나이 감쇠에도 쓰지 않습니다.", boundaryEn: "It is not a candidate recency feature and does not supply per-history-item age decay.", route: "timestamp → temporal split" },
  { name: "history", labelKo: "이전 클릭 History", labelEn: "Prior-click history", sample: "H1 H2 H3", dataType: "space-separated news IDs", group: "raw", meaningKo: "현재 impression 전에 이 사용자가 클릭한 기사 ID 목록입니다.", meaningEn: "News IDs clicked by the user before the current impression.", useKo: "마지막 최대 30개를 사용해 P 3개와 C 4개를 만들고, 전체 listed history는 추가 후보 추출에서 제외합니다.", useEn: "The last 30 build three P and four C fields; the full listed history is excluded from candidate additions.", boundaryKo: "독립적인 stated profile이 아닙니다. MIND에서는 P와 C가 모두 이 한 컬럼에서 파생됩니다.", boundaryEn: "This is not an independently stated profile. Both MIND P and C derive from this one column.", route: "history IDs → P · C · log history length" },
  { name: "impressions", labelKo: "후보와 클릭 라벨", labelEn: "Candidates and click labels", sample: "A-1 B-0", dataType: "newsID-label pairs", group: "raw", meaningKo: "원래 slate의 기사 ID와 클릭 여부를 1/0으로 함께 기록합니다.", meaningEn: "Stores each original-slate news ID with its binary click label.", useKo: "기사 ID는 original candidate가 되고 slate 소속으로 E=1을 받습니다. 뒤의 1/0은 학습·평가 정답 y로 분리합니다.", useEn: "News IDs become original candidates with E=1; the trailing 1/0 is separated as training/evaluation target y.", boundaryKo: "E와 y는 같은 값이 아닙니다. A-1과 B-0은 둘 다 E=1이지만 y는 다릅니다.", boundaryEn: "E and y are different: A-1 and B-0 both have E=1 but different targets.", route: "slate IDs → E / suffix labels → y" },
];

const newsFields: Field[] = [
  { name: "news_id", labelKo: "News ID", labelEn: "News ID", sample: "A", dataType: "string", group: "raw", meaningKo: "기사 한 건을 식별하고 behavior의 history·impressions와 연결하는 join key입니다.", meaningEn: "Article identifier and join key for history and impressions.", useKo: "후보·history ID를 기사 텍스트, 분류, 캐시 벡터와 연결합니다.", useEn: "Joins candidate and history IDs to text, taxonomy, and cached vectors.", boundaryKo: "ID 자체는 ExtraTrees 숫자 피처가 아닙니다.", boundaryEn: "The identifier itself is not a numeric scorer feature.", route: "news id → joins all article data" },
  { name: "category", labelKo: "Category", labelEn: "Category", sample: "news", dataType: "string", group: "raw", meaningKo: "MIND가 제공하는 상위 기사 분류입니다.", meaningEn: "Top-level MIND news category.", useKo: "후보와 같은 category를 가진 history 비율 P₂, category CTR, 그리고 캐시 embedding 입력에 사용합니다.", useEn: "Used for P₂ category share, category CTR, and the archived embedding input.", boundaryKo: "카테고리 이름을 그대로 숫자로 넣는 것이 아니라 비율·CTR·텍스트 표현으로 변환합니다.", boundaryEn: "The raw label is transformed into shares, CTR, or text representation rather than entered directly.", route: "category → P₂ · category CTR · embedding text" },
  { name: "subcategory", labelKo: "Subcategory", labelEn: "Subcategory", sample: "politics", dataType: "string", group: "raw", meaningKo: "상위 category보다 세밀한 기사 분류입니다.", meaningEn: "Finer taxonomy nested under category.", useKo: "후보와 같은 subcategory의 history 비율 P₃, subcategory CTR, 캐시 embedding 입력에 사용합니다.", useEn: "Used for P₃ subcategory share, subcategory CTR, and the archived embedding input.", boundaryKo: "Category와 별도 피처이며 둘을 하나의 숫자로 합치지 않습니다.", boundaryEn: "It remains separate from category rather than being collapsed into one field.", route: "subcategory → P₃ · subcategory CTR · embedding text" },
  { name: "title", labelKo: "기사 제목", labelEn: "Title", sample: "Carbon tax bill advances", dataType: "text", group: "raw", meaningKo: "기사 제목 원문입니다.", meaningEn: "Raw article headline.", useKo: "캐시 BGE 벡터 생성 입력과 log title character count에 사용합니다.", useEn: "Feeds the archived BGE vector and log title-character count.", boundaryKo: "ExtraTrees가 제목 문자열을 직접 읽는 것이 아니라 벡터와 길이 피처를 받습니다.", boundaryEn: "ExtraTrees receives a cached vector-derived summary and length, not the raw string.", route: "title → cached vector · log title characters" },
  { name: "abstract", labelKo: "기사 초록", labelEn: "Abstract", sample: "Lawmakers debate a new carbon-pricing plan.", dataType: "text", group: "raw", meaningKo: "기사 내용을 요약한 짧은 본문입니다.", meaningEn: "Short text summary of the article.", useKo: "캐시 BGE 벡터 생성 입력과 log abstract character count에 사용합니다.", useEn: "Feeds the archived BGE vector and log abstract-character count.", boundaryKo: "전체 기사 본문이 아니며 runner가 이 자리에서 embedding을 새로 만들지도 않습니다.", boundaryEn: "It is not the full article body, and the runner does not regenerate embeddings here.", route: "abstract → cached vector · log abstract characters" },
  { name: "url", labelKo: "기사 URL", labelEn: "URL", sample: "https://www.msn.com/...", dataType: "string", group: "raw", meaningKo: "원본 기사 주소입니다.", meaningEn: "Original article URL.", useKo: "공식 MIND 파일에는 존재하지만 이 공개 proxy runner의 입력에는 사용하지 않습니다.", useEn: "Present in official MIND files but unused by this public proxy runner.", boundaryKo: "URL 도메인이나 문자열에서 별도 피처를 만들지 않습니다.", boundaryEn: "No feature is derived from the URL or its domain.", route: "present in file → unused", used: false },
  { name: "title_entities", labelKo: "제목 Entity JSON", labelEn: "Title entities", sample: "[{\"Label\":\"Carbon tax\",…}]", dataType: "JSON", group: "raw", meaningKo: "제목에서 추출된 entity annotation입니다.", meaningEn: "Entity annotations extracted from the title.", useKo: "공식 파일에는 있지만 이 proxy의 21개 입력에는 사용하지 않습니다.", useEn: "Available in MIND but unused in the 21-field proxy.", boundaryKo: "Entity embedding이나 지식그래프 피처를 이 실험에 추가하지 않았습니다.", boundaryEn: "The audit adds no entity embedding or knowledge-graph feature.", route: "present in file → unused", used: false },
  { name: "abstract_entities", labelKo: "초록 Entity JSON", labelEn: "Abstract entities", sample: "[{\"Label\":\"Legislation\",…}]", dataType: "JSON", group: "raw", meaningKo: "초록에서 추출된 entity annotation입니다.", meaningEn: "Entity annotations extracted from the abstract.", useKo: "공식 파일에는 있지만 이 proxy의 21개 입력에는 사용하지 않습니다.", useEn: "Available in MIND but unused in the 21-field proxy.", boundaryKo: "원자료에 있다는 이유만으로 모델 입력에 들어간 것은 아닙니다.", boundaryEn: "Presence in the source file does not imply inclusion in the scorer.", route: "present in file → unused", used: false },
];

const rowFields: Field[] = [
  ["article_ctr", "Article CTR", "0.2381", "control", "학습 측 기사 클릭·impression 집계의 Laplace-smoothed CTR", "(article clicks+1)/(article impressions+2)"],
  ["log_article_impressions", "Log article impressions", "3.7136", "control", "기사의 학습 측 impression 수를 log(1+x)로 압축", "training article count → log(1+x)"],
  ["category_ctr", "Category CTR", "0.1509", "control", "후보 category의 smoothed CTR", "category counts → smoothed CTR"],
  ["subcategory_ctr", "Subcategory CTR", "0.2317", "control", "후보 subcategory의 smoothed CTR", "subcategory counts → smoothed CTR"],
  ["log_history_length", "Log history length", "1.3863", "control", "사용한 history 길이의 log(1+x)", "history → log(1+length)"],
  ["log_title_characters", "Log title characters", "3.1355", "control", "제목 문자 수의 log(1+x)", "title → character count → log"],
  ["log_abstract_characters", "Log abstract characters", "4.7958", "control", "초록 문자 수의 log(1+x)", "abstract → character count → log"],
  ["P_mean_vector_cosine", "P mean-vector cosine", "0.7474", "P", "정규화한 평균 history 방향과 후보의 cosine", "history vectors + candidate vector → P₁"],
  ["P_category_share", "P category share", "0.6667", "P", "history 중 후보와 같은 category의 비율", "history taxonomy + candidate category → P₂"],
  ["P_subcategory_share", "P subcategory share", "0.3333", "P", "history 중 후보와 같은 subcategory의 비율", "history taxonomy + candidate subcategory → P₃"],
  ["C_mean", "C mean", "0.6000", "C", "후보와 개별 history 기사 cosine의 산술평균", "candidate-history cosines → mean"],
  ["C_max", "C maximum", "1.0000", "C", "후보와 history 기사 cosine의 최댓값", "candidate-history cosines → maximum"],
  ["C_top3", "C top-three", "0.6000", "C", "상위 min(3, |H|)개 cosine의 평균", "candidate-history cosines → top-three mean"],
  ["C_attention", "C attention", "0.9476", "C", "softmax(similarity/0.18) 가중 cosine 평균", "candidate-history cosines → attention"],
  ["E_slate_member", "E slate membership", "1", "E", "원래 logged slate 소속이면 1, 추가 후보이면 0", "impressions membership → E"],
  ["P_sem_x_E", "P × E", "0.7474", "product", "P alignment와 E의 고정 곱", "P₁ × E"],
  ["C_mean_x_E", "C mean × E", "0.6000", "product", "C mean과 E의 고정 곱", "C mean × E"],
  ["C_max_x_E", "C max × E", "1.0000", "product", "C max와 E의 고정 곱", "C max × E"],
  ["C_attention_x_E", "C attention × E", "0.9476", "product", "C attention과 E의 고정 곱", "C attention × E"],
  ["P_sem_x_C_mean", "P × C mean", "0.4484", "product", "P alignment와 C mean의 고정 곱", "P₁ × C mean"],
  ["P_sem_x_C_attention", "P × C attention", "0.7083", "product", "P alignment와 C attention의 고정 곱", "P₁ × C attention"],
].map(([name, label, sample, group, meaning, route]) => ({
  name, labelKo: label, labelEn: label, sample, dataType: "float32", group: group as Group,
  meaningKo: meaning, meaningEn: meaning,
  useKo: "이 숫자 한 칸이 후보별 ExtraTrees 입력 행에 그대로 들어갑니다.",
  useEn: "This scalar occupies one cell in the candidate-level ExtraTrees row.",
  boundaryKo: group === "product" ? "새 원자료나 학습된 hidden coordinate가 아니라 이미 계산한 필드의 곱입니다." : group === "P" ? "MIND의 P는 stated profile이 아니라 history-derived proxy입니다." : group === "E" ? "인과적 exposure나 실제 examination을 확인한 값이 아닙니다." : "이 값 하나가 클릭 확률이나 최종 ranking score는 아닙니다.",
  boundaryEn: group === "product" ? "A product of existing fields, not new raw data or a learned hidden coordinate." : group === "P" ? "MIND P is a history-derived proxy, not a stated profile." : group === "E" ? "This does not verify causal exposure or examination." : "This single field is neither a click probability nor the final ranking score.",
  route,
}));

const sourceInfo: Record<Source, { ko: string; en: string; noteKo: string; noteEn: string; fields: Field[] }> = {
  behavior: { ko: "behaviors.tsv · 5개", en: "behaviors.tsv · 5 columns", noteKo: "한 행은 impression query 하나입니다. history와 original slate가 같은 행에 있지만 역할은 다릅니다.", noteEn: "One row is one impression query. History and the original slate share a row but serve different roles.", fields: behaviorFields },
  news: { ko: "news.tsv · 8개", en: "news.tsv · 8 columns", noteKo: "공식 MIND의 여덟 컬럼을 모두 표시합니다. 이 proxy가 실제로 쓰지 않는 세 컬럼도 함께 구분합니다.", noteEn: "All eight official MIND columns are shown, including three unused by this proxy.", fields: newsFields },
  row: { ko: "최종 후보 행 · 21개", en: "Candidate row · 21 fields", noteKo: "원컬럼을 join하고 통계·벡터 계산을 마친 뒤 ExtraTrees가 받는 float32 스칼라 21개입니다.", noteEn: "Twenty-one float32 scalars passed to ExtraTrees after joins, statistics, and vector calculations.", fields: rowFields },
};

export function MindDataMicroscope({ lang }: { lang: Lang }) {
  const ko = lang === "ko";
  const [source, setSource] = useState<Source>("behavior");
  const [selected, setSelected] = useState(0);
  const current = sourceInfo[source];
  const field = current.fields[selected] ?? current.fields[0];
  const chooseSource = (next: Source) => { setSource(next); setSelected(0); };
  const fieldNumber = String(selected + 1).padStart(2, "0");
  const grouped = useMemo(() => current.fields.map((item, index) => ({ item, index })), [current]);

  return <section className="mdi" aria-labelledby="mdi-title">
    <header className="mdi-heading"><span>MIND DATA MICROSCOPE</span><h4 id="mdi-title">{ko ? "원자료 컬럼을 하나씩 눌러 최종 피처까지 추적하기" : "Inspect each raw column and trace it to the final features"}</h4><p>{ko ? "컬럼 이름만 외우지 말고, 예시 원값이 어느 계산으로 들어가며 무엇으로 해석하면 안 되는지 확인하세요." : "Inspect the sample value, downstream calculation, and interpretation boundary for every column."}</p></header>
    <nav className="mdi-tabs" aria-label={ko ? "MIND 데이터 표 선택" : "Choose a MIND data table"}>{(Object.keys(sourceInfo) as Source[]).map(key => <button type="button" key={key} aria-pressed={source === key} onClick={() => chooseSource(key)}>{ko ? sourceInfo[key].ko : sourceInfo[key].en}</button>)}</nav>
    <p className="mdi-table-note">{ko ? current.noteKo : current.noteEn}</p>

    <div className="mdi-layout">
      <div className={`mdi-column-list is-${source}`} role="listbox" aria-label={ko ? "컬럼 목록" : "Column list"}>{grouped.map(({ item, index }) => <button type="button" key={item.name} className={`is-${item.group}`} aria-selected={selected === index} onClick={() => setSelected(index)}><span>{String(index + 1).padStart(2, "0")}</span><div><b>{ko ? item.labelKo : item.labelEn}</b><code>{item.name}</code></div><em>{item.used === false ? (ko ? "미사용" : "UNUSED") : item.group === "raw" ? "RAW" : item.group.toUpperCase()}</em></button>)}</div>

      <article className={`mdi-readout is-${field.group}`} aria-live="polite">
        <header><span>{fieldNumber} / {current.fields.length} · {field.group === "raw" ? "RAW COLUMN" : `${field.group.toUpperCase()} FIELD`}</span><h5>{ko ? field.labelKo : field.labelEn}</h5><code>{field.name}</code></header>
        <div className="mdi-sample"><span>{ko ? "이 예시 행의 원값" : "SAMPLE VALUE"}</span><strong>{field.sample}</strong><small>{field.dataType}</small></div>
        <dl>
          <div><dt>{ko ? "무엇을 기록하나" : "WHAT IT RECORDS"}</dt><dd>{ko ? field.meaningKo : field.meaningEn}</dd></div>
          <div><dt>{ko ? "실험에서 어떻게 쓰나" : "HOW IT IS USED"}</dt><dd>{ko ? field.useKo : field.useEn}</dd></div>
          <div><dt>{ko ? "이렇게 읽으면 안 됨" : "DO NOT INFER"}</dt><dd>{ko ? field.boundaryKo : field.boundaryEn}</dd></div>
        </dl>
        <div className="mdi-route"><span>{ko ? "데이터 경로" : "DATA ROUTE"}</span><b>{field.route}</b></div>
      </article>
    </div>

    <footer className="mdi-key"><span><i className="is-raw" />{ko ? "공식 원컬럼" : "raw source column"}</span><span><i className="is-used" />{ko ? "이 proxy에서 사용" : "used by this proxy"}</span><span><i className="is-unused" />{ko ? "파일에는 있으나 미사용" : "present but unused"}</span><p>{ko ? "최종 21개 탭의 값은 계산을 따라가기 위한 합성 예시이며 실제 MIND 사용자 행이나 모델 예측값이 아닙니다." : "Values in the 21-field tab are synthetic teaching values, not an actual MIND user row or model prediction."}</p></footer>
  </section>;
}
