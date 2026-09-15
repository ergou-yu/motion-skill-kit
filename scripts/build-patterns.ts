/**
 * build-patterns.ts —— patterns 文档的 Example 代码嵌入器
 *
 * 职责：递归扫描 patterns 目录下所有 .md 文档，把
 *   <!-- EMBED:START:snippets/xxx.tsx -->
 *   <!-- EMBED:END -->
 * 两个锚点之间替换为该 snippet 文件的完整代码块。
 *
 * 为什么需要它：pattern 文档的 Example 与 snippets 文件是同一份代码的两个
 * 存放位置，手抄必然失同步；由脚本从 snippet 单一来源生成，保证永远一致
 * （validate.ts 会校验这一点）。幂等：重复运行结果不变。
 *
 * 运行：npm run build:docs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

// 兼容各版本 Node：从 import.meta.url 反推仓库根目录
const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");

// 递归收集 .md 文件
function walkMd(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...walkMd(full));
    } else if (name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

// 扩展名 → markdown 代码块语言标记
function langOf(path: string): string {
  switch (extname(path)) {
    case ".tsx": return "tsx";
    case ".ts": return "ts";
    case ".html": return "html";
    default: return "";
  }
}

// 匹配 START 锚点、任意内容、END 锚点（非贪婪）
const EMBED_RE = /<!-- EMBED:START:(.+?) -->\n[\s\S]*?<!-- EMBED:END -->/g;

let totalEmbedded = 0;

for (const mdPath of walkMd(join(ROOT, "patterns"))) {
  const md = readFileSync(mdPath, "utf8");
  let updated = md;
  let count = 0;

  updated = md.replace(EMBED_RE, (_match, snippetRel: string) => {
    const snippetPath = join(ROOT, snippetRel.trim());
    const code = readFileSync(snippetPath, "utf8").trimEnd();
    count++;
    return [
      `<!-- EMBED:START:${snippetRel.trim()} -->`,
      "```" + langOf(snippetRel),
      code,
      "```",
      "<!-- EMBED:END -->",
    ].join("\n");
  });

  if (updated !== md) {
    writeFileSync(mdPath, updated);
    console.log(`  嵌入 ${relative(ROOT, mdPath)}（${count} 处）`);
    totalEmbedded += count;
  }
}

console.log(`\n完成：共嵌入 ${totalEmbedded} 个代码块。`);
