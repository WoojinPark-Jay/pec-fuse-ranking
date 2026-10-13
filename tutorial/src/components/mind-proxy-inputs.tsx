export function MindProxyInputs({ lang }: { lang: "ko" | "en" }) {
  const ko = lang === "ko";
  const blocks = [
    ["P · 3", ko ? "클릭 history로 만든 대체 프로필" : "History-derived profile proxy", ko ? "정규화한 평균 history 벡터와 후보의 코사인 유사도, 같은 카테고리 비율, 같은 세부 카테고리 비율." : "Cosine with the normalized mean-history vector, matching-category share, and matching-subcategory share."],
    ["E · 3", ko ? "기록된 impression slate" : "Recorded impression slate", ko ? "Slate 포함 여부, 기록된 순서의 역수, 순서 백분위. 추가 후보는 모두 0." : "Slate membership, reciprocal recorded position, and position percentile. All three are zero for added candidates."],
    ["C · 4", ko ? "후보와 개별 history 기사의 관계" : "Candidate-to-history similarities", ko ? "코사인 유사도의 평균, 최댓값, 상위 3개 평균, attention 가중 평균. P와 원자료는 같지만 계산 방식이 다릅니다." : "Mean, maximum, top-three mean, and attention-weighted mean of individual cosines. The source history is shared with P, but the calculations differ."],
    ["Controls · 8", ko ? "모든 모델의 공통 입력" : "Shared by every model", ko ? "기사·카테고리·세부 카테고리 CTR, 기사 impression 수, history·slate 크기, 제목·초록 길이. 수와 길이는 log 변환합니다." : "Article/category/subcategory CTR, article impression count, history/slate size, and title/abstract length. Counts and lengths are log-transformed."],
    ["Products · 6", ko ? "기존 입력의 곱" : "Products of existing inputs", ko ? "P 정합도·C 평균·C attention·C 최댓값과 E membership의 곱 4개, P 정합도와 C 평균·C attention의 곱 2개." : "Four products of E membership with P alignment, C mean, C attention, and C maximum; two products of P alignment with C mean and C attention."],
  ];
  return <div>
    <p>{ko ? "MIND는 사설 25차원 설계와 다른 공개 proxy입니다. 세 모델 모두 동일한 Controls 8개를 포함합니다." : "MIND uses a public proxy, not the private 25-field schema. Every model includes the same eight controls."}</p>
    <div className="ca-block-explainer">
      <div><b>Controls + E · 11D</b><p>Controls 8 + E 3</p></div>
      <div><b>P+C · 15D</b><p>Controls 8 + P 3 + C 4</p></div>
      <div><b>Full PEC proxy · 24D</b><p>Controls 8 + P 3 + E 3 + C 4 + Products 6</p></div>
    </div>
    <p>{ko ? "P+C에 비해 Full은 E 3개와 상호작용 6개를 함께 추가합니다. 따라서 두 모델의 차이는 E만의 효과가 아닙니다." : "Relative to P+C, Full adds three E fields and all six products. Their contrast is not an E-only addition."}</p>
    <details className="tutorial-disclosure"><summary>{ko ? "각 블록의 이름과 계산 방식" : "Feature blocks and how they are computed"}</summary><div className="ca-block-explainer">{blocks.map(([label,title,description]) => <div key={label}><b>{label} · {title}</b><p>{description}</p></div>)}</div></details>
  </div>;
}
