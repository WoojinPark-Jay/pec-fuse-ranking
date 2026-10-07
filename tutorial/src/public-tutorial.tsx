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
          <span className="public-mark" role="img" aria-label="PEC-Fuse feature blocks: P, E, C, Z, and psi"><i className="public-mark-p">P</i><i className="public-mark-e">E</i><i className="public-mark-c">C</i><i className="public-mark-z">Z</i><i className="public-mark-psi">ψ</i></span>
          <div><b>PEC-Fuse</b><span>{t("논문 해설 · 인터랙티브 튜토리얼", "Interactive paper companion")}</span></div>
        </div>
        <nav aria-label={t("프로젝트 링크", "Project links")}>
          <a href={`?lang=${lang}`}>{t("프로젝트", "Project")}</a>
          <a href={repository}>GitHub</a>
          <a href={`${repository}#quick-start`}>{t("실행", "Run")}</a>
          <a href={`${repository}/tree/main/access`}>{t("결과", "Results")}</a>
          <span className="public-language" aria-label={t("언어 선택", "Language selection")}>
            <a href="?view=tutorial&lang=en" aria-label="English" title="English" aria-current={!ko ? "page" : undefined}><span aria-hidden="true">🇺🇸</span></a>
            <a href="?view=tutorial&lang=ko" aria-label="한국어" title="한국어" aria-current={ko ? "page" : undefined}><span aria-hidden="true">🇰🇷</span></a>
          </span>
        </nav>
      </div>
      <div className="public-paper-meta">
        <span>{t("IEEE Access 투고 논문을 위한 대화형 해설", "Interactive companion to the IEEE Access manuscript")}</span>
        <span>Version 0.1.0</span>
        <span>{t("합성 예시 · 브라우저 내 계산", "Synthetic examples · in-browser calculations")}</span>
        <span className="public-author-cluster">
          <span>{t("Woojin Park · 제1저자 제작", "Tutorial by Woojin Park · First author")}</span>
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
      <p>{t("공개 저장소에는 기본 ExtraTrees 경로뿐 아니라 학습형 MLP 융합과 candidate-aware neural 모델의 정의·학습 루프도 포함되어 있습니다. 아래 세 경로는 모두 제공된 합성 입력에서 처음부터 실행할 수 있으며, MIND 공개 데이터 실험은 전체 재현 문서에서 별도로 안내합니다.", "The public repository now includes three executable paths: the ExtraTrees candidate pipeline, learned MLP fusion, and the candidate-aware neural scorer. All three can be trained from scratch on the supplied synthetic inputs; the public MIND study is documented separately in the full reproducibility guide.")}</p>
      <div className="public-command" role="group" aria-label={t("빠른 실행 명령", "Quick-start command")}>
        <code>python -m pip install -e .</code>
        <code>python scripts/run_synthetic_demo.py</code>
      </div>
        <div className="public-repro-copy public-repro-copy-ko" lang="ko">
          <div className="public-repro-grid">
            <article className="public-repro-card">
              <span>01 · 기본 후보 순위 경로</span>
              <h3>ExtraTrees로 전체 파이프라인 확인</h3>
              <code>python scripts/run_synthetic_demo.py</code>
              <p>순서가 고정된 25개 특성을 만들고, ExtraTrees를 학습한 뒤 질의 안에서 후보를 정렬해 NDCG@10·Recall@10·MRR을 계산합니다.</p>
            </article>
            <article className="public-repro-card">
              <span>02 · 학습형 MLP 융합</span>
              <h3>다섯 입력을 5차원 표현으로 학습</h3>
              <code>python -m pip install -e '.[neural]'</code>
              <code>python scripts/run_synthetic_fusion.py</code>
              <p>P·C 관련 다섯 좌표를 학습된 5차원 잠재 표현으로 바꾸고, 이 표현이 최종 점수 모델에 전달되는 과정과 역전파를 확인합니다.</p>
            </article>
            <article className="public-repro-card">
              <span>03 · 후보 인식 신경망</span>
              <h3>후보에 따라 달라지는 이력 요약 학습</h3>
              <code>python scripts/run_synthetic_neural.py</code>
              <p>이력 self-attention, candidate-conditioned pooling, listwise loss와 학습 루프를 합성 질의 그룹에서 직접 실행합니다.</p>
            </article>
          </div>
          <aside className="public-repro-boundary">
            <strong>재현 범위</strong>
            <p>이 실행은 공개 모델 정의와 학습 루프가 실제로 작동함을 검증합니다. 비공개 운영 레코드·임베딩·학습된 논문 체크포인트는 공개하지 않으므로, 논문 표의 수치를 그대로 다시 만드는 절차는 아닙니다.</p>
          </aside>
        </div>
        <div className="public-repro-copy public-repro-copy-en" lang="en">
          <div className="public-repro-grid">
            <article className="public-repro-card">
              <span>01 · Candidate ranking baseline</span>
              <h3>Trace the full ExtraTrees pipeline</h3>
              <code>python scripts/run_synthetic_demo.py</code>
              <p>Build the ordered 25-feature record, fit ExtraTrees, rank candidates within each query, and report NDCG@10, Recall@10, and MRR.</p>
            </article>
            <article className="public-repro-card">
              <span>02 · Learned MLP fusion</span>
              <h3>Learn a 5-D representation from five inputs</h3>
              <code>python -m pip install -e '.[neural]'</code>
              <code>python scripts/run_synthetic_fusion.py</code>
              <p>Transform the five P/C coordinates into a learned 5-D latent representation, pass it to the final scorer, and inspect backpropagation.</p>
            </article>
            <article className="public-repro-card">
              <span>03 · Candidate-aware neural</span>
              <h3>Learn a candidate-conditioned history summary</h3>
              <code>python scripts/run_synthetic_neural.py</code>
              <p>Run history self-attention, candidate-conditioned pooling, listwise loss, and the training loop on generated query groups.</p>
            </article>
          </div>
          <aside className="public-repro-boundary">
            <strong>Reproducibility boundary</strong>
            <p>These runs verify that the public model definitions and learning loops execute. They do not release operational rows, private embeddings, or fitted manuscript checkpoints, so they are not a numerical reproduction of the manuscript tables.</p>
          </aside>
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
        <h2>{t("논문과 사용한 소프트웨어 버전을 함께 인용해 주세요", "Cite the paper together with the software version used")}</h2>
        <p>{t("정식 DOI와 게재 정보는 출판 후 추가할 예정입니다. 그전에는 아래 논문 정보와 저장소의 릴리스 또는 커밋을 함께 표기해 주세요.", "The final DOI and publication metadata will be added after publication. Until then, cite the manuscript together with the repository release or commit used.")}</p>
        <pre><code>{`@article{park2026pecfuse,
  title   = {PEC-Fuse: Source-Preserving Evidence Fusion for
             News Ranking with Partial Recommendation Traces},
  author  = {Park, Woojin and Cheong, Taesu},
  journal = {IEEE Access},
  year    = {2026}
}

Software: PEC-Fuse repository, version 0.1.0
${repository}`}</code></pre>
        <p className="public-paper-authors"><b>{t("논문 저자", "Paper authors")}</b><span>Woojin Park · Taesu Cheong</span></p>
      </div>
      <aside>
        <span>{t("제1저자", "FIRST AUTHOR")}</span>
        <h3>Woojin Park</h3>
        <p>{t("PEC-Fuse 제1저자 · 튜토리얼 제작", "PEC-Fuse first author · Tutorial author")}</p>
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
        <strong>PEC-Fuse: Source-Preserving Evidence Fusion for News Ranking with Partial Recommendation Traces</strong>
        <span>Woojin Park · Taesu Cheong</span>
      </div>
      <nav className="public-footer-links" aria-label={t("저자 및 프로젝트 링크", "Author and project links")}>
        <a href={repository} target="_blank" rel="noopener noreferrer" aria-label={t("PEC-Fuse GitHub 저장소", "PEC-Fuse GitHub repository")}><SocialIcon kind="github" /><span>{t("GitHub 저장소", "GitHub repository")}</span></a>
        <a href={linkedinProfile} target="_blank" rel="noopener noreferrer" aria-label={t("Woojin Park LinkedIn 프로필", "Woojin Park LinkedIn profile")}><SocialIcon kind="linkedin" /><span>{t("LinkedIn 프로필", "LinkedIn profile")}</span></a>
        <a href="#top">{t("맨 위로", "Back to top")}</a>
      </nav>
    </footer>
  </>;
}
