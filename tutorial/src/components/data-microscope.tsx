"use client";

import { useMemo, useState } from "react";
import { ControlCalculations } from "./control-calculations";

type Lang = "ko" | "en";
type LocalText = { ko: string; en: string };
type Candidate = {
  id: string; topic: LocalText; label: 0 | 1; route: LocalText; traceRank: number | null;
  p: number; cmean: number; cmax: number; ctop3: number; catt: number;
  prefCat: number; prefPub: number; histCat: number; histPub: number; logClicks: number;
  popularity: number; recency: number; logLength: number; breaking: 0 | 1; topSims: number[];
};
type HistoryEvent = { date: string; article: LocalText; sims: Record<string, number> };
type Scenario = {
  id: string; tab: LocalText; user: string; date: string; summary: LocalText; poolSize: number;
  profile: { categories: string[]; publishers: string[]; keywords: string[] };
  history: HistoryEvent[]; trace: { id: string; rank: number }[]; candidates: Candidate[];
};

const tx = (value: LocalText, lang: Lang) => value[lang];
const fmt = (value: number) => value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");

const scenarios: Scenario[] = [
  {
    id: "mixed", tab: { ko: "일반 사례", en: "Mixed evidence" }, user: "U-017", date: "2026-05-10", poolSize: 15,
    summary: { ko: "환경 선호가 강하지만 최근에는 스포츠도 읽은 사용자입니다. 클릭한 A는 trace에 없고 B·C는 trace에 남아 있습니다.", en: "A user with strong climate preferences but recent sports reading. Clicked A is absent from the trace; B and C are retained." },
    profile: { categories: ["Climate 0.70", "Science 0.35", "Sports 0.05"], publishers: ["Daily Planet 0.20", "Field Notes 0.15"], keywords: ["carbon", "energy", "policy"] },
    history: [
      { date: "May 02", article: { ko: "스포츠 전술 분석", en: "Sports tactics analysis" }, sims: { A: .10, B: .88, C: .29 } },
      { date: "May 04", article: { ko: "지역 리그 결승", en: "Regional league final" }, sims: { A: .34, B: .80, C: .43 } },
      { date: "May 06", article: { ko: "배터리 기술 동향", en: "Battery technology update" }, sims: { A: .58, B: .61, C: .70 } },
      { date: "May 08", article: { ko: "탄소시장 해설", en: "Carbon-market explainer" }, sims: { A: .43, B: .75, C: .55 } },
    ],
    trace: [{ id: "C", rank: 2 }, { id: "B", rank: 5 }],
    candidates: [
      { id: "A", topic: { ko: "기후정책 뉴스", en: "Climate-policy news" }, label: 1, route: { ko: "당일 클릭 positive", en: "target-day clicked positive" }, traceRank: null, p: .82, cmean: .31, cmax: .58, ctop3: .45, catt: .40, prefCat: .70, prefPub: .20, histCat: .10, histPub: .05, logClicks: 4.62, popularity: .42, recency: .25, logLength: 6.55, breaking: 0, topSims: [.58,.43,.34] },
      { id: "B", topic: { ko: "스포츠 경기 기사", en: "Sports match report" }, label: 0, route: { ko: "retained non-click", en: "retained non-click" }, traceRank: 5, p: .28, cmean: .76, cmax: .88, ctop3: .81, catt: .72, prefCat: .05, prefPub: .10, histCat: .40, histPub: .20, logClicks: 4.62, popularity: .64, recency: .50, logLength: 6.20, breaking: 1, topSims: [.88,.80,.75] },
      { id: "C", topic: { ko: "과학 연구 보도", en: "Science research report" }, label: 0, route: { ko: "retained non-click", en: "retained non-click" }, traceRank: 2, p: .63, cmean: .44, cmax: .70, ctop3: .56, catt: .51, prefCat: .35, prefPub: .15, histCat: .20, histPub: .10, logClicks: 4.62, popularity: .36, recency: .33, logLength: 6.72, breaking: 0, topSims: [.70,.55,.43] },
    ],
  },
  {
    id: "no-trace", tab: { ko: "trace 없음", en: "No retained trace" }, user: "U-204", date: "2026-05-21", poolSize: 12,
    summary: { ko: "세 후보 모두 retained trace에 없습니다. E 세 필드는 0이지만 P와 C는 후보마다 계속 달라집니다.", en: "None of the candidates appears in the retained trace. All E fields are zero, while P and C still vary." },
    profile: { categories: ["Economy 0.65", "Technology 0.30"], publishers: ["Market Desk 0.25"], keywords: ["rates", "chips", "trade"] },
    history: [
      { date: "May 14", article: { ko: "반도체 공급망", en: "Semiconductor supply chain" }, sims: { A: .62, B: .84, C: .20 } },
      { date: "May 17", article: { ko: "금리 전망", en: "Interest-rate outlook" }, sims: { A: .79, B: .48, C: .16 } },
      { date: "May 19", article: { ko: "AI 산업 투자", en: "AI industry investment" }, sims: { A: .68, B: .76, C: .25 } },
    ],
    trace: [],
    candidates: [
      { id: "A", topic: { ko: "중앙은행 정책", en: "Central-bank policy" }, label: 0, route: { ko: "introduced candidate", en: "introduced candidate" }, traceRank: null, p: .78, cmean: .65, cmax: .79, ctop3: .70, catt: .69, prefCat: .65, prefPub: .15, histCat: .35, histPub: .12, logClicks: 3.71, popularity: .71, recency: .50, logLength: 6.44, breaking: 0, topSims: [.79,.68,.62] },
      { id: "B", topic: { ko: "차세대 반도체", en: "Next-generation chips" }, label: 1, route: { ko: "당일 클릭 positive", en: "target-day clicked positive" }, traceRank: null, p: .59, cmean: .74, cmax: .84, ctop3: .69, catt: .73, prefCat: .30, prefPub: .25, histCat: .42, histPub: .18, logClicks: 3.71, popularity: .58, recency: .50, logLength: 6.31, breaking: 0, topSims: [.84,.76,.48] },
      { id: "C", topic: { ko: "연예 시상식", en: "Entertainment awards" }, label: 0, route: { ko: "introduced candidate", en: "introduced candidate" }, traceRank: null, p: .08, cmean: .19, cmax: .25, ctop3: .20, catt: .18, prefCat: 0, prefPub: 0, histCat: .03, histPub: .02, logClicks: 3.71, popularity: .83, recency: .50, logLength: 5.92, breaking: 0, topSims: [.25,.20,.16] },
    ],
  },
  {
    id: "no-history", tab: { ko: "과거 클릭 없음", en: "No prior clicks" }, user: "U-311", date: "2026-06-03", poolSize: 9,
    summary: { ko: "적격한 이전 클릭이 없습니다. 모든 C 요약과 history control은 0이지만 profile과 trace는 사용할 수 있습니다.", en: "There are no eligible prior clicks. Every C summary and history control is zero, while profile and trace remain available." },
    profile: { categories: ["Science 0.80", "Health 0.45"], publishers: ["Research Wire 0.30"], keywords: ["space", "medicine", "discovery"] },
    history: [], trace: [{ id: "A", rank: 1 }, { id: "C", rank: 4 }],
    candidates: [
      { id: "A", topic: { ko: "우주망원경 발견", en: "Space-telescope discovery" }, label: 1, route: { ko: "positive + trace 중복", en: "positive overlapping trace" }, traceRank: 1, p: .91, cmean: 0, cmax: 0, ctop3: 0, catt: 0, prefCat: .80, prefPub: .30, histCat: 0, histPub: 0, logClicks: 0, popularity: .76, recency: .50, logLength: 6.48, breaking: 1, topSims: [] },
      { id: "B", topic: { ko: "지역 교통 소식", en: "Local transit update" }, label: 0, route: { ko: "introduced candidate", en: "introduced candidate" }, traceRank: null, p: .12, cmean: 0, cmax: 0, ctop3: 0, catt: 0, prefCat: 0, prefPub: 0, histCat: 0, histPub: 0, logClicks: 0, popularity: .31, recency: .50, logLength: 5.87, breaking: 0, topSims: [] },
      { id: "C", topic: { ko: "신약 임상 결과", en: "Clinical-trial result" }, label: 0, route: { ko: "retained non-click", en: "retained non-click" }, traceRank: 4, p: .67, cmean: 0, cmax: 0, ctop3: 0, catt: 0, prefCat: .45, prefPub: .10, histCat: 0, histPub: 0, logClicks: 0, popularity: .55, recency: .33, logLength: 6.70, breaking: 0, topSims: [] },
    ],
  },
];

function derived(c: Candidate) {
  const em = c.traceRank ? 1 : 0, er = c.traceRank ? 1 / c.traceRank : 0, ex = em + er;
  return { em, er, ex, pcount: Math.min(1,c.prefCat+c.prefPub), ccount: Math.min(1,c.histCat+c.histPub) };
}
function featureGroups(c: Candidate) {
  const d=derived(c);
  return [
    { key:"P", title:"P · Profile", fields:[[8,"P_semantic",c.p]] },
    { key:"E", title:"E · Trace", fields:[[3,"same_day_recommended",d.em],[4,"reciprocal_rank",d.er],[12,"E_exposure",d.ex]] },
    { key:"C", title:"C · Consumption", fields:[[9,"C_semantic",c.cmean],[20,"C_max",c.cmax],[21,"C_top3",c.ctop3],[22,"C_attention",c.catt]] },
    { key:"Z", title:"Z · Controls", fields:[[1,"pref_category_weight",c.prefCat],[2,"pref_publisher_weight",c.prefPub],[5,"hist_category_click_share",c.histCat],[6,"hist_publisher_click_share",c.histPub],[7,"log_user_prior_clicks",c.logClicks],[10,"P_count",d.pcount],[11,"C_count",d.ccount],[16,"popularity_score",c.popularity],[17,"recency_score",c.recency],[18,"log_article_len",c.logLength],[19,"is_breaking",c.breaking]] },
    { key:"psi", title:"ψ · Interactions", fields:[[13,"P_semantic_x_E",c.p*d.ex],[14,"C_semantic_x_E",c.cmean*d.ex],[15,"P_semantic_x_C_semantic",c.p*c.cmean],[23,"C_attention_x_E",c.catt*d.ex],[24,"C_max_x_E",c.cmax*d.ex],[25,"P_semantic_x_C_attention",c.p*c.catt]] },
  ] as const;
}

type DemoMode="control"|"direct"|"complete";
const teachingScores:Record<string,Record<DemoMode,Record<string,number>>>={
  mixed:{control:{A:.54,B:.62,C:.49},direct:{A:.73,B:.58,C:.64},complete:{A:.76,B:.55,C:.66}},
  "no-trace":{control:{A:.63,B:.59,C:.41},direct:{A:.61,B:.76,C:.22},complete:{A:.64,B:.79,C:.20}},
  "no-history":{control:{A:.68,B:.35,C:.55},direct:{A:.78,B:.24,C:.62},complete:{A:.82,B:.22,C:.65}},
};
function scoreFor(scenario:string,mode:DemoMode,candidate:string){return teachingScores[scenario]?.[mode]?.[candidate]??.5;}
function demoVector(c:Candidate,mode:DemoMode) {
  const d=derived(c);
  if(mode==="control") return [
    ["pref_category_weight",c.prefCat],["pref_publisher_weight",c.prefPub],["same_day_recommended",d.em],["reciprocal_rank",d.er],
    ["hist_category_click_share",c.histCat],["hist_publisher_click_share",c.histPub],["log_user_prior_clicks",c.logClicks],
    ["popularity_score",c.popularity],["recency_score",c.recency],["log_article_len",c.logLength],["is_breaking",c.breaking],
  ] as [string,number][];
  const full=featureGroups(c).flatMap(group=>group.fields.map(([id,name,value])=>({id:Number(id),name,value:Number(value),group:group.key}))).sort((a,b)=>a.id-b.id);
  const chosen=mode==="complete"?full:full.filter(field=>field.group!=="psi");
  return chosen.map(field=>[field.name,field.value] as [string,number]);
}

export function DataMicroscope({ lang }: { lang: Lang }) {
  const [scenarioId,setScenarioId]=useState("mixed"), [candidateId,setCandidateId]=useState("A");
  const [demoMode,setDemoMode]=useState<DemoMode>("complete");
  const scenario=scenarios.find(x=>x.id===scenarioId)??scenarios[0];
  const candidate=scenario.candidates.find(x=>x.id===candidateId)??scenario.candidates[0];
  const d=derived(candidate), groups=useMemo(()=>featureGroups(candidate),[candidate]), isKo=lang==="ko";
  const vector=demoVector(candidate,demoMode), width=vector.length;
  const scored=scenario.candidates.map(item=>({item,score:scoreFor(scenario.id,demoMode,item.id)}));
  const ranked=[...scored].sort((a,b)=>b.score-a.score);
  const selectedScore=scoreFor(scenario.id,demoMode,candidate.id);
  const treeOffsets=[.14,-.09,.03,-.04,-.04];
  const treeOutputs=treeOffsets.map(offset=>selectedScore+offset);
  const chooseScenario=(id:string)=>{const next=scenarios.find(x=>x.id===id)??scenarios[0];setScenarioId(id);setCandidateId(next.candidates[0].id);};
  return <section className="ca-section dm-section" id="microscope">
    <div className="ca-heading"><span>00 / DATA MICROSCOPE</span><h2>{isKo?"한 사용자의 기록이 모델 입력이 될 때까지":"From one user's records to a model input"}</h2><p>{isKo?"아래 값은 계산을 이해하기 위한 합성 예시입니다. 논문의 private candidate row를 공개한 것이 아닙니다.":"Values below are synthetic teaching examples, not released private candidate rows."}</p></div>
    <div className="dm-tabs" role="tablist">{scenarios.map(x=><button key={x.id} type="button" role="tab" aria-selected={x.id===scenario.id} onClick={()=>chooseScenario(x.id)}><span>{x.user}</span><b>{tx(x.tab,lang)}</b><small>{x.date}</small></button>)}</div>
    <div className="dm-case-head"><div><span>{isKo?"선택한 사용자–날짜 query":"Selected user-date query"}</span><h3>{scenario.user} <i>→</i> q=({scenario.user}, {scenario.date})</h3><p>{tx(scenario.summary,lang)}</p></div><dl><div><dt>{isKo?"전체 후보":"Full pool"}</dt><dd>{scenario.poolSize}</dd></div><div><dt>{isKo?"대표 표시":"Shown"}</dt><dd>3</dd></div><div><dt>{isKo?"입력 폭":"Width"}</dt><dd>25</dd></div></dl></div>
    <div className="dm-raw-grid">
      <section><header><span>USER TABLE</span><b>{isKo?"고정 프로필 snapshot":"Fixed profile snapshot"}</b></header><div className="dm-tags"><small>category</small>{scenario.profile.categories.map(x=><i key={x}>{x}</i>)}<small>publisher</small>{scenario.profile.publishers.map(x=><i key={x}>{x}</i>)}<small>keyword text</small>{scenario.profile.keywords.map(x=><i key={x}>{x}</i>)}</div><p>{isKo?"가중치는 Z에, 이름을 직렬화한 text embedding은 P 계산에 사용됩니다.":"Weights enter Z; embeddings of serialized names are used for P."}</p></section>
      <section><header><span>CLICK LOG</span><b>{isKo?"query 이전 클릭":"Clicks before the query"}</b></header>{scenario.history.length?<div className="dm-history">{scenario.history.map(e=><div key={e.date}><time>{e.date}</time><span>{tx(e.article,lang)}</span><b>cos={fmt(e.sims[candidate.id]??0)}</b></div>)}</div>:<div className="dm-empty">{isKo?"prior click 없음 → C와 history shares는 0":"No prior clicks → C and history shares are zero"}</div>}<p>{isKo?"최신 50개는 semantic C에, 전체 적격 이벤트는 count control에 씁니다.":"The latest 50 feed semantic C; all eligible events feed count controls."}</p></section>
      <section><header><span>RETAINED TRACE</span><b>{isKo?"보존된 추천목록":"Retained recommendation list"}</b></header>{scenario.trace.length?<ol className="dm-trace">{scenario.trace.map(x=><li key={x.id}><span>{x.id}</span><b>rank {x.rank}</b><small>1/r={fmt(1/x.rank)}</small></li>)}</ol>:<div className="dm-empty">{isKo?"retained entry 없음 → 모든 후보 E=0":"No retained entry → E=0 for every candidate"}</div>}<p>{isKo?"목록 부재는 실제 미노출의 증명이 아닙니다.":"Trace absence does not prove non-exposure."}</p></section>
      <section><header><span>QUERY LABELS</span><b>{isKo?"당일 관측 클릭":"Observed target-day clicks"}</b></header><div className="dm-labels">{scenario.candidates.map(x=><div key={x.id} className={x.label?"is-clicked":""}><b>{x.id}</b><span>y={x.label}</span><small>{tx(x.route,lang)}</small></div>)}</div><p>{isKo?"y는 학습 정답이지 feature가 아닙니다. y=0은 weak negative입니다.":"y is the target, not a feature. A y=0 row is a weak negative."}</p></section>
    </div>
    <div className="dm-candidate-table">
      <div className="dm-table-title"><div><span>QUERY–CANDIDATE TABLE</span><b>{isKo?"후보를 눌러 계산 경로를 바꿔 보세요":"Select a candidate to change the calculation path"}</b></div><small>X<sub>q</sub> ∈ ℝ<sup>{scenario.poolSize}×25</sup></small></div>
      <div className="dm-table-head"><span>{isKo?"후보":"Candidate"}</span><span>{isKo?"풀 경로":"Pool route"}</span><span>y</span><span>P</span><span>E<sub>x</sub></span><span>C<sub>mean</sub></span><span>{isKo?"모델 행":"Model row"}</span></div>
      {scenario.candidates.map(x=>{const v=derived(x);return <button key={x.id} type="button" className={x.id===candidate.id?"is-selected":""} onClick={()=>setCandidateId(x.id)}><span><b>{x.id}</b><small>{tx(x.topic,lang)}</small></span><span>{tx(x.route,lang)}</span><span className={x.label?"is-one":""}>{x.label}</span><span>{fmt(x.p)}</span><span>{fmt(v.ex)}</span><span>{fmt(x.cmean)}</span><span>1 × 25 →</span></button>;})}
      <p>{isKo?`실제 query에는 ${scenario.poolSize}개 행이 있지만 대표 3개만 표시합니다. 모델은 최종 후보의 모든 행을 점수화합니다.`:`The query has ${scenario.poolSize} rows; three are shown. The model scores every final candidate row.`}</p>
    </div>
    <div className="dm-derivation">
      <header><div><span>{isKo?`선택 후보 ${candidate.id}`:`Selected candidate ${candidate.id}`}</span><h3>{tx(candidate.topic,lang)}</h3></div><b>x<sub>q,{candidate.id}</sub> ∈ ℝ<sup>25</sup></b></header>
      <div className="dm-formulas">
        <div className="is-P"><span>P</span><b>cos(profile, article)</b><strong>{fmt(candidate.p)}</strong><p>{isKo?"profile과 article을 frozen BGE-M3로 인코딩하고 단위 벡터 cosine을 계산합니다.":"Encode profile and article with frozen BGE-M3 and take unit-vector cosine."}</p></div>
        <div className="is-E"><span>E</span><b>{candidate.traceRank?`1 + 1/${candidate.traceRank}`:"0 + 0"}</b><strong>{fmt(d.ex)}</strong><p>{candidate.traceRank?(isKo?`membership 1과 rank ${candidate.traceRank}의 역수 ${fmt(d.er)}를 더합니다.`:`Add membership 1 and reciprocal rank ${fmt(d.er)}.`):(isKo?"trace에 없으므로 두 값이 모두 0입니다.":"Both values are zero because the item is absent from the trace.")}</p></div>
        <div className="is-C"><span>C</span><b>mean · max · top-3 · att</b><strong>{fmt(candidate.cmean)} · {fmt(candidate.cmax)} · {fmt(candidate.ctop3)} · {fmt(candidate.catt)}</strong><p>{candidate.topSims.length?(isKo?`상위 cosine ${candidate.topSims.map(fmt).join(", ")}의 평균이 top-3=${fmt(candidate.ctop3)}입니다.`:`Top cosines ${candidate.topSims.map(fmt).join(", ")} give top-3=${fmt(candidate.ctop3)}.`):(isKo?"prior history가 없어 네 값 모두 0입니다.":"No prior history, so all four values are zero.")}</p></div>
        <div className="is-psi"><span>ψ</span><b>P×E · C×E · P×C</b><strong>{fmt(candidate.p*d.ex)} · {fmt(candidate.cmean*d.ex)} · {fmt(candidate.p*candidate.cmean)}</strong><p>{isKo?"새 관측이 아니라 위에서 계산한 값들의 곱입니다.":"These are products of computed values, not new observations."}</p></div>
      </div>
    </div>
    <div className="dm-feature-record">
      <div className="dm-record-head"><div><span>SOURCE-GROUPED VIEW</span><b>{isKo?"최종 25개 입력값":"The final 25 input values"}</b></div><p>{isKo?"번호는 Table 13의 estimator serialization ID이고, 화면에서는 출처별로 묶었습니다.":"Numbers are Table 13 serialization IDs; the display groups fields by source."}</p></div>
      <div className="dm-groups">{groups.map(g=><section key={g.key} className={`is-${g.key}`}><header><b>{g.title}</b><span>{g.fields.length}D</span></header><div>{g.fields.map(([id,name,value])=><p key={name}><small>{String(id).padStart(2,"0")}</small><code>{name}</code><strong>{fmt(Number(value))}</strong></p>)}</div></section>)}</div>
      <div className="dm-row-total"><span>1 + 3 + 4 + 11 + 6</span><b>= 25 fields for candidate {candidate.id}</b><small>{isKo?"schema는 같고 값은 후보마다 달라집니다.":"The schema is shared; values differ by candidate."}</small></div>
    </div>
    <ControlCalculations key={`${scenarioId}-${candidate.id}`} lang={lang} scenarioId={scenarioId} candidateId={candidate.id} reference={groups[3].fields} />
    <aside className="dm-takeaway"><b>{isKo?"핵심":"Key point"}</b><p>{isKo?"사용자 하나가 25개 숫자 하나로 바뀌는 것이 아닙니다. 사용자–날짜 query마다 여러 후보가 생기고, 각 후보가 별도의 25-D 행이 됩니다. 모델은 행마다 점수를 낸 뒤 같은 query 안에서 정렬합니다.":"A user does not become one 25-number vector. Each user-date query has several candidates; every candidate becomes a separate 25-D row, is scored, and is ranked only within that query."}</p></aside>
    <section className="dm-final-demo" id="final-demo">
      <header><div><span>END-TO-END SCENARIO DEMO</span><h3>{isKo?"많은 숫자가 최종 순위로 바뀌는 정확한 모양":"How many numbers become one ranked list"}</h3><p>{isKo?"위에서 선택한 사용자·query·후보를 그대로 사용합니다. 모델 모드를 바꾸면 행의 폭 d만 바뀌고, 후보마다 행 하나와 score 하나가 생기는 구조는 같습니다.":"This reuses the selected user, query, and candidate above. Changing model mode changes width d; every candidate still has one row and one score."}</p></div><nav>{(["control","direct","complete"] as DemoMode[]).map(mode=><button key={mode} type="button" aria-pressed={demoMode===mode} onClick={()=>setDemoMode(mode)}>{mode==="control"?"Control 11-D":mode==="direct"?"Direct 19-D":"Complete 25-D"}</button>)}</nav></header>
      <div className="dm-e2e">
        <div className="dm-e2e-step"><span>1 · USER–DATE</span><b>{scenario.user}</b><strong>{scenario.date}</strong><p>{isKo?`profile 1개 · prior clicks ${scenario.history.length}개 · trace items ${scenario.trace.length}개`:`one profile · ${scenario.history.length} prior clicks · ${scenario.trace.length} trace items`}</p></div>
        <i>→</i>
        <div className="dm-e2e-step"><span>2 · CANDIDATE POOL</span><b>A<sub>q</sub></b><strong>{scenario.poolSize} articles</strong><p>{isKo?"기사마다 label과 source별 feature를 계산합니다.":"Compute a label and source-specific features for every article."}</p></div>
        <i>→</i>
        <div className="dm-e2e-step is-matrix"><span>3 · INPUT MATRIX</span><b>X<sub>q</sub>∈ℝ<sup>{scenario.poolSize}×{width}</sup></b><strong>{scenario.poolSize} rows × {width} columns</strong><p>{isKo?"사용자 벡터 하나가 아니라 후보별 row가 쌓인 행렬입니다.":"This is a stack of candidate rows, not one user vector."}</p></div>
        <i>→</i>
        <div className="dm-e2e-step is-score"><span>4 · SCORER</span><b>f<sub>θ</sub>:ℝ<sup>{width}</sup>→ℝ</b><strong>{isKo?"row 하나 → scalar 하나":"one row → one scalar"}</strong><p>{isKo?"ExtraTrees가 25개 값을 더하거나 평균내는 것이 아니라 여러 tree split으로 하나의 class-1 score를 냅니다.":"ExtraTrees does not simply sum or average the values; tree splits produce one class-1 score."}</p></div>
      </div>
      <div className="dm-vector-demo">
        <header><div><span>{isKo?`현재 선택: 후보 ${candidate.id}`:`Selected: candidate ${candidate.id}`}</span><b>x<sub>q,{candidate.id}</sub> = [{vector.map(([,value])=>fmt(value)).join(", ")}]</b></div><strong>∈ ℝ<sup>{width}</sup></strong></header>
        <div>{vector.map(([name,value],index)=><span key={name+"-"+index} title={name}><small>{index+1}</small><b>{fmt(value)}</b><em>{name}</em></span>)}</div>
        <p>{isKo?"각 칸은 별도 좌표입니다. 이 배열 전체가 후보 하나의 입력 vector이며, 숫자들을 사전에 하나로 합쳐 넣지 않습니다. scorer를 통과한 뒤에야 후보당 scalar score 하나가 생깁니다.":"Each cell is a separate coordinate. The whole array is one candidate vector; the inputs are not collapsed into one value beforehand. One scalar per candidate appears only after scoring."}</p>
      </div>
      <div className="dm-ranking-lab">
        <header><div><span>FULL CANDIDATE-TO-RANK WALKTHROUGH</span><h4>{isKo?"후보 기사별 입력, forest 출력, 최종 순위":"Candidate inputs, forest outputs, and final ranking"}</h4></div><p>{isKo?"아래 score는 계산 구조를 보여주기 위한 합성 출력이며 논문의 실험 결과값이 아닙니다. 모델 버튼을 바꾸면 입력 폭과 설명용 score가 함께 바뀝니다.":"Scores below are synthetic teaching outputs, not empirical results reported in the paper. Changing model mode changes both input width and the illustrative scores."}</p></header>
        <div className="dm-ranking-grid">
          <section className="dm-candidate-stream">
            <header><b>{isKo?"추천 뉴스 풀의 대표 후보":"Representative news candidates"}</b><span>{isKo?`3개 표시 / 전체 ${scenario.poolSize}개`:`3 shown / ${scenario.poolSize} total`}</span></header>
            {scored.map(({item,score})=>{const itemD=derived(item),itemVector=demoVector(item,demoMode);return <button key={item.id} type="button" className={item.id===candidate.id?"is-selected":""} onClick={()=>setCandidateId(item.id)}>
              <div className="dm-news-head"><span>{item.id}</span><div><b>{tx(item.topic,lang)}</b><small>{tx(item.route,lang)}</small></div><strong className={item.label?"is-clicked":""}>y={item.label}</strong></div>
              <div className="dm-news-signals"><span>P <b>{fmt(item.p)}</b></span><span>E<sub>x</sub> <b>{fmt(itemD.ex)}</b></span><span>C<sub>mean</sub> <b>{fmt(item.cmean)}</b></span><span>{itemVector.length}-D</span></div>
              <div className="dm-news-vector"><code>[{itemVector.slice(0,6).map(([,v])=>fmt(v)).join(", ")}, …]</code></div>
              <div className="dm-news-score"><span><i style={{width:`${score*100}%`}}/></span><b>s<sub>{item.id}</sub>={score.toFixed(2)}*</b></div>
            </button>;})}
            {scenario.poolSize>3&&<div className="dm-more-candidates"><b>+ {scenario.poolSize-3}</b><span>{isKo?"같은 schema의 다른 후보 행":"other candidate rows with the same schema"}</span></div>}
          </section>
          <section className="dm-forest">
            <header><span>EXTRATREES SCORER</span><b>{isKo?`후보 ${candidate.id}의 ${width}개 좌표가 동시에 보존됨`:`Candidate ${candidate.id}'s ${width} coordinates stay separate`}</b></header>
            <div className="dm-tree-input"><small>x<sub>q,{candidate.id}</sub>∈ℝ<sup>{width}</sup></small><b>[x<sub>1</sub>, x<sub>2</sub>, …, x<sub>{width}</sub>]</b></div>
            <div className="dm-trees">{treeOutputs.map((value,index)=><div key={index}><i/><i/><i/><span>T<sub>{index+1}</sub>(x)</span><b>{value.toFixed(2)}</b></div>)}</div>
            <div className="dm-tree-average"><span>{isKo?"tree class-1 출력의 평균":"mean class-1 output across trees"}</span><b>({treeOutputs.map(x=>x.toFixed(2)).join(" + ")}) / 5</b><strong>= {selectedScore.toFixed(2)}*</strong></div>
            <p>{isKo?"실제 모델은 다섯 그루가 아니라 선택된 n_estimators만큼의 tree를 사용합니다. 다섯 개는 계산 방식을 보여주기 위한 축약입니다.":"The fitted model uses the selected number of estimators, not five trees. Five are shown only to explain aggregation."}</p>
          </section>
          <section className="dm-ranked-output">
            <header><b>{isKo?"score 내림차순 최종 결과":"Final result sorted by score"}</b><span>π<sub>q</sub>=argsort<sub>↓</sub>(s<sub>q</sub>)</span></header>
            <div>{ranked.map(({item,score},index)=><article key={item.id} className={item.label?"is-positive":""}><strong>{index+1}</strong><span>{item.id}</span><div><b>{tx(item.topic,lang)}</b><small>{item.label?(isKo?"관측 클릭 positive":"observed clicked positive"):(isKo?"weak negative":"weak negative")}</small></div><output>{score.toFixed(2)}*</output></article>)}</div>
            <aside><b>{isKo?"무엇이 하나의 값이 되는가?":"What becomes one value?"}</b><p>{isKo?"사용자 전체나 25개 입력 전체가 미리 scalar 하나가 되는 것이 아닙니다. scorer가 후보 row 하나를 처리한 결과만 sᵢ라는 하나의 값이 됩니다. 따라서 후보가 N개면 score도 N개입니다.":"Neither the user nor all inputs are collapsed beforehand. Only the scorer output for one candidate row becomes scalar sᵢ. N candidates therefore produce N scores."}</p></aside>
          </section>
        </div>
        <footer><span>* {isKo?"설명용 합성 scorer 출력":"synthetic scorer output for teaching"}</span><b>{isKo?`현재 결과: ${ranked.map((x,i)=>`${i+1}위 ${x.item.id}`).join(" · ")}`:`Current result: ${ranked.map((x,i)=>`rank ${i+1} ${x.item.id}`).join(" · ")}`}</b></footer>
      </div>
      <div className="dm-score-demo">
        <div><span>{isKo?"모든 후보 행":"All candidate rows"}</span><b>X<sub>q</sub>=[x<sub>q,1</sub>; … ; x<sub>q,N</sub>]</b></div><i>f<sub>θ</sub> row by row →</i><div><span>{isKo?"후보별 score vector":"One score per candidate"}</span><b>s<sub>q</sub>=[s<sub>q,1</sub>, … , s<sub>q,N</sub>]</b></div><i>argsort ↓ →</i><div><span>{isKo?"최종 순위":"Final ranking"}</span><b>π<sub>q</sub>=argsort(s<sub>q</sub>)</b></div>
      </div>
      <p className="dm-output-note">{isKo?"score는 후보별 class-1 probability 형태의 ranking 값이지, 보정된 CTR이나 사용자 전체를 나타내는 하나의 값이 아닙니다. 다른 query의 score와 직접 비교하지 않고 같은 query 안에서만 정렬합니다.":"The score is a candidate-level, class-1-probability-shaped ranking value, not calibrated CTR or one summary value for the user. Scores are ordered within the same query, not compared across queries."}</p>
    </section>
  </section>;
}
