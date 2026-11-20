import "./project-home.css";

const REPOSITORY_URL = "https://github.com/WoojinPark-Jay/pec-fuse-ranking";
const ARTIFACT_URL = "https://anonymous.4open.science/r/pec-fuse-ranking-9F34/";
const LINKEDIN_URL = "https://www.linkedin.com/in/woojinjaypark/";
const PROFESSOR_SCHOLAR_URL = "https://scholar.google.com/citations?user=M0PUKeYAAAAJ&hl=en";

function GitHubIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 .8A11.2 11.2 0 0 0 8.46 22.62c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.08 1.15A10.7 10.7 0 0 1 12 6.11c.95 0 1.9.13 2.79.38 2.14-1.45 3.08-1.15 3.08-1.15.62 1.55.23 2.7.12 2.98.72.79 1.16 1.79 1.16 3.02 0 4.32-2.64 5.27-5.15 5.55.4.35.76 1.04.76 2.1v3.09c0 .3.2.65.78.54A11.2 11.2 0 0 0 12 .8Z" /></svg>;
}

function LinkedInIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5.25 7.5A2.25 2.25 0 1 0 5.25 3a2.25 2.25 0 0 0 0 4.5ZM3.4 21h3.7V9H3.4v12Zm6.05 0h3.7v-6.68c0-1.76.33-3.46 2.51-3.46 2.15 0 2.18 2.01 2.18 3.57V21h3.7v-7.42c0-3.65-.79-6.46-5.05-6.46-2.05 0-3.42 1.12-3.98 2.18h-.05V9h-3.55c.05 1.03.04 12 .04 12Z" /></svg>;
}

function ExternalLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
}

export function ProjectHome({ lang }: { lang: "en" | "ko" }) {
  const ko = lang === "ko";
  const t = (koText: string, enText: string) => ko ? koText : enText;
  return (
    <div className="project-page">
      <a className="project-skip" href="#abstract">{t("본문으로 건너뛰기", "Skip to content")}</a>
      <header className="project-nav">
        <a className="project-wordmark" href="#top" aria-label="PEC-Fuse home">
          <span>PEC-Fuse</span>
        </a>
        <nav aria-label={t("프로젝트 페이지 탐색", "Project page navigation")}>
          <a href="#abstract">{t("개요", "Overview")}</a><a href="#method">{t("방법", "Method")}</a><a href="#results">{t("결과", "Results")}</a>
        </nav>
      </header>

      <main id="top">
        <section className="project-hero">
          <p className="venue-line">{t("IEEE Access 투고 원고 · 인터랙티브 프로젝트 페이지", "IEEE Access manuscript · Interactive project page")}</p>
          <div className="hero-title-lockup">
            <div className="pec-block-mark" role="img" aria-label="PEC-Fuse feature blocks: P, E, C, Z, and psi">
              <span className="mark-p">P</span><span className="mark-e">E</span><span className="mark-c">C</span><span className="mark-z">Z</span><span className="mark-psi">ψ</span>
            </div>
            <h1>PEC-Fuse</h1>
          </div>
          <p className="project-subtitle">{t("부분 추천 기록을 활용한 뉴스 순위화를 위한 출처 보존형 증거 융합", "Source-Preserving Evidence Fusion for News Ranking with Partial Recommendation Traces")}</p>
          <div className="author-line"><ExternalLink href="https://woojinpark-jay.github.io">Woojin Park</ExternalLink><span>·</span><ExternalLink href={PROFESSOR_SCHOLAR_URL}>Taesu Cheong</ExternalLink></div>
          <p className="affiliation-line">SaVAnNA Lab · Department of Industrial and Management Engineering · Korea University</p>

          <div className="institution-logos" aria-label="Research institution and operational data source">
            <div className="institution-logo ku-logo"><img src="./korea-university-crest.png" alt="Korea University" /></div>
            <span className="logo-divider" aria-hidden="true" />
            <div className="institution-logo insightea-logo"><img src="./insightea-wordmark.png" alt="insightea" /></div>
          </div>

          <div className="project-actions" aria-label="Project resources">
            <ExternalLink href={REPOSITORY_URL} className="project-button"><GitHubIcon />{t("코드", "Code")}</ExternalLink>
            <ExternalLink href={ARTIFACT_URL} className="project-button">{t("재현 아티팩트", "Reproducibility artifact")}</ExternalLink>
            <a className="project-button project-button-highlight" href={`?view=tutorial&lang=${lang}`}>{t("튜토리얼", "Tutorial")}</a>
            <a className="project-button project-button-highlight" href={`?view=tutorial&lang=${lang}#live-demo`}>{t("라이브 데모", "Live demo")}</a>
          </div>
        </section>

        <section className="paper-section abstract-section" id="abstract">
          <div className="section-heading"><p className="section-kicker">{t("논문 개요", "Paper overview")}</p><h2>{t("프로젝트 개요", "Project overview")}</h2></div>
          <div className="abstract-copy">
            <p>{t("운영 뉴스 추천은 불완전한 노출 로그 아래에서 명시적 프로필, 추천 기록, 클릭을 함께 사용해야 합니다. PEC-Fuse는 프로필 정합도, 기록된 시스템 동작, 후보 인식형 소비 이력을 점수화 전까지 구분해 유지하는 출처 보존형 입력 인터페이스입니다. 순서화된 스키마는 근거 구성과 점수화를 분리하며, 캐시된 표현은 트리 및 신경망 점수화기에 사용됩니다.", "Operational news recommenders must combine stated profiles, recommendation traces, and clicks despite incomplete impression logs. We present PEC-Fuse, a source-preserving input interface that keeps profile alignment, recorded system action, and candidate-aware consumption distinct until scoring. The ordered schema separates evidence construction from scoring; cached representations feed both tree-based and neural scorers.")}</p>
            <p>{t("회고적 플랫폼 로그에서 25-field Complete PEC는 운영 control보다 recent-window와 same-day NDCG@10을 각각 0.0662와 0.0218 높였고, 두 paired user-clustered 95% 신뢰구간 모두 0을 제외합니다. 19-field Direct는 Complete와 경쟁력 있는 성능을 유지하며, 같은 입력 폭에서 검사한 learned 5-D 표현보다 recent-window에서 높지만 same-day 차이는 불확실합니다.", "On retrospective platform logs, the complete 25-field PEC record improves normalized discounted cumulative gain at rank 10 (NDCG@10) over the operational control by 0.0662 and 0.0218 under recent-window and same-day candidate expansion, respectively; both paired user-clustered 95% confidence intervals exclude zero. A compact 19-field Direct variant remains competitive with the complete record. At matched input width, it outperforms the tested learned 5-D representation in recent-window ranking, while the same-day difference remains uncertain.")}</p>
            <p>{t("추가 audit에서는 출처 블록을 제거하고, ExtraTrees를 신경망 점수화기로 바꾸고, 다섯 개의 고정 seed로 후보를 재선정했습니다. 버전이 없는 프로필 스냅샷과 날짜 단위 trace는 각 클릭 전에 입력이 존재했는지 확인할 수 없습니다. 확장 MIND audit에서 21-field Full proxy는 BGE-M3와 BGE-base 모두에서 가장 높았습니다. MIND의 P와 C는 history-derived이고 E는 logged-slate membership이므로, 이 공개 결과는 private provenance의 동일 재현이 아닌 적용 경계 audit입니다.", "Additional audits remove source blocks, replace ExtraTrees with a neural scorer, and reselect candidates under five fixed seeds. The unversioned profile snapshot and date-level traces cannot verify whether profile and trace inputs were available before each click. In the expanded-pool MIND audit, the 21-field Full proxy is highest under BGE-M3 and BGE-base; nominal paired user-clustered intervals support both the full-record and explicit-product gains. MIND P and C are history-derived and E marks logged-slate membership, so the public result is a boundary audit rather than a matched replication of private provenance.")}</p>
          </div>
        </section>

        <section className="paper-section" id="method">
          <div className="section-heading section-heading-centered">
            <p className="section-kicker">{t("방법", "Method")}</p><h2>{t("출처를 보존하는 근거 구성", "Source-preserving evidence construction")}</h2>
            <p>{t("아키텍처는 표현 생성, 근거 구성과 최종 점수화를 분리합니다. 아래 그림은 원고의 Figure 1입니다.", "The architecture separates representation, evidence construction, and final scoring. The figure below is Figure 1 from the manuscript.")}</p>
          </div>
          <figure className="paper-figure architecture-figure">
            <button type="button" className="figure-preview-trigger" aria-label="Enlarge Figure 1 on this page" aria-haspopup="dialog" onClick={(event) => event.currentTarget.parentElement?.querySelector('dialog')?.showModal()}>
              <img src="./paper-architecture.png?v=92" alt="PEC-Fuse architecture from manuscript revision v92" />
            </button>
            <dialog className="figure-preview-dialog" aria-label="Figure 1: PEC-Fuse architecture" onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }} onClose={(event) => { event.currentTarget.classList.remove('is-zoomed'); event.currentTarget.querySelector('button[aria-pressed]')?.setAttribute('aria-pressed', 'false'); }}>
              <div className="figure-preview-surface">
                <div className="figure-preview-toolbar">
                  <strong>Figure 1 <span>PEC-Fuse architecture</span></strong>
                  <div>
                    <button type="button" onClick={(event) => { const zoomed = event.currentTarget.closest('dialog')?.classList.toggle('is-zoomed'); event.currentTarget.setAttribute('aria-pressed', String(Boolean(zoomed))); }} aria-pressed="false">{t("확대 / 맞춤", "Zoom / fit")}</button>
                    <a href="./paper-architecture.pdf?v=92" target="_blank" rel="noopener noreferrer">{t("그림 PDF", "Figure PDF")}</a>
                    <button type="button" autoFocus aria-label={t("확대 그림 닫기", "Close enlarged figure")} onClick={(event) => event.currentTarget.closest('dialog')?.close()}>{t("닫기", "Close")}</button>
                  </div>
                </div>
                <div className="figure-preview-scroll">
                  <img src="./paper-architecture.png?v=92" alt="Enlarged PEC-Fuse architecture: input representations, evidence construction, candidate records, and scoring and ranking" />
                </div>
              </div>
            </dialog>
            <figcaption><strong>Figure 1.</strong> {t("공유된 고정 표현에서 출처별 근거를 구성하고, 25차원 후보 레코드와 질의 내 순위화로 이어집니다.", "Shared frozen representations feed source-specific evidence construction, a fixed 25-dimensional candidate record, and within-query ranking.")} <a href="./paper-architecture.pdf?v=92" target="_blank" rel="noopener noreferrer">{t("그림 PDF 열기 ↗", "Open figure PDF ↗")}</a></figcaption>
          </figure>

          <div className="record-preview">
            <div className="record-preview-heading">
              <div><p className="section-kicker">{t("특성 레코드", "Feature record")}</p><h3>{t("25-field 후보 레코드의 구조", "Structure of the 25-field candidate record")}</h3></div>
              <p>{t("각 후보 기사는 점수화 전에 정보를 하나로 압축하지 않고, 출처별 다섯 블록을 유지합니다.", "Each candidate article keeps five source-grouped blocks instead of collapsing them into one value before scoring.")}</p>
            </div>
            <div className="record-blocks" aria-label="Complete PEC candidate record: P 1 field, E 3 fields, C 4 fields, Z 11 fields, and psi 6 fields">
              <div className="record-block block-p"><b>P</b><span>1 field</span><small>{t("프로필 정합도", "Profile alignment")}</small></div>
              <div className="record-block block-e"><b>E</b><span>3 fields</span><small>{t("보존 추천 기록", "Retained trace")}</small></div>
              <div className="record-block block-c"><b>C</b><span>4 fields</span><small>{t("이전 소비 이력", "Prior consumption")}</small></div>
              <div className="record-block block-z"><b>Z</b><span>11 fields</span><small>{t("기록 기반 통제", "Recorded controls")}</small></div>
              <div className="record-block block-psi"><b>ψ</b><span>6 fields</span><small>{t("고정 곱셈 항", "Deterministic products")}</small></div>
            </div>
            <div className="record-example">
              <div className="record-example-title"><small>{t("설명용 후보", "Illustrative candidate")}</small><strong>{t("기후 정책 기사", "Climate-policy article")}</strong></div>
              <div className="record-example-values" aria-label="Illustrative values from one candidate record">
                <span className="example-p"><b>P</b><small>Profile alignment</small><strong>0.82</strong></span>
                <span className="example-e"><b>E</b><small>Retained trace</small><strong>Absent</strong></span>
                <span className="example-c"><b>C</b><small>Mean · attention</small><strong>0.31 · 0.40</strong></span>
                <span className="example-psi"><b>ψ</b><small>P × C mean</small><strong>0.254</strong></span>
              </div>
              <a href={`?view=tutorial&lang=${lang}#record`}>{t("전체 입력 행 살펴보기 →", "Explore the complete row →")}</a>
            </div>
          </div>

          <p className="project-method-link"><a href={`?view=tutorial&lang=${lang}#data`}>{t("후보 구성과 Algorithm 1을 단계별로 보기 →", "Walk through candidate construction and Algorithm 1 →")}</a></p>
        </section>

        <section className="paper-section results-section" id="results">
          <div className="section-heading section-heading-centered">
            <p className="section-kicker">{t("결과", "Results")}</p><h2>{t("핵심 결과와 공개 데이터 경계", "Primary result and public-data boundary")}</h2>
            <p>{t("핵심 비교는 두 개의 고정 test pool에서 Complete PEC와 선택된 operational control을 평가합니다.", "The headline comparison evaluates the complete PEC record against the selected operational control on two fixed test pools.")}</p>
          </div>

          <div className="result-block">
            <div className="result-block-heading"><div><strong>{t("핵심 결과", "Primary result")}</strong><small>Complete PEC versus operational control · NDCG@10</small></div></div>
            <div className="headline-results" role="table" aria-label="Headline NDCG at 10 results">
              <div className="headline-row headline-header" role="row"><span role="columnheader">Candidate regime</span><span role="columnheader">Control</span><span role="columnheader">PEC</span><span role="columnheader">Difference [95% CI]</span></div>
              <div className="headline-row" role="row"><strong role="cell">Recent-window</strong><span role="cell">0.7309</span><span role="cell">0.7971</span><span className="result-gain" role="cell">+0.0662 <small>[0.0523, 0.0793]</small></span></div>
              <div className="headline-row" role="row"><strong role="cell">Same-day</strong><span role="cell">0.7499</span><span role="cell">0.7717</span><span className="result-gain" role="cell">+0.0218 <small>[0.0080, 0.0363]</small></span></div>
            </div>
            <p className="result-interpretation">{t("두 paired user-clustered 95% 신뢰구간 모두 0을 포함하지 않습니다.", "Both paired user-clustered 95% confidence intervals exclude zero.")}</p>
          </div>

          <div className="result-block mind-result-block">
            <div className="result-block-heading"><div><strong>{t("공개 데이터 경계 audit", "Public boundary audit")}</strong><small>Expanded-pool MIND · BGE-M3 · NDCG@10</small></div></div>
            <div className="mind-result-grid">
              <div className="mind-table mind-score-table" role="table" aria-label="MIND BGE-M3 NDCG at 10 results">
                <div className="mind-row mind-header" role="row"><span role="columnheader">Configuration</span><span role="columnheader">Fields</span><span role="columnheader">NDCG@10</span></div>
                <div className="mind-row" role="row"><span role="cell">Controls+E</span><span role="cell">8</span><span role="cell">0.3265</span></div>
                <div className="mind-row" role="row"><span role="cell">P+C Direct</span><span role="cell">14</span><span role="cell">0.3409</span></div>
                <div className="mind-row" role="row"><span role="cell">P+E+C Direct</span><span role="cell">15</span><span role="cell">0.3797</span></div>
                <div className="mind-row mind-best" role="row"><strong role="cell">Full PEC proxy</strong><strong role="cell">21</strong><strong role="cell">0.3828</strong></div>
              </div>
              <div className="mind-table mind-delta-table" role="table" aria-label="MIND paired additions">
                <div className="mind-row mind-header" role="row"><span role="columnheader">Added evidence</span><span role="columnheader">Difference [95% CI]</span></div>
                <div className="mind-row" role="row"><span role="cell">P/C over Controls+E</span><span role="cell">+0.0531 <small>[0.0506, 0.0556]</small></span></div>
                <div className="mind-row" role="row"><span role="cell">E under fixed P/C</span><span role="cell">+0.0388 <small>[0.0372, 0.0404]</small></span></div>
                <div className="mind-row" role="row"><span role="cell">Explicit products over Direct</span><span role="cell">+0.0031 <small>[0.0019, 0.0043]</small></span></div>
                <div className="mind-row mind-best" role="row"><strong role="cell">Full PEC over Controls+E</strong><strong role="cell">+0.0562 <small>[0.0536, 0.0588]</small></strong></div>
              </div>
            </div>
            <p className="result-interpretation">{t("Full PEC는 BGE-M3에서 가장 높고 BGE-base도 같은 양의 방향을 보입니다. 공개 proxy에서 C mean = ||mean history|| × p이므로 두 값은 한 query 안에서 같은 후보 순서를 만들지만, C mean은 query-level history 집중도 크기를 보존합니다. 둘은 같은 click history의 관련된 요약이지 독립 evidence가 아닙니다. 일부 contrast는 공통 endpoint를 통해 산술적으로 연결되며, 예를 들어 Full−Controls+E = (Full−Direct) + (Direct−Controls+E)입니다. 그러나 각 fit은 독립적으로 선택되고 각 추가 효과는 남아 있는 블록에 조건부이므로 독립적인 구성요소 기여로 해석하지 않습니다.", "Full PEC is highest under BGE-M3, and BGE-base shows the same positive directions. In the public proxy, C mean = ||mean history|| × p: both fields induce the same candidate ordering within a query, while C mean retains query-level history concentration. They are related summaries of the same click history, not independent evidence sources. Some contrasts are algebraically related through shared model endpoints; for example, Full−Controls+E = (Full−Direct) + (Direct−Controls+E). Because each fit is selected independently and each addition is conditional on the retained blocks, these contrasts are not independent component contributions. E marks logged-slate membership, so this is a public boundary audit rather than a matched replication of the private schema.")}</p>
          </div>

          <p className="results-note"><a href={`?view=tutorial&lang=${lang}#experiments`}>{t("전체 비교, Recall@10·MRR, 신경망 audit와 후보 재선정 결과 보기 →", "Open the full comparisons, Recall@10 and MRR, neural audit, and candidate reselection →")}</a></p>
        </section>

      </main>

      <footer className="project-footer">
        <div className="footer-identity">
          <strong>PEC-Fuse: Source-Preserving Evidence Fusion for News Ranking with Partial Recommendation Traces</strong>
          <span><ExternalLink href="https://woojinpark-jay.github.io">Woojin Park</ExternalLink> · Taesu Cheong</span>
        </div>
        <div className="footer-links">
          <ExternalLink href={REPOSITORY_URL}><GitHubIcon />GitHub repository</ExternalLink>
          <ExternalLink href={ARTIFACT_URL}>Reproducibility artifact</ExternalLink>
          <ExternalLink href={LINKEDIN_URL}><LinkedInIcon />LinkedIn profile</ExternalLink>
        </div>
      </footer>
    </div>
  );
}
