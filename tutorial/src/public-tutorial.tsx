import { ComparisonAtlas } from "./components/comparison-atlas";
import { LiveRankingDemo } from "./components/live-ranking-demo";

type Lang = "ko" | "en";
const repository = "https://github.com/WoojinPark-Jay/pec-fuse-ranking";

export function PublicTutorial({ lang }: { lang: Lang }) {
  const ko = lang === "ko";
  const t = (a: string, b: string) => ko ? a : b;

  return <>
    <a className="public-skip" href="#tutorial">{t("본문으로 건너뛰기", "Skip to tutorial")}</a>
    <header className="public-masthead" id="top">
      <div className="public-masthead-inner">
        <div className="public-brand">
          <span className="public-mark" aria-hidden="true"><i>P</i><i>E</i><i>C</i></span>
          <div><b>PEC-Fuse</b><span>{t("논문 해설 · 인터랙티브 튜토리얼", "Interactive paper companion")}</span></div>
        </div>
        <nav aria-label={t("프로젝트 링크", "Project links")}>
          <a href={repository}>GitHub</a>
          <a href={`${repository}#quick-start`}>{t("실행", "Run")}</a>
          <a href={`${repository}/tree/main/access`}>{t("결과", "Results")}</a>
          <span className="public-language" aria-label={t("언어 선택", "Language selection")}>
            <a href="?lang=en" aria-current={!ko ? "page" : undefined}>🇺🇸 <span>English</span></a>
            <a href="?lang=ko" aria-current={ko ? "page" : undefined}>🇰🇷 <span>한국어</span></a>
          </span>
        </nav>
      </div>
      <div className="public-paper-meta">
        <span>{t("IEEE Access 투고 논문을 위한 대화형 해설", "Interactive companion to the IEEE Access manuscript")}</span>
        <span>Version 0.1.0</span>
        <span>{t("합성 예시 · 브라우저 내 계산", "Synthetic examples · in-browser calculations")}</span>
        <a href="https://github.com/WoojinPark-Jay">Woojin Park · PEC-Fuse author</a>
      </div>
    </header>

    <nav className="public-toc" aria-label={t("튜토리얼 목차", "Tutorial contents")}>
      <a href="#tutorial">{t("시작", "Start")}</a>
      <a href="#microscope">{t("데이터", "Data")}</a>
      <a href="#candidate-budget">{t("후보풀", "Candidate pool")}</a>
      <a href="#record">{t("특성", "Features")}</a>
      <a href="#equations">{t("수식", "Equations")}</a>
      <a href="#model-lab">{t("모델", "Models")}</a>
      <a href="#atlas">{t("실험", "Experiments")}</a>
      <a className="public-live-demo-link" href="#live-demo">{t("라이브 데모", "Live demo")}<i>TRY</i></a>
      <a href="#reproduce">{t("재현", "Reproduce")}</a>
      <a href="#cite">{t("인용", "Cite")}</a>
    </nav>

    <aside className="public-demo-teaser" aria-label={t("라이브 랭킹 데모 안내", "Live ranking demo invitation")}>
      <div className="public-demo-faces" aria-hidden="true"><span>👩🏻‍🔬</span><span>🧑🏽‍💼</span><span>👩🏻‍⚕️</span></div>
      <div className="public-demo-phone" aria-hidden="true"><i>PEC</i><span>🌍</span><span>🔋</span><span>⚽</span></div>
      <div>
        <small>INTERACTIVE RECOMMENDATION DEMO</small>
        <b>{t("독자와 모델을 바꾸며 뉴스 순위를 직접 확인하세요", "Switch readers and models, then watch the news ranking change")}</b>
        <p>{t("세 가지 독자 성향과 네 가지 모델을 조합하고, 각 추천 점수가 어떤 입력에서 나왔는지 살펴볼 수 있습니다.", "Combine three reader profiles with four scoring models and inspect the evidence behind every recommendation score.")}</p>
      </div>
      <a href="#live-demo"><span>{t("라이브 데모 시작", "Open live demo")}</span><i aria-hidden="true">↓</i></a>
    </aside>

    <div id="tutorial">
      <ComparisonAtlas lang={lang} />
    </div>

    <LiveRankingDemo lang={lang} />

    <section className="public-release" id="reproduce">
      <div className="public-section-label">REPRODUCE</div>
      <h2>{t("개념을 이해했다면, 공개 코드로 직접 재현해 보세요", "Reproduce the workflow with the public code")}</h2>
      <p>{t("공개 저장소에는 합성 후보 데이터, 순서가 명시된 25개 특성 스키마, ExtraTrees 예제, NDCG@10·Recall@10·MRR 계산, 그리고 MIND 공개 데이터 실험이 포함되어 있습니다. 비공개 운영 데이터와 해당 데이터로 학습한 모델은 제공하지 않습니다.", "The public repository includes synthetic candidate data, the ordered 25-feature schema, an ExtraTrees example, NDCG@10/Recall@10/MRR calculations, and the public MIND study. Private operational data and models fitted to those data are not distributed.")}</p>
      <div className="public-command" role="group" aria-label={t("빠른 실행 명령", "Quick-start command")}>
        <code>python -m pip install -e .</code>
        <code>python scripts/run_synthetic_demo.py</code>
      </div>
      <div className="public-link-row">
        <a href={`${repository}#quick-start`}>{t("전체 실행 절차", "Full quick start")}</a>
        <a href={`${repository}/blob/main/docs/REPRODUCIBILITY.md`}>{t("재현 가능 범위", "Reproducibility scope")}</a>
        <a href={`${repository}/blob/main/docs/DATA_AVAILABILITY.md`}>{t("데이터 제공 범위", "Data availability")}</a>
      </div>
    </section>

    <section className="public-citation" id="cite">
      <div>
        <div className="public-section-label">CITE</div>
        <h2>{t("인용할 때는 저장소와 사용한 버전을 함께 밝혀 주세요", "Cite the repository together with the version used")}</h2>
        <p>{t("정식 서지 정보와 DOI는 논문 게재 후 추가할 예정입니다. 그전에는 저장소 주소와 사용한 릴리스 또는 커밋을 함께 표기해 주세요.", "Formal publication details and a DOI will be added after publication. Until then, cite the repository URL together with the release or commit used.")}</p>
        <pre><code>{`PEC-Fuse: Source-Preserving Evidence Fusion for News Ranking\nSoftware and interactive tutorial, version 0.1.0\n${repository}`}</code></pre>
      </div>
      <aside>
        <span>{t("저자", "AUTHOR")}</span>
        <h3>Woojin Park</h3>
        <p>{t("PEC-Fuse 연구, 공개 소프트웨어 및 튜토리얼", "PEC-Fuse research, open-source software, and tutorial")}</p>
        <a href="https://github.com/WoojinPark-Jay">GitHub profile</a>
        <a href={`${repository}/issues`}>{t("질문 및 재현 이슈", "Questions and reproducibility issues")}</a>
      </aside>
    </section>

    <a className="public-backtotop" href="#top" aria-label={t("맨 위로 이동", "Back to top")}>
      <span aria-hidden="true">↑</span>
      <b>{t("맨 위로", "Top")}</b>
    </a>

    <footer className="public-footer">
      <span>PEC-Fuse · Version 0.1.0</span>
      <span>{t("모든 계산 예시는 교육용 합성 데이터입니다.", "All calculation examples use synthetic teaching data.")}</span>
      <a href="#top">{t("맨 위로", "Back to top")}</a>
    </footer>
  </>;
}
