import { useState } from "react";
import "./comparison-input-strips.css";

type Part = { label: string; count: number; tone: "context" | "semantic" | "products" | "mixed"; description: string };
type Input = { label: string; parts: Part[] };
const context = (label: string, count: number, description: string): Part => ({ label, count, tone: "context", description });
const semantic: Part = { label: "P/C", count: 5, tone: "semantic", description: "One profile alignment and four semantic consumption summaries" };
const products: Part = { label: "Products", count: 6, tone: "products", description: "Six explicit cross-source products" };
const shared = context("S", 14, "Shared context: eleven Z fields and three retained-trace fields");
const baseline = context("B", 11, "Operational baseline: nine core controls and trace membership and reciprocal rank; not the eleven-field Z block");
const complete: Input = { label: "PEC", parts: [shared, semantic, products] };
const schemas = {
  headline: { rows: [complete, { label: "Control", parts: [baseline] }], note: "Adds semantic P/C, context fields and six products." },
  collapsed: { rows: [complete, { label: "Collapsed", parts: [baseline, { label: "1", count: 1, tone: "mixed", description: "One hand-built mixed semantic score" }] }], note: "Separate evidence versus one hand-built semantic score." },
  early: { rows: [complete, { label: "Early", parts: [baseline, { label: "1", count: 1, tone: "mixed", description: "One learned mixed semantic score; not the learned 5-D audit" }] }], note: "Separate evidence versus one learned semantic score." },
  noe: { rows: [{ label: "No-E PEC", parts: [context("Z", 11, "Nine core controls plus profile-count and consumption-count fields"), semantic, { label: "2", count: 2, tone: "products", description: "Two remaining profile-consumption products; all E-containing products removed" }] }, { label: "Control", parts: [context("Core", 9, "Nine core controls; trace membership and reciprocal rank removed from B")] }], note: "Neither input contains E or an E-containing product." },
  direct: { rows: [{ label: "Direct", parts: [shared, semantic] }, { label: "Learned", parts: [shared, { label: "Learned", count: 5, tone: "mixed", description: "A learned five-dimensional transform of the same five P/C coordinates" }] }], note: "Same 19-field width; only the five P/C coordinates change." },
} satisfies Record<string, { rows: Input[]; note: string }>;

const choices = [
  { id: "headline", label: "Operational control", heading: "What does the complete record add?", description: "Compare the eleven operational inputs with the complete source-preserving record.", target: "headline" },
  { id: "collapsed", label: "Scalar compression", heading: "Separate sources, or one mixed score?", description: "Compare the complete record with a single hand-built semantic score. Input width and context also differ.", target: "collapsed" },
  { id: "noe", label: "Without trace inputs", heading: "What remains when E is removed?", description: "Neither input includes retained-trace fields or products containing E.", target: "noe" },
  { id: "direct", label: "Matched width", heading: "Same width. Different coordinates.", description: "Both inputs contain 19 fields. The difference is whether five P/C coordinates stay separate or pass through a learned transform.", target: "early" },
] as const;

export function ComparisonInputExplorer() {
  const [active, setActive] = useState<(typeof choices)[number]["id"]>("direct");
  const choice = choices.find(item => item.id === active)!;
  const schema = schemas[active];
  return <section className="input-explorer" aria-label="Explore the comparison inputs">
    <div className="input-explorer-nav" role="tablist" aria-label="Choose an input comparison">
      {choices.map(item => <button key={item.id} type="button" role="tab" id={"input-tab-" + item.id} aria-selected={item.id === active} aria-controls="input-explorer-panel" onClick={() => setActive(item.id)}>{item.label}</button>)}
    </div>
    <div className="input-explorer-body" role="tabpanel" id="input-explorer-panel" aria-labelledby={"input-tab-" + active}>
      <div className="input-explorer-copy">
        <span className="input-explorer-eyebrow">Read the inputs</span>
        <h4>{choice.heading}</h4>
        <p>{choice.description}</p>
        <a href={"?view=tutorial&lang=en&comparison=" + choice.target + "#atlas"}>Explore this experiment <span aria-hidden="true">↗</span></a>
      </div>
      <div className="input-explorer-diagram">
        {schema.rows.map(row => {
          const total = row.parts.reduce((n, part) => n + part.count, 0);
          return <div className="input-explorer-model" key={row.label}>
            <div className="input-explorer-model-heading"><strong>{row.label === "PEC" ? "Complete PEC" : row.label === "Learned" ? "Learned 5-D fusion" : row.label === "Direct" ? "Direct" : row.label === "Control" && active === "noe" ? "No-E control" : row.label}</strong><span>{total}<small> fields</small></span></div>
            <div className="input-explorer-track" role="img" aria-label={row.label + ": " + row.parts.map(part => part.description + " (" + part.count + " fields)").join("; ")}>
              {row.parts.map(part => <span key={part.label} className={"input-explorer-part input-strip-" + part.tone} data-block={part.label} style={{ flex: part.count + " 0 0" }} title={part.description} aria-hidden="true"><span className="input-explorer-group-label"><b>{part.label === "S" ? "Shared context" : part.label === "B" ? "Baseline" : part.label === "1" ? "1" : part.label === "P/C" ? "P / C" : part.label}</b>{part.count > 2 && <small>{part.count}</small>}</span><span className="input-explorer-cells">{Array.from({ length: part.count }, (_, index) => <i key={index} />)}</span></span>)}
              {total < 25 && <span className="input-explorer-unused" style={{ flex: (25 - total) + " 0 0" }} aria-hidden="true" />}
            </div>
          </div>;
        })}
        <p className="input-explorer-caption">Colors match the feature record above; mixed representations are gray. Fields are grouped by source, not serialized order.</p>
      </div>
    </div>
  </section>;
}
