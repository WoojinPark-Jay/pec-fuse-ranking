import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import katex from "katex";
import * as fixture from "./mind-example-fixture.ts";

const { history, candidates, mean, norm, dot, names, computeValues, display4 } = fixture;
const close = (actual, expected, label) => assert.ok(Math.abs(actual - expected) < 1e-14, `${label}: ${actual} != ${expected}`);

test("shared fixture preserves the worked-example articles and vectors", () => {
  assert.deepEqual(history.map(item => item.vector), [[1, 0], [0.6, 0.8], [0, 1]]);
  assert.deepEqual(candidates[0], {
    id: "A", title: "AI tools for news", abstract: "A newsroom tests an AI tool.",
    category: "technology", sub: "ai", vector: [0.8, 0.6], member: 1, label: 1,
    counts: [3, 18, 17, 98, 7, 48],
  });
  assert.equal(candidates[0].title.length, 17);
  assert.equal(candidates[0].abstract.length, 28);
  assert.deepEqual(mean, [1.6 / 3, 1.8 / 3]);
  close(norm, Math.sqrt(145) / 15, "mean norm");
  assert.deepEqual(history.map(item => dot(candidates[0].vector, item.vector)), [0.8, 0.96, 0.6]);
});

test("all 21 candidate-A fields match independent full-precision arithmetic", () => {
  const p = 59 / (5 * Math.sqrt(145));
  const cm = 59 / 75;
  const exp = [0.8, 0.96, 0.6].map(value => Math.exp(value / 0.18));
  const ca = (0.8 * exp[0] + 0.96 * exp[1] + 0.6 * exp[2]) / (exp[0] + exp[1] + exp[2]);
  const expected = [
    4 / 20, Math.log(19), 18 / 100, 8 / 50, Math.log(4), Math.log(18), Math.log(29),
    p, 2 / 3, 1 / 3, cm, 0.96, cm, ca, 1, p, cm, 0.96, ca, p * cm, p * ca,
  ];
  const result = computeValues(candidates[0]);
  assert.equal(names.length, 21);
  assert.deepEqual(Object.keys(result.fields), [...names]);
  assert.equal(result.values.length, 21);
  result.values.forEach((value, index) => {
    close(value, expected[index], names[index]);
    assert.equal(value, result.fields[names[index]]);
  });
  assert.deepEqual(result.values.map(display4), [
    "0.2000", "2.9444", "0.1800", "0.1600", "1.3863", "2.8904", "3.3673",
    "0.9799", "0.6667", "0.3333", "0.7867", "0.9600", "0.7867", "0.8860",
    "1.0000", "0.9799", "0.7867", "0.9600", "0.8860", "0.7709", "0.8682",
  ]);
});

test("attention and products never consume rounded display values", () => {
  for (const candidate of candidates) {
    const { fields: f, weights, similarities } = computeValues(candidate);
    close(weights.reduce((sum, value) => sum + value, 0), 1, "weight sum");
    assert.equal(f.C_attention, similarities.reduce((sum, value, index) => sum + value * weights[index], 0));
    assert.equal(f.P_sem_x_E, f.P_mean_vector_cosine * candidate.member);
    assert.equal(f.C_mean_x_E, f.C_mean * candidate.member);
    assert.equal(f.C_max_x_E, f.C_max * candidate.member);
    assert.equal(f.C_attention_x_E, f.C_attention * candidate.member);
    assert.equal(f.P_sem_x_C_mean, f.P_mean_vector_cosine * f.C_mean);
    assert.equal(f.P_sem_x_C_attention, f.P_mean_vector_cosine * f.C_attention);
    assert.notEqual(f.P_sem_x_C_attention, Number(display4(f.P_mean_vector_cosine)) * Number(display4(f.C_attention)));
  }
  const added = computeValues(candidates[2]);
  assert.deepEqual(added.values.slice(14, 19), [0, 0, 0, 0, 0]);
  assert.ok(added.fields.P_sem_x_C_mean > 0);
});

// Inspect the actual UI data without changing its production exports or mounting React.
const source = readFileSync(new URL("./mind-data-microscope.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(`${source}\nexport { calculationDetails, rowFields, newsFields };`, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;
const require = createRequire(import.meta.url);
const ui = {};
runInNewContext(compiled, {
  exports: ui,
  require: id => id === "./mind-example-fixture" ? fixture : id.endsWith(".css") ? {} : require(id),
});

test("microscope samples and calculation results share all 21 fixture values", () => {
  assert.equal(ui.rowFields.length, 21);
  ui.rowFields.forEach((field, index) => {
    assert.equal(field.name, names[index]);
    const expected = display4(fixture.mindExampleCandidateAValues[field.name]);
    assert.equal(field.sample, expected);
    assert.equal(ui.calculationDetails[field.name].result, expected);
  });
  for (const [name, key] of [["title", "title"], ["abstract", "abstract"], ["category", "category"], ["subcategory", "sub"]]) {
    assert.equal(ui.newsFields.find(field => field.name === name).sample, candidates[0][key]);
  }
});

test("all microscope formulas render and encoder settings match the protocol", () => {
  for (const calculation of Object.values(ui.calculationDetails)) {
    for (const tex of [calculation.formula, calculation.substitution]) {
      assert.doesNotThrow(() => katex.renderToString(tex, { throwOnError: true, strict: false }));
    }
  }
  for (const name of ["title", "abstract"]) {
    const formula = ui.calculationDetails[name].formula;
    assert.ok(formula.includes(String.raw`title_i\Vert abstract_i\Vert c_i\Vert s_i`));
    assert.ok(formula.includes("512"));
    assert.ok(formula.includes("192"));
  }
});
