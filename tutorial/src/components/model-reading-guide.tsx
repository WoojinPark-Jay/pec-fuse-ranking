"use client";

import { useState, type ComponentProps } from "react";
import { ModelLearningLab } from "./model-learning-lab";
import "./model-reading-guide.css";

export function GuidedModelLab(props: ComponentProps<typeof ModelLearningLab>) {
  const language = props as { lang?: string; locale?: string; language?: string; en?: boolean; english?: boolean };
  const en = language.lang === "en" || language.locale === "en" || language.language === "en" || language.en === true || language.english === true;
  const t = (ko: string, english: string) => en ? english : ko;
  const [learning, setLearning] = useState(false);
  return <>
    <section className="mrg" id="model-reading-guide" aria-labelledby="mrg-title">
      <header>
        <span className="mrg-kicker">{t("모델 데모를 읽는 순서", "A reading guide to the model lab")}</span>
        <h2 id="mrg-title">{t("입력값을 바꾸는 것과 모델을 다시 학습하는 것은 다릅니다", "Changing an input is not the same as training a model")}</h2>
        <p>{t("후보 기사 A 하나를 먼저 따라가 봅니다. A를 설명하는 숫자 한 행이 입력이고, 이미 학습된 모델은 그 행에서 A의 점수 하나를 계산합니다. 모든 후보에 같은 과정을 적용한 뒤 같은 질의 안에서 점수순으로 정렬합니다.", "Start with one candidate article, A. One numeric row describing A is the input. The fitted model produces one score for A. Repeat for the other candidates, then sort within the query.")}</p>
      </header>

      <div className="mrg-example">
        <div><span>{t("기사 A를 설명하는 숫자", "Numbers describing article A")}</span><strong>[0.82, 0.31, 0.58, 0.45, 0.40]</strong><p>{t("차례대로 P, C mean, C max, C top-3, C attention. 서로 다른 다섯 특징이지, 다섯 기사나 다섯 정답이 아닙니다.", "In order: P, C mean, C max, C top-3, C attention. These are five different features, not five articles or five answers.")}</p></div>
        <div><span>{t("모델에 넣을 한 행", "One row for the model")}</span><strong>{t("기사 A → xₐ → 점수 sₐ", "Article A → xₐ → score sₐ")}</strong><p>{t("위 다섯 값은 입력의 일부입니다. Complete PEC에서는 다른 특징들과 합쳐 25칸짜리 한 행이 됩니다. 25개를 미리 더해서 한 숫자로 만들지 않습니다.", "Those five values are only part of the input. Complete PEC combines them with the other features into one 25-field row. It does not first sum the 25 values into one number.")}</p></div>
      </div>

      <div className="mrg-switch" role="group" aria-label={t("예측과 학습 구분", "Prediction versus training")}>
        <button type="button" aria-pressed={!learning} onClick={() => setLearning(false)}>{t("예측: 배운 규칙을 사용", "Prediction: use learned rules")}</button>
        <button type="button" aria-pressed={learning} onClick={() => setLearning(true)}>{t("학습: 정답으로 규칙을 조정", "Training: learn from labels")}</button>
      </div>
      <div className="mrg-lifecycle" aria-live="polite">
        <div className="mrg-path">
          <div><span>01</span><strong>{learning ? t("여러 학습 query의 후보 행 + y", "Candidate rows + y from training queries") : t("현재 후보의 입력 x", "Current candidate input x")}</strong></div>
          <div><span>02</span><strong>{learning ? t("입력과 정답의 관계를 학습", "Learn the relationship to labels") : t("이미 학습된 모델 fθ", "Already trained model fθ")}</strong></div>
          <div><span>03</span><strong>{learning ? t("이후 예측에 쓸 모델 θ", "Model θ for later predictions") : t("후보당 점수 한 개 s", "One score s per candidate")}</strong></div>
        </div>
        <p>{learning ? t("y=1은 관측된 클릭, y=0은 관측된 클릭이 아닌 후보입니다. 0이 싫어한다는 뜻은 아닙니다. 나무 모델은 분기와 말단 통계를 만들고, 신경망은 가중치를 조정합니다. 모델 하나를 기사 하나만으로 학습하는 것이 아니라 여러 학습 사례를 사용합니다.", "Here y=1 denotes an observed click, and y=0 a candidate without an observed click, not a confirmed dislike. Trees learn splits and leaf statistics; neural networks adjust weights. A model is learned from many training examples, not from one article alone.") : t("x는 이번 기사에 따라 달라지는 숫자, θ는 학습 때 정해진 모델의 규칙입니다. 입력 슬라이더를 움직이면 x만 바뀝니다. 모델을 다시 학습시키는 것은 아닙니다. 테스트의 y는 점수를 만든 뒤 평가할 때만 사용하며, 모델 입력에는 넣지 않습니다.", "x changes with the candidate; θ denotes the model rules obtained during training. Moving an input slider changes x, not the trained model. Test labels y are used for evaluation after scoring, not as model inputs.")}</p>
        <div className="mrg-equation"><strong>{learning ? t("학습 데이터 (X, y) → 모델 θ", "Training data (X, y) → model θ") : "sₐ = fθ(xₐ)"}</strong><span>{learning ? t("학습 방식은 모델마다 다릅니다. 아래에서 구분해 봅니다.", "How the model learns differs across the three cases below.") : t("읽는 법: ‘학습된 모델에 A의 입력 행을 넣어 A의 점수를 얻는다.’", "Read: apply the trained model to A’s input row to obtain A’s score.")}</span></div>
      </div>

      <h3>{t("세 경로는 어디에서 달라질까요?", "Where do the three paths differ?")}</h3>
      <p>{t("ExtraTrees와 신경망 순위 모델은 후보의 최종 점수를 만드는 두 가지 대안입니다. Learned fusion은 점수 모델 앞에서 입력 좌표를 바꾸는 방법입니다. 따라서 셋을 같은 종류의 최종 순위 모델로 보면 안 됩니다.", "ExtraTrees and the neural ranker are alternative final scorers. Learned fusion transforms inputs before the final scorer; it is not a third interchangeable ranking model.")}</p>
      <div className="mrg-models">
        <details><summary><strong>ExtraTrees</strong><span>{t("여러 나무의 판단을 모아 점수를 만듭니다", "Combine the judgments of many trees")}</span></summary>
          <p>{t("숫자 한 행을 받아 ‘P가 이 기준보다 큰가?’ 같은 질문을 차례로 거칩니다. 마지막 말단에 도착하면 그곳의 학습 표본에서 얻은 클래스 1 비율을 사용합니다. 여러 나무가 내는 값을 평균한 것이 점수입니다.", "A feature row passes through questions such as ‘Is P above this threshold?’ At the reached leaf, a tree uses the class-1 proportion learned from training samples there. The forest averages the tree outputs.")}</p>
          <div className="mrg-arithmetic">(0.60 + 0.80 + 0.70) / 3 = <strong>0.70</strong></div>
          <p>{t("설명용 나무 3개의 예입니다. 0.70은 입력 특징들의 평균이 아니라 세 나무 출력의 평균이며, 실제 클릭률이 70%라고 보장하는 값도 아닙니다.", "This is a three-tree teaching example. 0.70 is the average of tree outputs, not of input features, and it is not a guarantee of a 70% click-through rate.")}</p>
          <p className="mrg-try"><strong>{t("아래에서 해보기", "Try below")}</strong>{t(" ExtraTrees에서 P나 C를 바꿔 보세요. 분기 경계를 넘을 때 경로와 점수가 바뀌고, 같은 말단에 머무르면 입력이 변해도 점수가 그대로일 수 있습니다.", " In ExtraTrees, change P or C. Crossing a split threshold can change the path and score. Within the same leaves, changing an input may leave the score unchanged.")}</p>
        </details>
        <details><summary><strong>Neural ranker</strong><span>{t("기사와 이력을 벡터로 비교해 점수를 만듭니다", "Compare candidate and history vectors to produce a score")}</span></summary>
          <p>{t("벡터는 여러 숫자를 순서대로 담은 배열입니다. 후보 기사 벡터와 과거 기사 벡터를 받고, 지금 후보와 관련 있는 이력에 더 큰 비중을 주어 사용자 표현을 만듭니다. 후보·사용자 표현과 둘의 곱·차이 등을 합쳐 점수를 계산합니다. 실험 조건에 따라 control 또는 PEC 특징도 함께 넣습니다.", "A vector is an ordered array of numbers. The ranker receives candidate and past-article vectors, gives relevant history more weight, and forms a user representation. Candidate and user representations, their elementwise product and absolute difference, and optional control or PEC features are combined to compute a score.")}</p>
          <p>{t("여기서 attention 비중은 ‘어느 과거 기사를 얼마나 참고할지’이고, 최종 추천 점수와 다릅니다. 학습 때 후보 점수들을 softmax로 바꿔 정답과 비교하는 과정도, 이력 attention과는 다른 계산입니다.", "History attention weights answer ‘How much should each past article contribute?’ They are not the final ranking scores. The softmax over candidate scores used by the training loss is a separate operation from history attention.")}</p>
          <p className="mrg-try"><strong>{t("아래에서 해보기", "Try below")}</strong>{t(" Neural ranker에서 A와 B를 번갈아 선택하세요. 같은 이력이라도 후보가 바뀌면 참고 비중과 사용자 표현이 달라지는 과정을 보세요. 작은 예시 벡터는 실제 임베딩 차원을 축소해 설명한 것입니다.", " In Neural ranker, switch between A and B. Observe how the same history gets different weights and yields a different user representation for each candidate. The small teaching vectors do not represent the actual embedding dimensionality.")}</p>
        </details>
        <details><summary><strong>Learned fusion</strong><span>{t("점수를 만들기 전에 다섯 입력을 변환합니다", "Transform five inputs before final scoring")}</span></summary>
          <p>{t("Direct는 P와 네 C 값을 각각 보존합니다. Fusion은 이 다섯 숫자를 학습된 가중치로 섞어 새 좌표로 바꿉니다. 새 좌표 하나는 일반적으로 P처럼 이름이 붙은 개념이 아니라 여러 입력의 조합입니다. 그 결과에 공통 context를 붙여 ExtraTrees에 넣습니다.", "Direct retains P and the four C values separately. Fusion mixes those five numbers using learned weights to create new coordinates. A new coordinate generally combines several inputs rather than retaining a named meaning such as P. Shared context is then appended before ExtraTrees scoring.")}</p>
          <div className="mrg-arithmetic">{t("Direct: 공통 14 + 원래 5 = 19칸", "Direct: shared 14 + original 5 = 19 fields")}<br/>{t("5-D fusion: 공통 14 + 변환된 5 = 19칸", "5-D fusion: shared 14 + transformed 5 = 19 fields")}</div>
          <p>{t("따라서 이 비교는 입력 개수가 아니라 원래 좌표를 유지하는지, 학습해 바꾼 좌표를 쓰는지의 차이입니다. 다차원 fusion의 1-D 설정(14+1)과 별도의 scalar 비교(11+1)는 공통 context가 다르므로 같은 실험이 아닙니다.", "This comparison changes the representation, not the number of inputs. The 1-D setting of the multidimensional audit (14+1) and the separate scalar comparison (11+1) have different shared context and are not the same experiment.")}</p>
          <p className="mrg-try"><strong>{t("아래에서 해보기", "Try below")}</strong>{t(" Learned fusion에서 Direct와 5-D를 비교한 뒤 출력 좌표 하나를 선택하세요. 표준화 → 입력×가중치 → 합+bias → tanh 순서로 계산을 따라가세요. ‘학습 한 단계’는 이 예시의 가중치를 바꾸지만 논문 모델을 재학습하지는 않습니다.", " In Learned fusion, compare Direct with 5-D, then select an output coordinate. Follow standardization, input × weight, sum + bias, and tanh. ‘One training step’ updates this teaching example’s weights, not the paper’s fitted model.")}</p>
        </details>
      </div>
      <details className="mrg-terms"><summary>{t("기호 때문에 막히면: x, X, y, θ, W, b는 무엇인가요?", "Stuck on notation? What are x, X, y, θ, W, and b?")}</summary><dl>
        <dt>x / X</dt><dd>{t("x는 후보 한 개의 숫자 행, X는 여러 후보 행을 쌓은 표입니다. N×25는 후보 N개와 후보당 특징 25개를 뜻합니다.", "x is one candidate’s feature row; X stacks several rows. N×25 means N candidates with 25 features each.")}</dd>
        <dt>y / s</dt><dd>{t("y는 관측으로 만든 정답 레이블, s는 모델이 계산한 점수입니다. 모델이 y를 입력받아 그대로 s로 돌려주는 것이 아닙니다.", "y is the observed target label; s is the computed model score. The model is not given y to copy into s.")}</dd>
        <dt>θ / W / b</dt><dd>{t("θ는 학습된 모델 전체를 가리키는 기호입니다. 신경망의 W는 입력에 곱하는 가중치, b는 더하는 편향입니다. 특징값과 달리 학습 후에는 고정해 예측에 사용합니다.", "θ denotes the fitted model. In a neural network, W contains weights multiplying the input, and b is an added bias. Unlike candidate features, these are held fixed during prediction after training.")}</dd>
      </dl></details>
      <a className="mrg-start" href="#model-lab">{t("아래 데모에서 후보 A의 계산을 단계별로 보기", "Follow candidate A step by step in the model lab")}</a>
    </section>
    <ModelLearningLab {...props}/>
  </>;
}
