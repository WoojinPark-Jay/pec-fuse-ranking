export function MindProxyInputs({ lang }: { lang: "ko" | "en" }) {
  const ko = lang === "ko";
  const blocks = [
    ["P · 3", ko ? "클릭 history로 만든 대체 프로필" : "History-derived profile proxy", ko ? "정규화한 평균 history 벡터와 후보의 코사인 유사도, 같은 카테고리 비율, 같은 세부 카테고리 비율." : "Cosine with the normalized mean-history vector, matching-category share, and matching-subcategory share."],
    ["E · 1", ko ? "기록된 impression slate" : "Recorded impression slate", ko ? "후보가 원래 logged slate에 있었는지를 나타냅니다. 추가 후보는 0입니다." : "Indicates whether the candidate belonged to the original logged slate. Added candidates receive zero."],
    ["C · 4", ko ? "후보와 개별 history 기사의 관계" : "Candidate-to-history similarities", ko ? "코사인 유사도의 평균, 최댓값, 상위 3개 평균, attention 가중 평균. P와 원자료는 같지만 계산 방식이 다릅니다." : "Mean, maximum, top-three mean, and attention-weighted mean of individual cosines. The source history is shared with P, but the calculations differ."],
    ["Controls · 7", ko ? "모든 모델의 공통 입력" : "Shared by every model", ko ? "기사·카테고리·세부 카테고리 CTR, 기사 impression 수, history 크기, 제목·초록 길이. 수와 길이는 log 변환합니다." : "Article/category/subcategory CTR, article impression count, history size, and title/abstract length. Counts and lengths are log-transformed."],
    ["Products · 6", ko ? "기존 입력의 곱" : "Products of existing inputs", ko ? "P 정합도·C 평균·C attention·C 최댓값과 E membership의 곱 4개, P 정합도와 C 평균·C attention의 곱 2개." : "Four products of E membership with P alignment, C mean, C attention, and C maximum; two products of P alignment with C mean and C attention."],
  ];
  return <div>
    <p>{ko ? "MIND는 사설 25차원 설계와 다른 공개 proxy입니다. 네 구성은 같은 Controls 7개에서 출발해 P/C, E, 명시적 product를 단계적으로 추가합니다." : "MIND uses a public proxy, not the private 25-field schema. Four nested records start from the same seven controls and add P/C, E, and explicit products in stages."}</p>
    <div className="ca-block-explainer">
      <div><b>Controls + E · 8D</b><p>Controls 7 + E 1</p></div>
      <div><b>P+C Direct · 14D</b><p>Controls 7 + P 3 + C 4</p></div>
      <div><b>P+E+C Direct · 15D</b><p>Controls 7 + P 3 + E 1 + C 4</p></div>
      <div><b>Full PEC proxy · 21D</b><p>Direct 15 + Products 6</p></div>
    </div>
    <p>{ko ? "이 중첩 구조는 P/C 추가, E 추가, 명시적 product 추가 효과를 분리합니다. E는 노출의 인과적 증거가 아니라 후보가 logged slate에서 왔는지를 나타냅니다." : "The nesting separates P/C, E, and explicit-product additions. E is candidate-origin information, not causal evidence of exposure."}</p>
    <p>{ko ? "공개 proxy에서 P와 C는 독립 출처가 아니라 표현 역할을 뜻합니다. MIND에는 stated profile이 없으므로 정규화된 무가중 평균 history 방향을 P 정합도로 사용합니다. 같은 계산을 C 평균에도 쓰면 좌표가 중복되기 때문에, C 평균은 후보와 각 history 기사 사이 cosine의 산술평균으로 정의합니다." : "In the public proxy, P and C name representation roles rather than independent sources. MIND has no stated profile, so normalized unweighted mean-history alignment occupies the profile-like P coordinate. Reusing that calculation for C mean would duplicate the field; C mean is therefore the arithmetic mean of individual candidate-history cosines."}</p>
    <details className="tutorial-disclosure"><summary>{ko ? "각 블록의 이름과 계산 방식" : "Feature blocks and how they are computed"}</summary><div className="ca-block-explainer">{blocks.map(([label,title,description]) => <div key={label}><b>{label} · {title}</b><p>{description}</p></div>)}</div></details>
  </div>;
}
