import { useEffect, useState } from "react";
import { MindDataMicroscope } from "./mind-data-microscope";
import { MindWorkedExample } from "./mind-worked-example";

type Lang = "ko" | "en";
const steps = [
  { id: "mind-data", ko: "원자료", en: "Records" },
  { id: "mind-pool", ko: "후보 구성", en: "Candidates" },
  { id: "mind-inputs", ko: "입력 피처", en: "Features" },
  { id: "mind-models", ko: "학습과 평가", en: "Fit & evaluate" },
  { id: "mind-results", ko: "결과 읽기", en: "Interpretation" },
];
const artifact = "https://anonymous.4open.science/r/pec-fuse-ranking-9F34";
function stepFromHash() {
  const index = steps.findIndex(step => `#${step.id}` === window.location.hash);
  return index < 0 ? 0 : index;
}

export function MindJourney({ lang }: { lang: Lang }) {
  const t = (ko: string, en: string) => lang === "ko" ? ko : en;
  const [step, setStep] = useState(stepFromHash);
  const [candidate, setCandidate] = useState(0);
  useEffect(() => {
    const followHash = () => {
      if (window.location.hash === "#mind-guide" || steps.some(item => `#${item.id}` === window.location.hash)) setStep(stepFromHash());
    };
    let frame = 0;
    const update = () => {
      frame = 0;
      const offset = (document.querySelector(".research-header")?.getBoundingClientRect().height ?? 56) + 32;
      let current = 0;
      steps.forEach((item, index) => { const node = document.getElementById(item.id); if (node && node.getBoundingClientRect().top <= offset) current = index; });
      setStep(current);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("hashchange", followHash);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("hashchange", followHash); window.removeEventListener("scroll", onScroll); };
  }, []);
  const examples = [
    { id: "A", member: 1, label: 1, origin: t("원래 slate · 클릭", "Original slate · clicked") },
    { id: "B", member: 1, label: 0, origin: t("원래 slate · 미클릭", "Original slate · not clicked") },
    { id: "C", member: 0, label: 0, origin: t("추가 후보 · 약한 음성", "Added candidate · weak negative") },
  ];
  const selected = examples[candidate];

  return <>
    <header className="mj-heading">
      <span>PUBLIC DATA / MINDsmall</span>
      <h2>{t("기사 한 건이 MIND의 입력과 순위가 되기까지", "Follow one article from MIND records to ranking")}</h2>
      <p>{t("한 사용자와 후보 A·B·C를 따라가며 원자료, 숫자 특성과 순위를 확인한 뒤 실제 논문 결과와 연결합니다.", "Follow one reader and candidates A, B, and C from source records to numeric features and ranking, then connect the worked example to the reported experiment.")}</p>
      <div className="mj-contrast"><div><b>Private</b><span>{t("사용자–날짜 질의 · complete 25개 입력", "User-date query · complete 25-field record")}</span></div><div><b>MIND</b><span>{t("Impression 단위 질의 · full proxy 21개 입력", "Impression-level query · full 21-field proxy")}</span></div></div>
    </header>
    <nav className="mj-steps" aria-label={t("MIND 설명 단계", "MIND walkthrough steps")}>
      {steps.map((item, index) => <a key={item.id} href={`#${item.id}`} aria-current={step === index ? "step" : undefined}><span>0{index + 1}</span><b>{t(item.ko, item.en)}</b></a>)}
    </nav>

    <section id="mind-data" className="mj-panel" aria-labelledby="mind-data-title">
      <h3 id="mind-data-title">{t("01. 한 사람의 클릭 이력에서 시작합니다", "01. Start with one reader and three prior clicks")}</h3>
      <MindWorkedExample lang={lang} step={0} candidate={candidate} onCandidate={setCandidate} />
      <MindDataMicroscope lang={lang} />
      <details className="mj-reference"><summary>{t("더 깊이 보기: 원자료와 P·C·E의 출처", "Go deeper: source records and the origins of P, C, and E")}</summary>
      <p>{t("MINDsmall의 behaviors.tsv 한 행에는 사용자 ID, 시각, 이전 클릭 이력, 그리고 그 impression의 기사 후보와 클릭 라벨이 들어 있습니다. 같은 사용자의 다른 impression은 별도 질의이며, 각 질의 안에서만 순위를 매깁니다.", "A row in MINDsmall's behaviors.tsv contains the user ID, timestamp, prior click history, and that impression's candidates and click labels. Different impressions from the same user remain separate ranking queries.")}</p>
      <div className="mj-source-grid">
        <article><code>behaviors.tsv</code><h4>{t("이전에 클릭한 기사 ID", "Prior clicked article IDs")}</h4><p>{t("기록된 이력의 마지막 30개 클릭을 사용하며 반복 클릭도 유지합니다. 독립적으로 작성된 프로필은 없습니다.", "Use the last 30 listed pre-impression clicks, retaining repeated events. There is no independently stated profile.")}</p><strong>{t("같은 history → P와 C", "One history → both P and C")}</strong></article>
        <article><code>behaviors.tsv</code><h4>{t("원래 후보 slate와 라벨", "Original slate and labels")}</h4><p>{t("Slate 소속은 입력 E를 만들고, 클릭 라벨 y는 학습과 평가에 쓰입니다. y 자체는 입력 피처에 넣지 않습니다.", "Slate membership supplies input E; click label y supervises fitting and evaluation. The label itself is not an input feature.")}</p><strong>{t("후보 소속 → E / 클릭 → y", "Membership → E / click → y")}</strong></article>
        <article><code>news.tsv</code><h4>{t("기사 텍스트와 분류", "Article text and categories")}</h4><p>{t("제목·초록·카테고리·세부 카테고리를 기사 ID로 연결합니다. 고정 BGE 벡터는 의미 유사도에, 분류와 길이는 해당 피처에 쓰입니다.", "Join title, abstract, category, and subcategory by article ID. Fixed BGE vectors supply semantic similarities; categories and lengths supply their respective fields.")}</p><strong>{t("후보와 이력을 같은 기사 표현으로 연결", "Represent candidates and history in the same article space")}</strong></article>
      </div>
      <aside className="mj-note"><b>{t("먼저 구분할 것", "First distinction")}</b><p>{t("P는 여기서 실제 stated profile이 아니라 history-derived profile proxy입니다. E도 private의 membership·역순위·결합 점수 3개가 아니라, 원래 slate에 있었는지 나타내는 1개 입력입니다.", "P is a history-derived profile proxy, not a stated profile. E is one original-slate membership field, not the private block's three membership, reciprocal-rank, and combined-score fields.")}</p></aside>
          </details>
    </section>

    <section id="mind-pool" className="mj-panel" aria-labelledby="mind-pool-title">
      <h3 id="mind-pool-title">{t("02. 후보의 출처 E와 정답 y를 분리합니다", "02. Separate candidate origin E from target y")}</h3>
      <MindWorkedExample lang={lang} step={1} candidate={candidate} onCandidate={setCandidate} />
      <details className="mj-reference"><summary>{t("더 깊이 보기: 후보 추출과 약한 음성 라벨", "Go deeper: candidate sampling and weak-negative labels")}</summary>
      <div className="mj-pool-flow"><div><span>01</span><b>{t("원래 slate", "Logged slate")}</b><p>{t("원래 클릭·미클릭 후보와 라벨 유지", "Retain original clicked and unclicked candidates and their labels")}</p></div><div><span>02</span><b>{t("추가 후보 추출", "Sample additions")}</b><p>{t("학습 측 impression 빈도 상위 5,000개 기사에서 최대 10개를 균등 비복원 추출", "Up to ten uniform draws without replacement from the 5,000 most-impressed training-side articles")}</p></div><div><span>03</span><b>{t("확장 후보군", "Expanded pool")}</b><p>{t("원래 slate 전체와 전체 listed history의 기사는 추출 대상에서 제외", "Exclude the entire logged slate and entire listed history from the draws")}</p></div></div>
      <p className="mj-caption">{t("아래 세 기사는 구조를 설명하는 합성 예시입니다. 실제 평가 행이나 보고된 예측값이 아닙니다.", "The three articles below are a synthetic structural example, not evaluation rows or reported predictions.")}</p>
      <div className="mj-candidates" role="group" aria-label={t("예시 후보 선택", "Select an example candidate")}>{examples.map((item, index) => <button type="button" key={item.id} aria-pressed={candidate === index} onClick={() => setCandidate(index)}><b>{t("기사", "Article")} {item.id}</b><span>{item.origin}</span><code>E={item.member} · y={item.label}</code></button>)}</div>
      <div className="mj-candidate-detail" aria-live="polite"><strong>{t("선택 후보", "Selected candidate")} {selected.id}</strong><p>{selected.member === 0 ? t("E=0은 추가 추출한 후보라는 뜻입니다. y=0은 평가 풀을 구성하면서 부여한 약한 음성 라벨이며, 실제로 노출 후 클릭하지 않았음을 확인한 값이 아닙니다.", "E=0 identifies an added candidate. Its y=0 is an assigned weak-negative label, not a verified nonclick following an exposure.") : t(`E=1은 원래 slate 소속이라는 뜻입니다. 이 후보의 원래 클릭 라벨은 y=${selected.label}로 유지됩니다. E만으로 클릭 여부가 정해지지는 않습니다.`, `E=1 identifies membership in the original slate. Its original click label y=${selected.label} is retained. Membership alone does not determine whether it was clicked.`)}</p></div>
      <aside className="mj-note"><b>{t("왜 이 구분이 필요한가요?", "Why does this distinction matter?")}</b><p>{t("추가 후보는 모두 y=0이므로 E는 후보의 출처와 라벨 분포에 관련된 신호입니다. 따라서 표준 MIND leaderboard나 인과적 노출 효과가 아니라, 이 고정 expanded-pool 설정에서의 비교로 읽습니다.", "All added candidates receive y=0, so E carries candidate-origin information associated with the label distribution. Read the results as comparisons within this fixed expanded pool, not standard MIND leaderboard scores or causal exposure effects.")}</p></aside>
          </details>
    </section>

    <section id="mind-inputs" className="mj-panel" aria-labelledby="mind-inputs-title">
      <h3 id="mind-inputs-title">{t("03. 같은 후보를 실제 숫자 칸으로 바꿉니다", "03. Turn the same candidate into numeric fields")}</h3>
      <MindWorkedExample lang={lang} step={2} candidate={candidate} onCandidate={setCandidate} />
      <details className="mj-reference"><summary>{t("더 깊이 보기: 입력 구성과 P·C의 관계", "Go deeper: feature records and the P/C relationship")}</summary>
      <p>{t("공통 controls 7개에 history-derived P 3개, C 4개, slate membership E 1개, 고정 곱 6개를 조합합니다. 8→14→15→21의 단일 추가 순서가 아닙니다. P/C를 볼 때는 8↔15, E를 볼 때는 14↔15, 곱을 볼 때는 15↔21을 비교합니다.", "Combine seven shared controls with three history-derived P fields, four C fields, one E membership field, and six fixed products. This is not a single 8→14→15→21 addition chain: compare 8↔15 for P/C, 14↔15 for E, and 15↔21 for products.")}</p>
      <p>{t("p는 정규화한 평균 이력 방향과 후보의 cosine이며, C mean은 후보와 각 이력 기사의 cosine을 평균한 값입니다.", "p is the candidate cosine with the normalized mean-history direction; C mean averages the candidate's cosines with individual history articles.")} C<sub>mean</sub> = ‖h̄‖₂ p. {t("평균 이력의 크기가 0이 아니면 같은 query 안에서 두 값은 동일한 후보 순서를 만듭니다. C mean에는 이력 집중도 크기가 남습니다. 빈 이력의 P/C는 0으로 처리합니다.", "For nonzero mean-history norm, the fields induce the same within-query ordering; C mean retains the history-concentration magnitude. Empty-history P/C fields are set to zero.")}</p>
          </details>
    </section>

    <section id="mind-models" className="mj-panel" aria-labelledby="mind-models-title">
      <h3 id="mind-models-title">{t("04. 피처를 점수로, 점수를 순위로 바꿉니다", "04. From features to scores, from scores to ranks")}</h3>
      <MindWorkedExample lang={lang} step={3} candidate={candidate} onCandidate={setCandidate} />
      <details className="mj-reference"><summary>{t("더 깊이 보기: 학습·검증·평가와 벡터 캐시", "Go deeper: fitting, validation, evaluation, and vector caches")}</summary>
      <div className="mj-model-flow"><article><span>{t("고정", "FIXED")}</span><h4>BGE-M3 / BGE-base</h4><p>{t("저장된 정규화 기사 벡터를 사용합니다. 이 실험에서 텍스트 인코더를 새로 학습하거나 end-to-end로 미세조정하지 않습니다.", "Use archived normalized article vectors. This experiment neither trains the text encoder anew nor fine-tunes it end to end.")}</p></article><article><span>{t("계산", "COMPUTED")}</span><h4>{t("8 / 14 / 15 / 21개 피처", "8 / 14 / 15 / 21 fields")}</h4><p>{t("Cosine, 이력 비율, slate membership, controls와 곱을 계산합니다. Raw float32 입력을 사용하며 학습된 scaler는 적용하지 않습니다.", "Compute cosines, history shares, slate membership, controls, and products. Inputs are raw float32 features, without a fitted scaler.")}</p></article><article><span>{t("학습", "FITTED")}</span><h4>ExtraTrees</h4><p>{t("각 입력 구성마다 공통 4개 설정을 탐색하고 검증 NDCG@10으로 선택합니다. 모델의 학습과 선택은 구성별로 수행합니다.", "Search the same four configurations for each input record and select by validation NDCG@10. Fits and configuration selection are performed per record.")}</p></article></div>
      <aside className="mj-note"><b>{t("인코더를 바꿀 때 달라지는 것", "What changes with the encoder")}</b><p>{t("캐시된 인코더를 바꾸면 의미 기반 P/C 값과 그 파생 곱이 달라집니다. 공통 control 7개, 카테고리 비율, E는 그대로입니다. 임베딩을 쓰지 않는 Controls+E 결과는 두 인코더에서 재사용하고, 나머지 구성은 인코더별로 학습·선택합니다.", "Changing the cached encoder changes semantic P/C values and their derived products, not the seven controls, category shares, or E. The embedding-free Controls+E result is reused across encoders; the other configurations are fitted and selected for each encoder.")}</p></aside>
      <ol className="mj-timeline"><li><b>{t("51,000 fitting + 9,000 validation", "51,000 fitting + 9,000 validation")}</b><p>{t("첫 60,000개 train 행을 시각순으로 정렬해 분할합니다. 선택 단계의 CTR 통계와 추가 후보 추출 대상은 fitting 51,000개에서만 만듭니다.", "Sort the first 60,000 train rows chronologically and split them. Selection-stage CTR statistics and the candidate-sampling universe use only the 51,000 fitting rows.")}</p></li><li><b>{t("60,000개 train으로 refit", "Refit on all 60,000 train rows")}</b><p>{t("선택한 설정으로 다시 학습하고 통계·추출 대상도 train 전체에서 다시 만듭니다. Development 라벨은 피처 통계에 사용하지 않습니다.", "Refit the selected configuration and rebuild statistics and the sampling universe from all training rows. Development labels never enter feature statistics.")}</p></li><li><b>{t("30,000개 development impression 평가", "Evaluate 30,000 development impressions")}</b><p>{t("동일한 고정 후보군에서 질의 내 순위를 매겨 NDCG@10·Recall@10·MRR을 계산합니다. BGE-base는 인코더 민감도 비교이며 private의 neural challenger와는 별개입니다.", "Rank within each query in the same fixed pool and compute NDCG@10, Recall@10, and MRR. BGE-base checks encoder sensitivity; it is separate from the private neural challenger.")}</p></li></ol>
      <details className="mj-math"><summary>{t("실행 범위와 입력 캐시", "Execution scope and vector caches")}</summary><p>{t("공개 runner는 지정된 BGE 캐시 벡터 이후의 평가를 실행합니다. 벡터 캐시는 배포하지 않으며 runner가 임베딩을 재생성하지도 않습니다. Aggregate와 protocol은 공개되어 있습니다.", "The public runner evaluates from the specified cached BGE vectors onward. The caches are not distributed, and the runner does not regenerate embeddings. Aggregate results and the protocol are public.")}</p><code>scripts/run_mind_expanded_membership.py</code><p><a href={`${artifact}/docs/MIND_PROXY_PROTOCOL.md`}>{t("캐시 요구사항과 프로토콜 →", "Cache requirements and protocol →")}</a></p></details>
          </details>
    </section>

    <section id="mind-results" className="mj-panel" aria-labelledby="mind-results-title">
      <h3 id="mind-results-title">{t("05. 실습을 마치고 실제 논문 결과를 읽습니다", "05. Leave the toy example and read the reported results")}</h3>
      <MindWorkedExample lang={lang} step={4} candidate={candidate} onCandidate={setCandidate} />
      <details className="mj-reference"><summary>{t("더 깊이 보기: 모델 간 비교와 불확실성", "Go deeper: model contrasts and uncertainty")}</summary>
      <div className="mj-question-list">{[
        ["8 → 15", t("E를 유지하고 P/C를 더하면?", "What does P/C add with E retained?"), "Controls+E → P+E+C Direct"],
        ["14 → 15", t("P/C를 유지하고 E를 더하면?", "What does E add with P/C retained?"), "P+C Direct → P+E+C Direct"],
        ["15 → 21", t("동일 P/E/C 위에 곱 6개를 더하면?", "What do six products add over the same P/E/C?"), "P+E+C Direct → Full PEC proxy"],
        ["8 → 21", t("최소 control 구성과 Full은 얼마나 다른가?", "How does Full compare with Controls+E?"), "Controls+E → Full PEC proxy"],
      ].map(([width, question, endpoints]) => <article key={width}><code>{width}</code><div><h4>{question}</h4><p>{endpoints}</p></div></article>)}</div>
      <p>{t("두 인코더 모두에서 Full은 Direct보다 높은 NDCG@10을 보였고, 그 차이의 명목 사용자 군집 95% 구간은 0보다 위입니다. 이는 평가한 expanded pool에서의 explicit-product 이득이며, private 비교에서 그 추가 이득이 확립됐다는 뜻은 아닙니다.", "With both encoders, Full exceeds Direct in NDCG@10 and its nominal user-clustered 95% interval lies above zero. This supports an explicit-product gain in the evaluated expanded pool; it does not establish that extra gain in the private comparisons.")}</p>
      <aside className="mj-note"><b>{t("점수 차이와 독립 기여는 다릅니다", "Score differences are not independent contributions")}</b><p>{t("일부 차이는 산술적으로 더해지지만, 모델은 각각 선택되고 입력 추가는 남은 블록에 조건부입니다. 10,000회 사용자 군집 bootstrap 구간은 고정 모델·후보군에 조건부이며 학습 seed나 후보 재추출 변동은 포함하지 않습니다.", "Some differences add algebraically, but fits are selected separately and additions are conditional on retained blocks. The 10,000-replicate user-cluster bootstrap conditions on fixed fits and candidates; it excludes training-seed and candidate-reselection variability.")}</p></aside>
      <a className="mj-result-link" href={`?view=tutorial&lang=${lang}&comparison=mind#atlas`}>{t("실험 09: 피처별 비교와 실제 결과 열기 →", "Open experiment 09: feature comparisons and reported results →")}</a>
      <div className="mj-sources"><a href={`${artifact}/docs/MIND_PROXY_PROTOCOL.md`}>{t("설계·절차", "Design & procedure")}</a><a href={`${artifact}/access/data/mind_expanded_protocol.json`}>{t("정확한 필드·설정", "Exact fields & settings")}</a><a href={`${artifact}/access/data/mind_expanded_results.csv`}>{t("원본 aggregate 결과", "Aggregate results")}</a></div>
          </details>
    </section>
    <nav className="mj-pagination" aria-label={t("MIND 단계 이동", "MIND step navigation")}>
      {step > 0 ? <a href={`#${steps[step - 1].id}`}>← {t(steps[step - 1].ko, steps[step - 1].en)}</a> : <span />}
      <span>{step + 1} / {steps.length}</span>
      {step < steps.length - 1 ? <a href={`#${steps[step + 1].id}`}>{t(steps[step + 1].ko, steps[step + 1].en)} →</a> : <a href={`?view=tutorial&lang=${lang}&comparison=mind#atlas`}>{t("결과 비교", "Compare results")} →</a>}
    </nav>
  </>;
}
