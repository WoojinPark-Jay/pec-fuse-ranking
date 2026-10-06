import { useMemo, useState } from "react";

type Lang = "ko" | "en";
type Category = "climate" | "science" | "sports" | "local" | "health";
type ModelKey = "control" | "direct" | "complete" | "neural";

type Localized = { ko: string; en: string };
type Persona = {
  id: string;
  avatar: string;
  name: Localized;
  role: Localized;
  summary: Localized;
  interests: Localized[];
  recent: Localized[];
  profile: Record<Category, number>;
  history: Record<Category, number>;
  trace: string[];
};

type Article = {
  id: string;
  icon: string;
  category: Category;
  section: Localized;
  title: Localized;
  dek: Localized;
  popularity: number;
  recency: number;
  quality: number;
};

type Signals = { P: number; E: number; C: number; Z: number };

const personas: Persona[] = [
  {
    id: "mina",
    avatar: "👩🏻‍🔬",
    name: { ko: "민아", en: "Mina" },
    role: { ko: "기후·과학 독자", en: "Climate and science reader" },
    summary: {
      ko: "기후 정책을 꾸준히 읽고, 최근에는 배터리와 에너지 기술 기사를 자주 클릭했습니다.",
      en: "Regularly reads climate policy and has recently clicked battery and energy-technology stories."
    },
    interests: [
      { ko: "기후 정책", en: "Climate policy" },
      { ko: "에너지", en: "Energy" },
      { ko: "과학", en: "Science" }
    ],
    recent: [
      { ko: "탄소시장 개편안", en: "Carbon-market reform" },
      { ko: "차세대 배터리", en: "Next-generation batteries" },
      { ko: "해수면 관측", en: "Sea-level monitoring" }
    ],
    profile: { climate: .96, science: .84, sports: .12, local: .38, health: .44 },
    history: { climate: .91, science: .79, sports: .18, local: .34, health: .41 },
    trace: ["battery", "climate"]
  },
  {
    id: "jun",
    avatar: "🧑🏽‍💼",
    name: { ko: "준", en: "Jun" },
    role: { ko: "스포츠·지역 소식 독자", en: "Sports and local-news reader" },
    summary: {
      ko: "출퇴근 시간에는 지역 소식을, 저녁에는 경기 분석과 팀 뉴스를 주로 읽습니다.",
      en: "Reads local updates during the commute and follows match analysis and team news in the evening."
    },
    interests: [
      { ko: "축구", en: "Football" },
      { ko: "지역 교통", en: "Local transit" },
      { ko: "도시 생활", en: "City life" }
    ],
    recent: [
      { ko: "주말 결승전 분석", en: "Weekend final analysis" },
      { ko: "지하철 노선 개편", en: "Metro route changes" },
      { ko: "신인 선수 인터뷰", en: "Rookie interview" }
    ],
    profile: { climate: .31, science: .28, sports: .97, local: .88, health: .36 },
    history: { climate: .22, science: .31, sports: .94, local: .81, health: .29 },
    trace: ["football", "transit"]
  },
  {
    id: "sora",
    avatar: "👩🏻‍⚕️",
    name: { ko: "소라", en: "Sora" },
    role: { ko: "건강·연구 뉴스 독자", en: "Health and research reader" },
    summary: {
      ko: "의학 연구와 검증된 과학 보도를 선호하며, 속보보다 설명이 충분한 기사를 오래 읽습니다.",
      en: "Prefers evidence-led medical and science reporting, with deeper reads rather than breaking news."
    },
    interests: [
      { ko: "공중보건", en: "Public health" },
      { ko: "임상 연구", en: "Clinical research" },
      { ko: "과학 해설", en: "Science explainers" }
    ],
    recent: [
      { ko: "백신 효과 연구", en: "Vaccine-effectiveness study" },
      { ko: "유전체 분석", en: "Genomic analysis" },
      { ko: "수면과 기억", en: "Sleep and memory" }
    ],
    profile: { climate: .42, science: .91, sports: .09, local: .32, health: .98 },
    history: { climate: .38, science: .88, sports: .12, local: .28, health: .93 },
    trace: ["health", "science"]
  }
];

const articles: Article[] = [
  {
    id: "climate", icon: "🌍", category: "climate",
    section: { ko: "기후 정책", en: "Climate policy" },
    title: { ko: "도시 탄소예산, 내년부터 달라지는 것", en: "How the city carbon budget changes next year" },
    dek: { ko: "새 감축 목표와 시민 생활의 변화를 설명합니다.", en: "A practical guide to new targets and their everyday effects." },
    popularity: .66, recency: .86, quality: .83
  },
  {
    id: "battery", icon: "🔋", category: "science",
    section: { ko: "에너지 기술", en: "Energy technology" },
    title: { ko: "고체전지 수명, 새 실험이 보여준 결과", en: "What a new trial reveals about solid-state batteries" },
    dek: { ko: "연구진의 측정 방법과 한계를 함께 살펴봅니다.", en: "The measurements, the result, and the limits of the study." },
    popularity: .74, recency: .72, quality: .91
  },
  {
    id: "football", icon: "⚽", category: "sports",
    section: { ko: "스포츠", en: "Sports" },
    title: { ko: "후반 전술 변화가 결승전을 뒤집었다", en: "The second-half switch that changed the final" },
    dek: { ko: "패스 경로와 압박 위치로 승부처를 복기합니다.", en: "A tactical replay through passing lanes and pressing positions." },
    popularity: .95, recency: .91, quality: .69
  },
  {
    id: "transit", icon: "🚇", category: "local",
    section: { ko: "지역", en: "Local" },
    title: { ko: "광역철도 개편안, 내 통근시간은 얼마나 줄까", en: "What the rail redesign could mean for your commute" },
    dek: { ko: "역별 예상 시간과 환승 변화를 비교했습니다.", en: "Station-level travel times and transfer changes compared." },
    popularity: .81, recency: .79, quality: .76
  },
  {
    id: "health", icon: "🧬", category: "health",
    section: { ko: "의학 연구", en: "Medical research" },
    title: { ko: "유전자 치료 임상시험, 숫자 뒤의 의미", en: "Reading beyond the headline in a gene-therapy trial" },
    dek: { ko: "효과 크기와 부작용을 연구 설계와 함께 읽습니다.", en: "Effect size and adverse events, read alongside the trial design." },
    popularity: .58, recency: .63, quality: .96
  }
];

const modelCopy: Record<ModelKey, { name: string; label: Localized; detail: Localized }> = {
  control: {
    name: "Operational control",
    label: { ko: "운영 정보 중심", en: "Operational signals" },
    detail: { ko: "인기도·최신성 같은 Z 통제 특성을 중심으로 정렬합니다.", en: "Ranks mainly from Z controls such as popularity and recency." }
  },
  direct: {
    name: "Direct PEC",
    label: { ko: "출처별 값을 그대로", en: "Source values retained" },
    detail: { ko: "P·E·C를 구분된 좌표로 유지해 점수 모델에 전달합니다.", en: "Passes P, E, and C to the scorer as separate coordinates." }
  },
  complete: {
    name: "Complete PEC",
    label: { ko: "출처와 상호작용", en: "Sources plus interactions" },
    detail: { ko: "분리된 P·E·C와 그 상호작용을 함께 사용합니다.", en: "Uses separated P, E, and C signals together with their interactions." }
  },
  neural: {
    name: "Neural audit",
    label: { ko: "비선형 비교 모델", en: "Nonlinear audit model" },
    detail: { ko: "같은 정보가 신경망형 점수 모델에서도 유용한지 살펴보는 비교입니다.", en: "Checks whether the same evidence remains useful with a neural scorer." }
  }
};

const modelOrder: ModelKey[] = ["control", "direct", "complete", "neural"];

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

function signalsFor(persona: Persona, article: Article): Signals {
  const traceIndex = persona.trace.indexOf(article.id);
  return {
    P: persona.profile[article.category],
    E: traceIndex < 0 ? 0 : 1 / (traceIndex + 1),
    C: persona.history[article.category],
    Z: .55 * article.popularity + .45 * article.recency
  };
}

function scoreFor(model: ModelKey, s: Signals, article: Article) {
  if (model === "control") return clamp(.78 * s.Z + .22 * article.quality);
  if (model === "direct") return clamp(.30 * s.P + .16 * s.E + .30 * s.C + .19 * s.Z + .05 * article.quality);
  if (model === "complete") {
    return clamp(.25 * s.P + .14 * s.E + .24 * s.C + .15 * s.Z + .05 * article.quality + .11 * s.P * s.C + .06 * s.C * s.E);
  }
  return clamp(.24 * Math.sqrt(s.P) + .13 * s.E + .28 * Math.pow(s.C, .75) + .18 * s.Z + .08 * article.quality + .09 * Math.max(s.P, s.C));
}

export function LiveRankingDemo({ lang }: { lang: Lang }) {
  const ko = lang === "ko";
  const t = (value: Localized) => value[lang];
  const [personaId, setPersonaId] = useState(personas[0].id);
  const [model, setModel] = useState<ModelKey>("complete");
  const [selectedId, setSelectedId] = useState(articles[0].id);
  const persona = personas.find((item) => item.id === personaId) ?? personas[0];

  const ranked = useMemo(() => articles
    .map((article) => {
      const signals = signalsFor(persona, article);
      return { article, signals, score: scoreFor(model, signals, article) };
    })
    .sort((a, b) => b.score - a.score), [persona, model]);

  const selected = ranked.find((item) => item.article.id === selectedId) ?? ranked[0];
  const top = ranked[0];
  const signalLabels: Record<keyof Signals, Localized> = {
    P: { ko: "프로필 정합도", en: "Profile alignment" },
    E: { ko: "보존 추천 기록", en: "Retained trace" },
    C: { ko: "이전 클릭 정합도", en: "Click-history alignment" },
    Z: { ko: "운영 통제 특성", en: "Operational controls" }
  };

  return <section className="prd-demo" id="live-demo" aria-labelledby="prd-title">
    <header className="prd-intro">
      <div>
        <span className="public-section-label">LIVE RANKING DEMO</span>
        <h2 id="prd-title">{ko ? "독자 한 명의 뉴스 순위가 만들어지는 과정" : "Watch one reader's news ranking take shape"}</h2>
        <p>{ko ? "독자와 모델을 바꾸면 같은 다섯 기사의 순위가 어떻게 달라지는지 확인할 수 있습니다. 기사 하나를 누르면 그 순위를 만든 입력 근거도 함께 표시됩니다." : "Switch the reader and scoring model to see the same five stories reorder. Select any story to inspect the evidence behind its score."}</p>
      </div>
      <aside>
        <b>{ko ? "이 화면의 범위" : "What this demo is"}</b>
        <span>{ko ? "논문의 구조를 설명하는 합성 시뮬레이션" : "A synthetic simulation of the paper's ranking structure"}</span>
        <small>{ko ? "실제 사용자·학습 모델·논문 성능값이 아닙니다." : "Not a real user, fitted checkpoint, or reported result."}</small>
      </aside>
    </header>

    <div className="prd-stagebar" aria-label={ko ? "데모 진행 단계" : "Demo stages"}>
      <span><i>1</i>{ko ? "독자 선택" : "Choose reader"}</span>
      <span><i>2</i>{ko ? "후보 기사 확인" : "Review candidates"}</span>
      <span><i>3</i>{ko ? "모델 선택" : "Choose model"}</span>
      <span><i>4</i>{ko ? "순위와 근거 확인" : "Inspect ranking"}</span>
    </div>

    <div className="prd-workbench">
      <section className="prd-reader" aria-labelledby="prd-reader-title">
        <div className="prd-panel-heading">
          <span>01</span>
          <div><b id="prd-reader-title">{ko ? "누구에게 추천할까요?" : "Who are we ranking for?"}</b><small>{ko ? "합성 독자 프로필" : "Synthetic reader profiles"}</small></div>
        </div>
        <div className="prd-persona-tabs" role="group" aria-label={ko ? "독자 선택" : "Choose a reader"}>
          {personas.map((item) => <button key={item.id} type="button" aria-pressed={persona.id === item.id} onClick={() => setPersonaId(item.id)}>
            <span aria-hidden="true">{item.avatar}</span>
            <b>{t(item.name)}</b>
          </button>)}
        </div>
        <article className="prd-profile-card">
          <div className="prd-avatar" aria-hidden="true">{persona.avatar}</div>
          <div>
            <span>{ko ? "오늘의 독자" : "Today's reader"}</span>
            <h3>{t(persona.name)}</h3>
            <b>{t(persona.role)}</b>
          </div>
          <p>{t(persona.summary)}</p>
          <div className="prd-interest-list">
            {persona.interests.map((item) => <span key={item.en}>{t(item)}</span>)}
          </div>
        </article>
        <div className="prd-recent">
          <b>{ko ? "최근 클릭한 기사" : "Recently clicked"}</b>
          {persona.recent.map((item, index) => <div key={item.en}><span>{index + 1}</span>{t(item)}</div>)}
        </div>
      </section>

      <section className="prd-candidates" aria-labelledby="prd-candidate-title">
        <div className="prd-panel-heading">
          <span>02</span>
          <div><b id="prd-candidate-title">{ko ? "오늘의 후보 기사" : "Today's candidate stories"}</b><small>{ko ? "모든 모델에 동일한 후보 5개" : "The same five candidates for every model"}</small></div>
        </div>
        <div className="prd-news-grid">
          {articles.map((article) => {
            const signals = signalsFor(persona, article);
            const active = selected.article.id === article.id;
            const inTrace = signals.E > 0;
            return <button key={article.id} type="button" className={active ? "is-selected" : ""} aria-pressed={active} onClick={() => setSelectedId(article.id)}>
              <span className="prd-news-visual" aria-hidden="true"><i>NEWS</i>{article.icon}</span>
              <span className="prd-news-copy">
                <small>{t(article.section)}{inTrace ? ` · ${ko ? "추천 기록 있음" : "in retained trace"}` : ""}</small>
                <b>{t(article.title)}</b>
                <em>{t(article.dek)}</em>
              </span>
              <span className="prd-news-arrow" aria-hidden="true">→</span>
            </button>;
          })}
        </div>
      </section>

      <section className="prd-model" aria-labelledby="prd-model-title">
        <div className="prd-panel-heading">
          <span>03</span>
          <div><b id="prd-model-title">{ko ? "어떤 모델로 정렬할까요?" : "Which model should rank them?"}</b><small>{ko ? "입력 정보와 점수 규칙 비교" : "Compare inputs and scoring rules"}</small></div>
        </div>
        <div className="prd-model-tabs" role="group" aria-label={ko ? "모델 선택" : "Choose a model"}>
          {modelOrder.map((key) => <button key={key} type="button" aria-pressed={model === key} onClick={() => setModel(key)}>
            <b>{modelCopy[key].name}</b>
            <span>{t(modelCopy[key].label)}</span>
          </button>)}
        </div>
        <div className="prd-model-card">
          <div className="prd-model-icon" aria-hidden="true"><span>f</span><sub>θ</sub></div>
          <div><b>{modelCopy[model].name}</b><p>{t(modelCopy[model].detail)}</p></div>
        </div>
        <div className="prd-input-route" aria-label={ko ? "선택 모델의 입력 경로" : "Input route for the selected model"}>
          {(["P", "E", "C", "Z"] as const).map((key) => <span key={key} className={model === "control" && key !== "Z" ? "is-muted" : ""}>{key}</span>)}
          {model === "complete" && <span className="prd-interaction">ψ</span>}
          <i>→</i><b>s(x)</b>
        </div>
      </section>
    </div>

    <section className="prd-output" aria-labelledby="prd-output-title">
      <header>
        <div className="prd-panel-heading">
          <span>04</span>
          <div><b id="prd-output-title">{ko ? `${t(persona.name)}를 위한 최종 순위` : `Final ranking for ${t(persona.name)}`}</b><small>{ko ? "모델 점수가 큰 기사부터 정렬" : "Sorted by descending model score"}</small></div>
        </div>
        <div className="prd-winner"><span aria-hidden="true">{top.article.icon}</span><div><small>{ko ? "현재 1위" : "Currently ranked first"}</small><b>{t(top.article.title)}</b></div></div>
      </header>
      <div className="prd-ranking">
        {ranked.map((item, index) => {
          const active = selected.article.id === item.article.id;
          return <button key={item.article.id} type="button" className={active ? "is-selected" : ""} aria-pressed={active} onClick={() => setSelectedId(item.article.id)}>
            <span className="prd-rank">{index + 1}</span>
            <span className="prd-rank-icon" aria-hidden="true">{item.article.icon}</span>
            <span className="prd-rank-copy"><small>{t(item.article.section)}</small><b>{t(item.article.title)}</b></span>
            <span className="prd-scorebar"><i style={{ width: `${Math.round(item.score * 100)}%` }} /></span>
            <output>{item.score.toFixed(3)}</output>
          </button>;
        })}
      </div>
      <aside className="prd-inspector">
        <div className="prd-inspector-title">
          <span aria-hidden="true">{selected.article.icon}</span>
          <div><small>{ko ? "선택한 기사 입력 근거" : "Evidence for the selected story"}</small><b>{t(selected.article.title)}</b></div>
        </div>
        <div className="prd-signal-grid">
          {(Object.keys(selected.signals) as (keyof Signals)[]).map((key) => <div key={key} className={model === "control" && key !== "Z" ? "is-muted" : ""}>
            <span><b>{key}</b>{t(signalLabels[key])}<output>{selected.signals[key].toFixed(2)}</output></span>
            <i><em style={{ width: `${Math.round(selected.signals[key] * 100)}%` }} /></i>
          </div>)}
        </div>
        <p>{model === "control"
          ? (ko ? "이 모델은 P·E·C를 사용하지 않습니다. 인기와 최신성 같은 운영 정보가 순위를 주로 결정합니다." : "This model does not use P, E, or C. Operational signals such as popularity and recency drive the ranking.")
          : (ko ? `${t(persona.name)}의 프로필·이력과 이 기사의 관계가 후보별 입력이 됩니다. 네 값을 단순히 더한 것이 아니라, 선택한 모델의 규칙으로 점수 하나를 계산합니다.` : `The relationship between ${t(persona.name)} and this story becomes candidate-level input. The four values are not simply added; the selected model maps them to one ranking score.`)}</p>
      </aside>
    </section>
  </section>;
}
