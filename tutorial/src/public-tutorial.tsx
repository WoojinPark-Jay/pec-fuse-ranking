import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { BrandMark } from "./components/brand-mark";
import { chapterForHash, chapters, type ChapterId, type TutorialChapter } from "./tutorial-routes";

type Lang = "ko" | "en";
const ComparisonAtlas = lazy(() => import("./components/comparison-atlas").then((module) => ({ default: module.ComparisonAtlas })));
const LiveRankingDemo = lazy(() => import("./components/live-ranking-demo").then((module) => ({ default: module.LiveRankingDemo })));

const repository = "https://github.com/WoojinPark-Jay/pec-fuse-ranking";
const artifact = "https://anonymous.4open.science/r/pec-fuse-ranking-9F34";

const chapterLinks: Partial<Record<ChapterId, Array<{ hash: string; ko: string; en: string }>>> = {
  data: [{ hash: "microscope", ko: "원자료", en: "Source records" }, { hash: "row", ko: "후보풀", en: "Candidate pool" }],
  features: [{ hash: "record", ko: "25개 특성", en: "25 fields" }, { hash: "equations", ko: "계산식", en: "Calculations" }],
  models: [{ hash: "learn", ko: "학습 구조", en: "Learning contract" }, { hash: "model-reading-guide", ko: "모델 역할", en: "Model roles" }],
  experiments: [{ hash: "atlas", ko: "비교 지도", en: "Comparison atlas" }, { hash: "decision", ko: "질문별 찾기", en: "Find by question" }],
  resources: [{ hash: "reproduce", ko: "실행 안내", en: "Run examples" }, { hash: "cite", ko: "인용", en: "Citation" }],
};

function decodedHash() {
  try { return decodeURIComponent(window.location.hash.slice(1)); }
  catch { return "tutorial"; }
}

function ChapterHeader({ chapter, lang }: { chapter: TutorialChapter; lang: Lang }) {
  const ko = lang === "ko";
  const links = chapterLinks[chapter.id] ?? [];
  return <header className="research-chapter-header" id={chapter.root} tabIndex={-1}>
    <span>{chapter.number} / {ko ? chapter.ko : chapter.en}</span>
    <h1>{ko ? chapter.koDescription : chapter.enDescription}</h1>
    {links.length > 0 && <nav aria-label={ko ? "이 장의 세부 항목" : "In this chapter"}>
      {links.map((link) => <a key={link.hash} href={`#${link.hash}`}>{ko ? link.ko : link.en}</a>)}
    </nav>}
  </header>;
}

function Overview({ lang }: { lang: Lang }) {
  const ko = lang === "ko";
  const t = (a: string, b: string) => ko ? a : b;
  return <main id="tutorial" className="research-overview">
    <section className="research-hero">
      <div className="research-hero-copy">
        <span>PEC-FUSE / RESEARCH COMPANION</span>
        <h1>PEC-Fuse</h1>
        <p className="research-hero-lead">{t("부분적인 추천 기록 아래에서, 서로 다른 근거의 출처를 보존한 뉴스 랭킹", "Source-preserving news ranking under partial recommendation traces")}</p>
        <p>{t("사용자–날짜 질의 하나가 후보풀, 25개 특성, 모델 점수와 실험 결과로 이어지는 과정을 단계별로 확인하는 연구 동반 자료입니다.", "This research companion traces one user-date query through candidate construction, the 25-field record, model scoring, and the reported experiments.")}</p>
        <div className="research-hero-actions"><a href="#microscope">{t("데이터부터 시작", "Start with the data")}</a><a href="#atlas">{t("실험으로 이동", "Go to experiments")}</a></div>
      </div>
      <figure className="research-record-map" aria-label={t("후보 하나의 PEC-Fuse 입력 구조", "PEC-Fuse input structure for one candidate")}>
        <figcaption>{t("후보 기사 한 건", "One candidate article")}</figcaption>
        <div className="research-block-row">
          {[{ key: "P", n: 1, ko: "프로필", en: "Profile" }, { key: "E", n: 3, ko: "기록", en: "Trace" }, { key: "C", n: 4, ko: "이력", en: "History" }, { key: "Z", n: 11, ko: "통제", en: "Controls" }, { key: "ψ", n: 6, ko: "곱셈 항", en: "Products" }].map((block) => <div key={block.key} data-block={block.key}><b>{block.key}</b><span>{ko ? block.ko : block.en}</span><small>{block.n}</small></div>)}
        </div>
        <div className="research-rank-line"><span>25 {t("개 특성", "features")}</span><i aria-hidden="true">→</i><strong>{t("후보별 점수", "candidate score")}</strong><i aria-hidden="true">→</i><span>{t("질의 내 순위", "within-query rank")}</span></div>
      </figure>
    </section>

    <section className="research-thesis" aria-labelledby="research-thesis-title">
      <div><span>RESEARCH QUESTION</span><h2 id="research-thesis-title">{t("근거를 일찍 섞지 않으면 무엇을 더 구분할 수 있는가?", "What remains distinguishable when evidence is not fused too early?")}</h2></div>
      <p>{t("P는 사용자가 밝힌 프로필, E는 보존된 시스템 행동, C는 이전 클릭과 후보의 관계입니다. PEC-Fuse는 이 세 근거를 점수화 직전까지 별도 좌표로 유지합니다. 이 구분은 인과 설명이 아니라 입력의 출처와 가용성을 확인할 수 있게 하는 표현 설계입니다.", "P represents stated-profile alignment, E retained system action, and C the candidate's relation to prior clicks. PEC-Fuse keeps them in separate coordinates until scoring. This is a representation design that makes provenance and availability inspectable, not a causal explanation.")}</p>
    </section>

    <section className="research-chapter-index" aria-labelledby="chapter-index-title">
      <header><span>READING MAP</span><h2 id="chapter-index-title">{t("필요한 질문에서 시작하세요", "Start from the question you need")}</h2></header>
      <div>{chapters.slice(1).map((chapter) => <a key={chapter.id} href={`#${chapter.root}`}><span>{chapter.number}</span><b>{ko ? chapter.ko : chapter.en}</b><p>{ko ? chapter.koDescription : chapter.enDescription}</p><i aria-hidden="true">→</i></a>)}</div>
    </section>

    <section className="research-boundaries">
      <article><span>{t("이 논문이 검증하는 것", "WHAT IS TESTED")}</span><h3>{t("조건부 예측 유용성", "Conditional predictive utility")}</h3><p>{t("지정된 후보군과 시간 분할에서 입력 표현을 바꿨을 때의 순위 성능을 비교합니다.", "Ranking performance is compared under specified candidate pools and temporal splits.")}</p></article>
      <article><span>{t("구분해야 하는 것", "WHAT STAYS DISTINCT")}</span><h3>{t("출처, 의존도, 인과", "Provenance, reliance, causality")}</h3><p>{t("출처 표시는 가능하지만, permutation 의존도나 예측 이득만으로 인과효과를 주장하지 않습니다.", "Source labels are inspectable, but predictive gains and permutation reliance do not establish causal effects.")}</p></article>
      <article><span>{t("공개 데이터의 역할", "PUBLIC-DATA ROLE")}</span><h3>{t("복제가 아니라 경계 점검", "A boundary check, not replication")}</h3><p>{t("MIND는 독립적인 stated profile이 없어 P와 E의 의미가 달라집니다. 따라서 private 스키마의 재현이 아닙니다.", "MIND lacks an independently stated profile, so P and E change meaning. It is not a reproduction of the private schema.")}</p></article>
    </section>
  </main>;
}

function Resources({ lang }: { lang: Lang }) {
  const ko = lang === "ko";
  const t = (a: string, b: string) => ko ? a : b;
  const examples = [
    { n: "01", title: t("ExtraTrees 전체 경로", "Full ExtraTrees path"), command: "python scripts/run_synthetic_demo.py", copy: t("25개 특성 생성, 모델 fitting, 질의 내 정렬과 NDCG@10·Recall@10·MRR 계산을 실행합니다.", "Build the 25 fields, fit the model, rank within each query, and compute NDCG@10, Recall@10, and MRR.") },
    { n: "02", title: t("학습형 다차원 융합", "Learned multidimensional fusion"), command: "python scripts/run_synthetic_fusion.py", copy: t("다섯 P/C 좌표를 학습된 5차원 표현으로 바꾸고 최종 점수기에 전달합니다.", "Transform five P/C coordinates into a learned 5-D representation for the downstream scorer.") },
    { n: "03", title: t("후보 인식 신경망", "Candidate-aware neural scorer"), command: "python scripts/run_synthetic_neural.py", copy: t("이력 self-attention, 후보 조건부 pooling과 query-wise 학습 루프를 합성 데이터에서 실행합니다.", "Run history self-attention, candidate-conditioned pooling, and query-wise training on synthetic data.") },
  ];
  return <main className="research-resources">
    <section id="reproduce" className="research-resource-section">
      <div className="research-resource-heading"><span>REPRODUCE</span><h2>{t("공개 아티팩트에서 실행 가능한 범위", "What the public artifact can execute")}</h2><p>{t("아래 예제는 공개된 모델 정의와 학습 루프가 작동하는지 확인합니다. 비공개 운영 레코드·임베딩·학습된 체크포인트가 없으므로 논문 표의 수치를 그대로 재생하는 절차는 아닙니다.", "These examples verify the public model definitions and learning loops. They are not a numerical reproduction of the manuscript tables because operational rows, private embeddings, and fitted checkpoints are not released.")}</p></div>
      <div className="research-install"><code>python -m pip install -e '.[neural]'</code><a href={`${artifact}/README.md`}>{t("다운로드 및 시작 안내", "Download and quick start")}</a></div>
      <p>Run these commands from the downloaded repository root. The neural extra installs PyTorch for the fusion and neural examples; the ExtraTrees example alone only requires <code>python -m pip install -e .</code>.</p>
      <div className="research-example-list">{examples.map((example) => <article key={example.n}><span>{example.n}</span><div><h3>{example.title}</h3><code>{example.command}</code><p>{example.copy}</p></div></article>)}</div>
      <aside className="research-scope-note"><strong>{t("MIND 실행 경계", "MIND execution boundary")}</strong><p>{t("MIND runner는 지정된 BGE-M3·BGE-base 캐시 벡터를 요구합니다. 캐시는 배포되지 않고 runner도 생성하지 않습니다. 공개 aggregate와 protocol은 아티팩트에서 확인할 수 있습니다.", "The MIND runner requires specified BGE-M3 and BGE-base vector caches. The caches are not distributed or generated by the runner; aggregate results and the protocol remain available in the artifact.")}</p><a href={`${artifact}/docs/MIND_PROXY_PROTOCOL.md`}>{t("MIND protocol 보기", "Read the MIND protocol")}</a></aside>
      <nav className="research-resource-links" aria-label={t("재현 문서", "Reproducibility documents")}><a href={`${artifact}/docs/GETTING_STARTED.md`}>{t("전체 실행 절차", "Quick start")}</a><a href={`${artifact}/docs/REPRODUCIBILITY.md`}>{t("재현 가능 범위", "Reproducibility scope")}</a><a href={`${artifact}/docs/DATA_AVAILABILITY.md`}>{t("데이터 제공 범위", "Data availability")}</a></nav>
    </section>
    <section id="cite" className="research-cite">
      <div><span>CITATION</span><h2>{t("사용한 소프트웨어 버전을 명시해 주세요", "Reference the software version used")}</h2><p>{t("소프트웨어를 사용할 때는 저장소 URL과 커밋을 명시해 주세요. 논문의 최종 서지정보는 공개가 확정되면 추가합니다.", "When referring to this software, identify the repository URL and commit. A publication-specific citation will be added when final bibliographic details are available.")}</p></div>
      <a href={repository}>{t("소스 저장소", "Source repository")}</a>
    </section>
  </main>;
}

export function PublicTutorial({ lang }: { lang: Lang }) {
  const ko = lang === "ko";
  const t = (a: string, b: string) => ko ? a : b;
  const [hash, setHash] = useState(decodedHash);
  const chapterId = chapterForHash(hash);
  const chapter = useMemo(() => chapters.find((item) => item.id === chapterId)!, [chapterId]);
  const chapterIndex = chapters.findIndex((item) => item.id === chapterId);

  useEffect(() => {
    const followHash = () => setHash(decodedHash());
    window.addEventListener("hashchange", followHash);
    followHash();
    return () => window.removeEventListener("hashchange", followHash);
  }, []);

  useEffect(() => {
    // Deep links may arrive before a lazy-loaded chapter mounts.
    const focusTarget = () => {
      const target = document.getElementById(hash || "tutorial");
      if (!target) return false;
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.scrollIntoView({ block: "start", behavior: "instant" });
      target.focus({ preventScroll: true });
      return true;
    };
    if (focusTarget()) return;
    const observer = new MutationObserver(() => { if (focusTarget()) observer.disconnect(); });
    observer.observe(document.getElementById("root")!, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [hash, chapterId]);

  return <div className="research-companion" lang={lang} data-chapter={chapterId}>
    <a className="public-skip" href={`#${chapter.root}`}>{t("본문으로 건너뛰기", "Skip to content")}</a>
    <header className="research-header" id="top">
      <div className="research-header-bar">
        <a className="research-brand" href={`?view=tutorial&lang=${lang}#tutorial`} aria-label={t("PEC-Fuse 연구 가이드 개요", "PEC-Fuse research companion overview")}><BrandMark /><b>PEC-Fuse</b><small>{t("연구 가이드", "Research companion")}</small></a>
        <div className="research-header-actions"><a href="?lang=en">Project</a><a href={repository}>GitHub</a></div>
      </div>
      <nav className="research-chapter-nav" aria-label={t("연구 가이드 목차", "Research companion chapters")}>
        {chapters.map((item) => <a key={item.id} href={`#${item.root}`} aria-current={item.id === chapterId ? "page" : undefined}><span>{item.number}</span>{ko ? item.ko : item.en}</a>)}
      </nav>
    </header>

    {chapterId === "overview" ? <Overview lang={lang} /> : <>
      <ChapterHeader chapter={chapter} lang={lang} />
      <Suspense fallback={<div className="research-loading" role="status">{t("장 내용을 불러오는 중", "Loading chapter")}</div>}>
        {(["data", "features", "models", "mind", "experiments"] as ChapterId[]).includes(chapterId) && <main><ComparisonAtlas lang={lang} chapter={chapterId as "data" | "features" | "models" | "mind" | "experiments"} /></main>}
        {chapterId === "demo" && <main className="research-demo"><LiveRankingDemo lang={lang} /></main>}
        {chapterId === "resources" && <Resources lang={lang} />}
      </Suspense>
    </>}

    <nav className="research-next" aria-label={t("장 이동", "Chapter navigation")}>
      {chapterId !== "overview" && <a href={`#${chapters[Math.max(0, chapterIndex - 1)].root}`}><span>{t("이전", "Previous")}</span><b>{ko ? chapters[Math.max(0, chapterIndex - 1)].ko : chapters[Math.max(0, chapterIndex - 1)].en}</b></a>}
      {chapterId !== "resources" && <a href={`#${chapters[Math.min(chapters.length - 1, chapterIndex + 1)].root}`}><span>{t("다음", "Next")}</span><b>{ko ? chapters[Math.min(chapters.length - 1, chapterIndex + 1)].ko : chapters[Math.min(chapters.length - 1, chapterIndex + 1)].en}</b></a>}
    </nav>
    <footer className="research-footer"><span>PEC-Fuse · Woojin Park · Taesu Cheong</span><a href="#top">{t("맨 위로", "Back to top")}</a></footer>
  </div>;
}
