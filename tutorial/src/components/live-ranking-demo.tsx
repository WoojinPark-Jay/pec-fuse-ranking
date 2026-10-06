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
  moment: Localized;
  interests: Localized[];
  recent: Localized[];
  profile: Record<Category, number>;
  history: Record<Category, number>;
  publishers: { name: Localized; value: number }[];
  recentMix: { category: Category; value: number }[];
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
  source: Localized;
  published: string;
  readTime: number;
};

type Signals = { P: number; E: number; C: number; Z: number };

const categoryLabels: Record<Category, Localized> = {
  climate: { ko: "기후", en: "Climate" },
  science: { ko: "과학·기술", en: "Science & tech" },
  sports: { ko: "스포츠", en: "Sports" },
  local: { ko: "지역·도시", en: "Local & cities" },
  health: { ko: "건강", en: "Health" }
};

const topProfileCategories = (persona: Persona) =>
  (Object.entries(persona.profile) as [Category, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

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
    moment: { ko: "평일 아침 · 모바일에서 짧게 탐색", en: "Weekday morning · browsing briefly on mobile" },
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
    publishers: [
      { name: { ko: "사이언스와이어", en: "Science Wire" }, value: .82 },
      { name: { ko: "도시일보", en: "Metro Chronicle" }, value: .74 },
      { name: { ko: "테크스코프", en: "TechScope" }, value: .61 }
    ],
    recentMix: [{ category: "science", value: .43 }, { category: "climate", value: .42 }, { category: "local", value: .15 }],
    trace: ["battery", "climate"]
  },
  {
    id: "jun",
    avatar: "🧑🏽‍💼",
    name: { ko: "진", en: "Jin" },
    role: { ko: "스포츠·지역 소식 독자", en: "Sports and local-news reader" },
    summary: {
      ko: "출퇴근 시간에는 지역 소식을, 저녁에는 경기 분석과 팀 뉴스를 주로 읽습니다.",
      en: "Reads local updates during the commute and follows match analysis and team news in the evening."
    },
    moment: { ko: "퇴근 직후 · 경기 결과를 빠르게 확인", en: "After work · checking match results quickly" },
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
    publishers: [
      { name: { ko: "매치리뷰", en: "Match Review" }, value: .93 },
      { name: { ko: "시티저널", en: "City Journal" }, value: .79 },
      { name: { ko: "도시일보", en: "Metro Chronicle" }, value: .42 }
    ],
    recentMix: [{ category: "sports", value: .54 }, { category: "local", value: .36 }, { category: "science", value: .10 }],
    trace: ["football", "transit"]
  },
  {
    id: "sora",
    avatar: "👩🏻‍⚕️",
    name: { ko: "엘리", en: "Ellie" },
    role: { ko: "건강·연구 뉴스 독자", en: "Health and research reader" },
    summary: {
      ko: "의학 연구와 검증된 과학 보도를 선호하며, 속보보다 설명이 충분한 기사를 오래 읽습니다.",
      en: "Prefers evidence-led medical and science reporting, with deeper reads rather than breaking news."
    },
    moment: { ko: "주말 오후 · 긴 해설 기사를 정독", en: "Weekend afternoon · reading long-form explainers" },
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
    publishers: [
      { name: { ko: "에비던스랩", en: "Evidence Lab" }, value: .95 },
      { name: { ko: "사이언스와이어", en: "Science Wire" }, value: .88 },
      { name: { ko: "웰빙리포트", en: "Wellbeing Report" }, value: .76 }
    ],
    recentMix: [{ category: "health", value: .52 }, { category: "science", value: .39 }, { category: "climate", value: .09 }],
    trace: ["health", "science"]
  },
  {
    id: "taeo",
    avatar: "🧑🏻‍💻",
    name: { ko: "태오", en: "Taeo" },
    role: { ko: "기술·도시 변화 독자", en: "Technology and cities reader" },
    summary: {
      ko: "새 기술이 교통, 에너지와 일상에 미치는 영향을 다룬 분석 기사를 자주 읽습니다.",
      en: "Often reads analysis of how new technology changes transport, energy, and everyday life."
    },
    moment: { ko: "점심시간 · 노트북에서 주요 기사 확인", en: "Lunch break · scanning key stories on a laptop" },
    interests: [
      { ko: "인공지능", en: "Artificial intelligence" },
      { ko: "도시 기술", en: "Urban technology" },
      { ko: "에너지", en: "Energy" }
    ],
    recent: [
      { ko: "AI 기상예측", en: "AI weather forecasting" },
      { ko: "스마트 교통망", en: "Smart transit networks" },
      { ko: "전력망 혁신", en: "Power-grid innovation" }
    ],
    profile: { climate: .68, science: .95, sports: .18, local: .78, health: .39 },
    history: { climate: .61, science: .91, sports: .14, local: .73, health: .35 },
    publishers: [
      { name: { ko: "테크스코프", en: "TechScope" }, value: .94 },
      { name: { ko: "시티저널", en: "City Journal" }, value: .77 },
      { name: { ko: "사이언스와이어", en: "Science Wire" }, value: .72 }
    ],
    recentMix: [{ category: "science", value: .48 }, { category: "local", value: .29 }, { category: "climate", value: .23 }],
    trace: ["aiweather", "battery", "transit"]
  },
  {
    id: "nari",
    avatar: "👩🏽‍🏫",
    name: { ko: "서현", en: "Seohyun" },
    role: { ko: "생활·시사 종합 독자", en: "General current-affairs reader" },
    summary: {
      ko: "지역 정책과 건강, 과학을 고르게 읽으며 생활에 직접 영향을 주는 기사를 저장합니다.",
      en: "Reads broadly across local policy, health, and science, saving stories with practical impact."
    },
    moment: { ko: "저녁 · 휴대폰으로 저장 기사 탐색", en: "Evening · revisiting saved stories on mobile" },
    interests: [
      { ko: "생활 정책", en: "Everyday policy" },
      { ko: "건강", en: "Health" },
      { ko: "지역 사회", en: "Community" }
    ],
    recent: [
      { ko: "공공주택 변화", en: "Public-housing changes" },
      { ko: "수면 연구", en: "Sleep research" },
      { ko: "지역 예산안", en: "Local budget proposal" }
    ],
    profile: { climate: .66, science: .69, sports: .46, local: .92, health: .78 },
    history: { climate: .59, science: .65, sports: .42, local: .89, health: .74 },
    publishers: [
      { name: { ko: "커먼그라운드", en: "Common Ground" }, value: .91 },
      { name: { ko: "웰빙리포트", en: "Wellbeing Report" }, value: .82 },
      { name: { ko: "시티저널", en: "City Journal" }, value: .78 }
    ],
    recentMix: [{ category: "local", value: .40 }, { category: "health", value: .32 }, { category: "science", value: .28 }],
    trace: ["housing", "sleep", "transit"]
  }
];

const articles: Article[] = [
  {
    id: "climate", icon: "🌍", category: "climate",
    section: { ko: "기후 정책", en: "Climate policy" },
    title: { ko: "도시 탄소예산, 내년부터 달라지는 것", en: "How the city carbon budget changes next year" },
    dek: { ko: "새 감축 목표와 시민 생활의 변화를 설명합니다.", en: "A practical guide to new targets and their everyday effects." },
    popularity: .66, recency: .86, quality: .83, source: { ko: "도시일보", en: "Metro Chronicle" }, published: "2026.06.03", readTime: 5
  },
  {
    id: "battery", icon: "🔋", category: "science",
    section: { ko: "에너지 기술", en: "Energy technology" },
    title: { ko: "고체전지 수명, 새 실험이 보여준 결과", en: "What a new trial reveals about solid-state batteries" },
    dek: { ko: "연구진의 측정 방법과 한계를 함께 살펴봅니다.", en: "The measurements, the result, and the limits of the study." },
    popularity: .74, recency: .72, quality: .91, source: { ko: "사이언스와이어", en: "Science Wire" }, published: "2026.06.02", readTime: 7
  },
  {
    id: "football", icon: "⚽", category: "sports",
    section: { ko: "스포츠", en: "Sports" },
    title: { ko: "후반 전술 변화가 결승전을 뒤집었다", en: "The second-half switch that changed the final" },
    dek: { ko: "패스 경로와 압박 위치로 승부처를 복기합니다.", en: "A tactical replay through passing lanes and pressing positions." },
    popularity: .95, recency: .91, quality: .69, source: { ko: "매치리뷰", en: "Match Review" }, published: "2026.06.03", readTime: 4
  },
  {
    id: "transit", icon: "🚇", category: "local",
    section: { ko: "지역", en: "Local" },
    title: { ko: "광역철도 개편안, 내 통근시간은 얼마나 줄까", en: "What the rail redesign could mean for your commute" },
    dek: { ko: "역별 예상 시간과 환승 변화를 비교했습니다.", en: "Station-level travel times and transfer changes compared." },
    popularity: .81, recency: .79, quality: .76, source: { ko: "시티저널", en: "City Journal" }, published: "2026.05.31", readTime: 3
  },
  {
    id: "health", icon: "🧬", category: "health",
    section: { ko: "의학 연구", en: "Medical research" },
    title: { ko: "유전자 치료 임상시험, 숫자 뒤의 의미", en: "Reading beyond the headline in a gene-therapy trial" },
    dek: { ko: "효과 크기와 부작용을 연구 설계와 함께 읽습니다.", en: "Effect size and adverse events, read alongside the trial design." },
    popularity: .58, recency: .63, quality: .96, source: { ko: "에비던스랩", en: "Evidence Lab" }, published: "2026.05.29", readTime: 8
  },
  {
    id: "aiweather", icon: "🤖", category: "science",
    section: { ko: "AI·과학", en: "AI and science" },
    title: { ko: "AI 기상예측은 폭우를 얼마나 빨리 알릴까", en: "How much earlier can AI forecast extreme rain?" },
    dek: { ko: "기존 수치예보와 새 모델의 예측 시간을 비교했습니다.", en: "A comparison of lead times from conventional and AI forecasts." },
    popularity: .84, recency: .88, quality: .81, source: { ko: "테크스코프", en: "TechScope" }, published: "2026.06.03", readTime: 6
  },
  {
    id: "housing", icon: "🏙️", category: "local",
    section: { ko: "도시 정책", en: "Urban policy" },
    title: { ko: "공공주택 배정 기준, 우리 동네는 무엇이 달라지나", en: "What the new public-housing rules change locally" },
    dek: { ko: "지역별 공급 계획과 신청 조건을 표로 정리했습니다.", en: "Local supply plans and eligibility rules, mapped and compared." },
    popularity: .69, recency: .67, quality: .87, source: { ko: "커먼그라운드", en: "Common Ground" }, published: "2026.05.30", readTime: 6
  },
  {
    id: "sleep", icon: "🌙", category: "health",
    section: { ko: "건강", en: "Health" },
    title: { ko: "수면 30분의 차이가 기억력에 미치는 영향", en: "What 30 more minutes of sleep may mean for memory" },
    dek: { ko: "참가자 규모와 효과 크기를 과장 없이 살펴봅니다.", en: "A careful look at sample size, effect size, and uncertainty." },
    popularity: .76, recency: .59, quality: .89, source: { ko: "웰빙리포트", en: "Wellbeing Report" }, published: "2026.05.27", readTime: 5
  }
];

const modelCopy: Record<ModelKey, { name: string; icon: string; inputs: string; label: Localized; detail: Localized }> = {
  control: {
    icon: "⚙️", inputs: "Z → s(x)",
    name: "Operational control",
    label: { ko: "운영 정보 중심", en: "Operational signals" },
    detail: { ko: "인기도·최신성 같은 Z 통제 특성을 중심으로 정렬합니다.", en: "Ranks mainly from Z controls such as popularity and recency." }
  },
  direct: {
    icon: "🧩", inputs: "P · E · C · Z",
    name: "Direct PEC",
    label: { ko: "출처별 값을 그대로", en: "Source values retained" },
    detail: { ko: "P·E·C를 구분된 좌표로 유지해 점수 모델에 전달합니다.", en: "Passes P, E, and C to the scorer as separate coordinates." }
  },
  complete: {
    icon: "🔗", inputs: "P · E · C · Z · ψ",
    name: "Complete PEC",
    label: { ko: "출처와 상호작용", en: "Sources plus interactions" },
    detail: { ko: "분리된 P·E·C와 그 상호작용을 함께 사용합니다.", en: "Uses separated P, E, and C signals together with their interactions." }
  },
  neural: {
    icon: "🧠", inputs: "embeddings → s(x)",
    name: "Neural audit",
    label: { ko: "비선형 비교 모델", en: "Nonlinear audit model" },
    detail: { ko: "같은 정보가 신경망형 점수 모델에서도 유용한지 살펴보는 비교입니다.", en: "Checks whether the same evidence remains useful with a neural scorer." }
  }
};

const modelOrder: ModelKey[] = ["complete", "control", "direct", "neural"];

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
  if (model === "direct") return clamp(.25 * s.P + .15 * s.E + .25 * s.C + .15 * s.Z + .20 * article.quality);
  if (model === "complete") {
    return clamp(.25 * s.P + .14 * s.E + .24 * s.C + .15 * s.Z + .05 * article.quality + .11 * s.P * s.C + .06 * s.C * s.E);
  }
  return clamp(.15 * Math.sqrt(s.P) + .15 * s.E + .10 * Math.pow(s.C, .70) + .35 * s.Z + .05 * article.quality + .20 * Math.max(s.P, s.C));
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
        <p>{ko ? "독자와 모델을 바꾸면 같은 여덟 기사의 순위가 어떻게 달라지는지 확인할 수 있습니다. 기사 하나를 누르면 그 순위를 만든 입력 근거도 함께 표시됩니다." : "Switch the reader and scoring model to see the same eight stories reorder. Select any story to inspect the evidence behind its score."}</p>
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
          <div className="prd-reader-moment"><span aria-hidden="true">📱</span><div><small>{ko ? "현재 읽기 상황" : "Current reading context"}</small><b>{t(persona.moment)}</b></div></div>
          <div className="prd-interest-list">
            {persona.interests.map((item) => <span key={item.en}>{t(item)}</span>)}
          </div>
        </article>
        <div className="prd-reader-signals" aria-label={ko ? "독자 선호 신호 요약" : "Reader preference signal summary"}>
          <header>
            <b>{ko ? "독자 신호 요약" : "Reader signal summary"}</b>
            <small>{ko ? "합성 데모 · 클릭 확률 아님" : "Synthetic demo · not click probabilities"}</small>
          </header>
          <section className="prd-mini-chart">
            <div><b>{ko ? "프로필 카테고리" : "Profile categories"}</b><small>{ko ? "상위 선호 가중치" : "Top affinity weights"}</small></div>
            {topProfileCategories(persona).map(([category, value]) => <p key={category}>
              <span>{t(categoryLabels[category])}</span><i><em style={{ width: `${value * 100}%` }} /></i><output>{Math.round(value * 100)}</output>
            </p>)}
          </section>
          <section className="prd-mini-chart is-publisher">
            <div><b>{ko ? "선호 매체" : "Publisher affinity"}</b><small>{ko ? "상위 매체 가중치" : "Top publisher weights"}</small></div>
            {persona.publishers.map((publisher) => <p key={publisher.name.en}>
              <span>{t(publisher.name)}</span><i><em style={{ width: `${publisher.value * 100}%` }} /></i><output>{Math.round(publisher.value * 100)}</output>
            </p>)}
          </section>
          <section className="prd-click-mix">
            <div><b>{ko ? "최근 클릭 구성" : "Recent click mix"}</b><small>{ko ? "최근 표본의 카테고리 비중" : "Category share in the recent sample"}</small></div>
            <p aria-label={ko ? "최근 클릭 카테고리 분포" : "Recent click category distribution"}>
              {persona.recentMix.map((item, index) => <i key={item.category} className={`is-tone-${index + 1}`} style={{ width: `${item.value * 100}%` }} />)}
            </p>
            <ul>{persona.recentMix.map((item, index) => <li key={item.category}><i className={`is-tone-${index + 1}`} />{t(categoryLabels[item.category])}<b>{Math.round(item.value * 100)}%</b></li>)}</ul>
          </section>
        </div>
        <div className="prd-recent">
          <b>{ko ? "최근 클릭한 기사" : "Recently clicked"}</b>
          <div className="prd-recent-list">
            {persona.recent.map((item, index) => <span key={item.en}><i>{index + 1}</i>{t(item)}</span>)}
          </div>
        </div>
      </section>

      <section className="prd-candidates" aria-labelledby="prd-candidate-title">
        <div className="prd-panel-heading">
          <span>02</span>
          <div><b id="prd-candidate-title">{ko ? "오늘의 후보 기사" : "Today's candidate stories"}</b><small>{ko ? "모든 모델에 동일한 후보 8개" : "The same eight candidates for every model"}</small></div>
        </div>
        <div className="prd-news-grid">
          {articles.map((article) => {
            const signals = signalsFor(persona, article);
            const active = selected.article.id === article.id;
            const inTrace = signals.E > 0;
            return <button key={article.id} type="button" className={active ? "is-selected" : ""} aria-pressed={active} onClick={() => setSelectedId(article.id)}>
              <span className="prd-news-visual" aria-hidden="true"><i>NEWS</i>{article.icon}</span>
              <span className="prd-news-copy">
                <small>{t(article.section)}</small>
                <span className="prd-news-meta">{t(article.source)} · {article.published} · {article.readTime} min</span>
                <span className={`prd-rec-status ${inTrace ? "is-yes" : "is-no"}`}>{inTrace ? (ko ? "추천 기록 있음" : "In retained trace") : (ko ? "추천 기록 없음" : "Not in retained trace")}</span>
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
            <span className="prd-model-symbol" aria-hidden="true">{modelCopy[key].icon}</span>
            <span className="prd-model-copy"><b>{modelCopy[key].name}</b><small>{t(modelCopy[key].label)}</small><i>{modelCopy[key].inputs}</i></span>
            {key === "complete" && <em>{ko ? "기본 모델" : "DEFAULT"}</em>}
          </button>)}
        </div>
        <div className="prd-model-card" key={model}>
          <div className="prd-model-icon" aria-hidden="true"><span>{modelCopy[model].icon}</span><sub>fθ</sub></div>
          <div><b>{modelCopy[model].name}</b><p>{t(modelCopy[model].detail)}</p></div>
        </div>
        <div className="prd-input-route" aria-label={ko ? "선택 모델의 입력 경로" : "Input route for the selected model"}>
          {(["P", "E", "C", "Z"] as const).map((key) => <span key={key} className={model === "control" && key !== "Z" ? "is-muted" : ""}>{key}</span>)}
          {model === "complete" && <span className="prd-interaction">ψ</span>}
          <i>→</i><b>s(x)</b>
        </div>
        <div className="prd-model-lens" key={`${model}-${selected.article.id}`}>
          <header>
            <div><small>{ko ? "현재 선택 기사" : "Selected story"}</small><b>{selected.article.icon} {t(selected.article.title)}</b></div>
            <span>{ko ? "기사·모델 선택 시 갱신" : "Updates with story and model"}</span>
          </header>
          <div className="prd-model-signal-list">
            {(Object.keys(selected.signals) as (keyof Signals)[]).map((key) => <p key={key} className={model === "control" && key !== "Z" ? "is-muted" : ""}>
              <b>{key}</b><span>{t(signalLabels[key])}</span><i><em style={{ width: `${Math.round(selected.signals[key] * 100)}%` }} /></i><output>{selected.signals[key].toFixed(2)}</output>
            </p>)}
            {model === "complete" && <p className="is-interaction"><b>ψ</b><span>{ko ? "P×C 상호작용" : "P×C interaction"}</span><i><em style={{ width: `${Math.round(selected.signals.P * selected.signals.C * 100)}%` }} /></i><output>{(selected.signals.P * selected.signals.C).toFixed(2)}</output></p>}
          </div>
          <footer>
            <div><small>{ko ? "현재 정렬 점수" : "Current ranking score"}</small><output>{selected.score.toFixed(3)}</output></div>
            <div><small>{ko ? "현재 예상 순위" : "Current rank"}</small><output>{ranked.findIndex((item) => item.article.id === selected.article.id) + 1}<i>/ {ranked.length}</i></output></div>
          </footer>
        </div>
        <a className="prd-model-next" href="#prd-output-title">
          <div><small>STEP 03 OUTPUT</small><b>{ko ? "후보별 점수가 준비됐습니다" : "Candidate scores are ready"}</b><span>{ko ? "아래 04 추천 순위에서 결과 확인" : "Continue to the Step 04 recommendation ranking"}</span></div>
          <i aria-hidden="true">↓</i>
        </a>
      </section>
    </div>

    <section className="prd-output" aria-labelledby="prd-output-title">
      <div className="prd-output-marker"><span aria-hidden="true">↓</span><div><b>RECOMMENDATION PREVIEW</b><em>{ko ? "선택한 독자와 모델로 만든 결과가 아래 순위로 이어집니다" : "The selected reader and model produce the ranking below"}</em></div></div>
      <header>
        <div className="prd-panel-heading">
          <span>04</span>
          <div><b id="prd-output-title">{ko ? `${t(persona.name)}를 위한 최종 순위` : `Final ranking for ${t(persona.name)}`}</b><small>{ko ? "모델 점수가 큰 기사부터 정렬" : "Sorted by descending model score"}</small></div>
        </div>
        <div className="prd-output-summary">
          <div className="prd-phone-preview" aria-hidden="true"><div><span>{persona.avatar}</span><i>PEC</i></div><p>{ranked.slice(0, 3).map((item) => <b key={item.article.id}>{item.article.icon}</b>)}</p></div>
          <div className="prd-winner"><span aria-hidden="true">{top.article.icon}</span><div><small>{ko ? "현재 1위 추천" : "Top recommendation"}</small><b>{t(top.article.title)}</b></div></div>
        </div>
      </header>
      <div className="prd-ranking-stage">
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
        <aside className="prd-reader-view" aria-label={ko ? "독자에게 보이는 추천 화면" : "Recommendation shown to the reader"}>
          <div className="prd-reader-view-label"><small>READER VIEW</small><b>{ko ? "추천이 이렇게 전달됩니다" : "How the ranking reaches the reader"}</b></div>
          <div className="prd-reader-view-flow">
            <div className="prd-reader-badge"><span aria-hidden="true">{persona.avatar}</span><b>{t(persona.name)}</b><small>{ko ? "선택한 독자" : "Selected reader"}</small></div>
            <i aria-hidden="true">→</i>
            <div className="prd-demo-phone">
              <header><b>PEC</b><span>{ko ? "맞춤 뉴스" : "For you"}</span></header>
              {ranked.slice(0, 3).map((item, index) => <div key={item.article.id} className={index === 0 ? "is-top" : ""}>
                <span aria-hidden="true">{item.article.icon}</span><p><small>#{index + 1} · {t(item.article.section)}</small><b>{t(item.article.title)}</b></p>
              </div>)}
            </div>
          </div>
          <p>{ko ? "왼쪽의 모델 점수가 실제 독자 화면의 기사 순서를 결정합니다." : "The model scores on the left determine the story order shown in the reader's feed."}</p>
        </aside>
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
        <div className="prd-total-score"><small>{ko ? "선택 기사 총점" : "Selected story score"}</small><output>{selected.score.toFixed(3)}</output><span>{ko ? `현재 ${ranked.findIndex((item) => item.article.id === selected.article.id) + 1}위 · 정렬용 점수` : `Rank ${ranked.findIndex((item) => item.article.id === selected.article.id) + 1} · ranking score`}</span></div>
        <p>{model === "control"
          ? (ko ? "이 모델은 P·E·C를 사용하지 않습니다. 인기와 최신성 같은 운영 정보가 순위를 주로 결정합니다." : "This model does not use P, E, or C. Operational signals such as popularity and recency drive the ranking.")
          : (ko ? `${t(persona.name)}의 프로필·이력과 이 기사의 관계가 후보별 입력이 됩니다. 네 값을 단순히 더한 것이 아니라, 선택한 모델의 규칙으로 점수 하나를 계산합니다.` : `The relationship between ${t(persona.name)} and this story becomes candidate-level input. The four values are not simply added; the selected model maps them to one ranking score.`)}</p>
      </aside>
    </section>
  </section>;
}
