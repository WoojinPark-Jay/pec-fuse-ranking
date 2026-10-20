import { useEffect, useState } from "react";
import "./tutorial-release.css";
import { ComparisonAtlas } from "./components/comparison-atlas";
import { LiveRankingDemo } from "./components/live-ranking-demo";

type Lang = "ko" | "en";
const repository = "https://github.com/WoojinPark-Jay/pec-fuse-ranking";
const artifact = "https://anonymous.4open.science/r/pec-fuse-ranking-9F34";
const githubProfile = "https://github.com/WoojinPark-Jay";
const linkedinProfile = "https://www.linkedin.com/in/woojinjaypark/";
const personalWebsite = "https://woojinpark-jay.github.io";

function SocialIcon({ kind }: { kind: "website" | "github" | "linkedin" }) {
  if (kind === "github") return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.29-1.69-1.29-1.69-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.38.97.1-.75.4-1.27.74-1.56-2.57-.29-5.27-1.28-5.27-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.75 0c2.19-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.71 5.38-5.29 5.67.42.36.79 1.06.79 2.14v3.17c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .7Z" />
    </svg>
  );
  if (kind === "linkedin") return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.34 7.84H1.48V22h3.86V7.84ZM3.41 1a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM22.52 13.88c0-4.27-2.28-6.26-5.32-6.26-2.45 0-3.55 1.35-4.16 2.29V7.84H9.18V22h3.86v-7.01c0-1.85.35-3.64 2.64-3.64 2.26 0 2.29 2.11 2.29 3.76V22h3.86v-7.77c0-.12 0-.23-.01-.35Z" />
    </svg>
  );
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2 2.5 9.9V22h7.1v-6.3h4.8V22h7.1V9.9L12 2.2Zm7.3 17.6h-2.7v-6.3H7.4v6.3H4.7v-8.9L12 5l7.3 5.9v8.9Z" /></svg>;
}

export function PublicTutorial({ lang }: { lang: Lang }) {
  const ko = lang === "ko";
  const t = (a: string, b: string) => ko ? a : b;
  const [activeSection, setActiveSection] = useState("tutorial");

  useEffect(() => {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".public-toc a"));
    const sections = links.map(link => document.getElementById(link.hash.slice(1))).filter((node): node is HTMLElement => Boolean(node));
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const offset = (document.querySelector(".public-toc")?.getBoundingClientRect().height ?? 60) + 32;
        const current = sections
          .filter(section => section.getBoundingClientRect().top <= offset)
          .sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top)[0];
        setActiveSection(current?.id ?? "tutorial");
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    document.querySelectorAll<HTMLAnchorElement>(".public-toc a").forEach(link => {
      if (link.hash === `#${activeSection}`) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }, [activeSection]);

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

  return <div className="tutorial-release" lang={lang}>
    <a className="public-skip" href="#tutorial">{t("본문으로 건너뛰기", "Skip to tutorial")}</a>
    <header className="public-masthead" id="top">
      <div className="public-masthead-inner">
        <div className="public-brand">
          <span className="public-mark" role="img" aria-label="PEC-Fuse feature blocks: P, E, C, Z, and psi"><i className="public-mark-p">P</i><i className="public-mark-e">E</i><i className="public-mark-c">C</i><i className="public-mark-z">Z</i><i className="public-mark-psi">ψ</i></span>
          <div><b>PEC-Fuse</b><span>{t("논문 해설 · 인터랙티브 튜토리얼", "Interactive paper companion")}</span></div>
        </div>
        <nav aria-label={t("프로젝트 링크", "Project links")}>
          <span className="public-language" aria-label={t("언어 선택", "Language selection")}>
            <a href={`?view=tutorial&lang=en#${activeSection}`} aria-label="English" title="English" aria-current={!ko ? "page" : undefined}>EN</a>
            <a href={`?view=tutorial&lang=ko#${activeSection}`} aria-label="한국어" title="한국어" aria-current={ko ? "page" : undefined}>한국어</a>
          </span>
        </nav>
      </div>
      <div className="public-paper-meta">
        <span>{t("IEEE Access 투고 논문을 위한 대화형 해설", "Interactive companion to the IEEE Access manuscript")}</span>
        <span>Software 0.2.0 · Manuscript v85</span>
        <span>{t("합성 예시 · 브라우저 내 계산", "Synthetic examples · in-browser calculations")}</span>
        <span className="public-author-cluster">
          <span>{t("Woojin Park · 제1저자 제작 · 원고 v85", "Tutorial by Woojin Park · First author · Manuscript v85")}</span>
          <span className="public-social-icons">
            <a className="public-social-icon" href={personalWebsite} target="_blank" rel="noopener noreferrer" aria-label={t("Woojin Park 개인 웹사이트", "Woojin Park personal website")} title="Website"><SocialIcon kind="website" /></a>
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

    <main id="tutorial">
      <section className="tutorial-orientation" aria-label={t("읽기 안내", "Reading guide")}>
        <div className="tutorial-orientation-title">
          <span>{t("이 튜토리얼의 질문", "THE QUESTION")}</span>
          <h2>{t("서로 다른 근거는 어떻게 하나의 순위가 될까요?", "How do different sources of evidence become one ranking?")}</h2>
          <p>{t("한 후보 기사의 입력부터 시작해, 계산과 학습을 구분하고, 실제 실험이 뒷받침하는 범위까지 따라갑니다.", "Follow one candidate from its input fields to its score, then examine what the experiments support.")}</p>
        </div>
        <nav className="tutorial-paths" aria-label={t("목적별 읽기 경로", "Choose a reading path")}>
          <a href="#microscope"><span>01</span><b>{t("처음 이해하기", "Understand the idea")}</b><small>{t("데이터 → 특성 → 점수", "Data → features → scores")}</small></a>
          <a href="#atlas"><span>02</span><b>{t("실험 근거 살펴보기", "Examine the evidence")}</b><small>{t("비교 조건 → 결과 → 한계", "Conditions → results → limits")}</small></a>
          <a href="#reproduce"><span>03</span><b>{t("직접 실행하기", "Run the examples")}</b><small>{t("아티팩트 → 합성 예제 → 재현 범위", "Artifact → examples → scope")}</small></a>
        </nav>
        <p className="tutorial-scope">{t("읽는 기준: 조작 가능한 예시는 합성 데이터입니다. 실험 결과는 원고의 고정된 평가에서 나온 수치이며, MIND는 비공개 데이터와 다른 출처 정의를 사용하는 공개 프록시입니다.", "Reading key: interactive examples use synthetic data. Reported results come from the manuscript's fixed evaluations. MIND is a public proxy with different source definitions from the private study.")}</p>
      </section>
      <ComparisonAtlas lang={lang} />
    </main>

    <LiveRankingDemo lang={lang} />

    <section className="public-release" id="reproduce">
      <div className="public-section-label">REPRODUCE</div>
      <h2>{t("공개 아티팩트로 계산과 학습을 직접 확인하세요", "Run the workflow from the public artifact")}</h2>
      <p>{t("4open 아티팩트에서 ZIP을 내려받아 압축을 풀고, pyproject.toml이 있는 폴더에서 아래 명령을 실행하세요. ExtraTrees, 학습형 MLP 융합, 후보 인식 신경망의 세 합성 예제를 제공합니다. 논문 표의 재현 범위는 아래에서 별도로 구분합니다.", "Download the repository ZIP from the 4open artifact, extract it, and run these commands in the folder containing pyproject.toml. Three synthetic examples cover ExtraTrees, learned MLP fusion, and candidate-aware neural scoring. Their scope is distinguished from reproducing the manuscript tables below.")}</p>
      <div className="public-link-row"><a href={`${artifact}/README.md`}>{t("아티팩트와 다운로드 안내", "Artifact and download instructions")}</a></div>
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
        <a href={`${artifact}/docs/GETTING_STARTED.md`}>{t("전체 실행 절차", "Full quick start")}</a>
        <a href={`${artifact}/docs/REPRODUCIBILITY.md`}>{t("재현 가능 범위", "Reproducibility scope")}</a>
        <a href={`${artifact}/docs/DATA_AVAILABILITY.md`}>{t("데이터 제공 범위", "Data availability")}</a>
      </div>
      <div className="tutorial-reproduction-scope">
        <h3>{t("MIND 결과를 실행하려면", "To run the MIND evaluation")}</h3>
        <p>{t("MIND runner는 지정된 BGE-M3·BGE-base 캐시 벡터를 입력으로 받습니다. 캐시는 배포되지 않으며 runner도 이를 생성하지 않습니다. 원자료만으로 처음부터 실행하는 절차와는 범위가 다릅니다. 공개 aggregate와 protocol은 아티팩트에서 확인할 수 있습니다.", "The MIND runner requires the specified BGE-M3 and BGE-base vector caches. These caches are not distributed, and the runner does not generate them. Running from raw data alone is outside this entry point's scope. Aggregate results and the protocol are available in the artifact.")}</p>
        <a href={`${artifact}/docs/MIND_PROXY_PROTOCOL.md`}>{t("MIND 프로토콜과 캐시 요구사항", "MIND protocol and cache requirements")}</a>
      </div>
    </section>

    <section className="public-citation" id="cite">
      <div>
        <div className="public-section-label">CITE</div>
        <h2>{t("논문과 사용한 소프트웨어 버전을 함께 인용해 주세요", "Cite the paper together with the software version used")}</h2>
        <p>{t("현재 논문은 미출판 원고 v85입니다. 정식 DOI와 게재 정보는 출판 후 추가할 예정이며, 그전에는 아래 원고 정보와 사용한 저장소 릴리스 또는 커밋을 함께 표기해 주세요.", "This is an unpublished manuscript, revision v85. Final publication metadata and a DOI will be added after publication. Until then, cite the manuscript together with the repository release or commit used.")}</p>
        <pre><code>{`@unpublished{park2026pecfuse,
  title   = {PEC-Fuse: Source-Preserving Evidence Fusion for
             News Ranking with Partial Recommendation Traces},
  author  = {Park, Woojin and Cheong, Taesu},
  note    = {Unpublished manuscript, revision v85},
  url     = {https://woojinpark-jay.github.io/pec-fuse-ranking/PEC-Fuse-manuscript-v85.pdf},
  year    = {2026}
}

Software: PEC-Fuse repository, version 0.2.0
${repository}`}</code></pre>
        <p className="public-paper-authors"><b>{t("논문 저자", "Paper authors")}</b><span>Woojin Park · Taesu Cheong</span></p>
      </div>
      <aside>
        <span>{t("제1저자", "FIRST AUTHOR")}</span>
        <h3>Woojin Park</h3>
        <p>{t("PEC-Fuse 제1저자 · 튜토리얼 제작", "PEC-Fuse first author · Tutorial author")}</p>
        <a className="public-profile-link" href={personalWebsite} target="_blank" rel="noopener noreferrer"><SocialIcon kind="website" /><span>{t("개인 웹사이트", "Personal website")}</span></a>
        <a className="public-profile-link" href={githubProfile} target="_blank" rel="noopener noreferrer"><SocialIcon kind="github" /><span>GitHub profile</span></a>
        <a className="public-profile-link" href={linkedinProfile} target="_blank" rel="noopener noreferrer"><SocialIcon kind="linkedin" /><span>LinkedIn profile</span></a>
        <a href={`${artifact}/docs/GETTING_STARTED.md`}>{t("실행 안내와 재현 문서", "Execution and reproducibility guide")}</a>
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
    </footer>
  </div>;
}
