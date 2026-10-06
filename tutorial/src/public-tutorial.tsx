import { useEffect } from "react";
import { ComparisonAtlas } from "./components/comparison-atlas";
import { LiveRankingDemo } from "./components/live-ranking-demo";

type Lang = "ko" | "en";
const repository = "https://github.com/WoojinPark-Jay/pec-fuse-ranking";
const githubProfile = "https://github.com/WoojinPark-Jay";
const linkedinProfile = "https://www.linkedin.com/in/woojinjaypark/";

function SocialIcon({ kind }: { kind: "github" | "linkedin" }) {
  return kind === "github" ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.29-1.69-1.29-1.69-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.38.97.1-.75.4-1.27.74-1.56-2.57-.29-5.27-1.28-5.27-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.75 0c2.19-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.71 5.38-5.29 5.67.42.36.79 1.06.79 2.14v3.17c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .7Z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.34 7.84H1.48V22h3.86V7.84ZM3.41 1a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM22.52 13.88c0-4.27-2.28-6.26-5.32-6.26-2.45 0-3.55 1.35-4.16 2.29V7.84H9.18V22h3.86v-7.01c0-1.85.35-3.64 2.64-3.64 2.26 0 2.29 2.11 2.29 3.76V22h3.86v-7.77c0-.12 0-.23-.01-.35Z" />
    </svg>
  );
}

export function PublicTutorial({ lang }: { lang: Lang }) {
  const ko = lang === "ko";
  const t = (a: string, b: string) => ko ? a : b;

  useEffect(() => {
    let settleTimer = 0;

    const alignHashTarget = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      const toc = document.querySelector<HTMLElement>(".public-toc");
      const offset = (toc?.getBoundingClientRect().height ?? 0) + 12;
      const top = window.scrollY + target.getBoundingClientRect().top - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
    };

    const alignAfterRender = () => {
      window.requestAnimationFrame(() => window.requestAnimationFrame(alignHashTarget));
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(alignHashTarget, 350);
    };

    alignAfterRender();
    document.fonts?.ready.then(alignHashTarget);
    window.addEventListener("hashchange", alignAfterRender);
    return () => {
      window.clearTimeout(settleTimer);
      window.removeEventListener("hashchange", alignAfterRender);
    };
  }, []);

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
        <span className="public-author-cluster">
          <span>Woojin Park · PEC-Fuse author</span>
          <span className="public-social-icons">
            <a className="public-social-icon" href={githubProfile} target="_blank" rel="noopener noreferrer" aria-label={t("Woojin Park GitHub 프로필", "Woojin Park GitHub profile")} title="GitHub"><SocialIcon kind="github" /></a>
            <a className="public-social-icon" href={linkedinProfile} target="_blank" rel="noopener noreferrer" aria-label={t("Woojin Park LinkedIn 프로필", "Woojin Park LinkedIn profile")} title="LinkedIn"><SocialIcon kind="linkedin" /></a>
          </span>
        </span>
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
      <a className="public-live-demo-link" href="#live-demo">{t("데모", "Demo")}<i>LIVE</i></a>
    </nav>

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
        <p>{t("PEC-Fuse 저자", "PEC-Fuse author")}</p>
        <a className="public-profile-link" href={githubProfile} target="_blank" rel="noopener noreferrer"><SocialIcon kind="github" /><span>GitHub profile</span></a>
        <a className="public-profile-link" href={linkedinProfile} target="_blank" rel="noopener noreferrer"><SocialIcon kind="linkedin" /><span>LinkedIn profile</span></a>
        <a href={`${repository}/issues`}>{t("질문 및 재현 이슈", "Questions and reproducibility issues")}</a>
      </aside>
    </section>

    <a className="public-backtotop" href="#top" aria-label={t("맨 위로 이동", "Back to top")}>
      <span aria-hidden="true">↑</span>
      <b>{t("맨 위로", "Top")}</b>
    </a>

    <footer className="public-footer">
      <div className="public-footer-copy">
        <span>PEC-Fuse · Version 0.1.0</span>
        <span>{t("모든 계산 예시는 교육용 합성 데이터입니다.", "All calculation examples use synthetic teaching data.")}</span>
      </div>
      <nav className="public-footer-links" aria-label={t("저자 및 프로젝트 링크", "Author and project links")}>
        <a href={repository} target="_blank" rel="noopener noreferrer" aria-label={t("PEC-Fuse GitHub 저장소", "PEC-Fuse GitHub repository")}><SocialIcon kind="github" /><span>{t("GitHub 저장소", "GitHub repository")}</span></a>
        <a href={linkedinProfile} target="_blank" rel="noopener noreferrer" aria-label={t("Woojin Park LinkedIn 프로필", "Woojin Park LinkedIn profile")}><SocialIcon kind="linkedin" /><span>{t("LinkedIn 프로필", "LinkedIn profile")}</span></a>
        <a href="#top">{t("맨 위로", "Back to top")}</a>
      </nav>
    </footer>
  </>;
}
