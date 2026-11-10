"use client";

import { useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import "./mind-equation-guide.css";

type Topic = "profile" | "consumption" | "origin" | "controls" | "records";

function Formula({ tex }: { tex: string }) {
  return <div className="mxe-formula" dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { displayMode: true, throwOnError: false, strict: false }) }} />;
}

export function MindEquationGuide({ lang }: { lang: "ko" | "en" }) {
  const ko = lang === "ko";
  const t = (a: string, b: string) => ko ? a : b;
  const [topic, setTopic] = useState<Topic>("profile");
  const tabs: { id: Topic; ko: string; en: string }[] = [
    { id: "profile", ko: "P proxy와 C mean", en: "P proxy and C mean" },
    { id: "consumption", ko: "C 요약 4개", en: "Four C summaries" },
    { id: "origin", ko: "E와 곱 피처", en: "E and products" },
    { id: "controls", ko: "CTR와 control", en: "CTR and controls" },
    { id: "records", ko: "8 · 14 · 15 · 21", en: "8 · 14 · 15 · 21" },
  ];

  return <section className="mxe" aria-labelledby="mxe-title">
    <header className="mxe-header">
      <span>MIND PUBLIC PROXY · FORMULA CROSSWALK</span>
      <h3 id="mxe-title">{t("MIND에서는 같은 P·E·C 글자가 어떻게 다시 정의되는가", "How P, E, and C are redefined in the MIND proxy")}</h3>
      <p>{t("Private 계산을 그대로 복사한 것이 아닙니다. MIND에서 실제로 제공되는 클릭 이력과 impression slate에 맞춰 각 블록을 다시 정의합니다. 아래 값 하나하나가 최종 ExtraTrees에 들어가는 스칼라 피처입니다.", "This is not a copy of the private schema. Each block is redefined around the click history and impression slate that MIND actually provides. Every output below is a scalar feature supplied to ExtraTrees.")}</p>
    </header>

    <div className="mxe-boundary" role="note">
      <div><span>{t("Private P", "Private P")}</span><b>{t("독립적으로 저장된 stated profile", "Independently recorded stated profile")}</b></div>
      <i>≠</i>
      <div><span>{t("MIND P proxy", "MIND P proxy")}</span><b>{t("이전 클릭 history에서 만든 profile-like 요약", "Profile-like summary derived from prior clicks")}</b></div>
      <p>{t("따라서 MIND의 P와 C는 서로 독립적인 출처가 아닙니다. 둘 다 같은 클릭 이력 H에서 나오며, 요약 방식만 다릅니다.", "MIND P and C are therefore not independent sources. Both come from the same click history H and differ only in how that history is summarized.")}</p>
    </div>

    <nav className="mxe-tabs" aria-label={t("MIND 계산 선택", "Choose a MIND calculation")}>
      {tabs.map(tab => <button type="button" key={tab.id} aria-pressed={topic === tab.id} onClick={() => setTopic(tab.id)}>{ko ? tab.ko : tab.en}</button>)}
    </nav>

    <div className="mxe-panel" aria-live="polite">
      {topic === "profile" && <>
        <h4>{t("같은 클릭 이력에서 P proxy와 C mean을 만드는 두 경로", "Two paths from the same click history to P proxy and C mean")}</h4>
        <Formula tex={String.raw`\bar{\mathbf h}=\frac{1}{|H|}\sum_{j\in H}\mathbf v_j,\qquad p=\frac{\mathbf v_i^{\mathsf T}\bar{\mathbf h}}{\lVert\bar{\mathbf h}\rVert_2},\qquad C_{\mathrm{mean}}=\frac{1}{|H|}\sum_{j\in H}\mathbf v_i^{\mathsf T}\mathbf v_j`} />
        <div className="mxe-route">
          <article><span>{t("공통 입력", "SHARED INPUT")}</span><b>{t("최대 30개 이전 클릭 기사 벡터", "Up to 30 prior-click article vectors")}</b><small>H = {"{"}v₁, …, vⱼ{"}"}</small></article>
          <i>→</i>
          <article><span>P · 1 / 3</span><b>{t("이력을 먼저 평균·정규화한 뒤 후보와 cosine", "Average and normalize history, then cosine with candidate")}</b><small>p ∈ [−1, 1]</small></article>
          <i>↔</i>
          <article><span>C · 1 / 4</span><b>{t("후보–이력 cosine들을 먼저 구한 뒤 산술평균", "Compute candidate-history cosines first, then average")}</b><small>C<sub>mean</sub> ∈ [−1, 1]</small></article>
        </div>
        <div className="mxe-example">
          <div><span>{t("작은 계산 예시", "SMALL WORKED EXAMPLE")}</span><code>v₁=(1,0), v₂=(0,1), vᵢ=(1,0)</code></div>
          <div><b>h̄=(0.5,0.5), ‖h̄‖₂≈0.7071</b><b>p≈0.7071</b><b>C<sub>mean</sub>=0.5</b></div>
        </div>
        <Formula tex={String.raw`C_{\mathrm{mean}}=\lVert\bar{\mathbf h}\rVert_2\,p`} />
        <p className="mxe-reading">{t("핵심: 같은 query 안에서는 ‖h̄‖₂가 모든 후보에 공통이므로 p와 C mean은 후보 순서를 똑같이 만듭니다. 다만 C mean에는 history 벡터가 한 방향으로 얼마나 모였는지를 나타내는 크기 ‖h̄‖₂가 남습니다. MIND P 블록의 나머지 두 칸은 후보와 같은 category 비율과 subcategory 비율입니다.", "Key: within one query, ‖h̄‖₂ is shared by every candidate, so p and C mean induce the same candidate ordering. C mean nevertheless retains ‖h̄‖₂, the concentration magnitude of the history vectors. The other two MIND P fields are the shares of history items matching the candidate's category and subcategory.")}</p>
      </>}

      {topic === "consumption" && <>
        <h4>{t("후보와 각 이력 기사의 cosine 목록을 네 방식으로 요약", "Summarize candidate-to-history cosines in four ways")}</h4>
        <Formula tex={String.raw`s_{ij}=\mathbf v_i^{\mathsf T}\mathbf v_j,\quad C_{\mathrm{mean}}=\frac{1}{|H|}\sum_j s_{ij},\quad C_{\max}=\max_j s_{ij}`} />
        <Formula tex={String.raw`C_{\mathrm{top3}}=\frac{1}{m}\sum_{j\in\operatorname{Top}_m(s_i)}s_{ij},\quad m=\min(3,|H|)`} />
        <Formula tex={String.raw`a_{ij}=\frac{\exp(s_{ij}/0.18)}{\sum_k\exp(s_{ik}/0.18)},\qquad C_{\mathrm{attn}}=\sum_j a_{ij}s_{ij}`} />
        <div className="mxe-definition-grid">
          <article><b>C mean</b><p>{t("모든 개별 cosine의 산술평균입니다.", "Arithmetic mean of all individual cosines.")}</p></article>
          <article><b>C max</b><p>{t("가장 비슷한 이력 기사 하나만 봅니다.", "Uses only the single most similar history item.")}</p></article>
          <article><b>C top-3</b><p>{t("상위 최대 3개를 평균합니다. 이력이 2개면 2개로 나눕니다.", "Averages up to the top three; two history items means a divisor of two.")}</p></article>
          <article><b>C attention</b><p>{t("후보와 더 비슷한 이력에 더 큰 softmax weight를 줍니다.", "Gives larger softmax weights to history items more similar to the candidate.")}</p></article>
        </div>
        <div className="mxe-private-public">
          <div><span>{t("Private C attention", "Private C attention")}</span><b>similarity + age decay</b><small>ρⱼ=exp(−age/30)</small></div>
          <div><span>{t("MIND C attention", "MIND C attention")}</span><b>similarity only</b><small>{t("목록 순서만 있어 정확한 클릭 시각 감쇠를 적용하지 않음", "No age decay because exact click timing is unavailable")}</small></div>
        </div>
        <p className="mxe-reading">{t("실제 softmax 구현은 가장 큰 logit을 먼저 빼서 overflow를 막습니다. 모든 항에서 같은 값을 빼므로 최종 weight는 바뀌지 않습니다. 빈 history이면 P와 C를 모두 0으로 둡니다.", "The implementation subtracts the largest logit before softmax to prevent overflow. Subtracting the same value from every logit leaves the final weights unchanged. Empty histories set all P and C fields to zero.")}</p>
      </>}

      {topic === "origin" && <>
        <h4>{t("MIND의 E는 순위가 아니라 후보의 출처 한 칸", "MIND E is one candidate-origin field, not a rank")}</h4>
        <Formula tex={String.raw`e_i=\begin{cases}1,&i\in\text{original logged impression slate}\\0,&i\in\text{added candidate set}\end{cases}`} />
        <div className="mxe-private-public">
          <div><span>{t("Private E · 3개", "Private E · 3 fields")}</span><b>(E<sub>m</sub>, E<sub>r</sub>, E<sub>x</sub>)</b><small>{t("membership · reciprocal rank · combined E", "membership · reciprocal rank · combined E")}</small></div>
          <div><span>{t("MIND E · 1개", "MIND E · 1 field")}</span><b>slate membership</b><small>{t("원래 logged slate이면 1, 추가 후보이면 0", "1 for logged-slate items, 0 for added candidates")}</small></div>
        </div>
        <Formula tex={String.raw`pe,\;C_{\mathrm{mean}}e,\;C_{\max}e,\;C_{\mathrm{attn}}e,\;pC_{\mathrm{mean}},\;pC_{\mathrm{attn}}`} />
        <p className="mxe-reading">{t("위 여섯 값은 기존 좌표를 곱해 만든 product입니다. 새로운 원자료도, 신경망이 학습한 hidden feature도 아닙니다. 또한 e=1은 원래 slate 소속이라는 기록일 뿐, 실제 examination이나 인과적 exposure가 확인됐다는 뜻이 아닙니다.", "These six values are fixed products of existing coordinates: neither new source data nor learned hidden features. Also, e=1 records original-slate membership; it does not verify examination or causal exposure.")}</p>
      </>}

      {topic === "controls" && <>
        <h4>{t("학습 측 집계로 CTR을 완화하고, 큰 count는 log로 압축", "Smooth training-side CTRs and log-compress large counts")}</h4>
        <Formula tex={String.raw`\mathrm{CTR}_{\mathrm{smooth}}=\frac{\mathrm{clicks}+1}{\mathrm{impressions}+2},\qquad z_{\mathrm{count}}=\log(1+x)`} />
        <div className="mxe-example">
          <div><span>{t("예: 40회 노출 · 9회 클릭", "EXAMPLE: 40 impressions · 9 clicks")}</span><code>(9+1)/(40+2)=10/42≈0.2381</code></div>
          <div><b>log impressions = ln(41) ≈ 3.7136</b><b>{t("처음 보는 key의 CTR = 0.5", "Unseen-key CTR = 0.5")}</b></div>
        </div>
        <div className="mxe-control-list">
          <span>1 · Article CTR</span><span>2 · log article impressions</span><span>3 · Category CTR</span><span>4 · Subcategory CTR</span><span>5 · log history length</span><span>6 · log title length</span><span>7 · log abstract length</span>
        </div>
        <p className="mxe-reading">{t("이 일곱 값은 모두 개발 평가 label을 보지 않고 학습 측 통계나 현재 기사·이력 길이에서 만듭니다. CTR smoothing은 관측 수가 적은 항목에서 0 또는 1로 과도하게 튀는 값을 누그러뜨립니다.", "All seven values come from training-side statistics or the current article/history lengths without using development labels. CTR smoothing tempers extreme zero-or-one estimates for sparsely observed keys.")}</p>
      </>}

      {topic === "records" && <>
        <h4>{t("field 수는 embedding 차원이 아니라 ExtraTrees 입력 칸 수", "Field counts are ExtraTrees input widths, not embedding dimensions")}</h4>
        <div className="mxe-records">
          <article><span>Controls + E</span><b>7 + 1 = 8</b><small>{t("운영 통계와 후보 출처", "controls and candidate origin")}</small></article>
          <article><span>P + C Direct</span><b>7 + 3 + 4 = 14</b><small>{t("E 없이 history-derived semantic 입력", "history-derived semantics without E")}</small></article>
          <article><span>P + E + C Direct</span><b>7 + 3 + 1 + 4 = 15</b><small>{t("출처별 좌표를 곱 없이 보존", "source-labeled coordinates without products")}</small></article>
          <article><span>Full PEC proxy</span><b>15 + 6 = 21</b><small>{t("Direct에 product 6개 추가", "Direct plus six products")}</small></article>
        </div>
        <div className="mxe-comparisons">
          <p><b>8 → 15</b>{t("P와 C를 추가", "Add P and C")}</p>
          <p><b>14 → 15</b>{t("E를 추가", "Add E")}</p>
          <p><b>15 → 21</b>{t("product 6개를 추가", "Add six products")}</p>
        </div>
        <p className="mxe-reading">{t("8→14→15→21을 하나의 순차 사다리로 읽으면 안 됩니다. 8개 구성에는 E가 있지만 14개 구성에는 E가 없습니다. 각 비교는 같은 후보군과 공통 절차 아래에서 해당 입력 집합 전체를 독립적으로 선택한 모델끼리의 비교입니다.", "Do not read 8→14→15→21 as one sequential ladder. The 8-field record includes E, whereas the 14-field record omits it. Each contrast compares independently selected models for the named input sets under the same pool and common protocol.")}</p>
      </>}
    </div>

    <footer className="mxe-footer">
      <b>{t("한 줄 경계", "Interpretive boundary")}</b>
      <span>{t("MIND 실험은 공개 필드에 맞춘 interface proxy이며, private 데이터의 독립 stated profile과 25개 schema를 복제한 실험이 아닙니다.", "The MIND experiment is an interface proxy mapped to public fields, not a replication of the private data's independent stated profile or 25-field schema.")}</span>
      <a href="#mind-data">{t("원자료부터 MIND 전체 경로 보기 →", "Follow the full MIND path from source records →")}</a>
    </footer>
  </section>;
}
