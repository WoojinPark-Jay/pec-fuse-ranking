"use client";

import { ComparisonScoreCharts } from "./comparison-score-charts";
import "./comparison-evidence.css";

type Lang = "ko" | "en";
type Evidence = {
  names: [string, string];
  delta?: [number, number];
  ci?: [[number, number], [number, number]];
  certainty?: [boolean, boolean];
  takeaway: [string, string];
  boundary: [string, string];
};
const evidence: Record<string, Evidence> = {
  headline: { names: ["Operational control", "Complete PEC"], delta: [.0662, .0218], certainty: [true,true], takeaway: ["두 후보 조건 모두 Complete PEC의 순위 품질이 더 높았습니다.", "Complete PEC achieved higher ranking quality in both candidate regimes."], boundary: ["전체 입력 구성의 이득입니다. 특정 특징 하나의 효과나 온라인 클릭률 개선까지 뜻하지는 않습니다.", "This supports the complete input configuration, not a causal effect of one feature or an online click-through lift."] },
  collapsed: { names: ["Scalar collapsed", "Complete PEC"], takeaway: ["두 조건에서 Complete PEC가 수식으로 합친 scalar 구성보다 높았습니다.", "Complete PEC scored higher than the rule-based scalar configuration in both regimes."], boundary: ["입력 차원과 context, interaction도 다릅니다. ‘압축만 바꿔서 생긴 효과’로 읽으면 안 됩니다.", "Width, context, and interactions also differ. This is not an isolated effect of compression."] },
  early: { names: ["Learned 5-D fusion", "Direct 19-D"], delta: [.0041,.0030], ci: [[.0009,.0068],[-.0028,.0088]], certainty: [true,false], takeaway: ["Recent-window에서는 Direct 우위를 지지하지만, same-day에서는 차이의 방향이 아직 불확실합니다.", "Recent-window supports Direct’s advantage; the same-day difference remains uncertain."], boundary: ["둘 다 19차원입니다. 시험한 변환 방식과의 비교이지, 모든 신경망 fusion보다 낫다는 뜻은 아닙니다.", "Both inputs are 19-dimensional. The comparison concerns the tested transform, not all neural fusion methods."] },
  interactions: { names: ["Direct 19-D", "Complete PEC 25-D"], delta: [.0010,.0016], certainty: [false,false], takeaway: ["평균은 Complete가 조금 높지만, 여섯 곱셈 특징의 추가 이득은 두 조건 모두 확실하지 않습니다.", "Complete has slightly higher means, but the added benefit of six interaction features is unresolved in both regimes."], boundary: ["CI가 0을 포함한다는 것은 ‘차이를 확정하지 못했다’는 뜻입니다. 두 모델이 동등하다는 증명은 아닙니다.", "Intervals containing zero leave the difference unresolved; they do not establish equivalence."] },
  noe: { names: ["No-E control", "No-E PEC"], delta: [.0655,.0874], certainty: [true,true], takeaway: ["추천 trace 입력 없이 다시 학습해도 P/C를 더한 구성이 더 높았습니다.", "The P/C-enhanced configuration scored higher even when models were retrained without trace inputs."], boundary: ["E=0인 행만 추린 결과가 아닙니다. trace를 제거하고 각각 학습한 모델끼리 비교합니다.", "These are separately fitted no-E models, not a post-hoc subset of rows with E=0."] },
  joint: { names: ["Context only · 8-D", "Context + C · 12-D"], delta: [.0526,.0244], certainty: [true,true], takeaway: ["프로필과 trace를 모두 빼도 과거 클릭 기반 C를 추가한 효과가 남았습니다.", "Prior-click C retained useful signal after both profile and trace inputs were removed."], boundary: ["여기서는 seed 42의 비교를 봅니다. 이 결과가 full PEC의 모든 입력이 예측 시점에 존재했음을 입증하지는 않습니다.", "This is the seed-42 comparison. It does not establish prediction-time availability of every full-PEC input."] },
  neural: { names: ["Neural control", "Neural PEC"], delta: [.0385,.0488], certainty: [true,true], takeaway: ["신경망 scorer에서도 PEC 입력을 더한 쪽이 두 조건 모두 더 높았습니다.", "Adding PEC inputs improved both regimes with the neural scorer too."], boundary: ["입력 설계의 효과가 tree에만 묶이지 않는다는 근거입니다. ExtraTrees와 neural 중 누가 우승했는지를 보여주는 비교는 아닙니다.", "The input benefit is not confined to trees. This is not an ExtraTrees-versus-neural contest."] },
  pool: { names: ["Control / collapsed", "Complete PEC"], takeaway: ["평가 후보를 다섯 번 다시 구성해도 두 기준 모델 대비 차이의 CI가 모두 양수였습니다.", "Across five candidate reselections, intervals for gains over both references remained positive."], boundary: ["학습은 다시 하지 않습니다. 평가 후보 구성에 대한 점검이며, 새 플랫폼에서의 성능 검증은 아닙니다.", "Models are not retrained. This checks evaluation-pool sensitivity, not performance on a new platform."] },
  mind: { names: ["P+C", "P+E+C"], takeaway: ["이 공개 proxy에서는 공통 Controls를 포함한 P+C 15차원 모델이 Full 24차원 모델보다 세 encoder 모두에서 더 높았습니다.", "In this public proxy, P+C (15 fields, including controls) scored higher than Full (24 fields) for all three encoders."], boundary: ["P는 history-derived proxy이며 Full은 E와 상호작용 6개를 함께 추가합니다. E만의 효과나 사설 PEC의 독립 재현으로 읽지 않습니다.", "P is history-derived; Full adds both E and six products to P+C. This is not an E-only ablation or an independent replication of private PEC."] },
};
const fmt = (v:number) => `${v < 0 ? "−" : "+"}${Math.abs(v).toFixed(4)}`;

export function ComparisonEvidence({lang, comparisonId}:{lang:Lang;comparisonId:string}) {
  const summary=evidence[comparisonId];
  return summary ? <ComparisonScoreCharts key={comparisonId} lang={lang} comparisonId={comparisonId} summary={summary}/> : null;
}

export function ComparisonProtocol({lang,item}:{lang:Lang;item:{asks:string;same:string;change:string;learned:string;limit:string}}) {
  const ko=lang==="ko";
  return <section className="ce-protocol">
    <h4>{ko?"결과를 이해하기 위한 실험 설계":"The experimental design behind the result"}</h4>
    <div className="ce-question"><span>01 · {ko?"답하려는 질문":"Question"}</span><p>{item.asks}</p></div>
    <div className="ce-design-pair"><div><span>02 · {ko?"비교의 공통 조건":"Shared conditions"}</span><p>{item.same}</p></div><div><span>03 · {ko?"두 구성에서 달라진 부분":"What differs"}</span><p>{item.change}</p></div></div>
    <details><summary>{ko?"학습 방식과 해석 범위를 더 자세히 보기":"More on fitting and interpretation"}</summary><strong>{ko?"무엇을 학습했나?":"What was learned?"}</strong><p>{item.learned}</p><strong>{ko?"해석의 범위":"Scope of interpretation"}</strong><p>{item.limit}</p></details>
  </section>;
}
