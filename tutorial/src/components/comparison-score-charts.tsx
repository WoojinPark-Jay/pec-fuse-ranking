"use client";

import { useState } from "react";
import "./comparison-score-charts.css";

type Row = { label:string; a:number; b:number; delta:number; ci?:[number,number] };
type Series = { names:[string,string]; rows:Row[]; source:string; scope:[string,string] };
const row=(label:string,a:number,b:number,delta:number,ci?:[number,number]):Row=>({label,a,b,delta,ci});
const series:Record<string,Series>={
  headline:{names:["Operational control","Complete PEC"],rows:[row("Recent-window",.7309,.7971,.0662,[.0523,.0793]),row("Same-day",.7499,.7717,.0218,[.0080,.0363])],source:"v80 · tables/headline.tex",scope:["Headline: 최종 선택한 두 모델의 고정 test pool 결과","Headline: selected models on fixed test pools"]},
  collapsed:{names:["Scalar collapsed","Complete PEC · audit"],rows:[row("Recent-window",.7782,.7915,.0133,[.0047,.0215]),row("Same-day",.7603,.7710,.0107,[.0009,.0206])],source:"v80 · tables/core_metrics_recent.tex, core_metrics_same.tex, compression.tex",scope:["Scalar audit: 이 비교에서 선택한 PEC fit입니다. Headline PEC 점수와 섞지 않습니다.","Scalar audit: its own selected PEC fit, not the headline PEC fit."]},
  early:{names:["Learned 5-D fusion","Direct 19-D"],rows:[row("Recent-window",.7912,.7952,.0041,[.0009,.0068]),row("Same-day",.7675,.7704,.0030,[-.0028,.0088])],source:"v80 · tables/direct_complete.tex",scope:["Shared-context audit: 다섯 학습 seed의 평균, 두 모델 모두 19차원","Shared-context audit: five-training-seed means; both models have 19 inputs"]},
  interactions:{names:["Direct 19-D","Complete PEC 25-D"],rows:[row("Recent-window",.7952,.7962,.0010,[-.0029,.0047]),row("Same-day",.7704,.7721,.0016,[-.0025,.0053])],source:"v80 · tables/direct_complete.tex",scope:["Shared-context audit: 다섯 학습 seed의 평균; 추가되는 것은 여섯 explicit product","Shared-context audit: five-training-seed means; Complete adds six explicit products"]},
  noe:{names:["No-E control","No-E PEC"],rows:[row("Recent-window",.6232,.6886,.0655,[.0474,.0826]),row("Same-day",.5461,.6335,.0874,[.0694,.1058])],source:"v80 · tables/core_metrics_recent.tex, core_metrics_same.tex, trace.tex",scope:["No-E audit: E를 제거하고 각각 선택·학습한 모델","No-E audit: separately selected and fitted models without E"]},
  joint:{names:["Context only · 8-D","Context + C · 12-D"],rows:[row("Recent-window",.5972,.6499,.0526,[.0370,.0686]),row("Same-day",.5340,.5584,.0244,[.0056,.0450])],source:"v80 · appendices/c_joint_pe_removal.tex · joint_pe_metrics",scope:["Joint-removal audit: seed 42 결과; 두 모델 모두 P/E 유래 입력 제거","Joint-removal audit: seed 42; both models exclude P/E-derived inputs"]},
  neural:{names:["Neural control","Neural PEC"],rows:[row("Recent-window",.7582582857045829,.7967391793977392,.0385,[.0287,.0473]),row("Same-day",.708039711533244,.7568792545448266,.0488,[.0361,.0609])],source:"v80 · tables/neural.tex; reports/experiments/cutoff_corrected_diagnostics_2026_09_10/neural_test_metrics.csv",scope:["Neural audit: 같은 신경망 구조에서 입력을 control/PEC로 바꾼 비교","Neural audit: control versus PEC inputs in the same neural architecture"]},
  mind:{names:["P+E+C Direct · 15-D","Full PEC proxy · 21-D"],rows:[row("BGE-M3",.3796788525,.3827545430,.0030756904,[.0018503143,.0043113862]),row("BGE-base",.3805381623,.3914502758,.0109121135,[.0096252991,.0121705698])],source:"v80 · access/data/mind_expanded_results.csv · mind_expanded_user_bootstrap.json",scope:["MIND-small expanded pool: 30,000 dev impressions; 10,000회 명목 paired user-cluster bootstrap CI","MIND-small expanded pool: 30,000 dev impressions; nominal paired user-clustered CIs from 10,000 bootstrap replicates"]},
};
const pool:Series[]=[
  {names:["Operational control","Complete PEC · headline"],rows:[row("Original",.7499,.7717,.0218,[.0080,.0363]),row("Seed 7",.6654,.7331,.0677,[.0524,.0842]),row("Seed 13",.6508,.7255,.0747,[.0614,.0891]),row("Seed 42",.6562,.7216,.0654,[.0513,.0804]),row("Seed 101",.6545,.7303,.0758,[.0614,.0912]),row("Seed 202",.6648,.7286,.0638,[.0495,.0799])],source:"v80 · tables/pool_sensitivity.tex · headline fits",scope:["Same-day 후보 재선정: 원래 pool과 다섯 seed. 모델은 다시 학습하지 않습니다.","Same-day candidate reselection: original pool plus five seeds; models are not retrained."]},
  {names:["Scalar collapsed","Complete PEC · audit"],rows:[row("Original",.7603,.7710,.0107,[.0009,.0206]),row("Seed 7",.6873,.7174,.0300,[.0208,.0396]),row("Seed 13",.6815,.7053,.0238,[.0145,.0336]),row("Seed 42",.6740,.7006,.0266,[.0155,.0375]),row("Seed 101",.6761,.7066,.0304,[.0213,.0404]),row("Seed 202",.6882,.7154,.0272,[.0177,.0372])],source:"v80 · tables/pool_sensitivity.tex · compression-audit fits",scope:["Same-day 후보 재선정: 이 탭의 PEC는 compression-audit fit입니다.","Same-day candidate reselection: this tab uses the compression-audit PEC fit."]},
];
const signed=(v:number)=>`${v<0?"−":"+"}${Math.abs(v).toFixed(4)}`;

export function ComparisonScoreCharts({lang,comparisonId,summary}:{lang:"ko"|"en";comparisonId:string;summary:{takeaway:[string,string];boundary:[string,string]}}){
  const ko=lang==="ko",t=(a:string,b:string)=>ko?a:b;
  const [view,setView]=useState<"scores"|"difference">("scores");
  const [reference,setReference]=useState(0);
  const [zoom,setZoom]=useState(false);
  const s=comparisonId==="pool"?pool[reference]:series[comparisonId];
  if(!s)return null;
  const isMind=comparisonId==="mind";
  const descriptive=s.rows.every(r=>!r.ci);
  const small=s.rows.every(r=>Math.abs(r.delta)<.025);
  const tight=small && zoom;
  const low=tight?-.03:-.04,high=tight?.03:.12;
  const x=(v:number)=>36+(v-low)/(high-low)*560;
  const ticks=tight?[-.03,-.015,0,.015,.03]:[-.04,0,.04,.08,.12];
  return <section className="csc" aria-label={t("두 모델의 실제 결과 비교","Observed scores for both models")}>
    <header className="csc-head"><span>{t("관측된 결과 · NDCG@10","OBSERVED RESULTS · NDCG@10")}</span><h4>{t(...summary.takeaway)}</h4></header>
    {comparisonId==="pool" && <div className="csc-controls" role="group" aria-label={t("재선정 비교 기준","Reselection reference")}><button type="button" aria-pressed={reference===0} onClick={()=>setReference(0)}>{t("운영 control과 비교","Versus operational control")}</button><button type="button" aria-pressed={reference===1} onClick={()=>setReference(1)}>{t("Collapsed와 비교","Versus collapsed")}</button></div>}
    <div className="csc-legend"><div><b className="csc-key csc-a">A</b><strong>{s.names[0]}</strong></div><div><b className="csc-key csc-b">B</b><strong>{s.names[1]}</strong></div></div>
    <p className="csc-scope">{t(...s.scope)}</p>
    <div className="csc-toolbar"><div className="csc-controls" role="group" aria-label={t("차트 표시 방식","Chart display")}><button type="button" aria-pressed={view==="scores"} onClick={()=>setView("scores")}>{t("두 모델 점수","Both model scores")}</button><button type="button" aria-pressed={view==="difference"} onClick={()=>setView("difference")}>{t("차이와 불확실성","Difference and uncertainty")}</button></div>{view==="difference" && small && <button className="csc-zoom" type="button" aria-pressed={tight} onClick={()=>setZoom(!zoom)}>{tight?t("공통 눈금","Shared scale"):t("차이 확대","Zoom in")}</button>}</div>
    <p className="csc-how">{view==="scores"?t("A와 B가 같은 0~1 눈금에서 출발합니다. 막대가 길수록 클릭 기사를 더 높은 순위에 둔 결과입니다. 작은 차이는 ‘차이와 불확실성’에서 확대해 보세요.","A and B use the same zero-based 0–1 scale. Longer bars indicate better placement of clicked articles. Use ‘Difference and uncertainty’ to inspect small gaps."):t("차이 = B − A. 0의 오른쪽은 B가 높고, 왼쪽은 A가 높습니다. 검은 가로선은 차이의 95% CI입니다. 0을 걸치면 방향이 불확실합니다.","Difference = B − A. Right of zero favors B; left favors A. Black whiskers show the 95% CI of the difference. An interval crossing zero leaves the direction unresolved.")}</p>
    <div className={`csc-groups ${comparisonId==="pool"?"csc-pool":""}`}>
      {s.rows.map(r=><figure className="csc-group" key={r.label}>
        <figcaption><strong>{r.label}</strong><span>Δ {signed(r.delta)}{descriptive?" ≈":""}</span></figcaption>
        {view==="scores"?<>
          {([r.a,r.b] as const).map((value,i)=><div className="csc-bar-row" key={i}><b className={`csc-key ${i===0?"csc-a":"csc-b"}`}>{i===0?"A":"B"}</b><div className="csc-track" role="img" aria-label={`${s.names[i]}: NDCG@10 ${value.toFixed(4)}`}><span className={i===0?"csc-fill-a":"csc-fill-b"} style={{width:`${value*100}%`}}/></div><strong>{value.toFixed(4)}</strong></div>)}
          <div className="csc-axis"><span>0</span><span>0.25</span><span>0.50</span><span>0.75</span><span>1.00</span></div>
        </>:<svg viewBox="0 0 632 108" role="img" aria-label={`${r.label}: ${s.names[1]} minus ${s.names[0]} ${signed(r.delta)}${r.ci?`, 95% CI ${r.ci[0]} to ${r.ci[1]}`:", descriptive difference"}`}>
          {ticks.map(v=><g key={v}><line x1={x(v)} x2={x(v)} y1="8" y2="79" stroke={v===0?"#254a5d":"#dce5eb"} strokeWidth={v===0?2:1} strokeDasharray={v===0?"4 3":undefined}/><text x={x(v)} y="100" textAnchor="middle" fontSize="15" fill="#3c5665">{v===0?"0":v.toFixed(3)}</text></g>)}
          <rect x={x(Math.min(0,r.delta))} y="20" width={Math.abs(x(r.delta)-x(0))} height="27" fill={r.delta<0?"#6e8092":"#247995"} rx="2"/>
          <circle cx={x(r.delta)} cy="33.5" r="4" fill="#193b4d"/>
          {r.ci && <g stroke="#173d50" strokeWidth="2.5"><line x1={x(r.ci[0])} x2={x(r.ci[1])} y1="65" y2="65"/><line x1={x(r.ci[0])} x2={x(r.ci[0])} y1="59" y2="71"/><line x1={x(r.ci[1])} x2={x(r.ci[1])} y1="59" y2="71"/></g>}
        </svg>}
        <div className={`csc-stat ${r.ci && r.ci[0]<=0 && r.ci[1]>=0?"csc-uncertain":""}`}>
          {r.ci?<><strong>{r.ci[0]>0?t("B 우위를 지지","Supports B advantage"):r.ci[1]<0?t("A 우위를 지지","Supports A advantage"):t("차이의 방향 불확실","Direction unresolved")}</strong><span>95% CI [{signed(r.ci[0])}, {signed(r.ci[1])}]</span></>:<><strong>{t("관측 점수에서는 A가 높음","A has the higher observed score")}</strong><span>{t("CI 미보고 · 유의성 판단 아님","CI not reported · not a significance claim")}</span></>}
        </div>
      </figure>)}
    </div>
    <div className="csc-footnotes"><p>{isMind?t("MIND의 Δ는 Full 21-D − Direct 15-D 명시적 product 추가 효과입니다. CI는 10,000회 사용자 군집 bootstrap의 명목 95% 구간이며 다중비교 보정은 적용하지 않았습니다.","The MIND delta is Full 21-D minus Direct 15-D: the added value of six explicit product fields. CIs are nominal 95% intervals from 10,000 user-clustered bootstrap replicates without multiplicity adjustment."):t("점수는 소수 넷째 자리로 표시합니다. Δ와 신뢰구간은 원고의 보고값이므로, 화면에 반올림해 표시한 점수끼리 빼면 약 0.0001의 차이가 날 수 있습니다. 감사 실험의 95% 신뢰구간에는 다중비교 보정을 적용하지 않았습니다.","Scores are shown to four decimals. Deltas and CIs follow the manuscript; subtracting rounded scores can differ by about 0.0001. Audit intervals are nominal 95% CIs without multiplicity adjustment.")}</p>{view==="difference" && tight && <p>{t("현재 확대 눈금입니다. 다른 케이스의 막대 길이와 직접 비교하지 마세요.","The difference scale is zoomed. Do not directly compare bar lengths with other cases.")}</p>}<details><summary>{t("수치 출처와 읽을 때 주의할 점","Data source and interpretation")}</summary><code>{s.source}</code><p>{t("학습용 합성 예시가 아니라 원고·보관된 실험 결과의 집계값입니다. NDCG@10은 순위 평가 지표이며 클릭 확률이나 온라인 CTR이 아닙니다.","These are aggregate manuscript/archived experimental results, not synthetic teaching examples. NDCG@10 measures ranking quality, not click probability or online CTR.")}</p></details></div>
    <aside className="csc-boundary"><strong>{t("해석의 범위","Interpretation boundary")}</strong><p>{t(...summary.boundary)}</p></aside>
  </section>;
}
