import "./project-home.css";
import { ComparisonInputExplorer } from "./components/comparison-input-strips";

const REPOSITORY_URL = "https://github.com/WoojinPark-Jay/pec-fuse-ranking";
const ARTIFACT_URL = "https://anonymous.4open.science/r/pec-fuse-ranking-9F34/";
const LINKEDIN_URL = "https://www.linkedin.com/in/woojinjaypark/";
const PROFESSOR_SCHOLAR_URL = "https://scholar.google.com/citations?user=M0PUKeYAAAAJ&hl=en";
const PAPER_URL = "./PEC-Fuse-manuscript-v49.pdf";

function GitHubIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 .8A11.2 11.2 0 0 0 8.46 22.62c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.08 1.15A10.7 10.7 0 0 1 12 6.11c.95 0 1.9.13 2.79.38 2.14-1.45 3.08-1.15 3.08-1.15.62 1.55.23 2.7.12 2.98.72.79 1.16 1.79 1.16 3.02 0 4.32-2.64 5.27-5.15 5.55.4.35.76 1.04.76 2.1v3.09c0 .3.2.65.78.54A11.2 11.2 0 0 0 12 .8Z" /></svg>;
}

function LinkedInIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5.25 7.5A2.25 2.25 0 1 0 5.25 3a2.25 2.25 0 0 0 0 4.5ZM3.4 21h3.7V9H3.4v12Zm6.05 0h3.7v-6.68c0-1.76.33-3.46 2.51-3.46 2.15 0 2.18 2.01 2.18 3.57V21h3.7v-7.42c0-3.65-.79-6.46-5.05-6.46-2.05 0-3.42 1.12-3.98 2.18h-.05V9h-3.55c.05 1.03.04 12 .04 12Z" /></svg>;
}

function ExternalLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
}

export function ProjectHome(_props: { lang: "en" | "ko" }) {
  return (
    <div className="project-page">
      <header className="project-nav">
        <a className="project-wordmark" href="#top" aria-label="PEC-Fuse home">
          <span>PEC-Fuse</span>
        </a>
        <nav aria-label="Project page navigation">
          <a href="#abstract">Abstract</a><a href="#method">Method</a><a href="#results">Results</a><a href="#paper">Paper</a><a href="#demo">Demo</a><a href="#citation">Citation</a>
        </nav>
      </header>

      <main id="top">
        <section className="project-hero">
          <p className="venue-line">IEEE Access manuscript · Interactive project page</p>
          <div className="hero-title-lockup">
            <div className="pec-block-mark" role="img" aria-label="PEC-Fuse feature blocks: P, E, C, Z, and psi">
              <span className="mark-p">P</span><span className="mark-e">E</span><span className="mark-c">C</span><span className="mark-z">Z</span><span className="mark-psi">ψ</span>
            </div>
            <h1>PEC-Fuse</h1>
          </div>
          <p className="project-subtitle">Source-Preserving Evidence Fusion for News Ranking with Partial Recommendation Traces</p>
          <div className="author-line"><ExternalLink href="https://woojinpark-jay.github.io">Woojin Park</ExternalLink><span>·</span><ExternalLink href={PROFESSOR_SCHOLAR_URL}>Taesu Cheong</ExternalLink></div>
          <p className="affiliation-line">SaVAnNA Lab · Department of Industrial and Management Engineering · Korea University</p>

          <div className="institution-logos" aria-label="Research institution and operational data source">
            <div className="institution-logo ku-logo"><img src="./korea-university-crest.png" alt="Korea University" /></div>
            <span className="logo-divider" aria-hidden="true" />
            <div className="institution-logo insightea-logo"><img src="./insightea-wordmark.png" alt="insightea" /></div>
          </div>

          <div className="project-actions" aria-label="Project resources">
            <ExternalLink href={PAPER_URL} className="project-button">Paper</ExternalLink>
            <ExternalLink href={REPOSITORY_URL} className="project-button"><GitHubIcon />Code</ExternalLink>
            <ExternalLink href={ARTIFACT_URL} className="project-button">Reproducibility artifact</ExternalLink>
            <a className="project-button project-button-highlight" href="?view=tutorial&lang=en">Tutorial</a>
            <a className="project-button project-button-highlight" href="?view=tutorial&lang=en#live-demo">Live demo</a>
          </div>
        </section>

        <section className="paper-section abstract-section" id="abstract">
          <div className="section-heading"><p className="section-kicker">Paper overview</p><h2>Abstract</h2></div>
          <div className="abstract-copy">
            <p>Operational news recommenders must combine stated profiles, recommendation traces, and clicks despite incomplete impression logs. We present PEC-Fuse, a source-preserving input interface that keeps profile alignment, recorded system action, and candidate-aware consumption distinct until scoring. An ordered schema and temporal evaluation support cached representations and different scorers.</p>
            <p>On retrospective platform logs, the complete 25-field PEC record improves normalized discounted cumulative gain at rank 10 (NDCG@10) over the operational control by 0.0662 and 0.0218 under recent-window and same-day candidate expansion, respectively; both paired user-clustered 95% confidence intervals exclude zero. A compact 19-field Direct variant remains competitive with the complete record. At matched input width, it outperforms a learned 5-D representation in recent-window ranking, while the same-day difference remains uncertain.</p>
            <p>Source-removal, neural-scoring, and fixed-model candidate-reselection checks assess robustness across evidence, scorer, and candidate conditions. The unversioned profile snapshot and date-level traces cannot verify whether P and E were available before each click. On MIND, where P is derived from click histories, P+C achieves higher NDCG@10 than P+E+C, marking a boundary of the complete interface in this setting. These findings support source-preserving evidence design for bounded news re-ranking under incomplete operational records.</p>
          </div>
        </section>

        <section className="paper-section" id="method">
          <div className="section-heading section-heading-centered">
            <p className="section-kicker">Method</p><h2>Source-preserving evidence construction</h2>
            <p>The architecture separates representation, evidence construction, and final scoring. The figure below is Figure 1 from the manuscript.</p>
          </div>
          <figure className="paper-figure architecture-figure">
            <button type="button" className="figure-preview-trigger" aria-label="Enlarge Figure 1 on this page" aria-haspopup="dialog" onClick={(event) => event.currentTarget.parentElement?.querySelector('dialog')?.showModal()}>
              <img src="./paper-architecture.png?v=49" alt="PEC-Fuse architecture from manuscript revision v49" />
            </button>
            <dialog className="figure-preview-dialog" aria-label="Figure 1: PEC-Fuse architecture" onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }} onClose={(event) => { event.currentTarget.classList.remove('is-zoomed'); event.currentTarget.querySelector('button[aria-pressed]')?.setAttribute('aria-pressed', 'false'); }}>
              <div className="figure-preview-surface">
                <div className="figure-preview-toolbar">
                  <strong>Figure 1 <span>PEC-Fuse architecture</span></strong>
                  <div>
                    <button type="button" onClick={(event) => { const zoomed = event.currentTarget.closest('dialog')?.classList.toggle('is-zoomed'); event.currentTarget.setAttribute('aria-pressed', String(Boolean(zoomed))); }} aria-pressed="false">Zoom / fit</button>
                    <a href="./paper-architecture.pdf?v=49" target="_blank" rel="noopener noreferrer">Vector PDF</a>
                    <button type="button" autoFocus aria-label="Close enlarged figure" onClick={(event) => event.currentTarget.closest('dialog')?.close()}>Close</button>
                  </div>
                </div>
                <div className="figure-preview-scroll">
                  <img src="./paper-architecture.png?v=49" alt="Enlarged PEC-Fuse architecture: input representations, evidence construction, candidate records, and scoring and ranking" />
                </div>
              </div>
            </dialog>
            <figcaption><strong>Figure 1.</strong> Shared frozen representations feed source-specific evidence construction, a fixed 25-dimensional candidate record, and within-query ranking. <a href="./paper-architecture.pdf?v=49" target="_blank" rel="noopener noreferrer">Open vector PDF ↗</a></figcaption>
          </figure>

          <div className="record-preview">
            <div className="record-preview-heading">
              <div><p className="section-kicker">Feature record</p><h3>Structure of the 25-field candidate record</h3></div>
              <p>Each candidate article keeps five source-grouped blocks instead of collapsing them into one value before scoring.</p>
            </div>
            <div className="record-blocks" aria-label="Complete PEC candidate record: P 1 field, E 3 fields, C 4 fields, Z 11 fields, and psi 6 fields">
              <div className="record-block block-p"><b>P</b><span>1 field</span><small>Profile alignment</small></div>
              <div className="record-block block-e"><b>E</b><span>3 fields</span><small>Retained trace</small></div>
              <div className="record-block block-c"><b>C</b><span>4 fields</span><small>Prior consumption</small></div>
              <div className="record-block block-z"><b>Z</b><span>11 fields</span><small>Recorded controls</small></div>
              <div className="record-block block-psi"><b>ψ</b><span>6 fields</span><small>Deterministic products</small></div>
            </div>
            <div className="record-example">
              <div className="record-example-title"><small>Illustrative candidate</small><strong>Climate-policy article</strong></div>
              <div className="record-example-values" aria-label="Illustrative values from one candidate record">
                <span className="example-p"><b>P</b><small>Profile alignment</small><strong>0.82</strong></span>
                <span className="example-e"><b>E</b><small>Retained trace</small><strong>Absent</strong></span>
                <span className="example-c"><b>C</b><small>Mean · attention</small><strong>0.31 · 0.40</strong></span>
                <span className="example-psi"><b>ψ</b><small>P × C mean</small><strong>0.254</strong></span>
              </div>
              <a href="?view=tutorial&lang=en#record">Explore the complete row →</a>
            </div>
          </div>

          <div className="algorithm-intro">
            <p className="section-kicker">Candidate construction</p><h3>Retrospective candidate construction and ranking</h3>
            <p>Algorithm 1 specifies candidate assembly, feature serialization, scoring, and query-level evaluation.</p>
          </div>
          <figure className="paper-figure algorithm-figure">
            <button type="button" className="figure-preview-trigger" aria-label="Enlarge Algorithm 1 on this page" aria-haspopup="dialog" onClick={(event) => event.currentTarget.parentElement?.querySelector('dialog')?.showModal()}>
              <img src="./paper-algorithm-1.png?v=49" alt="Algorithm 1 from manuscript revision v49: Retrospective candidate construction and PEC ranking" />
            </button>
            <figcaption>Click or tap to enlarge Algorithm 1 and inspect the full procedure.</figcaption>
            <dialog className="figure-preview-dialog" aria-label="Algorithm 1: candidate construction and ranking" onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }} onClose={(event) => { event.currentTarget.classList.remove('is-zoomed'); event.currentTarget.querySelector('button[aria-pressed]')?.setAttribute('aria-pressed', 'false'); }}>
              <div className="figure-preview-surface">
                <div className="figure-preview-toolbar">
                  <strong>Algorithm 1 <span>Candidate construction</span></strong>
                  <div>
                    <button type="button" aria-pressed="false" onClick={(event) => { const zoomed = event.currentTarget.closest('dialog')?.classList.toggle('is-zoomed'); event.currentTarget.setAttribute('aria-pressed', String(Boolean(zoomed))); }}>Zoom / fit</button>
                    <button type="button" autoFocus aria-label="Close enlarged algorithm" onClick={(event) => event.currentTarget.closest('dialog')?.close()}>Close</button>
                  </div>
                </div>
                <p className="figure-zoom-hint">Use Zoom / fit, then scroll to inspect the details.</p>
                <div className="figure-preview-scroll" tabIndex={0} role="region" aria-label="Scrollable enlarged algorithm">
                  <img src="./paper-algorithm-1.png?v=49" alt="Full Algorithm 1: retrospective candidate construction and PEC ranking" />
                </div>
              </div>
            </dialog>
          </figure>
        </section>

        <section className="paper-section results-section" id="results">
          <div className="section-heading section-heading-centered">
            <p className="section-kicker">Results</p><h2>Primary result and representation comparison</h2>
            <p>The manuscript's headline comparison reports the complete PEC record against the selected operational control on the two fixed test pools.</p>
          </div>

          <div className="result-block">
            <div className="result-block-heading"><div><strong>Primary result</strong><small>Complete PEC versus the selected operational control · NDCG@10</small></div></div>
            <div className="headline-results" role="table" aria-label="Headline NDCG at 10 results">
              <div className="headline-row headline-header" role="row"><span role="columnheader">Candidate regime</span><span role="columnheader">Control</span><span role="columnheader">PEC</span><span role="columnheader">Difference [95% CI]</span></div>
              <div className="headline-row" role="row"><strong role="cell">Recent-window</strong><span role="cell">0.7309</span><span role="cell">0.7971</span><span className="result-gain" role="cell">+0.0662 <small>[0.0523, 0.0793]</small></span></div>
              <div className="headline-row" role="row"><strong role="cell">Same-day</strong><span role="cell">0.7499</span><span role="cell">0.7717</span><span className="result-gain" role="cell">+0.0218 <small>[0.0080, 0.0363]</small></span></div>
            </div>
            <p className="result-interpretation">Both paired user-clustered 95% confidence intervals exclude zero.</p>
          </div>

          <div className="contrast-block">
            <div className="contrast-heading">
              <div><p className="section-kicker">Broader evidence</p><h3>Selected paired contrasts</h3></div>
              <p>NDCG@10 differences for representative fixed-fit comparisons in both candidate regimes.</p>
            </div>
            <ComparisonInputExplorer />
            <p className="mobile-scroll-hint" id="contrast-scroll-hint">Swipe horizontally to compare both regimes. Keyboard: focus the table and use the arrow keys.</p>
            <div className="contrast-table" role="table" aria-label="Selected paired NDCG at 10 contrasts" aria-describedby="contrast-scroll-hint" tabIndex={0}>
              <div className="contrast-row contrast-header" role="row"><span role="columnheader">Comparison</span><span role="columnheader">Recent-window Δ [95% CI]</span><span role="columnheader">Same-day Δ [95% CI]</span></div>
              <div className="contrast-row" role="row"><strong role="cell">PEC − control</strong><span className="contrast-estimate" role="cell">+0.0662 <small>[0.0523, 0.0793]</small></span><span className="contrast-estimate" role="cell">+0.0218 <small>[0.0080, 0.0363]</small></span></div>
              <div className="contrast-row" role="row"><strong role="cell">Audit PEC − collapsed</strong><span className="contrast-estimate" role="cell">+0.0133 <small>[0.0047, 0.0215]</small></span><span className="contrast-estimate" role="cell">+0.0107 <small>[0.0009, 0.0206]</small></span></div>
              <div className="contrast-row" role="row"><strong role="cell">Audit PEC − early fusion</strong><span className="contrast-estimate" role="cell">+0.0121 <small>[0.0048, 0.0198]</small></span><span className="contrast-estimate" role="cell">+0.0125 <small>[0.0011, 0.0248]</small></span></div>
              <div className="contrast-row" role="row"><strong role="cell">No-E PEC − no-E control</strong><span className="contrast-estimate" role="cell">+0.0655 <small>[0.0474, 0.0826]</small></span><span className="contrast-estimate" role="cell">+0.0874 <small>[0.0694, 0.1058]</small></span></div>
              <div className="contrast-row" role="row"><strong role="cell">Direct 19-D − learned 5-D fusion</strong><span className="contrast-estimate" role="cell">+0.0041 <small>[0.0009, 0.0068]</small></span><span className="contrast-estimate is-uncertain" role="cell">+0.0030 <small>[−0.0028, 0.0088]</small><em>CI includes zero</em></span></div>
            </div>
            <p className="contrast-footnote">Positive differences favor the first model. Intervals are nominal user-clustered 95% bootstrap CIs; no multiplicity adjustment is applied.</p>
          </div>
          <p className="results-note">Full Recall@10 and MRR intervals, candidate-aware neural scoring, candidate reselection, and the public MIND proxy remain in the paper and tutorial.</p>
        </section>

        <section className="takeaways-section" aria-labelledby="takeaways-title">
          <div className="section-heading section-heading-centered">
            <p className="section-kicker">Summary</p>
            <h2 id="takeaways-title">What this study contributes</h2>
          </div>
          <div className="takeaway-grid">
            <article><span>01</span><h3>Preserve evidence sources through to scoring</h3><p>PEC-Fuse keeps profile, retained-trace, and consumption evidence in distinct, source-labeled fields until scoring. Each input remains traceable to its source instead of being reduced to a single mixed score.</p></article>
            <article><span>02</span><h3>Deliver stronger ranking with traceable inputs</h3><p>Complete PEC improves NDCG@10 over the operational control by 0.0662 in recent-window and 0.0218 in same-day evaluation. PEC inputs also improve ranking with the tested neural scorer.</p></article>
            <article><span>03</span><h3>Retain the benefits in a compact representation</h3><p>The 19-field Direct record preserves source distinctions and remains competitive with Complete PEC. The six explicit interaction products show no established additional benefit, supporting a simpler implementation.</p></article>
          </div>
          <p style={{ margin: '16px 0 0', fontSize: '0.875rem', color: '#656b70', lineHeight: 1.6 }}>Evaluated on retrospective candidate pools; the MIND proxy highlights the importance of platform-specific source semantics.</p>
        </section>

        <section className="paper-section manuscript-section" id="paper">
          <div className="section-heading manuscript-heading">
            <div><p className="section-kicker">Current manuscript · v49</p><h2>Read the paper</h2></div>
            <p>PEC-Fuse: Source-Preserving Evidence Fusion for News Ranking with Partial Recommendation Traces.</p>
            <ExternalLink href={PAPER_URL} className="project-button">Open PDF</ExternalLink>
          </div>
          <ExternalLink href={PAPER_URL} className="paper-preview">
            <img src="./paper-first-page-v49.png" alt="First-page preview of the PEC-Fuse v49 manuscript" loading="lazy" />
            <span className="paper-preview-copy">
              <small>Manuscript v49 · 23 pages</small>
              <strong>The complete paper, figures, and supporting analyses.</strong>
              <span>A preview of the first page. Open the PDF to read, search, or download the full manuscript.</span>
              <b>Open full PDF</b>
            </span>
          </ExternalLink>
        </section>

        <section className="demo-section" id="demo">
          <header className="demo-heading">
            <div className="demo-copy">
              <p className="section-kicker">Interactive analysis</p>
              <h2>Inspect a complete within-query ranking trace.</h2>
              <p>Choose a synthetic reader and an illustrative scoring rule, then trace one candidate from source-labeled inputs to its toy score and final rank.</p>
            </div>
            <a className="demo-link" href="?view=tutorial&lang=en#live-demo">Explore the live ranking demo <span aria-hidden="true">→</span></a>
          </header>
          <figure className="demo-preview">
            <div className="preview-context">
              <div className="preview-meta preview-reader">
                <span className="preview-avatar" aria-hidden="true">🧑🏻</span>
                <span><small>Reader</small><strong>Jin</strong><em>General news reader</em></span>
              </div>
              <div className="preview-route" aria-hidden="true">
                <i>→</i>
                <div className="preview-phone">
                  <header><b>PEC-Fuse</b><em>For you</em></header>
                  <span><i>⚽</i><small><b>1</b> Second-half switch</small></span>
                  <span><i>🚇</i><small><b>2</b> Rail redesign</small></span>
                  <span><i>🏙️</i><small><b>3</b> Housing rules</small></span>
                </div>
              </div>
              <div className="preview-meta preview-model"><small>Illustrative scoring rule</small><strong>Interactions (toy)</strong><span>P · E · C · Z · ψ</span></div>
            </div>
            <div className="preview-feed">
              <div className="preview-feed-header"><strong>Within-query ranking</strong><span>Interactions · toy score</span></div>
              <div className="preview-story">
                <b className="story-rank">1</b><span><small>Sports</small><strong>The second-half switch that changed the final</strong></span><output className="story-score">0.812</output>
              </div>
              <div className="preview-story preview-story-selected">
                <b className="story-rank">2</b><span><small>Local</small><strong>What the rail redesign could mean for your commute</strong></span><output className="story-score">0.764</output>
              </div>
              <div className="preview-story">
                <b className="story-rank">3</b><span><small>Urban policy</small><strong>What the new public-housing rules change locally</strong></span><output className="story-score">0.691</output>
              </div>
            </div>
            <div className="preview-evidence">
              <div className="evidence-title"><small>Selected candidate</small><strong>Local news · rank 2 of 8</strong></div>
              <div className="evidence-values"><span><b>P</b> Profile</span><span><b>E</b> Trace</span><span><b>C</b> History</span><span><b>Z</b> Controls</span></div>
              <div className="preview-score"><strong>Score → rank</strong></div>
            </div>
            <figcaption>Synthetic illustration. Scores are for interface explanation only and are not manuscript results.</figcaption>
          </figure>
        </section>

        <section className="paper-section citation-section" id="citation">
          <div className="section-heading"><p className="section-kicker">Paper</p><h2>Citation</h2><p>This is an unpublished manuscript, revision v49. Use the citation below until final publication metadata and a DOI are available.</p></div>
          <pre><code>{`@unpublished{park2026pecfuse,
  title   = {PEC-Fuse: Source-Preserving Evidence Fusion for
             News Ranking with Partial Recommendation Traces},
  author  = {Park, Woojin and Cheong, Taesu},
  note    = {Unpublished manuscript, revision v49},
  url     = {https://woojinpark-jay.github.io/pec-fuse-ranking/PEC-Fuse-manuscript-v49.pdf},
  year    = {2026}
}`}</code></pre>
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
