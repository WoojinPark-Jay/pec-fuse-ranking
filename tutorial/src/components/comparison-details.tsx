"use client";

import { useState } from "react";

type Lang = "ko" | "en";
type Field = { name: string; value: string; kind: "B"|"P"|"E"|"C"|"Z"|"psi"|"F" };

const B: Field[] = [
  {name:"pref_category_weight",value:"0.70",kind:"B"},{name:"pref_publisher_weight",value:"0.20",kind:"B"},
  {name:"same_day_recommended",value:"0",kind:"B"},{name:"reciprocal_rank",value:"0",kind:"B"},
  {name:"hist_category_click_share",value:"0.10",kind:"B"},{name:"hist_publisher_click_share",value:"0.05",kind:"B"},
  {name:"log_user_prior_clicks",value:"4.62",kind:"B"},{name:"popularity_score",value:"0.42",kind:"B"},
  {name:"recency_score",value:"0.25",kind:"B"},{name:"log_article_len",value:"6.55",kind:"B"},{name:"is_breaking",value:"0",kind:"B"},
];
const Z: Field[] = [
  {name:"pref_category_weight",value:"0.70",kind:"Z"},{name:"pref_publisher_weight",value:"0.20",kind:"Z"},
  {name:"hist_category_click_share",value:"0.10",kind:"Z"},{name:"hist_publisher_click_share",value:"0.05",kind:"Z"},
  {name:"log_user_prior_clicks",value:"4.62",kind:"Z"},{name:"P_count",value:"0.90",kind:"Z"},{name:"C_count",value:"0.15",kind:"Z"},
  {name:"popularity_score",value:"0.42",kind:"Z"},{name:"recency_score",value:"0.25",kind:"Z"},{name:"log_article_len",value:"6.55",kind:"Z"},{name:"is_breaking",value:"0",kind:"Z"},
];
const E: Field[] = [{name:"same_day_recommended",value:"0",kind:"E"},{name:"reciprocal_rank",value:"0",kind:"E"},{name:"E_exposure",value:"0",kind:"E"}];
const PC: Field[] = [{name:"P_semantic",value:"0.82",kind:"P"},{name:"C_semantic",value:"0.31",kind:"C"},{name:"C_max",value:"0.58",kind:"C"},{name:"C_top3",value:"0.45",kind:"C"},{name:"C_attention",value:"0.40",kind:"C"}];
const PSI: Field[] = [
  {name:"P_semantic_x_E",value:"0",kind:"psi"},{name:"C_semantic_x_E",value:"0",kind:"psi"},
  {name:"P_semantic_x_C_semantic",value:"0.2542",kind:"psi"},{name:"C_attention_x_E",value:"0",kind:"psi"},
  {name:"C_max_x_E",value:"0",kind:"psi"},{name:"P_semantic_x_C_attention",value:"0.3280",kind:"psi"},
];
const context8Names = new Set(["hist_category_click_share","hist_publisher_click_share","log_user_prior_clicks","C_count","popularity_score","recency_score","log_article_len","is_breaking"]);

function fieldsFor(id: string): { fields: Field[]; transform?: string } {
  const H=[...E,...Z], noE9=B.filter(x=>!["same_day_recommended","reciprocal_rank"].includes(x.name));
  if(id==="control11") return {fields:B};
  if(id==="collapsed12") return {fields:[...B,{name:"hand_collapsed_score",value:"0.61†",kind:"F"}],transform:"P/C evidence → fixed collapse rule → one scalar"};
  if(id==="early12") return {fields:[...B,{name:"learned_scalar",value:"0.63*",kind:"F"}],transform:"[P, Cmean, Cmax, Ctop3, Catt] → gθ → one fitted scalar"};
  if(id==="scalarDirect17") return {fields:[...B,{name:"E_exposure",value:"0",kind:"E"},...PC]};
  if(id==="direct19") return {fields:[...H,...PC]};
  if(id==="fusion19") return {fields:[...H,...["h1 0.44*","h2 −0.08*","h3 0.31*","h4 0.12*","h5 0.57*"].map(x=>{const [name,value]=x.split(" ");return {name,value,kind:"F" as const};})],transform:"[0.82, 0.31, 0.58, 0.45, 0.40] → gθ → [0.44, −0.08, 0.31, 0.12, 0.57]*"};
  if(id==="complete25") return {fields:[...H,...PC,...PSI]};
  if(id==="noE9") return {fields:noE9};
  if(id==="noE18") return {fields:[...Z,...PC,...PSI.filter(x=>["P_semantic_x_C_semantic","P_semantic_x_C_attention"].includes(x.name))]};
  if(id==="context8") return {fields:Z.filter(x=>context8Names.has(x.name))};
  if(id==="contextC12") return {fields:[...Z.filter(x=>context8Names.has(x.name)),...PC.filter(x=>x.kind==="C")]};
  return {fields:B};
}

function FieldPanel({ id, name, side, lang }: { id:string; name:string; side:"left"|"right"; lang:Lang }) {
  const data=fieldsFor(id);
  return <section className={`cdp-side is-${side}`}>
    <header><div><span>{side==="left"?(lang==="ko"?"비교 기준":"Reference"):(lang==="ko"?"비교 대상":"Compared model")}</span><b>{name}</b></div><strong>{data.fields.length} values</strong></header>
    {data.transform&&<p className="cdp-transform">{data.transform}</p>}
    <div className="cdp-fields">{data.fields.map((field,index)=><div key={field.name+"-"+index} className={`is-${field.kind}`}><code>{field.name}</code><b>{field.value}</b></div>)}</div>
  </section>;
}

export function ComparisonDataPreview({lang,comparisonId,leftId,leftName,rightId,rightName}:{lang:Lang;comparisonId:string;leftId:string;leftName:string;rightId:string;rightName:string}) {
  const isKo=lang==="ko";
  return <div className="cdp-preview">
    <header><div><span>SAME CANDIDATE, DIFFERENT INPUT SCHEMAS</span><h4>{isKo?"일반 사례의 후보 A가 실제로 각 모델에 들어가는 모양":"How candidate A enters each model"}</h4></div><p>{isKo?"색은 field의 출처, 숫자는 해당 후보의 입력값입니다. 회색 B는 운영 baseline schema입니다.":"Color denotes source; numbers are candidate-level inputs. Gray B marks the operational baseline schema."}</p></header>
    {comparisonId==="mind"&&<aside>{isKo?"MIND 비교에서는 P/E/C의 정의가 private schema와 다릅니다. 아래 값은 private 후보 A를 이용한 구조 설명이며 MIND 실제 row가 아닙니다.":"MIND redefines P/E/C. The values below illustrate the private candidate-A schema, not an actual MIND row."}</aside>}
    <div className="cdp-pair"><FieldPanel id={leftId} name={leftName} side="left" lang={lang}/><FieldPanel id={rightId} name={rightName} side="right" lang={lang}/></div>
    <footer><span>† {isKo?"고정 collapse rule의 설명용 출력":"illustrative output of the fixed collapse rule"}</span><span>* {isKo?"학습 파라미터가 있어야 정해지는 설명용 fitted output; 실제 값은 seed와 fit에 따라 달라짐":"illustrative fitted output; actual values depend on seed and fitted parameters"}</span></footer>
  </div>;
}

type BudgetState={positives:number;retained:number;eligible:number};
const presets:{id:string;ko:string;en:string;state:BudgetState}[]=[
  {id:"minimum",ko:"최소 예산",en:"Minimum budget",state:{positives:1,retained:0,eligible:12}},
  {id:"ordinary",ko:"일반 예시",en:"Typical example",state:{positives:2,retained:5,eligible:20}},
  {id:"capped",ko:"24개 상한",en:"24-item cap",state:{positives:8,retained:24,eligible:40}},
  {id:"scarce",ko:"가용 기사 부족",en:"Catalog scarcity",state:{positives:6,retained:2,eligible:3}},
];
function Cells({count,kind,max=24}:{count:number;kind:string;max?:number}) {
  const shown=Math.min(count,max);
  return <div className={`cbl-cells is-${kind}`}>{Array.from({length:shown},(_,i)=><i key={i}/>)}{count>max&&<b>+{count-max}</b>}</div>;
}
export { CandidateBudgetStory as CandidateBudgetLab } from "./candidate-budget-story";

type ScorerMode = "tree" | "neural" | "fusion";

export { GuidedModelLab as ScorerExplainer } from "./model-reading-guide";

export function BeginnerGuide({ lang }: { lang: Lang }) {
  const ko = lang === "ko";
  const steps = [
    {n:"1", term:ko?"질의를 만든다":"Create one query", symbol:"q=(u,t)", text:ko?"사용자 u의 날짜 t 하루를 하나의 순위 문제로 묶습니다. 같은 사용자라도 날짜가 달라지면 별도 질의입니다.":"Bundle user u on date t into one ranking problem. The next day for the same user is a separate query."},
    {n:"2", term:ko?"후보 기사를 모은다":"Assemble candidates", symbol:"Aq", text:ko?"그날 클릭한 기사 Y, 클릭 기사를 뺀 보존 추천 기사 R, 새 비교 기사 N을 합치고 중복을 제거합니다.":"Combine clicked articles Y, retained non-clicks R, and introduced articles N, then remove duplicates."},
    {n:"3", term:ko?"기사마다 한 행을 만든다":"Build one row per article", symbol:"xq,i ∈ Rᵈ", text:ko?"후보 기사 i 하나를 d개의 숫자로 설명합니다. d는 기사 수가 아니라 기사 한 개의 특성 수입니다.":"Describe candidate article i with d numbers. Here d is the features per article, not the article count."},
    {n:"4", term:ko?"학습용 정답을 붙인다":"Attach the training label", symbol:"yq,i ∈ {0,1}", text:ko?"그날 클릭된 기사면 1, 클릭이 관측되지 않았으면 0입니다. 0은 싫어함이나 실제 미노출을 뜻하지 않습니다.":"Use 1 for a clicked article that day and 0 for no observed click. Zero does not mean dislike or verified non-exposure."},
    {n:"5", term:ko?"모델이 점수를 낸다":"Produce model scores", symbol:"sq,i=fθ(xq,i)", text:ko?"각 후보에 정렬용 숫자 하나가 생깁니다. 이 점수는 보정된 클릭 확률이나 사용자 전체 점수가 아닙니다.":"Each candidate receives one ordering number. It is not a calibrated click probability or a global user score."},
    {n:"6", term:ko?"같은 질의 안에서 정렬한다":"Rank within the query", symbol:"πq=argsort↓(sq)", text:ko?"같은 질의에서 점수가 큰 기사부터 세웁니다. NDCG@10은 클릭 기사가 위쪽에 배치됐는지 평가합니다.":"Sort articles by score within that query. NDCG@10 evaluates whether clicked articles appear near the top."},
  ];
  return <section className="bg" aria-labelledby="bg-title">
    <header><div><span>{ko?"처음 읽는 순서":"FIRST-TIME READER MAP"}</span><h2 id="bg-title">{ko?"데이터에서 최종 순위까지, 여섯 단계":"The whole pipeline for a first-time reader"}</h2></div><p>{ko?"먼저 아래 흐름을 잡아 두면 11-D·19-D·25-D 비교를 쉽게 읽을 수 있습니다. 세 구성의 핵심 차이는 3단계에서 후보 기사 한 행을 어떤 숫자로 채우는가입니다.":"Once these six steps are clear, the later 11-D, 19-D, and 25-D comparisons are simply different choices for the numbers placed in each article row at Step 3."}</p></header>
    <div className="bg-steps">{steps.map((step,index)=><article key={step.n}><span>{step.n}</span><div><b>{step.term}</b><code>{step.symbol}</code><p>{step.text}</p></div>{index<steps.length-1&&<i>→</i>}</article>)}</div>
    <div className="bg-running">
      <div><span>{ko?"계속 사용하는 예시":"Running example"}</span><b>U-017 · 2026-05-10</b><p>{ko?"사용자 한 명의 하루를 설명하는 합성 예시이며, 실제 평가 성능값은 아닙니다.":"A synthetic example of one user-day, not a reported performance result."}</p></div>
      <div><small>{ko?"관측 클릭":"clicked"}</small><strong>2</strong><code>|Yq|</code></div><i>+</i>
      <div><small>{ko?"보존 추천 미클릭":"retained non-click"}</small><strong>5</strong><code>|Rqⁿᶜ|</code></div><i>+</i>
      <div><small>{ko?"새 비교 기사":"introduced"}</small><strong>8</strong><code>|Nq|</code></div><i>=</i>
      <div className="is-total"><small>{ko?"후보 행":"candidate rows"}</small><strong>15</strong><code>|Aq|</code></div><i>→</i>
      <div className="is-total"><small>{ko?"Complete PEC 입력":"Complete PEC input"}</small><strong>15×25</strong><code>Xq</code></div>
    </div>
    <div className="bg-confusions">
      <p><b>{ko?"15와 25는 무엇이 다른가?":"How do 15 and 25 differ?"}</b>{ko?"15는 후보 기사 행의 수이고, 25는 기사 한 행에 들어가는 특성 열의 수입니다.":"Fifteen is the number of candidate rows; 25 is the feature columns in each article row."}</p>
      <p><b>{ko?"특성과 정답 라벨은 같은가?":"Are feature and label the same?"}</b>{ko?"아닙니다. 특성 x는 모델에 넣는 설명값이고, 라벨 y는 학습할 때 맞히도록 주는 정답입니다.":"No. Feature x describes the article to the model; label y is the target supplied during fitting."}</p>
      <p><b>{ko?"모델 점수와 평가 지표는 같은가?":"Are score and metric the same?"}</b>{ko?"아닙니다. 모델 점수는 기사마다 하나씩 나오고, NDCG·Recall·MRR은 완성된 순위 전체를 평가합니다.":"No. The model emits a score per article; NDCG, Recall, and MRR evaluate the completed ranked list."}</p>
    </div>
  </section>;
}

export function ComparisonReadingGuide({ lang }: { lang: Lang }) {
  const ko = lang === "ko";
  return <section className="crg" aria-labelledby="crg-title">
    <header><span>HOW TO READ A COMPARISON</span><h3 id="crg-title">{ko?"모든 비교를 세 문장으로 읽는 법":"Read every comparison in three sentences"}</h3><p>{ko?"모델 이름과 차원부터 외우지 말고, 무엇을 그대로 두고 무엇 하나만 바꿨는지 확인하세요.":"Do not memorize model names and dimensions first. Identify what stays fixed and what single component changes."}</p></header>
    <div className="crg-three">
      <article><span>01</span><b>{ko?"무엇이 같은가?":"What stays fixed?"}</b><p>{ko?"같은 평가 구간, 같은 질의와 후보 행, 같은 라벨을 사용합니다. 가능한 비교에서는 최종 점수 모델도 같게 둡니다.":"The same evaluation regime, query and candidate rows, labels, and, where applicable, downstream scorer."}</p></article>
      <article><span>02</span><b>{ko?"무엇만 바뀌는가?":"What changes?"}</b><p>{ko?"정보 출처, 표현 방식, 제거한 입력 블록, 학습기, 후보 재선정 가운데 해당 실험이 지정한 요소만 바꿉니다.":"The designated input source, representation, removed block, learner, or candidate reselection."}</p></article>
      <article><span>03</span><b>{ko?"무슨 질문에 답하는가?":"What question is answered?"}</b><p>{ko?"바꾼 요소가 같은 질의의 순위 품질을 개선했는지 묻습니다. 한 비교의 결론을 모든 모델에 확대하지 않습니다.":"Whether that changed element improves ranking quality on the same queries, without generalizing the result to every possible model."}</p></article>
    </div>
    <div className="crg-families">
      <article><b>{ko?"입력 정보 비교":"Input-information comparison"}</b><code>Control ↔ PEC</code><p>{ko?"P/E/C 정보를 추가하는 것이 유용한가?":"Does adding P/E/C information help?"}</p></article>
      <article><b>{ko?"표현 방식 비교":"Representation comparison"}</b><code>Direct ↔ Complete ↔ Fusion</code><p>{ko?"원 좌표 유지, interaction 추가, learned transform 중 무엇이 유리한가?":"Is it better to retain coordinates, add interactions, or use a learned transform?"}</p></article>
      <article><b>{ko?"정보 제거 비교":"Source-removal comparison"}</b><code>No-E · joint removal</code><p>{ko?"특정 source를 사용할 수 없어도 남는 효과가 있는가?":"Does useful signal remain when a source is unavailable?"}</p></article>
      <article><b>{ko?"학습기 점검":"Learner check"}</b><code>ExtraTrees ↔ neural variants</code><p>{ko?"PEC의 이점이 특정 tree 모델에만 묶여 있는가?":"Is the PEC benefit tied only to one tree learner?"}</p></article>
      <article><b>{ko?"후보 구성 점검":"Candidate-construction check"}</b><code>fixed-model reselection</code><p>{ko?"한 번의 후보 추출이나 tie order 때문에 생긴 결과인가?":"Is the result caused by one candidate draw or tie order?"}</p></article>
    </div>
    <aside><b>{ko?"차원이 크면 더 좋은 모델인가?":"Does a larger dimension mean a better model?"}</b><p>{ko?"아닙니다. 25-D는 정보 열이 25개라는 뜻일 뿐입니다. 성능은 NDCG@10과 paired confidence interval로 판단하며, 19-D가 25-D와 통계적으로 구분되지 않을 수도 있습니다.":"No. 25-D only means 25 input columns. Performance is judged by NDCG@10 and paired confidence intervals; 19-D may be statistically indistinguishable from 25-D."}</p></aside>
  </section>;
}

type EquationMode = "ndcg" | "meanHistory" | "summaries" | "attention" | "popularity" | "preference" | "trace" | "ensemble";

export { EquationWalkthrough as EquationLab } from "./equation-walkthrough";
