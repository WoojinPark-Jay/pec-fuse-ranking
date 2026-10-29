import { useEffect, useRef, useState } from "react";
import { ComparisonAtlas } from "./components/comparison-atlas";
import { LiveRankingDemo } from "./components/live-ranking-demo";

type Lang = "ko" | "en";
const repository = "https://github.com/WoojinPark-Jay/pec-fuse-ranking";
const artifact = "https://anonymous.4open.science/r/pec-fuse-ranking-9F34";
const githubProfile = "https://github.com/WoojinPark-Jay";
const linkedinProfile = "https://www.linkedin.com/in/woojinjaypark/";
const personalWebsite = "https://woojinpark-jay.github.io";

const readingPages = [
  { id: "tutorial", ko: "소개", en: "Overview", roots: ["top"] },
  { id: "microscope", ko: "원자료", en: "Source records", roots: ["microscope"] },
  { id: "candidate-budget", ko: "후보풀", en: "Candidate pool", roots: ["row"] },
  { id: "record", ko: "특성", en: "Feature record", roots: ["record"] },
  { id: "equations", ko: "계산", en: "Calculations", roots: ["equations"] },
  { id: "model-lab", ko: "모델", en: "Models", roots: ["learn"] },
  { id: "mind-guide", ko: "MIND 경로", en: "MIND walkthrough", roots: ["mind-data", "mind-pool", "mind-inputs", "mind-models", "mind-results"] },
  { id: "atlas", ko: "실험", en: "Experiments", roots: ["atlas", "decision"] },
  { id: "live-demo", ko: "데모", en: "Live demo", roots: ["live-demo"] },
  { id: "reproduce", ko: "실행 안내", en: "Run the examples", roots: ["reproduce"] },
  { id: "cite", ko: "인용", en: "Citation", roots: ["cite"] },
];
const readingGroups = [
  { ko: "소개", en: "Overview", pages: ["tutorial"] },
  { ko: "데이터", en: "Data", pages: ["microscope", "candidate-budget"] },
  { ko: "특성", en: "Features", pages: ["record", "equations"] },
  { ko: "모델", en: "Models", pages: ["model-lab"] },
  { ko: "MIND", en: "MIND", pages: ["mind-guide"] },
  { ko: "실험", en: "Experiments", pages: ["atlas"] },
  { ko: "데모", en: "Demo", pages: ["live-demo"] },
  { ko: "자료", en: "Resources", pages: ["reproduce", "cite"] },
];

function hashTarget() {
  try { return decodeURIComponent(window.location.hash.slice(1)); }
  catch { return "tutorial"; }
}

function readingPageFor(id: string) {
  const direct = readingPages.find(page => page.id === id || page.roots.includes(id));
  if (direct) return direct.id;
  const target = document.getElementById(id);
  return readingPages.find(page => page.roots.some(root => target?.closest(`[id="${root}"]`)))?.id ?? "tutorial";
}

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
  const [activeSection, setActiveSection] = useState(() => readingPageFor(hashTarget()));
  const navigation = useRef<{ top: number; until: number } | null>(null);
  const readingGroup = readingGroups.find(group => group.pages.includes(activeSection))!;

  useEffect(() => {
    let frame = 0;
    const navigate = (animate = false) => {
      const id = hashTarget();
      navigation.current = { top: -1, until: performance.now() + 2500 };
      setActiveSection(readingPageFor(id));
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          if (!id) return;
          const page = readingPages.find(item => item.id === id);
          const target = (page && document.getElementById(page.roots[0])) ?? document.getElementById(id);
          if (!target) return;
          let parent = target.parentElement;
          while (parent) {
            if (parent instanceof HTMLDetailsElement) parent.open = true;
            parent = parent.parentElement;
          }
          const offset = (document.querySelector(".public-toc")?.getBoundingClientRect().height ?? 60) + 24;
          const motion = animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          const top = Math.max(0, Math.min(document.documentElement.scrollHeight - window.innerHeight, window.scrollY + target.getBoundingClientRect().top - offset));
          navigation.current = { top, until: performance.now() + 2500 };
          window.scrollTo({ top, behavior: motion ? "smooth" : "instant" });
        });
      });
    };
    const followHash = () => navigate(true);
    const followLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>(".tutorial-reader a[href^='#']") : null;
      const hash = link?.getAttribute("href");
      if (!hash || hash === "#") return;
      let id: string;
      try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
      const page = readingPages.find(item => item.id === id);
      if (!document.getElementById(id) && !(page && document.getElementById(page.roots[0]))) return;
      event.preventDefault();
      if (window.location.hash !== hash) window.history.pushState(null, "", hash);
      navigate(true);
    };
    navigate();
    window.addEventListener("hashchange", followHash);
    document.addEventListener("click", followLink);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", followHash);
      document.removeEventListener("click", followLink);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const pending = navigation.current;
      if (pending) {
        if (Math.abs(window.scrollY - pending.top) < 2 || performance.now() >= pending.until) navigation.current = null;
        else return;
      }
      const offset = (document.querySelector(".public-toc")?.getBoundingClientRect().height ?? 56) + 32;
      let current = "tutorial";
      for (const page of readingPages.slice(1)) {
        const element = document.getElementById(page.roots[0]) ?? document.getElementById(page.id);
        if (element && element.getBoundingClientRect().top <= offset) current = page.id;
      }
      setActiveSection(current);
    };
    const queue = () => { if (!frame) frame = requestAnimationFrame(update); };
    const interrupt = () => { navigation.current = null; };
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchstart", interrupt, { passive: true });
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", queue); window.removeEventListener("resize", queue); window.removeEventListener("wheel", interrupt); window.removeEventListener("touchstart", interrupt); };
  }, []);

  return <div className="tutorial-release tutorial-reader tutorial-continuous" data-page={activeSection} lang={lang}>
    <a className="public-skip" href="#tutorial">{t("본문으로 건너뛰기", "Skip to tutorial")}</a>
    <aside className="reader-rail" aria-label={t("페이지 길잡이", "Page guide")}>
      <span className="reader-rail-label">{t("읽기 길잡이", "ON THIS PAGE")}</span>
      <nav aria-label={t("섹션 바로가기", "Section shortcuts")}>
        {readingGroups.map((group, index) => <div className="reader-rail-group" key={group.en} data-active={group === readingGroup}>
          <a href={`#${group.pages[0]}`} aria-current={group === readingGroup ? "location" : undefined}><span>{String(index + 1).padStart(2, "0")}</span><b>{t(group.ko, group.en)}</b></a>
        </div>)}
      </nav>
      <div className="reader-rail-children" aria-label={t("현재 섹션의 세부 목차", "Current section links")}>
            {(readingGroup.pages[0] === "mind-guide"
              ? [{id:"mind-data",ko:"원자료",en:"Records"},{id:"mind-pool",ko:"후보 구성",en:"Candidates"},{id:"mind-inputs",ko:"입력 피처",en:"Features"},{id:"mind-models",ko:"학습과 평가",en:"Fit & evaluate"},{id:"mind-results",ko:"결과 읽기",en:"Results"}]
              : readingGroup.pages.map(id => readingPages.find(page => page.id === id)!))
              .map(page => <a key={page.id} href={`#${page.id}`} aria-current={page.id === activeSection ? "location" : undefined}>{t(page.ko, page.en)}</a>)}
      </div>
      <a className="reader-rail-top" href="#top"><span aria-hidden="true">↑</span>{t("맨 위로", "Back to top")}</a>
    </aside>
    <div className="reader-floating-tools">
      <details className="reader-pocket-guide">
        <summary>{t("목차", "Contents")}<span aria-hidden="true">＋</span></summary>
        <nav aria-label={t("빠른 목차", "Quick contents")} onClick={event => {
          if ((event.target as HTMLElement).closest("a")) event.currentTarget.closest("details")?.removeAttribute("open");
        }}>
          {readingPages.map(page => <a key={page.id} href={`#${page.id}`} aria-current={page.id === activeSection ? "location" : undefined}>{t(page.ko, page.en)}</a>)}
        </nav>
      </details>
      <a className="reader-back-top" href="#top" aria-label={t("페이지 맨 위로 이동", "Back to the top of the page")}><span aria-hidden="true">↑</span>{t("맨 위로", "Top")}</a>
    </div>
    <header className="public-masthead" id="top">
      <div className="public-masthead-inner">
        <div className="public-brand">
          <span className="public-mark" role="img" aria-label="PEC-Fuse feature blocks: P, E, C, Z, and psi"><i className="public-mark-p">P</i><i className="public-mark-e">E</i><i className="public-mark-c">C</i><i className="public-mark-z">Z</i><i className="public-mark-psi">ψ</i></span>
          <div><b>PEC-Fuse</b><span>{t("인터랙티브 가이드", "Interactive guide")}</span></div>
        </div>
        <nav aria-label={t("프로젝트 링크", "Project links")}>
          <a href={`?lang=${lang}`} aria-label={t("프로젝트 메인 페이지로 이동", "Go to project home")}>{t("프로젝트", "Project")}</a>
          <span className="public-language" aria-label={t("언어 선택", "Language selection")}>
            <a href={`?view=tutorial&lang=en#${activeSection}`} aria-label="English" title="English" aria-current={!ko ? "page" : undefined}>EN</a>
            <a href={`?view=tutorial&lang=ko#${activeSection}`} aria-label="한국어" title="한국어" aria-current={ko ? "page" : undefined}>한국어</a>
          </span>
        </nav>
      </div>
    </header>

    <nav className="public-toc" aria-label={t("튜토리얼 목차", "Tutorial contents")}>
      {readingGroups.map(group => <a key={group.en} href={`#${group.pages[0]}`} aria-current={group === readingGroup ? "page" : undefined}>{t(group.ko, group.en)}</a>)}
    </nav>


    <main id="tutorial">
      <section className="tutorial-orientation" aria-label={t("읽기 안내", "Reading guide")}>
        <div className="tutorial-orientation-title">
          <span>{t("원고 v91 · 시각적 해설", "MANUSCRIPT v91 / A VISUAL GUIDE")}</span>
          <h1>{t("서로 다른 근거가\n하나의 순위가 되기까지.", "From evidence to a ranked list.")}</h1>
          <p>{t("후보 기사 하나를 따라가며 입력, 계산, 모델과 실험을 이해하세요. 아래로 이어서 읽거나 상단 목차로 원하는 부분에 이동하세요.", "Follow one candidate through the inputs, calculations, and experiments. Read continuously or use the fixed contents bar to jump to a section.")}</p>
          <a className="reader-start" href="#microscope">{t("가이드 시작하기", "Start with the data")} <span aria-hidden="true">→</span></a>
        </div>
        <aside className="reader-primer" aria-label={t("후보 하나의 다섯 입력 블록", "Five input blocks for one candidate")}>
          <span>{t("PRIVATE 경로 · 후보 기사 하나", "PRIVATE PATH / ONE CANDIDATE ARTICLE")}</span>
          <div className="reader-blocks">{[{symbol:"P",count:1,label:t("프로필","Profile")},{symbol:"E",count:3,label:t("기록","Trace")},{symbol:"C",count:4,label:t("이력","History")},{symbol:"Z",count:11,label:t("통제","Controls")},{symbol:"ψ",count:6,label:t("곱셈 항","Products")}].map(block => <div key={block.symbol}><b>{block.symbol}</b><span>{block.label}</span><small>{block.count}</small></div>)}</div>
          <div className="reader-primer-output"><span>{t("25개 특성", "25 features")}</span><i aria-hidden="true">→</i><strong>{t("모델 점수", "Model score")}</strong><i aria-hidden="true">→</i><span>{t("질의 내 순위", "Rank within query")}</span></div>
          <p>{t("서로 다른 출처를 유지하고, 점수화할 때 결합합니다.", "Keep the sources distinct. Combine them at scoring.")}</p>
        </aside>
        <nav className="tutorial-paths" aria-label={t("목적별 읽기 경로", "Choose a reading path")}>
          <a href="#microscope"><span>01</span><b>{t("처음 이해하기", "Understand the idea")}</b><small>{t("데이터 → 특성 → 점수", "Data → features → scores")}</small></a>
          <a href="#atlas"><span>02</span><b>{t("실험 근거 살펴보기", "Examine the evidence")}</b><small>{t("비교 조건 → 결과 → 한계", "Conditions → results → limits")}</small></a>
          <a href="#reproduce"><span>03</span><b>{t("직접 실행하기", "Run the examples")}</b><small>{t("아티팩트 → 합성 예제 → 재현 범위", "Artifact → examples → scope")}</small></a>
        </nav>
        <p className="tutorial-scope">{t("기본 가이드는 private의 25개 입력을 합성 예시로 설명합니다. MIND는 impression 단위 질의와 별도의 21개 입력을 사용합니다.", "The main guide illustrates the private 25-field record with synthetic examples. MIND instead uses impression-level queries and a separate 21-field record.")} <a href="#mind-data">{t("MIND를 원자료부터 따라가기 →", "Follow MIND from its source records →")}</a></p>
      </section>
      <ComparisonAtlas lang={lang} />

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
        <p>{t("현재 논문은 미출판 원고 v91입니다. 정식 DOI와 게재 정보는 출판 후 추가할 예정이며, 그전에는 아래 원고 정보와 사용한 저장소 릴리스 또는 커밋을 함께 표기해 주세요.", "This is an unpublished manuscript, revision v91. Final publication metadata and a DOI will be added after publication. Until then, cite the manuscript together with the repository release or commit used.")}</p>
        <pre><code>{`@unpublished{park2026pecfuse,
  title   = {PEC-Fuse: Source-Preserving Evidence Fusion for
             News Ranking with Partial Recommendation Traces},
  author  = {Park, Woojin and Cheong, Taesu},
  note    = {Unpublished manuscript, revision v91},
  url     = {https://woojinpark-jay.github.io/pec-fuse-ranking/PEC-Fuse-manuscript-v91.pdf},
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

    <nav className="reader-pagination" aria-label={t("가이드 이동", "Guide navigation")}><a href="#tutorial">{t("소개로 돌아가기 ↑", "Back to overview ↑")}</a><a href={`?lang=${lang}`}>{t("프로젝트 메인", "Project home")}</a></nav>
    </main>

    <footer className="public-footer">
      <div className="public-footer-copy">
        <strong>PEC-Fuse: Source-Preserving Evidence Fusion for News Ranking with Partial Recommendation Traces</strong>
        <span>Woojin Park · Taesu Cheong</span>
      </div>
    </footer>
  </div>;
}
