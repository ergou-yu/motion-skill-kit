/**
 * validate.ts —— motion-skill-kit 片段索引健康报告
 *
 * 校验项（与 README「片段质量规约」一一对应）：
 *  1. data/index.json 可解析、每条记录字段完整且类型正确
 *  2. files / doc 指向的文件存在
 *  3. pattern 文档包含 Context / Approach / Example 三段
 *  4. Example 代码块与 snippet 文件内容一致（防两份拷贝失同步）
 *  5. .tsx 片段可被 TypeScript 语法解析（仅语法、零依赖、不做类型检查）
 *  6. .html 片段结构闭合且包含 prefers-reduced-motion
 *  7. 所有片段包含 prefers-reduced-motion 降级与 CONFIG 参数对象
 *  8. 反向检查：snippets/ 与 patterns/ 无孤儿文件、索引无遗漏
 *
 * 退出码：有 error → 1（CI 可拦截），仅 warn → 0。
 * 运行：npm run validate
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const rel = (p: string) => relative(ROOT, p);

// ---------- 报告收集 ----------
type Level = "pass" | "warn" | "error";
const results: Array<{ level: Level; check: string; target: string; message: string }> = [];

function report(level: Level, check: string, target: string, message: string) {
  results.push({ level, check, target, message });
}

// ---------- 工具 ----------
function walk(dir: string, exts: string[]): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full, exts));
    else if (exts.some((e) => name.endsWith(e))) out.push(full);
  }
  return out;
}

// 空白标准化：比对 md 代码块与源文件时忽略行尾/结尾空白差异
const normalize = (s: string) => s.replace(/[ \t]+$/gm, "").trim();

const REQUIRED_FIELDS: Array<[string, "string" | "string[]"]> = [
  ["id", "string"],
  ["name", "string"],
  ["category", "string"],
  ["tags", "string[]"],
  ["tech", "string[]"],
  ["dependencies", "string[]"],
  ["files", "string[]"],
  ["doc", "string"],
  ["performance", "string"],
  ["reducedMotionFallback", "string"],
];

const VALID_PERFORMANCE = new Set(["low-cost", "medium", "high"]);
const CATEGORIES = ["backgrounds", "text-effects", "cursor", "scroll", "image", "transitions", "generative-art", "shaders", "styles"];

// ---------- 1. 读取索引 ----------
type Snippet = Record<string, unknown>;
let snippets: Snippet[] = [];

try {
  const raw = JSON.parse(readFileSync(join(ROOT, "data", "index.json"), "utf8"));
  snippets = raw.snippets;
  if (!Array.isArray(snippets)) throw new Error("snippets 字段不是数组");
  report("pass", "索引解析", "data/index.json", `共 ${snippets.length} 条记录`);
} catch (e) {
  report("error", "索引解析", "data/index.json", `无法解析: ${(e as Error).message}`);
  console.log(render());
  process.exit(1);
}

// ---------- 2~7. 逐条校验 ----------
const seenIds = new Set<string>();
const indexedSnippetFiles = new Set<string>();
const indexedDocs = new Set<string>();

for (const s of snippets) {
  const id = String(s.id ?? "(缺失)");

  // 字段完整性
  for (const [field, type] of REQUIRED_FIELDS) {
    const v = s[field];
    const ok = type === "string" ? typeof v === "string" && v.length > 0 : Array.isArray(v) && v.every((x) => typeof x === "string");
    if (!ok) {
      report("error", "字段完整", id, `缺少或类型错误: ${field}（应为${type === "string" ? "非空字符串" : "字符串数组"}）`);
    }
  }
  if (seenIds.has(id)) report("error", "唯一性", id, "id 重复");
  seenIds.add(id);

  if (!CATEGORIES.includes(String(s.category))) {
    report("error", "分类合法", id, `未知分类: ${s.category}`);
  }
  if (!VALID_PERFORMANCE.has(String(s.performance))) {
    report("warn", "性能分级", id, `performance 应为 low-cost|medium|high，当前: ${s.performance}`);
  }

  // 文件存在性
  const files = (s.files as string[]) ?? [];
  for (const f of files) {
    indexedSnippetFiles.add(f);
    if (!existsSync(join(ROOT, f))) {
      report("error", "文件存在", id, `files 指向的文件不存在: ${f}`);
    }
  }
  const doc = s.doc as string;
  if (doc) {
    indexedDocs.add(doc);
    if (!existsSync(join(ROOT, doc))) {
      report("error", "文件存在", id, `doc 指向的文档不存在: ${doc}`);
    }
  }

  // snippet 内容规约
  for (const f of files) {
    const full = join(ROOT, f);
    if (!existsSync(full)) continue;
    const code = readFileSync(full, "utf8");
    const ext = extname(f);

    if (!code.includes("prefers-reduced-motion")) {
      report("error", "降级处理", id, `${rel(f)} 未包含 prefers-reduced-motion 降级`);
    }
    // 参数集中两种合法形态：JS 的 CONFIG 常量对象，或风格套件的 :root CSS 变量 token 块
    const hasJsConfig = /const\s+CONFIG\s*=/.test(code);
    const hasCssTokens = /:root\s*\{[^}]*--/.test(code);
    if (!hasJsConfig && !hasCssTokens) {
      report("error", "参数集中", id, `${rel(f)} 未定义顶部 CONFIG 常量对象或 :root CSS 变量 token 块`);
    }
    if (!/\/[\u4e00-\u9fa5]|\/\/\s*[\u4e00-\u9fa5]|\/\*\s*[\u4e00-\u9fa5]/.test(code) && ext !== ".json") {
      report("warn", "中文注释", id, `${rel(f)} 未检测到中文注释（注释应解释「为什么」）`);
    }

    if (ext === ".tsx") {
      // TypeScript 语法解析：只查语法错误，不做类型检查（片段脱离项目上下文无法全量检查）
      const sf = ts.createSourceFile(f, code, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);
      const diags = sf.parseDiagnostics;
      if (diags.length > 0) {
        const first = diags[0];
        const pos = sf.getLineAndCharacterOfPosition(first.start ?? 0);
        report("error", "TSX 语法", id, `${rel(f)} 第 ${pos.line + 1} 行: ${ts.flattenDiagnosticMessageText(first.messageText, " ")}`);
      } else {
        report("pass", "TSX 语法", id, rel(f));
      }
    }

    if (ext === ".html") {
      const closed = /<\/html>\s*$/i.test(code.trim());
      if (!closed) report("error", "HTML 结构", id, `${rel(f)} 未以 </html> 闭合`);
      if (!/^<!DOCTYPE html>/i.test(code.trim())) report("warn", "HTML 结构", id, `${rel(f)} 缺少 DOCTYPE 声明`);
    }
  }

  // pattern 文档三段式 + Example 代码块一致性
  const docPath = join(ROOT, doc ?? "");
  if (doc && existsSync(docPath)) {
    const md = readFileSync(docPath, "utf8");
    for (const section of ["## Context", "## Approach", "## Example"]) {
      if (!md.includes(section)) {
        report("error", "三段式结构", id, `${rel(docPath)} 缺少 ${section} 段`);
      }
    }
    // 提取 EMBED 锚点之间的代码块，与 snippet 比对
    const embeds = [...md.matchAll(/<!-- EMBED:START:(.+?) -->\n```[\w]*\n([\s\S]*?)\n```/g)];
    if (embeds.length === 0) {
      report("warn", "代码嵌入", id, `${rel(docPath)} 的 Example 未嵌入代码（先运行 npm run build:docs）`);
    }
    for (const [, snippetRel, embedded] of embeds) {
      const srcPath = join(ROOT, snippetRel.trim());
      if (!existsSync(srcPath)) {
        report("error", "代码嵌入", id, `EMBED 指向的文件不存在: ${snippetRel}`);
        continue;
      }
      const same = normalize(embedded) === normalize(readFileSync(srcPath, "utf8"));
      if (same) {
        report("pass", "代码一致", id, `${rel(snippetRel.trim())} ↔ ${rel(docPath)}`);
      } else {
        report("error", "代码一致", id, `${rel(docPath)} 的 Example 与 ${rel(snippetRel.trim())} 不一致（运行 npm run build:docs 重新生成）`);
      }
    }
  }
}

// ---------- 8. 反向检查：孤儿文件与索引遗漏 ----------
const allSnippets = walk(join(ROOT, "snippets"), [".tsx", ".html"]);
const allDocs = walk(join(ROOT, "patterns"), [".md"]);

for (const f of allSnippets) {
  if (!indexedSnippetFiles.has(rel(f))) {
    report("error", "索引遗漏", rel(f), "snippets 中的文件未被 data/index.json 收录");
  }
}
for (const d of allDocs) {
  if (!indexedDocs.has(rel(d))) {
    report("error", "索引遗漏", rel(d), "patterns 中的文档未被 data/index.json 收录");
  }
}

// ---------- 汇总输出 ----------
function render(): string {
  const ICON: Record<Level, string> = { pass: "✅", warn: "⚠️ ", error: "❌" };
  const lines: string[] = [];
  lines.push("\n══════════ motion-skill-kit 片段索引健康报告 ══════════\n");

  // 按 check 分组统计，再逐条列出非 pass 项（pass 项折叠为计数，避免刷屏）
  const byCheck = new Map<string, { pass: number; warn: number; error: number }>();
  for (const r of results) {
    const c = byCheck.get(r.check) ?? { pass: 0, warn: 0, error: 0 };
    c[r.level]++;
    byCheck.set(r.check, c);
  }

  lines.push("按校验项汇总：");
  for (const [check, c] of byCheck) {
    lines.push(`  ${check}: ${c.pass} pass${c.warn ? ` / ${c.warn} warn` : ""}${c.error ? ` / ${c.error} ERROR` : ""}`);
  }

  const problems = results.filter((r) => r.level !== "pass");
  if (problems.length > 0) {
    lines.push("\n问题明细：");
    for (const p of problems) {
      lines.push(`  ${ICON[p.level]} [${p.check}] ${p.target} —— ${p.message}`);
    }
  } else {
    lines.push("\n全部校验通过 🎉");
  }

  const pass = results.filter((r) => r.level === "pass").length;
  const warn = results.filter((r) => r.level === "warn").length;
  const error = results.filter((r) => r.level === "error").length;
  lines.push(`\n总计：${pass} pass · ${warn} warn · ${error} error（片段 ${allSnippets.length} 个 / 文档 ${allDocs.length} 篇）`);
  return lines.join("\n");
}

console.log(render());
process.exit(results.some((r) => r.level === "error") ? 1 : 0);
