# motion-skill-kit

前端艺术动效代码片段库 + Agent Skill。让你（或 AI Agent）在生成前端页面时，快速检索并注入**经过验证的动效代码片段与艺术风格套件**，提升 AI 产出页面的视觉质感。

- **49 个片段**：18 个 React `.tsx`（Next.js App Router 兼容）+ 31 个原生 HTML 单文件（双击即可预览）
- **9 大分类**：背景 / 文字 / 光标 / 滚动 / 图片 / 转场 / 生成艺术 / 着色器 + **艺术风格**（孟菲斯、蒸汽波、Y2K、新拟态、玻璃拟态、欧普、粗野主义、瑞士网格、印象派点彩、梵高星夜、浮世绘、包豪斯、波普、酸性设计、赛博朋克、Frutiger Aero、黏土拟态、Art Deco、新中式水墨、像素风——共 20 套风格 token + 组件 demo）
- **零第三方运行时依赖**：全部用原生 CSS / Canvas / Web Animations API / IntersectionObserver / WebGL 实现（唯一例外：p5.js 流场走 CDN）
- **每个片段都带**：顶部 `CONFIG` 参数对象（颜色/速度/幅度集中调参）、`prefers-reduced-motion` 降级、解释「为什么这么写」的中文注释

## 目录结构

```
motion-skill-kit/
├── SKILL.md              # Agent Skill 入口（触发条件 + 检索流程 + 注入规范）
├── skill.json            # skill 元数据（名称/描述/触发关键词）
├── README.md             # 本文件
├── patterns/             # 49 篇模式文档（Context / Approach / Example 三段式）
├── snippets/             # 49 个可运行片段（.tsx / .html，与文档一一对应）
├── templates/            # 起步模板：p5.js / Three.js / shader boilerplate
├── data/index.json       # 结构化索引（Agent 检索入口）
└── scripts/
    ├── build-patterns.ts # 把 snippet 代码嵌入 pattern 文档的 Example 段
    └── validate.ts       # 索引健康报告（语法/一致性/降级/孤儿文件检查）
```

## 快速开始（人类用法）

```bash
npm install        # 只装 tsx + typescript（校验脚本用，片段本身零依赖）
npm run validate   # 健康报告：字段完整 / TSX 语法 / 文档与代码一致 / 降级检查
npm run build:docs # 修改 snippet 后重新同步 pattern 文档的 Example 段
```

想直接看效果：Finder 里**双击任意 `snippets/**/*.html`**（如 `shaders/fragment-ripple.html`、`styles/vaporwave.html`、`styles/van-gogh-swirl.html`）即可在浏览器预览；`.tsx` 片段复制进任意 React 项目即用。

## 在 Claude Code 里安装

### 全局安装（所有会话可用）

```bash
# 把整个仓库复制到 Claude 的全局 skills 目录
cp -r motion-skill-kit ~/.claude/skills/motion-skill-kit
```

### 项目级安装（仅当前项目）

```bash
cp -r motion-skill-kit <你的项目>/.claude/skills/motion-skill-kit
```

安装后 Claude Code 会读取 `SKILL.md` 的 frontmatter（name + description）。当你的请求命中触发条件（炫酷页面 / 动效背景 / 生成艺术 / 光标特效……）时会自动加载该 skill；也可以显式引用：

```
用 motion-skill-kit 里的 aurora-background 做一个暗色科技感 Hero
参考 motion-skill-kit，给这个落地页加滚动叙事和磁吸按钮
```

## 在 Cursor 里安装

Cursor 没有 Anthropic 式的 skills 自动触发，用 **Project Rules** 引用本库：

1. 把 `motion-skill-kit` 放进你的项目（或任意固定路径）；
2. 新建 `<你的项目>/.cursor/rules/motion-skill-kit.mdc`：

   ```markdown
   ---
   description: 前端动效片段库。当用户要求炫酷页面、动效背景、生成艺术、光标特效、滚动叙事等视觉效果时应用。
   alwaysApply: false
   ---
   需要前端动效时，按以下流程使用 motion-skill-kit（位于 <本库绝对路径或相对路径>）：
   1. 读 data/index.json，按 tags / category / tech / performance 匹配候选片段；
   2. 读该片段 doc 字段指向的 patterns/<分类>/<id>.md 了解场景与性能注意；
   3. 复制 files 字段指向的 snippets/<分类>/<id>.tsx|html 注入项目；
   4. 只调 CONFIG 参数适配设计稿，不重写实现；必须保留 prefers-reduced-motion 降级。
   ```

3. 也可以把上面 4 条流程写进项目根目录 `AGENTS.md`，对 Cursor / Claude Code / 其他 Agent 同时生效。

## Agent 检索流程（SKILL.md 摘要）

0. **先选型**：用户未指明风格时，按 SKILL.md 的「自动选型策略」（内容类型 → 风格 + 动效映射表）自行选择，并向用户说明理由与备选；
1. **读索引** `data/index.json` → 按 `tags`（中文关键词）/ `category` / `tech` / `performance` 筛选；
2. **读文档** `doc` 字段指向的 pattern 文档 → Context（适用场景）/ Approach（思路与性能注意）；
3. **取代码** `files` 字段指向的 snippet → 完整可运行源码；
4. **注入调参** → 只改 `CONFIG` / `:root` token，保留降级逻辑；
5. **告知用户** → 降级表现（`reducedMotionFallback` 字段）与性能级别。

> 触发范围：任何前端页面开发任务都应主动使用本 skill 做视觉决策——「使用」指查库决策，允许得出「本次零动效」的结论（如严肃场景）。

## 未收录风格的扩展流程（skill 自我增长）

用户点名的风格库里没有（如「酸性设计」「赛博朋克」「水墨风」）时，Agent 按以下流程处理（详见 SKILL.md）：

1. **联网调研**：搜索 `<风格名> 网页设计 特点` / `<风格名> CSS 实现教程`，从一手资料提炼设计 token、风格铁律与适用场景；
2. **实现套件**：按本库规约写 `snippets/styles/<id>.html`（`:root` token + 降级 + 中文注释注明风格依据）；
3. **交付确认**：先给用户预览 demo，确认后注入项目；
4. **回写入库**：补 pattern 文档（Context 注明资料来源）→ 更新 `data/index.json` → `npm run build:docs && npm run validate` 全绿即收录，下次可直接点名使用。

## 新增一个片段（四步）

1. **写 snippet**：`snippets/<分类>/<id>.tsx` 或 `.html`——顶部 `CONFIG` 常量、中文注释、`prefers-reduced-motion` 降级，一个都不能少；
2. **写文档**：`patterns/<分类>/<id>.md`，三段式 Context / Approach / Example，Example 段写：
   ```
   <!-- EMBED:START:snippets/<分类>/<id>.tsx -->
   <!-- EMBED:END -->
   ```
3. **登记索引**：`data/index.json` 的 `snippets` 数组加一条记录（字段参照现有条目）；
4. **跑校验**：`npm run build:docs && npm run validate`，全绿即入库。

## 片段质量规约（validate.ts 的校验依据）

- `.tsx` 必须能被 TypeScript 语法解析（`"use client"` + 函数组件，React 18+ / Next.js App Router 兼容）；
- `.html` 必须 `<!DOCTYPE html>` 开头、`</html>` 闭合、内联 CSS/JS、双击可开；
- 所有片段必须包含 `prefers-reduced-motion` 降级分支，且参数集中定义（效果类用顶部 `CONFIG` 常量对象，风格套件用 `:root` CSS 变量 token 块）；
- pattern 文档必须含三段式标题，且 Example 代码块与 snippet 文件**逐字节一致**（由 `build-patterns.ts` 从 snippet 单一来源生成，validate 负责盯防失同步）；
- `snippets/` 与 `patterns/` 中不允许存在未被索引收录的孤儿文件。

## 性能分级速查

| 级别 | 含义 | 代表片段 |
|---|---|---|
| low-cost | 合成器动画，随便叠 | aurora-background、noise-grain、per-char-reveal、scroll-progress |
| medium | 每帧 JS 计算 / 中等 shader，整页 ≤2 个 | particle-network、cursor-trail、parallax-hero、fragment-ripple |
| high | 全屏逐像素 / 重 shader，整页 ≤1 个 | hover-distort、noise-cloud-shader、canvas-noise-field |
