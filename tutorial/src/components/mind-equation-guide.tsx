"use client";

import { useState, type ReactNode } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import "./mind-equation-guide.css";

type Topic = "profile" | "consumption" | "origin" | "controls" | "records";

function Formula({ tex }: { tex: string }) {
  return <div className="mxe-formula" dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { displayMode: true, throwOnError: false, strict: false }) }} />;
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return <section className="mxe-step"><span>{String(n).padStart(2, "0")}</span><div><h5>{title}</h5>{children}</div></section>;
}

function IOMap({ input, operation, output, role, lang }: { input: string; operation: string; output: string; role: string; lang: "ko" | "en" }) {
  const ko = lang === "ko";
  return <div className="mxe-io">
    <article><span>{ko ? "들어오는 것" : "INPUT"}</span><b>{input}</b></article><i>→</i>
    <article><span>{ko ? "계산이 하는 일" : "OPERATION"}</span><b>{operation}</b></article><i>→</i>
    <article><span>{ko ? "나오는 것" : "OUTPUT"}</span><b>{output}</b></article>
    <article className="mxe-io-role"><span>{ko ? "최종 용도" : "WHERE IT GOES"}</span><b>{role}</b></article>
  </div>;
}

export function MindEquationGuide({ lang }: { lang: "ko" | "en" }) {
  const ko = lang === "ko";
  const t = (a: string, b: string) => ko ? a : b;
  const [topic, setTopic] = useState<Topic>("profile");
  const tabs: { id: Topic; ko: string; en: string }[] = [
    { id: "profile", ko: "1 · P와 C mean", en: "1 · P and C mean" },
    { id: "consumption", ko: "2 · C 네 가지", en: "2 · Four C fields" },
    { id: "origin", ko: "3 · E와 곱", en: "3 · E and products" },
    { id: "controls", ko: "4 · Control 7개", en: "4 · Seven controls" },
    { id: "records", ko: "5 · 최종 입력 행", en: "5 · Final input rows" },
  ];

  return <section className="mxe" aria-labelledby="mxe-title">
    <header className="mxe-header">
      <span>MIND PUBLIC PROXY · STEP-BY-STEP CALCULATION</span>
      <h3 id="mxe-title">{t("MIND의 원자료 한 행이 21개 숫자가 되기까지", "How one MIND record becomes 21 numeric fields")}</h3>
      <p>{t("같은 P·E·C 글자를 쓰지만 private 계산을 복사한 것이 아닙니다. 아래에서는 원자료가 어디서 오고, 사용자마다 무엇을 한 번 만들며, 후보 기사마다 무엇을 다시 계산하는지 실제 숫자를 끝까지 대입합니다.", "The labels P, E, and C are reused, but the private calculations are not copied. Below, we identify each raw source, separate query-level work from candidate-level work, and substitute numbers through to the final features.")}</p>
    </header>

    <div className="mxe-plain">
      <span>{t("먼저 한 문장으로", "FIRST, IN ONE SENTENCE")}</span>
      <h4>{t("MIND에는 독립 stated profile이 없어서 이전 클릭 이력 하나에서 P와 C를 모두 만들고, 원래 impression slate 소속 여부를 E로 둡니다.", "MIND has no independent stated profile, so both P and C come from one prior-click history, while E records original-slate membership.")}</h4>
      <p>{t("P는 profile-like 요약, C는 후보와 개별 클릭 기사의 관계 요약입니다. 이름이 다르다고 원자료까지 독립적인 것은 아닙니다.", "P is a profile-like summary; C summarizes candidate-to-click relations. Different labels do not make their raw provenance independent.")}</p>
    </div>

    <div className="mxe-source-map">
      <article><span>behaviors.tsv · history</span><b>{t("이전 클릭 최대 30개", "Up to 30 prior clicks")}</b><p>{t("P 3개와 C 4개 생성", "Produces P 3 and C 4")}</p></article>
      <article><span>behaviors.tsv · slate</span><b>{t("원래 후보와 클릭 라벨", "Logged candidates and labels")}</b><p>{t("소속은 E, 클릭은 정답 y", "Membership becomes E; click becomes y")}</p></article>
      <article><span>news.tsv + training logs</span><b>{t("텍스트·분류·학습 측 통계", "Text, taxonomy, training statistics")}</b><p>{t("Control 7개와 기사 벡터", "Seven controls and article vectors")}</p></article>
      <article><span>derived fields</span><b>{t("이미 만든 값의 곱", "Products of existing values")}</b><p>{t("새 원자료가 아닌 product 6개", "Six products, not a new source")}</p></article>
    </div>

    <div className="mxe-boundary" role="note">
      <div><span>PRIVATE P</span><b>{t("별도로 저장된 stated profile", "Independently recorded stated profile")}</b><small>{t("프로필 텍스트와 후보 기사 비교", "Profile text compared with candidate")}</small></div>
      <i>≠</i>
      <div><span>MIND P PROXY</span><b>{t("이전 클릭에서 만든 profile-like 요약", "Profile-like summary derived from clicks")}</b><small>{t("C와 같은 history를 다른 방식으로 요약", "Another summary of the same history used by C")}</small></div>
    </div>

    <nav className="mxe-tabs" aria-label={t("MIND 계산 선택", "Choose a MIND calculation")}>
      {tabs.map(tab => <button type="button" key={tab.id} aria-pressed={topic === tab.id} onClick={() => setTopic(tab.id)}>{ko ? tab.ko : tab.en}</button>)}
    </nav>

    <div className="mxe-panel" aria-live="polite">
      {topic === "profile" && <>
        <div className="mxe-topic-head"><span>01 · HISTORY → P / C</span><h4>{t("세 번의 이전 클릭과 새 후보 하나를 끝까지 계산합니다", "Follow three prior clicks and one candidate through the full calculation")}</h4><p>{t("평균을 내면 숫자 하나가 아니라 같은 차원의 평균 벡터가 나옵니다. 그 벡터는 query마다 한 번 만들고, 후보가 바뀔 때마다 후보와의 유사도를 다시 계산합니다.", "Averaging vectors produces another vector of the same dimension, not one scalar. Build it once per query, then recompute alignment for each candidate.")}</p></div>
        <IOMap lang={lang} input={t("이전 클릭 벡터 3개 + 현재 후보 벡터", "Three prior-click vectors + candidate vector")} operation={t("이력을 평균·정규화하고 후보와 비교", "Average and normalize history, then compare candidate")} output={t("P 3개 + C mean 1개", "Three P fields + one C mean")} role={t("후보별 ExtraTrees 입력 행의 네 칸", "Four cells in the candidate's ExtraTrees row")} />

        <div className="mxe-symbols">
          <div><code>H</code><span>{t("현재 impression 전의 클릭 기사 목록", "Clicks before the current impression")}</span></div>
          <div><code>vⱼ</code><span>{t("이력의 j번째 기사 단위 벡터", "Unit vector for history article j")}</span></div>
          <div><code>vᵢ</code><span>{t("지금 점수화할 후보 기사 단위 벡터", "Unit vector for candidate i")}</span></div>
          <div><code>h̄</code><span>{t("이력 벡터들을 좌표별로 평균한 벡터", "Coordinate-wise mean history vector")}</span></div>
        </div>

        <Step n={1} title={t("설명용 2차원 기사 벡터를 놓습니다", "Start with teaching-scale 2D vectors")}>
          <p>{t("실제 BGE 벡터는 훨씬 길지만 계산 원리는 같습니다. 아래 세 이력 벡터와 후보 벡터는 모두 길이가 1입니다.", "Actual BGE vectors are much wider, but the arithmetic is the same. All vectors below have unit length.")}</p>
          <div className="mxe-data-table mxe-history-table">
            <div className="is-head"><b>{t("구분", "Item")}</b><b>{t("기사", "Article")}</b><b>{t("분류", "Taxonomy")}</b><b>{t("벡터", "Vector")}</b></div>
            <div><span>H₁</span><span>{t("기후 정책", "Climate policy")}</span><span>News / Politics</span><code>(1.0, 0.0)</code></div>
            <div><span>H₂</span><span>{t("금리 전망", "Interest-rate outlook")}</span><span>News / Economy</span><code>(0.8, 0.6)</code></div>
            <div><span>H₃</span><span>{t("축구 결과", "Football result")}</span><span>Sports / Football</span><code>(0.0, 1.0)</code></div>
            <div className="is-candidate"><span>i</span><span>{t("탄소세 법안", "Carbon-tax bill")}</span><span>News / Politics</span><code>(1.0, 0.0)</code></div>
          </div>
        </Step>

        <Step n={2} title={t("이력 벡터를 좌표별로 평균합니다", "Average history vectors coordinate by coordinate")}>
          <Formula tex={String.raw`\bar{\mathbf h}=\frac{(1,0)+(0.8,0.6)+(0,1)}{3}=(0.6,\,0.5333)`} />
          <p>{t("첫 좌표끼리 평균해 0.6, 둘째 좌표끼리 평균해 0.5333이 됩니다. 따라서 h̄는 숫자 하나가 아니라 2차원 벡터입니다. 실제 계산은 모든 BGE 좌표에서 똑같이 합니다.", "The first coordinates average to 0.6 and the second to 0.5333. Thus h̄ is a vector, not one number. The real calculation repeats this over every BGE coordinate.")}</p>
        </Step>

        <Step n={3} title={t("P를 위해 평균 이력의 방향만 남깁니다", "Normalize the mean history for P")}>
          <Formula tex={String.raw`\lVert\bar{\mathbf h}\rVert_2=\sqrt{0.6^2+0.5333^2}\approx0.8028,\qquad \widehat{\mathbf h}=\frac{\bar{\mathbf h}}{\lVert\bar{\mathbf h}\rVert_2}\approx(0.7474,\,0.6644)`} />
          <p>{t("0.8028은 평균 벡터의 길이입니다. 각 좌표를 그 길이로 나누면 길이가 1인 방향 벡터가 됩니다. 이 단계는 query마다 한 번입니다.", "The value 0.8028 is the mean vector's length. Dividing each coordinate by it leaves a unit-length direction. This is computed once per query.")}</p>
        </Step>

        <Step n={4} title={t("후보를 넣어 P alignment 한 칸을 만듭니다", "Insert the candidate to obtain one P alignment")}>
          <Formula tex={String.raw`p=\mathbf v_i^{\mathsf T}\widehat{\mathbf h}=(1,0)\cdot(0.7474,0.6644)=\mathbf{0.7474}`} />
          <p>{t("점곱은 같은 위치의 좌표를 곱해 더합니다. 후보가 바뀌면 vᵢ가 바뀌므로 p도 다시 계산됩니다. 이것이 P 블록 첫 번째 칸입니다.", "The dot product multiplies matching coordinates and sums them. A new candidate changes vᵢ and p. This is the first P field.")}</p>
        </Step>

        <Step n={5} title={t("같은 history로 C mean을 별도로 만듭니다", "Build C mean separately from the same history")}>
          <Formula tex={String.raw`s_{i1}=1.0,\quad s_{i2}=0.8,\quad s_{i3}=0.0,\qquad C_{\mathrm{mean}}=\frac{1.0+0.8+0.0}{3}=\mathbf{0.6000}`} />
          <p>{t("이번에는 이력을 먼저 합치지 않고 후보와 각 클릭 기사의 cosine을 세 번 구한 뒤 평균합니다. 그래서 p=0.7474와 C mean=0.6000은 값이 다릅니다.", "This path computes three candidate-history cosines before averaging. That is why p=0.7474 and C mean=0.6000 differ.")}</p>
          <Formula tex={String.raw`C_{\mathrm{mean}}=\lVert\bar{\mathbf h}\rVert_2\,p\approx0.8028\times0.7474=0.6000`} />
        </Step>

        <Step n={6} title={t("P의 나머지 두 칸과 최종 출력을 확인합니다", "Complete the remaining P fields and inspect the output")}>
          <div className="mxe-share-row"><article><span>P₂ · category share</span><b>2 / 3 = 0.6667</b><p>{t("후보와 같은 News가 이력 3개 중 2개", "Two of three history items share News")}</p></article><article><span>P₃ · subcategory share</span><b>1 / 3 = 0.3333</b><p>{t("후보와 같은 Politics가 이력 3개 중 1개", "One of three history items shares Politics")}</p></article></div>
          <div className="mxe-output-row"><span>{t("후보 i에 저장되는 값", "VALUES STORED FOR CANDIDATE i")}</span><b>P = [0.7474, 0.6667, 0.3333]</b><b>C<sub>mean</sub> = 0.6000</b></div>
          <p>{t("같은 query 안에서는 ‖h̄‖₂가 모든 후보에 공통이므로 p와 C mean은 후보 순서를 같게 만듭니다. 하지만 둘 다 같은 클릭 history에서 나온 값이므로 독립 stated-profile evidence와 behavioral evidence를 재현한 것은 아닙니다.", "Within one query, ‖h̄‖₂ is shared by every candidate, so p and C mean induce the same candidate ordering. Both derive from one click history, so they do not reproduce independent stated-profile and behavioral evidence.")}</p>
        </Step>
      </>}

      {topic === "consumption" && <>
        <div className="mxe-topic-head"><span>02 · ONE COSINE LIST → FOUR C FIELDS</span><h4>{t("같은 목록에서 전체·최고·상위 몇 개·가중 중심을 각각 봅니다", "Read one list as overall, strongest, top-few, and weighted evidence")}</h4><p>{t("C 네 칸은 서로 다른 질문에 답합니다. 아래 별도 예시는 후보 하나와 이력 기사 네 개의 cosine을 사용합니다.", "The four C fields answer different questions. This separate example uses four candidate-history cosines.")}</p></div>
        <IOMap lang={lang} input={t("후보–이력 cosine 네 개", "Four candidate-history cosines")} operation={t("평균·최댓값·상위 3개·softmax 가중평균", "Mean, maximum, top-three, and softmax-weighted mean")} output={t("C mean, C max, C top-3, C attention", "C mean, C max, C top-3, C attention")} role={t("후보별 C 블록 4개", "Four candidate-level C fields")} />

        <Step n={1} title={t("후보와 각 이력 기사의 cosine을 계산합니다", "Compute a cosine with every history item")}>
          <div className="mxe-cosine-strip"><div><span>H₁</span><b>0.78</b><small>{t("매우 비슷함", "very similar")}</small></div><div><span>H₂</span><b>0.62</b><small>{t("비슷함", "similar")}</small></div><div><span>H₃</span><b>0.20</b><small>{t("약한 관련", "weak relation")}</small></div><div><span>H₄</span><b>−0.10</b><small>{t("반대 방향", "opposite direction")}</small></div></div>
          <Formula tex={String.raw`\mathbf s_i=[0.78,\;0.62,\;0.20,\;-0.10]`} />
        </Step>

        <Step n={2} title={t("네 요약값을 같은 목록에서 계산합니다", "Compute four summaries from the same list")}>
          <div className="mxe-summary-table">
            <div className="is-head"><b>{t("필드", "Field")}</b><b>{t("계산", "Calculation")}</b><b>{t("값", "Value")}</b><b>{t("답하는 질문", "Question")}</b></div>
            <div><span>C mean</span><code>(.78+.62+.20−.10)/4</code><b>0.375</b><p>{t("전체 이력과 대체로 닮았나?", "Generally similar to the full history?")}</p></div>
            <div><span>C max</span><code>max(.78,.62,.20,−.10)</code><b>0.780</b><p>{t("강하게 닮은 기사 하나라도 있나?", "Is there one strong match?")}</p></div>
            <div><span>C top-3</span><code>(.78+.62+.20)/3</code><b>0.533</b><p>{t("가장 관련된 몇 개와 닮았나?", "Similar to the top few?")}</p></div>
            <div><span>C attention</span><code>Σ aⱼsᵢⱼ</code><b>≈ 0.715</b><p>{t("강한 일치를 더 크게 보면?", "What if stronger matches weigh more?")}</p></div>
          </div>
        </Step>

        <Step n={3} title={t("Attention의 비중을 숫자로 확인합니다", "Inspect the attention weights")}>
          <Formula tex={String.raw`a_{ij}=\frac{\exp(s_{ij}/0.18)}{\sum_k\exp(s_{ik}/0.18)},\qquad C_{\mathrm{attn}}=\sum_j a_{ij}s_{ij}`} />
          <div className="mxe-weight-table">
            <div className="is-head"><b>{t("이력", "History")}</b><b>s<sub>ij</sub></b><b>{t("안정화 후 exp", "Stabilized exp")}</b><b>{t("가중치 a", "Weight a")}</b></div>
            <div><span>H₁</span><span>0.78</span><span>1.000</span><b>0.686</b></div>
            <div><span>H₂</span><span>0.62</span><span>0.411</span><b>0.282</b></div>
            <div><span>H₃</span><span>0.20</span><span>0.040</span><b>0.027</b></div>
            <div><span>H₄</span><span>−0.10</span><span>0.008</span><b>0.005</b></div>
          </div>
          <p>{t("가장 큰 logit을 먼저 빼서 첫 exp를 1로 만들었습니다. 모든 logit에서 같은 수를 빼면 softmax 비율은 변하지 않습니다. 0.78과 0.62가 대부분의 비중을 가져 C attention이 약 0.715가 됩니다.", "The largest logit is subtracted first, making its exponential one. Subtracting the same value leaves softmax ratios unchanged. The 0.78 and 0.62 similarities dominate, placing C attention near 0.715.")}</p>
        </Step>
        <div className="mxe-private-public">
          <div><span>{t("Private C attention", "Private C attention")}</span><b>similarity + age decay</b><small>ρⱼ=exp(−age/30)</small></div>
          <div><span>{t("MIND C attention", "MIND C attention")}</span><b>similarity only</b><small>{t("목록 순서만 있어 정확한 클릭 시각 감쇠를 적용하지 않음", "No age decay because exact click timing is unavailable")}</small></div>
        </div>
        <p className="mxe-reading">{t("Private attention은 similarity와 기사 나이를 함께 보지만 MIND attention은 similarity만 봅니다. 빈 history이면 P 3개와 C 4개를 모두 0으로 둡니다.", "Private attention combines similarity and article age; MIND attention uses similarity only. Empty histories set all three P and four C fields to zero.")}</p>
      </>}

      {topic === "origin" && <>
        <div className="mxe-topic-head"><span>03 · CANDIDATE ORIGIN → E / PRODUCTS</span><h4>{t("E는 클릭 여부가 아니라 후보가 어디서 들어왔는지를 기록합니다", "E records where a candidate came from, not whether it was clicked")}</h4><p>{t("원래 logged slate의 후보는 E=1, 인기 기사 풀에서 추가한 후보는 E=0입니다. 클릭 정답 y는 별도 열이며 모델 입력에 넣지 않습니다.", "Original logged-slate candidates receive E=1; added candidates receive E=0. Click target y remains separate and is never an input field.")}</p></div>
        <IOMap lang={lang} input={t("후보의 slate 소속 + 이미 계산한 P/C", "Slate membership + existing P/C fields")} operation={t("E를 0/1로 기록하고 지정 좌표를 곱함", "Record E as 0/1 and multiply specified fields")} output={t("E 1개 + product 6개", "One E field + six products")} role={t("Direct에는 E, Full에는 E와 product", "E in Direct; E and products in Full")} />
        <Step n={1} title={t("E와 정답 y를 분리합니다", "Separate E from target y")}>
          <div className="mxe-origin-table">
            <div className="is-head"><b>{t("후보", "Candidate")}</b><b>{t("출처", "Origin")}</b><b>E</b><b>y</b><b>{t("뜻", "Reading")}</b></div>
            <div><span>A</span><span>{t("원래 slate", "Logged slate")}</span><b>1</b><b>1</b><p>{t("원래 후보이며 클릭됨", "Logged and clicked")}</p></div>
            <div><span>B</span><span>{t("원래 slate", "Logged slate")}</span><b>1</b><b>0</b><p>{t("원래 후보지만 미클릭", "Logged but not clicked")}</p></div>
            <div><span>C</span><span>{t("추가 후보", "Added candidate")}</span><b>0</b><b>0</b><p>{t("약한 음성; 실제 비노출 확인 아님", "Weak negative; non-exposure unverified")}</p></div>
          </div>
        <Formula tex={String.raw`e_i=\begin{cases}1,&i\in\text{original logged impression slate}\\0,&i\in\text{added candidate set}\end{cases}`} />
          <p>{t("A와 B는 E가 같아도 y가 다릅니다. 따라서 E는 클릭 라벨이 아닙니다. E=1도 사용자가 실제로 보았다는 인과적 exposure 증명이 아니라 slate에 기록됐다는 뜻입니다.", "A and B share E but have different y, so E is not a click label. E=1 records slate membership rather than verified examination or causal exposure.")}</p>
        </Step>
        <div className="mxe-private-public">
          <div><span>{t("Private E · 3개", "Private E · 3 fields")}</span><b>(E<sub>m</sub>, E<sub>r</sub>, E<sub>x</sub>)</b><small>{t("membership · reciprocal rank · combined E", "membership · reciprocal rank · combined E")}</small></div>
          <div><span>{t("MIND E · 1개", "MIND E · 1 field")}</span><b>slate membership</b><small>{t("원래 logged slate이면 1, 추가 후보이면 0", "1 for logged-slate items, 0 for added candidates")}</small></div>
        </div>
        <Step n={2} title={t("여섯 product는 기존 숫자의 고정 곱입니다", "The six products are fixed products of existing values")}>
        <Formula tex={String.raw`pe,\;C_{\mathrm{mean}}e,\;C_{\max}e,\;C_{\mathrm{attn}}e,\;pC_{\mathrm{mean}},\;pC_{\mathrm{attn}}`} />
          <p>{t("p=0.7474, C mean=0.6000, C max=0.7800, C attention=0.7150으로 놓고 E만 바꿔 봅니다.", "Hold p=0.7474, C mean=0.6000, C max=0.7800, and C attention=0.7150 while changing only E.")}</p>
          <div className="mxe-product-table">
            <div className="is-head"><b>{t("후보", "Candidate")}</b><b>p×E</b><b>Cmean×E</b><b>Cmax×E</b><b>Cattn×E</b><b>p×Cmean</b><b>p×Cattn</b></div>
            <div><span>E=1</span><span>0.7474</span><span>0.6000</span><span>0.7800</span><span>0.7150</span><span>0.4484</span><span>0.5344</span></div>
            <div><span>E=0</span><span>0</span><span>0</span><span>0</span><span>0</span><span>0.4484</span><span>0.5344</span></div>
          </div>
          <p>{t("E가 들어간 앞 네 곱은 추가 후보에서 0이지만 P×C 두 곱은 남습니다. 모두 새 원자료나 학습된 hidden feature가 아니라 계산으로 만든 파생 입력입니다.", "The four E-containing products become zero for added candidates, while the two P×C products remain. All are deterministic derived inputs, not new source data or learned hidden features.")}</p>
        </Step>
      </>}

      {topic === "controls" && <>
        <div className="mxe-topic-head"><span>04 · TRAINING STATISTICS / NEWS METADATA → CONTROLS</span><h4>{t("Control은 의미 유사도가 아니라 기사 통계와 길이 정보입니다", "Controls are article statistics and lengths, not semantic similarities")}</h4><p>{t("CTR과 impression 수는 학습 측 logged slate에서만 집계합니다. Development 클릭 라벨은 이 통계에 들어가지 않습니다.", "CTR and impression counts come only from training-side logged slates. Development labels never enter these statistics.")}</p></div>
        <IOMap lang={lang} input={t("학습 측 clicks/impressions + history·텍스트 길이", "Training clicks/impressions + history and text lengths")} operation={t("CTR smoothing + log(1+x) 압축", "CTR smoothing + log(1+x) compression")} output={t("공통 control 7개", "Seven shared controls")} role={t("모든 8·14·15·21 구성에 공통", "Shared by all 8/14/15/21 records")} />
        <Step n={1} title={t("CTR을 0이나 1로 과도하게 튀지 않게 완화합니다", "Smooth CTR away from sparse extremes")}>
        <Formula tex={String.raw`\mathrm{CTR}_{\mathrm{smooth}}=\frac{\mathrm{clicks}+1}{\mathrm{impressions}+2},\qquad z_{\mathrm{count}}=\log(1+x)`} />
        <div className="mxe-ctr-table">
          <div className="is-head"><b>{t("단위", "Key")}</b><b>{t("학습 측 원자료", "Training counts")}</b><b>{t("계산", "Calculation")}</b><b>{t("출력", "Output")}</b></div>
          <div><span>Article</span><span>9 clicks / 40 impr.</span><code>10/42</code><b>0.2381</b></div>
          <div><span>Category</span><span>120 / 800</span><code>121/802</code><b>0.1509</b></div>
          <div><span>Subcategory</span><span>18 / 80</span><code>19/82</code><b>0.2317</b></div>
          <div><span>{t("처음 보는 key", "Unseen key")}</span><span>0 / 0</span><code>1/2</code><b>0.5000</b></div>
        </div>
          <p>{t("미관측 key의 0.5는 ‘클릭 확률 50%’라는 모델 예측이 아니라 smoothing 기본값입니다.", "The 0.5 for an unseen key is a smoothing default, not a model prediction of 50% click probability.")}</p>
        </Step>
        <Step n={2} title={t("큰 count와 문자열 길이는 log(1+x)로 압축합니다", "Compress counts and text lengths with log(1+x)")}>
          <div className="mxe-log-table">
            <div className="is-head"><b>{t("필드", "Field")}</b><b>x</b><b>{t("계산", "Calculation")}</b><b>{t("출력", "Output")}</b></div>
            <div><span>Article impressions</span><span>40</span><code>ln(41)</code><b>3.7136</b></div>
            <div><span>History length</span><span>3</span><code>ln(4)</code><b>1.3863</b></div>
            <div><span>Title characters</span><span>22</span><code>ln(23)</code><b>3.1355</b></div>
            <div><span>Abstract characters</span><span>120</span><code>ln(121)</code><b>4.7958</b></div>
          </div>
          <p>{t("로그는 순서는 유지하면서 큰 수 사이의 간격을 줄입니다. 제목과 초록은 단어 수가 아니라 runner가 읽은 문자열의 문자 수입니다.", "The logarithm preserves ordering while shrinking large gaps. Title and abstract lengths count characters in the runner's strings, not words.")}</p>
        </Step>
        <Step n={3} title={t("최종 control 7개의 정확한 순서를 확인합니다", "Inspect the ordered seven-field control block")}>
        <div className="mxe-control-list">
          <span>1 · Article CTR</span><span>2 · log article impressions</span><span>3 · Category CTR</span><span>4 · Subcategory CTR</span><span>5 · log history length</span><span>6 · log title characters</span><span>7 · log abstract characters</span>
        </div>
        <p>{t("이 일곱 값은 모든 MIND 모델 구성에 공통입니다. 의미 기반 P/C나 E를 제거해도 이 context는 남습니다.", "These seven fields are shared by every MIND record. They remain when semantic P/C or E is removed.")}</p>
        </Step>
      </>}

      {topic === "records" && <>
        <div className="mxe-topic-head"><span>05 · BLOCKS → ONE CANDIDATE ROW</span><h4>{t("후보 하나의 숫자를 어떤 조합으로 ExtraTrees에 넣는지 봅니다", "Assemble one candidate's numbers into the compared ExtraTrees rows")}</h4><p>{t("8·14·15·21은 embedding 차원이 아니라 후보 한 행의 스칼라 피처 개수입니다. 각 구성은 별도 ExtraTrees를 학습하고 validation으로 설정을 선택합니다.", "The widths 8, 14, 15, and 21 count scalar fields, not embedding dimensions. Each record fits and selects its own ExtraTrees model.")}</p></div>
        <IOMap lang={lang} input={t("Control 7 + P 3 + E 1 + C 4 + product 6", "Controls 7 + P 3 + E 1 + C 4 + products 6")} operation={t("질문에 맞는 블록만 이어 붙임", "Concatenate the blocks named by each comparison")} output={t("후보당 8·14·15·21개 입력 행", "An 8/14/15/21-field row per candidate")} role={t("구성마다 독립적으로 선택한 ExtraTrees 입력", "Input to independently selected ExtraTrees fits")} />

        <Step n={1} title={t("각 블록이 몇 칸인지 고정합니다", "Fix the width of each block")}>
          <div className="mxe-block-strip"><div className="is-z"><b>Controls</b><span>7</span><small>{t("CTR·count·길이", "CTR, counts, lengths")}</small></div><div className="is-p"><b>P</b><span>3</span><small>{t("alignment·분류 비율", "alignment and shares")}</small></div><div className="is-e"><b>E</b><span>1</span><small>slate membership</small></div><div className="is-c"><b>C</b><span>4</span><small>{t("이력 유사도 요약", "history summaries")}</small></div><div className="is-x"><b>Products</b><span>6</span><small>{t("고정 곱", "fixed products")}</small></div></div>
        </Step>

        <Step n={2} title={t("네 입력 구성을 한 줄씩 읽습니다", "Read the four input records one line at a time")}>
          <div className="mxe-record-table">
            <div className="is-head"><b>{t("모델 이름", "Record")}</b><b>{t("들어가는 블록", "Included blocks")}</b><b>{t("계산", "Width calculation")}</b><b>{t("총 칸", "Width")}</b></div>
            <div><span>Controls + E</span><span>Controls · E</span><code>7 + 1</code><b>8</b></div>
            <div><span>P + C Direct</span><span>Controls · P · C</span><code>7 + 3 + 4</code><b>14</b></div>
            <div><span>P + E + C Direct</span><span>Controls · P · E · C</span><code>7 + 3 + 1 + 4</code><b>15</b></div>
            <div><span>Full PEC proxy</span><span>Controls · P · E · C · Products</span><code>15 + 6</code><b>21</b></div>
          </div>
          <p>{t("Direct는 P/E/C를 별도 칸으로 보존하되 product를 넣지 않는다는 뜻입니다. Full은 같은 15개 Direct 입력에 product 6개만 더합니다.", "Direct preserves P/E/C in separate coordinates without products. Full adds six products to the same 15 Direct fields.")}</p>
        </Step>

        <Step n={3} title={t("화살표마다 어떤 질문을 묻는지 읽습니다", "Read the question behind each arrow")}>
          <div className="mxe-question-table">
            <article><span>8 → 15</span><b>{t("P/C 추가", "Add P/C")}</b><p>{t("E와 Controls는 유지하고 P 3개와 C 4개 추가", "Hold E and controls; add P 3 and C 4")}</p></article>
            <article><span>14 → 15</span><b>{t("E 추가", "Add E")}</b><p>{t("P/C와 Controls는 유지하고 E 1개 추가", "Hold P/C and controls; add E 1")}</p></article>
            <article><span>15 → 21</span><b>{t("Product 추가", "Add products")}</b><p>{t("동일 P/E/C 위에 고정 곱 6개 추가", "Hold P/E/C; add six products")}</p></article>
            <article><span>8 → 21</span><b>{t("전체 비교", "Full contrast")}</b><p>{t("P/C와 product가 함께 달라지는 feature-set 비교", "Feature-set contrast changing P/C and products")}</p></article>
          </div>
        </Step>

        <div className="mxe-warning"><b>{t("8 → 14 → 15 → 21의 순차 사다리가 아닙니다", "This is not a sequential 8 → 14 → 15 → 21 ladder")}</b><p>{t("8개에는 E가 있지만 14개에는 E가 없습니다. 8에서 14로 가는 것은 단순 추가가 아니라 E를 빼고 P/C를 넣는 교체입니다. 논문은 위에 적은 짝을 각각 비교합니다.", "The 8-field record contains E while the 14-field record does not. Moving from 8 to 14 would replace E with P/C rather than simply add fields. The paper uses the named pairwise contrasts above.")}</p></div>
      </>}
    </div>

    <footer className="mxe-footer">
      <b>{t("한 줄 경계", "Interpretive boundary")}</b>
      <span>{t("MIND 실험은 공개 필드에 맞춘 interface proxy이며, private 데이터의 독립 stated profile과 25개 schema를 복제한 실험이 아닙니다.", "The MIND experiment is an interface proxy mapped to public fields, not a replication of the private data's independent stated profile or 25-field schema.")}</span>
      <a href="#mind-data">{t("원자료부터 MIND 전체 경로 보기 →", "Follow the full MIND path from source records →")}</a>
    </footer>
  </section>;
}
