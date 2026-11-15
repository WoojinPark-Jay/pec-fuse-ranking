export type ChapterId = "overview" | "data" | "features" | "models" | "mind" | "experiments" | "demo" | "resources";

export type TutorialChapter = {
  id: ChapterId;
  number: string;
  ko: string;
  en: string;
  root: string;
  hashes: string[];
  koDescription: string;
  enDescription: string;
};

export const chapters: TutorialChapter[] = [
  { id: "overview", number: "01", ko: "개요", en: "Overview", root: "tutorial", hashes: ["", "top", "tutorial"], koDescription: "연구 질문, 핵심 아이디어와 읽기 경로", enDescription: "Research question, core idea, and reading paths" },
  { id: "data", number: "02", ko: "데이터", en: "Data", root: "data", hashes: ["data", "microscope", "candidate-budget", "row", "final-demo"], koDescription: "원자료에서 평가 후보풀까지", enDescription: "From source records to an evaluation pool" },
  { id: "features", number: "03", ko: "특성", en: "Features", root: "features", hashes: ["features", "record", "equations"], koDescription: "후보 하나가 25-field 레코드가 되는 과정", enDescription: "How one candidate becomes a 25-field record" },
  { id: "models", number: "04", ko: "모델", en: "Models", root: "models", hashes: ["models", "learn", "model-lab", "model-reading-guide"], koDescription: "계산된 근거에서 학습된 순위 점수까지", enDescription: "From computed evidence to learned ranking scores" },
  { id: "mind", number: "05", ko: "MIND", en: "MIND", root: "mind", hashes: ["mind", "mind-guide", "mind-data", "mind-pool", "mind-inputs", "mind-models", "mind-results"], koDescription: "공개 impression 로그에서의 transfer 경계", enDescription: "A transfer boundary on public impression logs" },
  { id: "experiments", number: "06", ko: "실험", en: "Experiments", root: "experiments", hashes: ["experiments", "atlas", "decision"], koDescription: "표현·강건성·전이 audit", enDescription: "Representation, robustness, and transfer audits" },
  { id: "demo", number: "07", ko: "데모", en: "Demo", root: "demo", hashes: ["demo", "live-demo"], koDescription: "합성 데이터로 보는 인터랙티브 순위 추적", enDescription: "An interactive synthetic ranking trace" },
  { id: "resources", number: "08", ko: "자료", en: "Resources", root: "resources", hashes: ["resources", "reproduce", "cite"], koDescription: "재현 범위, 아티팩트와 인용", enDescription: "Reproducibility, artifact, and citation" },
];

export const tutorialHashes = new Set(chapters.flatMap((chapter) => chapter.hashes).filter(Boolean));

export function chapterForHash(hash: string): ChapterId {
  return chapters.find((chapter) => chapter.hashes.includes(hash))?.id ?? "overview";
}
