"use client";

import { useMemo, useState } from "react";
import { DataMicroscope } from "./data-microscope";
import { ComparisonEvidence, ComparisonProtocol } from "./comparison-evidence";
import { BeginnerGuide, CandidateBudgetLab, ComparisonDataPreview, ComparisonReadingGuide, EquationLab, ScorerExplainer } from "./comparison-details";

type Lang = "ko" | "en";
type BlockKind = "B" | "H" | "P" | "E" | "C" | "Z" | "psi" | "F";
type Block = { kind: BlockKind; label: string; width: number };
type Model = { id: string; name: string; width: number; blocks: Block[]; note: string };
type Comparison = {
  id: string;
  group: string;
  number: string;
  title: string;
  short: string;
  left: string;
  right: string;
  same: string;
  change: string;
  learned: string;
  asks: string;
  limit: string;
  result: string;
  resultTone: "positive" | "mixed" | "boundary";
};

const koModels: Model[] = [
  { id: "control11", name: "Operational control", width: 11, blocks: [{ kind: "B", label: "B · 운영 control", width: 11 }], note: "실제 운영형 baseline의 11개 필드. complete record의 Z 11개와 동일한 집합이 아니다." },
  { id: "collapsed12", name: "Scalar collapsed", width: 12, blocks: [{ kind: "B", label: "B", width: 11 }, { kind: "F", label: "수식 scalar", width: 1 }], note: "P/C를 사람이 정한 하나의 점수로 먼저 합친다." },
  { id: "early12", name: "Learned early fusion", width: 12, blocks: [{ kind: "B", label: "B", width: 11 }, { kind: "F", label: "학습 scalar", width: 1 }], note: "P/C를 logistic 또는 MLP가 학습한 하나의 값으로 먼저 합친다." },
  { id: "scalarDirect17", name: "Scalar-audit Direct", width: 17, blocks: [{ kind: "B", label: "B", width: 11 }, { kind: "E", label: "combined E", width: 1 }, { kind: "P", label: "P", width: 1 }, { kind: "C", label: "C summaries", width: 4 }], note: "운영 baseline 위에 combined E와 원래의 다섯 P/C 좌표를 직접 제공한다." },
  { id: "direct19", name: "Direct", width: 19, blocks: [{ kind: "H", label: "H · 공통 context", width: 14 }, { kind: "P", label: "P", width: 1 }, { kind: "C", label: "C summaries", width: 4 }], note: "상호작용 없이 source-preserving semantic 좌표를 그대로 둔다." },
  { id: "fusion19", name: "Learned 5-D fusion", width: 19, blocks: [{ kind: "H", label: "H · 공통 context", width: 14 }, { kind: "F", label: "gθ(P,C)", width: 5 }], note: "동일한 다섯 입력을 학습 변환한 5차원 hidden vector로 바꾼다." },
  { id: "complete25", name: "Complete PEC", width: 25, blocks: [{ kind: "H", label: "H · E+Z context", width: 14 }, { kind: "P", label: "P", width: 1 }, { kind: "C", label: "C summaries", width: 4 }, { kind: "psi", label: "ψ products", width: 6 }], note: "Direct의 19개 필드에 여섯 deterministic product를 더한다." },
  { id: "noE9", name: "No-E control", width: 9, blocks: [{ kind: "B", label: "E-free control", width: 9 }], note: "trace 관련 control을 제거한 baseline." },
  { id: "noE18", name: "No-E PEC", width: 18, blocks: [{ kind: "Z", label: "E-free context", width: 9 }, { kind: "P", label: "P", width: 1 }, { kind: "C", label: "C", width: 4 }, { kind: "psi", label: "남은 P–C products", width: 4 }], note: "E와 E를 포함한 product를 제거하고 P/C 구조는 유지한다." },
  { id: "context8", name: "Context only", width: 8, blocks: [{ kind: "Z", label: "P/E-free context", width: 8 }], note: "프로필 유래 입력과 trace 입력을 함께 제거한다." },
  { id: "contextC12", name: "Context + C", width: 12, blocks: [{ kind: "Z", label: "P/E-free context", width: 8 }, { kind: "C", label: "C summaries", width: 4 }], note: "동일한 8개 context에 과거 클릭 기반 C 네 개만 더한다." },
];

const enBlockLabels: Record<string, string> = {
  "B · 운영 control": "B · operational controls",
  "수식 scalar": "Rule-based scalar",
  "학습 scalar": "Learned scalar",
  "H · 공통 context": "H · shared context",
  "남은 P–C products": "Remaining P–C products",
};

const enModels: Model[] = koModels.map((model) => ({
  ...model,
  blocks: model.blocks.map((block) => ({
    ...block,
    label: enBlockLabels[block.label] ?? block.label,
  })),
}));

const koComparisons: Comparison[] = [
  { id: "headline", group: "핵심 성능", number: "01", title: "Complete PEC vs operational control", short: "전체 source-preserving record가 운영 baseline보다 나은가?", left: "control11", right: "complete25", same: "같은 query–candidate rows, 같은 라벨, 같은 temporal regime, ExtraTrees 계열 scorer.", change: "11-D 운영 입력 대신 P/E/C/Z와 interaction을 포함한 25-D record를 제공한다.", learned: "두 모델은 각각 별도로 선택·학습된다. P/E/C/ψ 계산 자체는 deterministic이다.", asks: "실제 구현된 complete interface 전체가 운영형 control보다 순위를 개선하는가?", limit: "25개 중 어느 필드가 원인인지, 온라인 CTR이 오르는지는 이 비교만으로 말하지 않는다.", result: "NDCG@10: recent +0.0662, same-day +0.0218; 두 paired CI 모두 0보다 큼.", resultTone: "positive" },
  { id: "collapsed", group: "압축 방식", number: "02", title: "Complete PEC vs scalar collapsed", short: "출처를 하나의 수식 점수로 일찍 합치면 무엇을 잃는가?", left: "collapsed12", right: "complete25", same: "같은 후보와 평가 지표. 양쪽 모두 context를 가지지만 context schema와 표현 폭은 다르다.", change: "P/C를 1개 scalar로 압축한 12-D 입력과 source별 좌표·products를 둔 25-D 입력을 비교한다.", learned: "Collapsed scalar는 고정 수식이며 학습되지 않는다. 최종 scorer만 fitted된다.", asks: "완전한 source-preserving 구성과 수동 scalar 구성 중 어느 구현이 더 유용한가?", limit: "차원, context feature, interactions도 함께 달라지는 feature-set 비교다. 순수한 압축 효과 하나로 분해하지 않는다.", result: "두 private regime에서 complete PEC가 collapsed보다 높음; headline과 audit fit은 구분해서 읽는다.", resultTone: "positive" },
  { id: "early", group: "압축 방식", number: "03", title: "Direct vs learned early fusion", short: "같은 정보 폭에서 원래 좌표와 학습 변환을 직접 비교한다.", left: "fusion19", right: "direct19", same: "최종 입력은 모두 19-D: H 14개 + semantic 5개. interactions 없음.", change: "오른쪽은 P와 C 네 좌표를 그대로 유지하고, 왼쪽은 그 다섯 값을 5-D learned representation으로 치환한다.", learned: "왼쪽의 gθ가 validation 과정에서 학습된다. 양쪽 최종 scorer도 각각 fitted된다.", asks: "차원 수를 맞췄을 때 source별 원래 좌표를 유지하는 것이 시험한 learned transform보다 유리한가?", limit: "모든 가능한 fusion network보다 Direct가 우월하다는 검정은 아니다.", result: "Direct − fusion: recent +0.0041 [0.0009, 0.0068]; same-day +0.0030 [−0.0028, 0.0088].", resultTone: "mixed" },
  { id: "interactions", group: "표현 폭", number: "04", title: "Complete 25-D vs Direct 19-D", short: "여섯 interaction product가 실제로 필요한가?", left: "direct19", right: "complete25", same: "동일한 H 14개와 원래 P/C 다섯 좌표. 같은 source-preserving 의미.", change: "Complete 쪽에 P×E, C×E, P×C의 deterministic products 여섯 개만 추가한다.", learned: "추가 여섯 값은 학습된 embedding이 아니라 입력값들의 곱이다. scorer가 사용 여부를 학습한다.", asks: "명시적 interaction 여섯 개가 compact Direct보다 추가 이득을 주는가?", limit: "CI가 0을 포함하면 동등성이 입증된 것이 아니라 추가 차이를 구별하지 못한 것이다.", result: "Complete − Direct: recent +0.0010, same-day +0.0016; 두 CI 모두 0 포함.", resultTone: "mixed" },
  { id: "noe", group: "입력 제거", number: "05", title: "No-E PEC vs no-E control", short: "추천 trace 없이도 분리된 P/C 표현이 도움이 되는가?", left: "noE9", right: "noE18", same: "E 관련 필드와 E-containing products를 양쪽에서 제거한 독립적 모델 선택·학습.", change: "E-free control에 P, C와 남는 P–C products를 추가한다.", learned: "후처리 slice가 아니라 E를 빼고 처음부터 별도로 학습한 모델들이다.", asks: "이득이 retained recommendation trace 하나에만 의존하는가?", limit: "E=0 행만 골라 보는 slice와 다른 estimand이며 실제 비노출을 뜻하지 않는다.", result: "No-E PEC가 두 regime의 no-E control보다 높아 trace 외 신호의 유용성을 지지.", resultTone: "positive" },
  { id: "joint", group: "입력 제거", number: "06", title: "Context + C vs context only", short: "프로필과 trace를 함께 없애도 prior-click consumption이 남는가?", left: "context8", right: "contextC12", same: "P 유래 입력과 E 입력을 모두 제거한 동일한 8-D context.", change: "오른쪽에 쿼리 이전 클릭으로 계산한 C_mean, C_max, C_top3, C_attention 네 값만 더한다.", learned: "C 값은 frozen article vectors와 prior history에서 결정적으로 계산한다. 두 scorer는 별도 fitted된다.", asks: "시점 불확실성이 있는 P/E 없이도 C가 ranking signal을 제공하는가?", limit: "전체 PEC의 시간적 유효성이나 prospective deployment를 검증하는 실험은 아니다.", result: "C 추가: recent +0.0526, same-day +0.0244; seed-42 paired CI 모두 0보다 큼.", resultTone: "positive" },
  { id: "neural", group: "학습기", number: "07", title: "Neural control vs neural PEC", short: "효과가 tree learner에만 생기는가?", left: "control11", right: "complete25", same: "동일한 neural scorer family와 평가 후보. 입력 interface만 control/PEC로 바꾼다.", change: "신경망의 candidate input에 source-preserving PEC 정보를 제공한다.", learned: "이 비교에서는 neural parameters가 학습된다. ExtraTrees 결과의 단순 재사용이 아니다.", asks: "PEC 입력의 효과가 ExtraTrees라는 한 learner family에만 묶여 있는가?", limit: "모든 neural news recommender와의 외부 benchmark는 아니다.", result: "Neural PEC − neural control: recent +0.0385, same-day +0.0488; 두 CI 모두 양수.", resultTone: "positive" },
  { id: "pool", group: "강건성", number: "08", title: "Fixed model under candidate reselection", short: "특정 negative sample 한 번에만 결과가 생겼는가?", left: "control11", right: "complete25", same: "학습된 모델과 설정은 고정. 후보 pool/tie-order seed만 다시 구성한다.", change: "평가 후보 집합을 seed 7, 13, 42, 101, 202로 바꾼다.", learned: "새 seed마다 모델을 다시 선택하거나 학습하지 않는다. 바뀌는 것은 evaluation rows다.", asks: "원래 후보 추출의 우연한 구성에 headline 차이가 과도하게 의존하는가?", limit: "새 사용자·새 플랫폼·새 trace 정책에 대한 외부 일반화 검정은 아니다.", result: "다섯 reselection 모두 operational control과 collapsed 대비 paired CI가 양수.", resultTone: "positive" },
  { id: "mind", group: "공개 경계", number: "09", title: "MIND P+C vs P+E+C", short: "다른 의미의 공개 proxy에서도 모든 source가 항상 필요한가?", left: "direct19", right: "complete25", same: "공개 뉴스 데이터에서 재정의한 P/E/C proxy와 동일한 encoder별 평가.", change: "P+C 표현에 proxy E를 추가한다.", learned: "MIND의 P는 독립 stated profile이 아니라 history-derived proxy다.", asks: "공개 proxy 환경에서 E 추가가 일관되게 이로운가, 아니면 source 의미에 따라 달라지는가?", limit: "private platform의 stated-profile/trace 구분을 독립 재현하는 실험이 아니다.", result: "세 encoder 모두 P+C가 P+E+C보다 높아, 모든 source의 보편적 우월성 대신 경계를 보여 줌.", resultTone: "boundary" },
];

const enComparisons: Comparison[] = [
  { id: "headline", group: "Core performance", number: "01", title: "Complete PEC vs operational control", short: "Does the full source-preserving record improve on the operational baseline?", left: "control11", right: "complete25", same: "The same query–candidate rows, labels, temporal regime, and ExtraTrees learner family.", change: "The input changes from the 11-D operational baseline to the 25-D P/E/C/Z record with interactions.", learned: "The two scorers are selected and fitted separately. P/E/C/ψ construction is deterministic.", asks: "Does the implemented complete interface improve ranking over the operational control?", limit: "This does not identify a causal field or establish online CTR lift.", result: "NDCG@10: recent +0.0662, same-day +0.0218; both paired intervals are above zero.", resultTone: "positive" },
  { id: "collapsed", group: "Compression", number: "02", title: "Complete PEC vs scalar collapsed", short: "What changes when source evidence is collapsed into one hand-built score?", left: "collapsed12", right: "complete25", same: "The candidate rows and metrics are shared; both sides contain context, but their schemas differ.", change: "A 12-D input with one hand-built P/C scalar is compared with the 25-D source-preserving record.", learned: "The collapsed scalar is fixed, not learned. Only the final scorer is fitted.", asks: "Which implemented feature set is more useful: complete PEC or manual scalar collapse?", limit: "Width, context fields, and interactions also differ, so this is a feature-set comparison rather than a pure compression estimand.", result: "Complete PEC is higher in both private regimes; headline and audit fits remain distinct.", resultTone: "positive" },
  { id: "early", group: "Compression", number: "03", title: "Direct vs learned 5-D fusion", short: "Compare original source coordinates with a learned transform at matched width.", left: "fusion19", right: "direct19", same: "Both final inputs are 19-D: 14 context fields plus five semantic coordinates. Neither uses explicit interactions.", change: "Direct retains P and the four C coordinates; fusion replaces them with a learned 5-D representation.", learned: "The left-side gθ is trained during selection. Both final scorers are fitted separately.", asks: "At matched width, does retaining original source coordinates outperform the tested learned transform?", limit: "This is not a claim against every possible fusion network.", result: "Direct − fusion: recent +0.0041 [0.0009, 0.0068]; same-day +0.0030 [−0.0028, 0.0088].", resultTone: "mixed" },
  { id: "interactions", group: "Representation width", number: "04", title: "Complete 25-D vs Direct 19-D", short: "Are the six explicit interaction products necessary?", left: "direct19", right: "complete25", same: "The same 14 context fields and five original P/C coordinates.", change: "Complete adds six deterministic P×E, C×E, and P×C products.", learned: "The six values are products, not learned embeddings; the scorer learns whether to use them.", asks: "Do explicit interactions improve on the compact Direct record?", limit: "An interval containing zero means the difference was unresolved, not that equivalence was proved.", result: "Complete − Direct: recent +0.0010, same-day +0.0016; both intervals include zero.", resultTone: "mixed" },
  { id: "noe", group: "Input removal", number: "05", title: "No-E PEC vs no-E control", short: "Does separated P/C evidence remain useful without retained trace features?", left: "noE9", right: "noE18", same: "E fields and E-containing products are removed before independent model selection and fitting.", change: "P, C, and the remaining P–C products are added to the E-free control.", learned: "These are independently trained models, not a post-hoc E=0 slice.", asks: "Is the gain entirely explained by retained recommendation traces?", limit: "This differs from filtering E=0 rows and does not identify verified non-exposure.", result: "No-E PEC exceeds the no-E control in both regimes, supporting signal beyond the trace.", resultTone: "positive" },
  { id: "joint", group: "Input removal", number: "06", title: "Context + C vs context only", short: "Does prior-click consumption remain useful after removing both profile and trace inputs?", left: "context8", right: "contextC12", same: "The same eight context fields after removing P-derived and E inputs.", change: "The right side adds only C_mean, C_max, C_top3, and C_attention from prior clicks.", learned: "C is deterministically computed from frozen article vectors and prior history; the scorers are fitted separately.", asks: "Does C carry ranking signal without temporally uncertain P/E inputs?", limit: "This does not validate the temporal availability of full PEC or a prospective deployment.", result: "C gain: recent +0.0526, same-day +0.0244; both seed-42 paired intervals are above zero.", resultTone: "positive" },
  { id: "neural", group: "Learner family", number: "07", title: "Neural control vs neural PEC", short: "Is the input effect confined to a tree learner?", left: "control11", right: "complete25", same: "The same neural scorer family and evaluation candidates; the candidate input changes.", change: "The neural candidate input receives the source-preserving PEC record.", learned: "Neural parameters are trained for this audit; ExtraTrees scores are not reused.", asks: "Does the PEC interface help beyond the ExtraTrees learner family?", limit: "This is not an exhaustive external benchmark against every neural news recommender.", result: "Neural PEC − neural control: recent +0.0385, same-day +0.0488; both intervals are positive.", resultTone: "positive" },
  { id: "pool", group: "Robustness", number: "08", title: "Fixed model under candidate reselection", short: "Is the conclusion tied to one negative-sampling realization?", left: "control11", right: "complete25", same: "Fitted models and settings stay fixed; only candidate-pool/tie-order seeds change.", change: "Evaluation pools are reconstructed with seeds 7, 13, 42, 101, and 202.", learned: "Models are not reselected or refitted for each reselection seed; evaluation rows change.", asks: "Does the headline difference depend heavily on the original candidate draw?", limit: "This is not external generalization to a new platform, policy, or user population.", result: "Across all five reselections, paired intervals remain positive versus control and collapsed.", resultTone: "positive" },
  { id: "mind", group: "Public boundary", number: "09", title: "MIND P+C vs P+E+C", short: "Are all sources always beneficial when their public-data meanings change?", left: "direct19", right: "complete25", same: "Public-data P/E/C proxies are evaluated under the same encoder-specific setup.", change: "Proxy E is added to P+C.", learned: "MIND P is history-derived rather than an independent stated profile.", asks: "Is adding E consistently beneficial in this public proxy, or does utility depend on source semantics?", limit: "This is not an independent replication of the private stated-profile/trace distinction.", result: "P+C exceeds P+E+C for all three encoders, marking a boundary rather than universal source superiority.", resultTone: "boundary" },
];

const enModelNotes: Record<string, string> = {
  control11: "Eleven operational baseline fields; this B set is not identical to the complete record's eleven-field Z block.",
  collapsed12: "A hand-built rule collapses P/C into one scalar before scoring.",
  early12: "Logistic regression or an MLP learns one early-fusion scalar.",
  scalarDirect17: "The operational baseline plus combined E and the five original P/C coordinates.",
  direct19: "Fourteen shared context fields plus five original source coordinates; no explicit interactions.",
  fusion19: "The same five inputs are replaced by a learned 5-D hidden representation.",
  complete25: "Direct plus six deterministic interaction products.",
  noE9: "The control after removing trace-related fields.",
  noE18: "P/C structure retained after removing E and E-containing products.",
  context8: "Eight context fields after jointly removing profile-derived and trace inputs.",
  contextC12: "The same eight fields plus four prior-click consumption summaries.",
};

const plainKo: Record<string, string> = {
  headline: "가장 기본적인 질문입니다. 같은 기사 후보들을 놓고, 기존 운영 정보 11개만 본 모델과 다섯 근거 블록을 모두 본 모델 중 누가 클릭 기사를 더 위에 올리는지 비교합니다.",
  collapsed: "여러 근거를 모델에게 따로 보여 주는 대신 먼저 숫자 하나로 요약해 버리면 어떻게 되는지를 봅니다. 차이는 단순히 12 대 25라는 열 개수뿐 아니라, 모델이 각 출처를 따로 구별할 수 있는지에도 있습니다.",
  early: "두 모델 모두 최종적으로 19개 숫자를 받습니다. 차이는 P와 C의 원래 다섯 숫자를 그대로 주는지, 작은 네트워크가 다시 만든 다섯 숫자로 바꾸어 주는지입니다.",
  interactions: "두 모델은 처음 19개 값이 완전히 같습니다. Complete만 기존 값끼리 곱한 여섯 열을 더 받으므로, 이 비교는 그 여섯 곱셈 특성이 실질적으로 더 필요한지를 묻습니다.",
  noe: "추천목록 기록 E를 양쪽 모델에서 모두 없앤 뒤 다시 학습합니다. 그래도 오른쪽 모델이 낫다면 PEC의 이득을 E 하나만으로 설명하기 어렵습니다.",
  joint: "시점이 불확실할 수 있는 프로필 P와 추천 trace E를 둘 다 제거합니다. 남은 동일한 context에 과거 클릭에서 만든 C 네 값만 더했을 때 순위가 나아지는지를 확인합니다.",
  neural: "입력 표현은 좋지만 ExtraTrees와 특별히 궁합이 좋아서 생긴 결과일 수 있습니다. 그래서 같은 입력 차이를 neural scorer에서도 다시 시험합니다.",
  pool: "모델은 손대지 않고 시험 문제에 해당하는 후보 기사만 여러 번 다시 뽑습니다. 어느 한 번의 쉬운 negative 표본 때문에 결과가 좋아 보였는지를 점검합니다.",
  mind: "공개 데이터에서는 P와 E의 뜻을 사설 데이터와 똑같이 만들 수 없습니다. 이 비교는 완전한 재현이 아니라, 출처의 의미가 달라지면 어떤 블록이 유용한지도 달라질 수 있음을 보여 줍니다.",
};

const plainEn: Record<string, string> = {
  headline: "This is the main comparison. Given the same candidate articles, it asks whether a model with all five evidence blocks places clicked articles above a model using only the eleven operational inputs.",
  collapsed: "This asks what happens when several sources are summarized into one number before the ranker sees them. The difference is not only 12 versus 25 columns; it is also whether the ranker can distinguish the sources.",
  early: "Both models receive nineteen final numbers. One keeps the five original P/C values; the other replaces them with five values produced by a small learned transformation.",
  interactions: "The first nineteen inputs are identical. Only Complete receives six additional products, so this comparison isolates the practical value of those explicit interaction columns.",
  noe: "Trace evidence E is removed from both sides before training. If PEC still wins, its gain cannot be attributed only to the retained recommendation trace.",
  joint: "Both potentially time-uncertain sources, P and E, are removed. The audit then asks whether adding four C values from prior clicks improves the same eight-field context.",
  neural: "A useful representation might work only because it suits ExtraTrees. This audit repeats the input contrast with a neural scorer.",
  pool: "The fitted models stay unchanged while the evaluation candidates are drawn again. This checks whether one unusually easy negative sample created the result.",
  mind: "Public MIND data cannot reproduce private P and E with the same meanings. This is a boundary study showing that source utility can change when source semantics change.",
};

function modelSet(lang: Lang) {
  if (lang === "ko") return koModels;
  return enModels.map((model) => ({ ...model, note: enModelNotes[model.id] ?? model.note }));
}

function VectorBar({ model }: { model: Model }) {
  return <div className="ca-vector" aria-label={`${model.name}: ${model.width} dimensions`}>
    {model.blocks.map((block, index) => <div key={`${block.label}-${index}`} className={`ca-block is-${block.kind}`} style={{ flexGrow: block.width }} title={`${block.label}: ${block.width}D`}>
      <b>{block.label}</b><span>{block.width}D</span>
    </div>)}
  </div>;
}

function Matrix({ width, side }: { width: number; side: "left" | "right" }) {
  return <div className={`ca-matrix is-${side}`} style={{ gridTemplateColumns: `repeat(${width}, minmax(2px, 1fr))` }} aria-hidden="true">
    {Array.from({ length: width * 6 }, (_, index) => <i key={index} />)}
  </div>;
}

export function ComparisonAtlas({ lang }: { lang: Lang }) {
  const models = useMemo(() => modelSet(lang), [lang]);
  const comparisons = lang === "ko" ? koComparisons : enComparisons;
  const [activeId, setActiveId] = useState("early");
  const active = comparisons.find((item) => item.id === activeId) ?? comparisons[0];
  const left = models.find((model) => model.id === active.left) ?? models[0];
  const right = models.find((model) => model.id === active.right) ?? models[0];
  const groups = Array.from(new Set(comparisons.map((item) => item.group)));
  const isKo = lang === "ko";

  return <main className="comparison-atlas" lang={lang}>
    <header className="ca-topbar">
      <a href="/notes/pec-fuse">PEC-FUSE / RESEARCH NOTES</a>
      <nav aria-label={isKo ? "페이지와 언어" : "Page and language"}>
        <a href="/notes/pec-fuse/compare" aria-current={isKo ? "page" : undefined}><span aria-hidden="true">🇰🇷</span> 한국어</a>
        <a href="/notes/pec-fuse/compare/en" aria-current={!isKo ? "page" : undefined}><span aria-hidden="true">🇬🇧</span> English</a>
        <a href={isKo ? "/notes/pec-fuse" : "/notes/pec-fuse/en"}>{isKo ? "수식·알고리즘 노트" : "Math & algorithm notes"}</a>
        <a href="/notes/pec-fuse/paper">{isKo ? "논문 전문 해설" : "Paper commentary"}</a>
      </nav>
    </header>

    <article className="ca-shell">
      <header className="ca-intro">
        <p className="ca-kicker">PEC-FUSE · INTERACTIVE PAPER COMPANION</p>
        <h1>{isKo ? "PEC-Fuse, 단계별로 살펴보기" : "PEC-Fuse, step by step"}</h1>
        <p className="ca-deck">{isKo ? "한 사용자와 날짜를 하나의 질의로 정의하고, 기사 후보를 구성하는 단계부터 시작합니다. 이후 각 특성의 출처와 계산 과정, 학습되는 요소, 실험에서 달라지는 조건을 차례로 확인합니다." : "Start with a single user-date query and build its candidate set. Then trace each feature to its source, separate computed quantities from learned components, and identify the condition changed in every experiment."}</p>
        <div className="ca-route"><a href="#microscope">0 · {isKo ? "데이터 살펴보기" : "Inspect the data"}</a><span>→</span><a href="#final-demo">{isKo ? "전체 순위 과정" : "Follow the ranking"}</a><span>→</span><a href="#row">1 · {isKo ? "후보 행 구성" : "Build candidate rows"}</a><span>→</span><a href="#record">2 · {isKo ? "특성 계산" : "Compute features"}</a><span>→</span><a href="#learn">3 · {isKo ? "모델 학습" : "Fit the model"}</a><span>→</span><a href="#atlas">4 · {isKo ? "실험 비교" : "Compare experiments"}</a></div>
        <div className="ca-first-read">
          <div><span>1</span><b>{isKo ? "시험 문제를 만든다" : "Build the test question"}</b><p>{isKo ? "사용자 한 명의 하루를 query로 두고, 그날 클릭 기사와 비교할 후보 기사를 모읍니다." : "Treat one user-day as a query and gather clicked articles plus comparison candidates."}</p></div>
          <div><span>2</span><b>{isKo ? "기사마다 숫자 행을 만든다" : "Create one numeric row per article"}</b><p>{isKo ? "각 후보에 대해 P·E·C·Z·ψ를 계산합니다. 후보가 15개면 행도 15개입니다." : "Compute P, E, C, Z, and ψ for every candidate. Fifteen candidates produce fifteen rows."}</p></div>
          <div><span>3</span><b>{isKo ? "행마다 점수를 학습한다" : "Learn a score for each row"}</b><p>{isKo ? "클릭된 행은 y=1, 나머지는 y=0으로 학습하고, 같은 query 안에서 점수가 큰 순서로 정렬합니다." : "Fit y=1 for clicked rows and y=0 otherwise, then sort scores within each query."}</p></div>
          <div><span>4</span><b>{isKo ? "한 요소만 바꿔 비교한다" : "Change one design choice"}</b><p>{isKo ? "후보와 평가법은 가능한 한 같게 두고 입력 블록, 압축 방식 또는 learner만 바꿉니다." : "Keep candidates and evaluation fixed where possible while changing an input block, fusion rule, or learner."}</p></div>
        </div>
      </header>

      <DataMicroscope lang={lang} />

      <section className="ca-section" id="row">
        <div className="ca-heading"><span>01 / QUERY TO ROWS</span><h2>{isKo ? "한 쿼리는 어떻게 학습 행이 되는가" : "How one query becomes training rows"}</h2><p>{isKo ? "후보 선택과 순위 학습은 서로 다른 단계입니다." : "Candidate admission and ranking are separate stages."}</p></div>
        <div className="ca-pool-flow">
          <div className="ca-pool is-positive"><b>Y<sub>q</sub></b><strong>2</strong><span>{isKo ? "당일 클릭 기사" : "target-day clicks"}</span><small>label 1</small></div>
          <span className="ca-union">∪</span>
          <div className="ca-pool is-trace"><b>R<sub>q</sub><sup>nc</sup></b><strong>5</strong><span>{isKo ? "양성을 뺀 retained items" : "retained items after positives"}</span><small>{isKo ? "weak label 0" : "weak label 0"}</small></div>
          <span className="ca-union">∪</span>
          <div className="ca-pool is-introduced"><b>N<sub>q</sub></b><strong>8</strong><span>{isKo ? "선택된 introduced items" : "selected introduced items"}</span><small>b<sub>q</sub>=min(24,max(4,4|Y<sub>q</sub>|))</small></div>
          <span className="ca-arrow">→</span>
          <div className="ca-pool is-final"><b>A<sub>q</sub></b><strong>15</strong><span>{isKo ? "중복 제거 후보 행" : "deduplicated rows"}</span><small>X<sub>q</sub> ∈ ℝ<sup>15×d</sup></small></div>
        </div>
        <div className="ca-symbol-guide">
          <div><b>q=(u,t)</b><p>{isKo ? "사용자 u의 날짜 t에 만든 순위 문제 하나입니다. 같은 사용자가 다른 날짜에 다시 등장하면 별도 query입니다." : "One ranking problem for user u on date t. The same user on another date forms another query."}</p></div>
          <div><b>|Y<sub>q</sub>|=2</b><p>{isKo ? "그날 클릭된 고유 기사 수입니다. 이 예시에서는 positive가 2개라서 4|Yq|=8입니다." : "The number of unique articles clicked that day. Here two positives give 4|Yq|=8."}</p></div>
          <div><b>b<sub>q</sub>=8</b><p>{isKo ? "introduced 후보의 최대 예산입니다. min(24,max(4,8))=8이며, 적격 기사가 6개뿐이면 실제 Nq는 6개입니다." : "The maximum introduced-candidate budget: min(24,max(4,8))=8. If only six articles are eligible, Nq contains six."}</p></div>
          <div><b>X<sub>q</sub>∈ℝ<sup>15×d</sup></b><p>{isKo ? "15는 후보 기사 수인 행 개수, d는 모델이 받는 특성 열 개수입니다. 모델 비교에서 주로 달라지는 것은 d입니다." : "Fifteen is the number of candidate rows; d is the number of feature columns. Most model comparisons change d."}</p></div>
        </div>
        <CandidateBudgetLab lang={lang} />
        <div className="ca-two-notes">
          <p><b>{isKo ? "겹친 positive" : "Overlapping positive"}</b>{isKo ? "클릭 기사가 trace에도 있으면 한 행만 남고 label은 1이며 E 정보는 유지됩니다." : "If a click also appears in the trace, it remains one row with label 1 and keeps its E features."}</p>
          <p><b>{isKo ? "0 라벨의 의미" : "Meaning of label 0"}</b>{isKo ? "관측된 클릭이 아니라는 뜻이지, 실제 dislike나 verified non-exposure라는 뜻은 아닙니다." : "It means no observed click in this query, not verified dislike or verified non-exposure."}</p>
        </div>
      </section>

      <BeginnerGuide lang={lang} />

      <section className="ca-section" id="record">
        <div className="ca-heading"><span>02 / ROW ANATOMY</span><h2>{isKo ? "원자료에서 25개 필드까지" : "From source records to 25 fields"}</h2><p>{isKo ? "한 행은 서로 다른 시점과 출처의 정보를 같은 vector에 두되, 블록은 구분합니다." : "One row places different sources in one vector while preserving their block identities."}</p></div>
        <div className="ca-provenance">
          <div className="ca-source-card"><span>{isKo ? "관측" : "Observed"}</span><b>{isKo ? "프로필 · trace · 클릭 · 기사" : "Profile · trace · clicks · article"}</b><p>{isKo ? "저장된 기록과 query label" : "Stored records and query labels"}</p></div>
          <div className="ca-process">→<small>{isKo ? "frozen encoder + 고정 수식" : "frozen encoder + fixed formulas"}</small></div>
          <div className="ca-record-card">
            <div className="is-P"><b>P</b><span>1</span><small>{isKo ? "profile alignment" : "profile alignment"}</small></div>
            <div className="is-E"><b>E</b><span>3</span><small>{isKo ? "retained trace" : "retained trace"}</small></div>
            <div className="is-C"><b>C</b><span>4</span><small>{isKo ? "prior-click consumption" : "prior-click consumption"}</small></div>
            <div className="is-Z"><b>Z</b><span>11</span><small>{isKo ? "recorded controls" : "recorded controls"}</small></div>
            <div className="is-psi"><b>ψ</b><span>6</span><small>{isKo ? "deterministic products" : "deterministic products"}</small></div>
          </div>
        </div>
        <div className="ca-block-explainer">
          <div className="is-P"><b>P · 1 field</b><p>{isKo ? "사용자가 직접 밝힌 프로필과 후보 기사의 의미적 가까움입니다. P=0.82는 82% 클릭 확률이 아닙니다." : "Semantic closeness between the stated profile and the candidate. P=0.82 is not an 82% click probability."}</p></div>
          <div className="is-E"><b>E · 3 fields</b><p>{isKo ? "보존된 추천 trace에 있었는지와 몇 위였는지를 나타냅니다. trace에 없다고 실제 미노출이 확인되는 것은 아닙니다." : "Whether the item appears in the retained trace and at what rank. Absence does not verify non-exposure."}</p></div>
          <div className="is-C"><b>C · 4 fields</b><p>{isKo ? "query 날짜보다 앞선 클릭 기사들과 후보가 얼마나 비슷한지를 mean·max·top-3·attention으로 각각 요약합니다." : "Four summaries of similarity to clicks before the query date: mean, maximum, top-3, and attention."}</p></div>
          <div className="is-Z"><b>Z · 11 fields</b><p>{isKo ? "프로필·클릭 비율, 과거 클릭 수, 인기도, 최신성, 기사 길이 같은 기록 기반 control입니다." : "Recorded controls such as profile/click shares, prior-click count, popularity, recency, and article length."}</p></div>
          <div className="is-psi"><b>ψ · 6 fields</b><p>{isKo ? "이미 계산된 P·E·C 값들을 곱한 interaction입니다. 새 관측 자료나 별도 embedding이 아닙니다." : "Products of already computed P, E, and C values. They are neither new observations nor learned embeddings."}</p></div>
        </div>
        <div className="ca-sample-row">
          <div><span>{isKo ? "후보 A" : "Candidate A"}</span><b>Climate-policy news</b><small>y=1 · trace member=0</small></div>
          <div className="is-P"><small>P</small><b>0.82</b></div><div className="is-E"><small>E<sub>m</sub></small><b>0</b></div><div className="is-E"><small>1/r</small><b>0</b></div><div className="is-C"><small>C<sub>mean</sub></small><b>0.31</b></div><div className="is-C"><small>C<sub>att</sub></small><b>0.40</b></div><div className="is-psi"><small>P×C<sub>mean</sub></small><b>0.2542</b></div>
        </div>
        <p className="ca-caption">{isKo ? "0.82는 확률이 아니라 cosine alignment입니다. 0.2542는 0.82×0.31로 계산한 입력값이며 예측 점수가 아닙니다. y는 정답 label로 평가에 쓰이지만 scorer 입력에는 들어가지 않습니다." : "0.82 is a cosine alignment, not a probability. 0.2542 is the computed input 0.82×0.31, not a prediction. The label y is used for fitting and evaluation, not as a scorer feature."}</p>
      </section>

      <EquationLab lang={lang} />

      <section className="ca-section" id="learn">
        <div className="ca-heading"><span>04 / WHAT IS LEARNED</span><h2>{isKo ? "고정값, 계산값, 학습값을 분리해서 읽기" : "Separate fixed, computed, and learned quantities"}</h2></div>
        <div className="ca-learning-line">
          <div><span>FIXED</span><b>BGE-M3 encoder</b><p>{isKo ? "기사·프로필 embedding을 생성하지만 이 연구 데이터로 업데이트하지 않음." : "Creates article/profile embeddings but is not updated on this study data."}</p></div>
          <div><span>COMPUTED</span><b>P · E · C · Z · ψ</b><p>{isKo ? "관측 기록과 고정 수식에서 매 query–candidate마다 계산." : "Computed per query–candidate from observed records and fixed formulas."}</p></div>
          <div><span>OPTIONALLY LEARNED</span><b>g<sub>θ</sub>(P,C)</b><p>{isKo ? "learned-fusion 비교에서만 scalar 또는 d차원 표현을 학습." : "Learns a scalar or d-dimensional representation only in fusion variants."}</p></div>
          <div><span>FITTED</span><b>ExtraTrees / neural scorer</b><p>{isKo ? "행 단위 click label로 학습하고 class-1 probability를 query 안 순위 점수로 사용." : "Fits pointwise click labels and uses class-1 probability as the within-query score."}</p></div>
          <div><span>EVALUATION ONLY</span><b>NDCG · Recall · MRR · CI</b><p>{isKo ? "query metric과 사용자 bootstrap은 모델 입력이 아니라 평가 절차." : "Query metrics and user bootstrap belong to evaluation, not model input."}</p></div>
        </div>
        <div className="ca-training-example">
          <div><span>{isKo ? "입력 행" : "Input rows"}</span><b>x<sub>q,A</sub>, x<sub>q,B</sub>, x<sub>q,C</sub></b><small>{isKo ? "각 후보의 d개 특성" : "d features per candidate"}</small></div>
          <i>+</i><div><span>{isKo ? "학습 label" : "Training label"}</span><b>1, 0, 0</b><small>{isKo ? "A만 관측 클릭" : "only A was clicked"}</small></div>
          <i>→</i><div><span>{isKo ? "모델 출력" : "Model output"}</span><b>0.71, 0.42, 0.18</b><small>{isKo ? "확률 형태의 ranking score" : "probability-shaped ranking scores"}</small></div>
          <i>→</i><div><span>{isKo ? "query 내 순위" : "Within-query rank"}</span><b>A › B › C</b><small>{isKo ? "다른 query와 점수 크기 비교 안 함" : "not compared across queries"}</small></div>
        </div>
        <div className="ca-timeline"><div><b>Jan–Mar</b><span>{isKo ? "후보 설정 학습" : "fit candidates"}</span></div><div><b>April</b><span>{isKo ? "validation 선택" : "validation selection"}</span></div><div><b>Jan–Apr</b><span>{isKo ? "선택 설정 refit" : "refit selected setup"}</span></div><div><b>May–Jun</b><span>{isKo ? "고정 모델 test scoring" : "fixed-model test scoring"}</span></div></div>
        <p className="ca-caption">{isKo ? "ExtraTrees의 출력은 보정된 CTR이 아니라 같은 query 안에서 정렬하기 위한 score입니다. 모델 선택은 April query-level NDCG@10으로 하고, 최종 수치는 May–June query에서 계산합니다." : "The ExtraTrees output is a within-query ranking score, not calibrated CTR. April query-level NDCG@10 selects the configuration; final metrics use May–June queries."}</p>
        <ScorerExplainer lang={lang} />
      </section>

      <section className="ca-section ca-atlas-section" id="atlas">
        <div className="ca-heading"><span>05 / INTERACTIVE COMPARISON ATLAS</span><h2>{isKo ? "어떤 것과 어떤 것을 비교했는가" : "What is compared with what"}</h2><p>{isKo ? "왼쪽에서 비교를 고르면, 두 입력의 모양과 바뀐 요소가 함께 갱신됩니다." : "Choose a comparison; both input shapes and the changed component update together."}</p></div>
        <ComparisonReadingGuide lang={lang} />
        <div className="ca-atlas-layout">
          <aside className="ca-selector" aria-label={isKo ? "비교 목록" : "Comparison list"}>
            {groups.map((group) => <div key={group}><h3>{group}</h3>{comparisons.filter((item) => item.group === group).map((item) => <button type="button" key={item.id} className={item.id === active.id ? "is-active" : ""} onClick={() => setActiveId(item.id)}><span>{item.number}</span><b>{item.title}</b><small>{item.short}</small></button>)}</div>)}
          </aside>
          <div className="ca-comparison-stage" aria-live="polite">
            <header><span>{active.number} · {active.group}</span><h3>{active.title}</h3><p>{active.short}</p></header>
            <div className="ca-plain-guide"><span>{isKo ? "한마디로 말하면" : "In plain language"}</span><p>{(isKo ? plainKo : plainEn)[active.id]}</p></div>
            <ComparisonEvidence key={active.id} lang={lang} comparisonId={active.id} />
            <div className="ca-model-pair">
              <section><div className="ca-model-title"><span>{isKo ? "비교 기준" : "Reference"}</span><b>{left.name}</b><strong>{left.width}D</strong></div><Matrix width={left.width} side="left" /><VectorBar model={left} /><p>{left.note}</p></section>
              <div className="ca-versus">VS</div>
              <section><div className="ca-model-title"><span>{isKo ? "비교 대상" : "Compared model"}</span><b>{right.name}</b><strong>{right.width}D</strong></div><Matrix width={right.width} side="right" /><VectorBar model={right} /><p>{right.note}</p></section>
            </div>
            <p className="ca-matrix-key">{isKo ? "행렬 읽는 법 · 작은 사각형의 한 줄은 후보 기사 하나, 세로 열 하나는 입력 특성 하나입니다. 여기서는 모양을 보여 주기 위해 후보 6개만 그렸으며 실제 후보 수는 query마다 달라집니다. 19-D는 후보마다 숫자 19개를 모델에 준다는 뜻입니다." : "How to read the matrices · One horizontal row represents one candidate article; one vertical column is one input feature. Six rows are drawn only to show shape. Actual candidate counts vary by query. A 19-D input means nineteen numbers per candidate."}</p>
            <ComparisonDataPreview lang={lang} comparisonId={active.id} leftId={left.id} leftName={left.name} rightId={right.id} rightName={right.name} />
            <ComparisonProtocol lang={lang} item={active} />
          </div>
        </div>
      </section>

      <section className="ca-section" id="decision">
        <div className="ca-heading"><span>05 / READING PATH</span><h2>{isKo ? "질문에서 표로 바로 가기" : "Go from a question to the relevant comparison"}</h2></div>
        <div className="ca-decision-grid">
          {(isKo ? [
            ["전체 방법이 baseline보다 좋은가?", "01 · Complete vs control"],
            ["수동 scalar만 이긴 것인가?", "02–03 · collapsed / learned fusion"],
            ["25개가 모두 필요한가?", "04 · 25-D vs 19-D"],
            ["trace 때문에만 좋아졌나?", "05 · no-E training"],
            ["P와 E를 둘 다 빼면 남는가?", "06 · context + C"],
            ["tree 모델에만 유리한가?", "07 · neural audit"],
            ["한 후보 sample의 우연인가?", "08 · candidate reselection"],
            ["공개 데이터에서도 항상 같은가?", "09 · MIND boundary"],
          ] : [
            ["Does the full method beat the baseline?", "01 · Complete vs control"],
            ["Does it only beat a hand-built scalar?", "02–03 · collapsed / learned fusion"],
            ["Are all 25 fields necessary?", "04 · 25-D vs 19-D"],
            ["Is the gain only from the trace?", "05 · no-E training"],
            ["What remains without both P and E?", "06 · context + C"],
            ["Is it specific to tree models?", "07 · neural audit"],
            ["Is it one lucky candidate draw?", "08 · candidate reselection"],
            ["Does the same pattern always hold publicly?", "09 · MIND boundary"],
          ]).map(([question, answer]) => <button key={question} type="button" onClick={() => { const number = answer.slice(0, 2); const target = comparisons.find((item) => item.number === number); if (target) setActiveId(target.id); document.getElementById("atlas")?.scrollIntoView({ behavior: "smooth" }); }}><span>{question}</span><b>{answer}</b></button>)}
        </div>
      </section>

      <footer className="ca-footer">
        <p>{isKo ? "이 페이지의 수치는 현재 PEC-Fuse IEEE Access 원고의 보고값을 읽기 위한 지도입니다. 예시 후보 값은 설명용 합성값입니다." : "Reported effects follow the current PEC-Fuse IEEE Access manuscript; candidate-level values on this page are synthetic teaching examples."}</p>
        <details className="ca-glossary"><summary>{isKo ? "처음 볼 때 자주 헷갈리는 용어" : "Terms that are easy to confuse"}</summary><div>
          <p><b>Query</b>{isKo ? "검색어가 아니라 사용자–날짜 단위의 순위 문제입니다." : "Not a search string here; it is one user-date ranking problem."}</p>
          <p><b>Candidate</b>{isKo ? "그 query에서 점수를 받아 서로 경쟁하는 기사 한 개입니다." : "One article scored and ranked against the other articles in that query."}</p>
          <p><b>Dimension (D)</b>{isKo ? "후보 하나를 표현하는 숫자 열의 개수입니다. 후보 수와 다릅니다." : "The number of numeric feature columns for one candidate, not the number of candidates."}</p>
          <p><b>Paired difference</b>{isKo ? "같은 query에서 두 모델의 metric을 빼서 얻은 차이입니다." : "The metric difference between two models evaluated on the same query."}</p>
          <p><b>CI</b>{isKo ? "사용자 단위 bootstrap으로 구한 차이의 불확실성 범위입니다. 0을 포함하면 방향이 확실하지 않습니다." : "An uncertainty interval for the difference from user-cluster bootstrap. Including zero means the direction is unresolved."}</p>
        </div></details>
        <div><a href={isKo ? "/notes/pec-fuse" : "/notes/pec-fuse/en"}>{isKo ? "수식과 알고리즘을 자세히 읽기" : "Read the full math and algorithm notes"}</a><a href="/notes/pec-fuse/paper">{isKo ? "논문을 처음부터 끝까지 읽기" : "Read the full paper commentary"}</a></div>
      </footer>
    </article>
  </main>;
}
