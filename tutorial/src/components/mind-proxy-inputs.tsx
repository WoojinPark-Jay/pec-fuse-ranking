import { useState } from "react";
import "./mind-proxy-inputs.css";
export function MindProxyInputs({ lang }: { lang: "ko" | "en" }) {
  const ko = lang === "ko";
  const blocks = [
    ["P · 3", ko ? "클릭 history로 만든 대체 프로필" : "History-derived profile proxy", ko ? "정규화한 평균 history 벡터와 후보의 코사인 유사도, 같은 카테고리 비율, 같은 세부 카테고리 비율." : "Cosine with the normalized mean-history vector, matching-category share, and matching-subcategory share."],
    ["E · 1", ko ? "기록된 impression slate" : "Recorded impression slate", ko ? "후보가 원래 logged slate에 있었는지를 나타냅니다. 추가 후보는 0입니다." : "Indicates whether the candidate belonged to the original logged slate. Added candidates receive zero."],
    ["C · 4", ko ? "후보와 개별 history 기사의 관계" : "Candidate-to-history similarities", ko ? "코사인 유사도의 평균, 최댓값, 상위 3개 평균, attention 가중 평균. P와 원자료는 같지만 계산 방식이 다릅니다." : "Mean, maximum, top-three mean, and attention-weighted mean of individual cosines. The source history is shared with P, but the calculations differ."],
    ["Controls · 7", ko ? "모든 모델의 공통 입력" : "Shared by every model", ko ? "기사·카테고리·세부 카테고리 CTR, 기사 impression 수, history 크기, 제목·초록 길이. 수와 길이는 log 변환합니다." : "Article/category/subcategory CTR, article impression count, history size, and title/abstract length. Counts and lengths are log-transformed."],
    ["Products · 6", ko ? "기존 입력의 곱" : "Products of existing inputs", ko ? "P 정합도·C 평균·C attention·C 최댓값과 E membership의 곱 4개, P 정합도와 C 평균·C attention의 곱 2개." : "Four products of E membership with P alignment, C mean, C attention, and C maximum; two products of P alignment with C mean and C attention."],
  ];
  const [selected, setSelected] = useState(2);
  const [encoder, setEncoder] = useState<0 | 1>(0);
  const models = [
    { name: "Controls+E", width: 8, blocks: ["Controls", "E"], scores: ["0.3265", "0.3265"] },
    { name: "P+C Direct", width: 14, blocks: ["Controls", "P", "C"], scores: ["0.3409", "0.3451"] },
    { name: "P+E+C Direct", width: 15, blocks: ["Controls", "P", "E", "C"], scores: ["0.3797", "0.3805"] },
    { name: "Full PEC proxy", width: 21, blocks: ["Controls", "P", "E", "C", "Products"], scores: ["0.3828", "0.3915"] },
  ];
  const counts: Record<string, number> = { Controls: 7, P: 3, E: 1, C: 4, Products: 6 };
  const comparisons = [
    { label: ko ? "P/C 추가" : "Add P/C", from: 0, to: 2, added: ["P", "C"], results: ["+0.0531 [0.0506, 0.0556]", "+0.0540 [0.0516, 0.0565]"] },
    { label: ko ? "E 추가" : "Add E", from: 1, to: 2, added: ["E"], results: ["+0.0388 [0.0372, 0.0404]", "+0.0354 [0.0339, 0.0370]"] },
    { label: ko ? "곱 피처 추가" : "Add products", from: 2, to: 3, added: ["Products"], results: ["+0.0031 [0.0019, 0.0043]", "+0.0109 [0.0096, 0.0122]"] },
    { label: ko ? "전체 비교" : "Full contrast", from: 0, to: 3, added: ["P", "C", "Products"], results: ["+0.0562 [0.0536, 0.0588]", "+0.0649 [0.0623, 0.0675]"] },
  ];
  const active = comparisons[selected];
  const [chosenField, setChosenField] = useState<string | null>(null);
  // Display labels describe the published fields, rather than claiming runner column names.
  const fields: Record<string, { label: string; detail: string }[]> = {
    Controls: [
      { label: "Article CTR", detail: ko ? "기사 단위 클릭률 control." : "Article-level click-through-rate control." },
      { label: "Category CTR", detail: ko ? "카테고리 단위 클릭률 control." : "Category-level click-through-rate control." },
      { label: "Subcategory CTR", detail: ko ? "세부 카테고리 단위 클릭률 control." : "Subcategory-level click-through-rate control." },
      { label: "Article impressions", detail: ko ? "기사 impression 수의 log 변환." : "Log-transformed article impression count." },
      { label: "History size", detail: ko ? "클릭 history 크기의 log 변환." : "Log-transformed click-history size." },
      { label: "Title length", detail: ko ? "제목 길이의 log 변환." : "Log-transformed title length." },
      { label: "Abstract length", detail: ko ? "초록 길이의 log 변환." : "Log-transformed abstract length." },
    ],
    P: [
      { label: "p · mean-history alignment", detail: ko ? "정규화된 무가중 평균 history 벡터와 후보 벡터의 cosine. 독립 stated profile이 아닙니다." : "Candidate cosine with the normalized unweighted mean-history vector; not an independent stated profile." },
      { label: "Category share", detail: ko ? "후보와 같은 카테고리에 속하는 history 기사의 비율." : "Share of history articles matching the candidate category." },
      { label: "Subcategory share", detail: ko ? "후보와 같은 세부 카테고리에 속하는 history 기사의 비율." : "Share of history articles matching the candidate subcategory." },
    ],
    E: [{ label: "Slate membership", detail: ko ? "원래 logged slate의 후보이면 1, 추가 후보이면 0. 인과적 노출 효과가 아닙니다." : "One for original logged-slate candidates, zero for added candidates; not a causal exposure effect." }],
    C: [
      { label: "C mean", detail: ko ? "후보와 개별 history 기사 간 cosine의 산술평균. C mean = ||mean history|| × p." : "Arithmetic mean of candidate-history cosines. C mean = ||mean history|| × p." },
      { label: "C maximum", detail: ko ? "후보와 개별 history 기사 간 cosine의 최댓값." : "Maximum individual candidate-history cosine." },
      { label: "C top-three", detail: ko ? "후보와 history 간 cosine 중 상위 3개의 평균." : "Mean of the top three candidate-history cosines." },
      { label: "C attention", detail: ko ? "후보와 history 간 cosine의 attention 가중 평균." : "Attention-weighted mean of candidate-history cosines." },
    ],
    Products: [
      { label: "p × E", detail: "p × E" },
      { label: "C mean × E", detail: "C mean × E" },
      { label: "C attention × E", detail: "C attention × E" },
      { label: "C maximum × E", detail: "C maximum × E" },
      { label: "p × C mean", detail: "p × C mean" },
      { label: "p × C attention", detail: "p × C attention" },
    ],
  };
  return <div className="mind-lab">
    <p>{ko ? "MIND의 8/14/15/21개 입력을 비교해 보세요. Private의 19/25개 입력과는 다른 공개 proxy입니다. 비교를 선택하면 바뀌는 블록과 보고 결과가 함께 표시됩니다." : "Explore MIND's 8/14/15/21-field records, distinct from the private 19/25-field schema. Choose a contrast to see its added blocks and reported results."}</p>
    <div className="mind-cases" role="group" aria-label={ko ? "MIND 비교 선택" : "Choose a MIND contrast"}>{comparisons.map((item, index) => <button type="button" key={index} aria-pressed={selected === index} onClick={() => { setSelected(index); setChosenField(null); }}><span>0{index + 1}</span>{item.label}<small>{models[item.from].width} → {models[item.to].width}</small></button>)}</div>
    <div className="mind-pair" aria-live="polite">{[active.from, active.to].map((index, side) => {
      const model = models[index];
      return <section className="mind-record" key={side}><header><span>{side === 0 ? (ko ? "비교 기준" : "Reference") : (ko ? "입력 추가 후" : "With added fields")}</span><strong>{model.width}<small>{ko ? "개 필드" : " fields"}</small></strong><h4>{model.name}</h4></header><div className="mind-feature-groups">{model.blocks.map(key => <div key={key} className="mind-feature-group"><span>{key} · {counts[key]}</span><div className="mind-feature-cells">{fields[key].map((field, fieldIndex) => {
        const fieldId = side + ":" + key + ":" + fieldIndex;
        return <button type="button" key={fieldId} className={"mind-feature-cell mind-block-" + key + (side === 1 && active.added.includes(key) ? " is-added" : "")} aria-pressed={chosenField === fieldId} aria-label={field.label + ": " + field.detail} title={field.label + ": " + field.detail} onClick={() => setChosenField(fieldId)}><span>{key === "Controls" ? "Ctrl" : key === "Products" ? "×" : key}{fieldIndex + 1}</span><small>{field.label.replace(" · mean-history alignment", "").replace("Article impressions", "Impressions").replace("Subcategory", "Subcat.").replace("Category", "Cat.").replace("C maximum", "C max").replace("C attention", "C attn").replace("C top-three", "Top-3")}</small></button>;
      })}</div></div>)}</div><div className="mind-field-detail" aria-live="polite">{(() => {
        const selected = model.blocks.flatMap(key => fields[key].map((field, index) => ({ ...field, id: side + ":" + key + ":" + index, key }))).find(field => field.id === chosenField);
        return selected ? <><b>{selected.label}</b><p>{selected.detail}{selected.key === "Products" ? (ko ? " · 기존 입력의 고정 곱입니다. 새 원자료나 학습된 좌표가 아닙니다." : " · A fixed product of existing fields, not new source data or a learned coordinate.") : ""}</p></> : <p>{ko ? "피처 칸을 눌러 의미와 계산 방식을 확인하세요." : "Select a feature cell to inspect its meaning and calculation."}</p>;
      })()}</div><p className="mind-record-formula">{model.blocks.map(key => key + " " + counts[key]).join(" + ")}</p></section>;
    })}</div>
    <p className="mind-key">{ko ? "작은 칸 하나 = 스칼라 피처 하나. 테두리 = 추가된 피처. 각 구성은 같은 후보의 입력 한 행입니다. 칸 안의 번호는 블록 내 식별 번호이며 실제 값이 아닙니다. 표시는 설명용 이름이며 runner 컬럼명을 뜻하지 않습니다." : "One cell = one scalar feature. Outline = added feature. Each record represents the same candidate. Cell numbers identify fields within a block, not feature values. Labels are descriptive, not runner column names."}</p>
    <p className="mind-case-note">{ko ? "같게 유지하는 입력: " : "Retained inputs: "}{models[active.from].blocks.join(" + ")}{ko ? " / 추가 입력: " : " / Added: "}{active.added.join(" + ")}</p>
    <div className="mind-outcome"><div className="mind-encoder" role="group" aria-label={ko ? "인코더" : "Encoder"}>{([0, 1] as const).map(id => <button type="button" key={id} aria-pressed={encoder === id} onClick={() => setEncoder(id)}>{id === 0 ? "BGE-M3" : "BGE-base"}</button>)}</div><div className="mind-scoreline" aria-live="polite"><div><span>NDCG@10</span><b>{models[active.from].scores[encoder]} → {models[active.to].scores[encoder]}</b></div><div><span>{ko ? "차이 [명목 95% CI]" : "Difference [nominal 95% CI]"}</span><b>{active.results[encoder]}</b></div></div><p>{ko ? "논문 보고값 · 동일 expanded pool · 사용자 군집 bootstrap 10,000회. 각 모델은 공통 선택 절차에서 독립적으로 선택됩니다." : "Reported results · shared expanded pool · 10,000 user-cluster bootstrap replicates. Each model is independently selected under the common protocol."}</p></div>
    <div className="mind-provenance"><h4>{ko ? "같은 글자, 다른 출처: MIND에서의 의미" : "Same letters, different provenance in MIND"}</h4><div className="mind-source-flow"><div><b>{ko ? "이전 클릭 history" : "Prior click history"}</b><span>→ P · 3 / C · 4</span><p>{ko ? "같은 원천을 서로 다르게 요약" : "Different summaries of one source"}</p></div><div><b>{ko ? "원래 impression slate" : "Original impression slate"}</b><span>→ E · 1</span><p>{ko ? "원래 후보 소속 여부, 인과적 노출 효과 아님" : "Candidate membership, not causal exposure"}</p></div><div><b>{ko ? "기존 P / E / C 좌표" : "Existing P / E / C fields"}</b><span>→ Products · 6</span><p>{ko ? "고정 곱셈으로 계산, 새로운 출처 아님" : "Fixed products, not new sources"}</p></div></div><p className="mind-relation">C<sub>mean</sub> = ‖h̄‖₂ · p</p><p>{ko ? "p와 C 평균은 같은 query 안에서 동일한 후보 순서를 만듭니다. C 평균에는 정규화가 제거한 history 집중도 크기가 남습니다. 독립적인 두 evidence source가 아닙니다." : "Within a query, p and C mean induce the same candidate ordering. C mean retains the history-concentration magnitude removed by normalization. They are not independent evidence sources."}</p></div>
    <details className="tutorial-disclosure"><summary>{ko ? "전체 필드 정의와 해석 범위" : "Full field definitions and interpretation"}</summary><div className="mind-definitions">{blocks.map(([label,title,description]) => <div key={label}><b>{label} · {title}</b><p>{description}</p></div>)}</div><p>{ko ? "네 구성은 하나의 순차 사슬이 아닙니다. 8→15는 P/C 추가, 14→15는 E 추가, 15→21은 곱 피처 추가입니다. Full−Controls+E = (Full−Direct) + (Direct−Controls+E)는 산술적으로 성립하지만, 각 대비는 남은 입력에 조건부이며 독립적인 구성요소 기여량은 아닙니다. 이 평가는 private의 독립 stated-profile 출처를 재현하지 않습니다." : "These records are not one sequential chain: 8→15 adds P/C, 14→15 adds E, and 15→21 adds products. Full−Controls+E = (Full−Direct) + (Direct−Controls+E) holds algebraically, but contrasts are conditional on retained inputs, not independent component contributions. This evaluation does not replicate private stated-profile provenance."}</p></details>
  </div>;
}
