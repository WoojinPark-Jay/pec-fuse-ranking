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

export function ComparisonInputStrips({ kind }: { kind: keyof typeof schemas }) {
  const schema = schemas[kind];
  return <a className="comparison-input-strips" href="?view=tutorial&lang=en#atlas" aria-label={schema.note + " Explore input definitions in the tutorial."}>
    <span className="input-strip-pair">
      {schema.rows.map(row => {
        const total = row.parts.reduce((n, part) => n + part.count, 0);
        return <span className="input-strip-row" key={row.label}>
          <span className="input-strip-name">{row.label}</span>
          <span className="input-strip-track" role="img" aria-label={row.label + ": " + row.parts.map(part => part.description + " (" + part.count + " fields)").join("; ") + ". Total " + total + " fields."}>
            {row.parts.map(part => <span key={part.label} className={"input-strip-part input-strip-" + part.tone} style={{ flex: part.count + " 0 0" }} title={part.description + " (" + part.count + " fields)"} aria-hidden="true">{part.label}{part.count > 2 && <span>{part.count}</span>}</span>)}
            {total < 25 && <span className="input-strip-remainder" style={{ flex: (25 - total) + " 0 0" }} aria-hidden="true" />}
          </span>
          <span className="input-strip-width">{total}D</span>
        </span>;
      })}
    </span>
    <span className="input-strip-note">{schema.note}<span aria-hidden="true"> ↗</span></span>
  </a>;
}
