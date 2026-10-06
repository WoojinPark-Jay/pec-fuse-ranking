import { ComparisonAtlas } from "./components/comparison-atlas";

type Lang = "ko" | "en";
const repository = "https://github.com/WoojinPark-Jay/pec-fuse-ranking";

export function PublicTutorial({ lang }: { lang: Lang }) {
  const ko = lang === "ko";
  const t = (a: string, b: string) => ko ? a : b;
  const languageHref = ko ? "?lang=en" : "?lang=ko";

  return <>
    <a className="public-skip" href="#tutorial">{t("본문으로 건너뛰기", "Skip to tutorial")}</a>
    <header className="public-masthead" id="top">
      <div className="public-masthead-inner">
        <div className="public-brand">
          <span className="public-mark" aria-hidden="true"><i>P</i><i>E</i><i>C</i></span>
          <div><b>PEC-Fuse</b><span>{t("인터랙티브 논문 튜토리얼", "Interactive paper tutorial")}</span></div>
        </div>
        <nav aria-label={t("프로젝트 링크", "Project links")}>
          <a href={repository}>GitHub</a>
          <a href={`${repository}#quick-start`}>{t("실행", "Run")}</a>
          <a href={`${repository}/tree/main/access`}>{t("결과", "Results")}</a>
          <a href={languageHref}>{ko ? "English" : "한국어"}</a>
        </nav>
      </div>
      <div className="public-paper-meta">
        <span>{t("IEEE Access 원고의 동반 학습 자료", "Companion learning resource for an IEEE Access manuscript")}</span>
        <span>Version 0.1.0</span>
        <span>{t("합성 예시 · 브라우저 내 계산", "Synthetic examples · in-browser calculations")}</span>
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
      <a href="#reproduce">{t("재현", "Reproduce")}</a>
      <a href="#cite">{t("인용", "Cite")}</a>
    </nav>

    <div id="tutorial">
      <ComparisonAtlas lang={lang} />
    </div>

    <section className="public-release" id="reproduce">
      <div className="public-section-label">REPRODUCE</div>
      <h2>{t("설명을 읽은 다음, 같은 구조를 직접 실행해 보세요", "After the explanation, run the same structure yourself")}</h2>
      <p>{t("공개 저장소에는 합성 후보 행, 정렬된 25차원 스키마, ExtraTrees 데모, NDCG@10·Recall@10·MRR 계산, 공개 MIND 경계 실험이 포함됩니다. 비공개 운영 행과 fitted private models는 배포하지 않습니다.", "The public repository includes synthetic candidate rows, the ordered 25-field schema, an ExtraTrees demo, NDCG@10/Recall@10/MRR calculations, and a public MIND boundary study. Private operational rows and fitted private models are not distributed.")}</p>
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
        <h2>{t("버전과 저장소를 함께 기록해 주세요", "Record the version and repository together")}</h2>
        <p>{t("정식 출판 정보와 DOI는 게재 후 추가됩니다. 그전에는 저장소 URL과 사용한 release 또는 commit을 함께 남겨 주세요.", "Formal publication details and a DOI will be added after publication. Until then, cite the repository URL together with the release or commit used.")}</p>
        <pre><code>{`PEC-Fuse: Source-Preserving Evidence Fusion for News Ranking\nSoftware and interactive tutorial, version 0.1.0\n${repository}`}</code></pre>
      </div>
      <aside>
        <span>{t("저자", "AUTHOR")}</span>
        <h3>Woojin Park</h3>
        <p>{t("PEC-Fuse 연구·소프트웨어·튜토리얼", "PEC-Fuse research, software, and tutorial")}</p>
        <a href="https://github.com/WoojinPark-Jay">GitHub profile</a>
        <a href={`${repository}/issues`}>{t("질문 및 재현 이슈", "Questions and reproducibility issues")}</a>
      </aside>
    </section>

    <footer className="public-footer">
      <span>PEC-Fuse · Version 0.1.0</span>
      <span>{t("모든 계산 예시는 교육용 합성 데이터입니다.", "All calculation examples use synthetic teaching data.")}</span>
      <a href="#top">{t("맨 위로", "Back to top")}</a>
    </footer>
  </>;
}
