# motion-skill-kit 开源：给 AI Agent 的 42 个前端动效片段库，让 AI 写出的页面自带「艺术感」

> 一次让 Claude 写官网的经历让我意识到：AI 不缺写动效代码的能力，缺的是**经过验证的动效决策依据**。于是我把它做成了一个可自我增长的开源 Agent Skill——**motion-skill-kit**。本文分享它的设计思路、核心实现与踩坑记录。
>
> 仓库地址：<https://github.com/ergou-yu/motion-skill-kit>（MIT，欢迎 Star / PR）

## 前言：AI 生成页面，输在「视觉抽盲盒」

让 AI 写一个「炫酷的官网 Hero」，你大概率会得到三种结果之一：

1. **平庸款**——白底黑字加个 `transition: all 0.3s`，毫无氛围；
2. **用力过猛款**——渐变、阴影、旋转 360° 全叠上，像 2010 年的 PPT；
3. **掉帧款**——动画写在 `top/left` 上，或者用 `pointermove` 直接 `setState`，一秒上百次重渲染。

根因不是模型不会写 CSS，而是**每次都从零发明**：它没有一份「这个效果什么场景该用、性能成本多少、无障碍怎么降级」的验证过的知识库。人类的资深前端之所以稳，是因为脑子里有一套反复验证过的模式库。

**motion-skill-kit 就是把这套模式库显式化**，做成 Agent Skill 标准格式（SKILL.md + 索引 + 片段），让 Claude Code、Cursor、ZCode 等 AI 编程工具在写页面前先查库决策，再注入经过验证的代码。

## 一、它是什么：素材库 + 行为引擎的双形态

一句话定义：**42 个零第三方依赖的前端动效/艺术风格片段 + 一份教 Agent 如何检索、选型、注入的 SKILL.md 行为规范**。

### 1.1 内容全景：9 大分类 42 个片段

| 分类 | 数量 | 代表片段 |
|---|---|---|
| 背景动效 backgrounds | 5 | 极光流动、噪点颗粒、粒子连线网络、3D 星空流星 |
| 文字动效 text-effects | 5 | 粒子文字汇聚、逐字入场、故障风 glitch、乱码解码 |
| 光标交互 cursor | 3 | 磁吸按钮、Canvas 拖尾光标、反相混合光标 |
| 滚动叙事 scroll | 4 | 三层视差 Hero、IntersectionObserver 揭示序列、横向 pin |
| 图片特效 image | 3 | WebGL 液态置换变形、clip-path 遮罩揭示、Ken Burns |
| 页面转场 transitions | 3 | 遮罩擦除、FLIP 共享元素过渡、路由淡入 |
| 生成艺术 generative-art | 3 | p5.js 流场、种子随机（可复现）、原生 Perlin 噪声场 |
| 着色器 shaders | 3 | 交互波纹、fbm 云雾（domain warp）、plasma 色场 |
| 艺术风格 styles | 13 | 孟菲斯、蒸汽波、Y2K 铬感、新拟态、玻璃拟态、欧普、粗野主义、瑞士网格、莫奈点彩、梵高星夜、浮世绘、包豪斯、波普 |

两种载体形式：

- **React 片段（18 个 `.tsx`）**：函数组件、`"use client"`、Next.js App Router 兼容，复制进项目即用；
- **原生 HTML 片段（24 个）**：单文件内联 CSS/JS，**Finder 双击就能在浏览器预览效果**——WebGL/shader/生成艺术类全部采用这种形式，注入 React 项目时把 `<script>` 逻辑搬进 `useEffect` 即可。

### 1.2 三条硬性质量线（每个片段必须满足）

1. **零第三方运行时依赖**：只用原生 CSS / Canvas / Web Animations API / IntersectionObserver / WebGL（唯一例外：p5 流场走 CDN）。注入任何项目零安装成本；
2. **`prefers-reduced-motion` 降级**：用户开启系统「减少动态效果」时，自动退化为静态构图而非黑屏或闪烁；
3. **参数集中区**：效果类片段的视觉参数全部收在顶部 `CONFIG` 常量对象，风格套件收在 `:root` CSS 变量——AI 调参只碰这一块，不碰实现逻辑。

## 二、核心设计：SKILL.md 不只是文档，是「行为引擎」

大多数「AI 素材库」失败的原因是：库在那里，AI 不知道什么时候该用。所以 SKILL.md 的重点不是罗列片段，而是写清楚**三个行为规则**。

### 2.1 规则一：前端任务即主动触发

frontmatter 的 description 直接声明触发边界：

```yaml
---
name: motion-skill-kit
description: 前端艺术动效代码片段库。只要任务涉及前端页面开发（组件、页面、
  落地页、官网、H5、后台界面改版等）就应主动使用本 skill 做视觉决策；当用户
  要求炫酷页面、艺术感官网、动效背景、生成艺术、光标特效……时必须使用。
---
```

这里有个容易忽略的逻辑细节：「使用 skill」= **查索引做有依据的视觉决策**，而允许得出「本次零动效」的结论。政务/医疗类严肃页面的正确输出不是沉默跳过，而是「查过了，建议零动效，理由是信息效率优先」。把「主动触发」和「强制注入」解耦，规则才不会和克制原则打架。

### 2.2 规则二：用户没说风格？查「自动选型决策表」

用户说「帮我做个落地页」而不提风格时，Agent 按 SKILL.md 内置的映射表选型（风格 + 动效一起定，防止气质打架）：

| 内容类型 | 推荐风格 | 推荐动效组合 |
|---|---|---|
| 科技 / AI / SaaS 官网 | 暗色 + 极光背景 | 逐字入场 + 视差 Hero + 磁吸按钮 |
| 开发者工具 / 文档站 | 粗野主义 或 瑞士网格 | 滚动揭示 + 进度条 |
| 电商大促 / 活动页 | 波普 或 Y2K 铬感 | marquee + WebGL 置换 |
| 音乐 / 夜生活 / 潮流 | 蒸汽波 | glitch 文字 + 噪点颗粒 |
| 艺术 / 文化 / 展览 | 浮世绘 / 欧普 / 印象派 | 遮罩揭示 + 路由淡入 |
| 高端 B2B / 金融 / 法律 | 瑞士网格 | 仅滚动揭示（克制） |
| 完全无法判断 | — | 百搭基础包：滚动揭示 + 逐字入场 + 进度条 |

配合硬约束：整页 `high` 性能片段 ≤1 个、`medium` ≤2 个、动效总数 ≤4~5 个、光敏类（glitch/欧普）不主动选入。**宁缺毋滥是写进规则的**。

### 2.3 规则三：库里没有的风格？联网调研并自我增长

用户点名「酸性设计」「赛博朋克」这种库里没有的风格时，SKILL.md 规定了四步扩展流程：

```
查索引无命中
   ↓ ① 联网调研：搜「<风格名> 网页设计 特点」「<风格名> CSS 实现教程」，
   │   从一手资料提炼设计 token / 风格铁律 / 适用场景
   ↓ ② 实现套件：按规约写 HTML demo（:root token + 降级 + 中文注释注明依据）
   ↓ ③ 交付确认：先给用户预览，方向对了再注入项目
   ↓ ④ 回写入库：补 pattern 文档 → 更新 index.json → 校验全绿 → 告知用户
      「已收录，下次直接点名」
```

两条纪律防止失控：搜不到资料必须声明「基于理解实现」，禁止把「我猜」写成「教程指出」；单套件控制在 150~250 行。这让 skill 具备**用得越多越准**的复利。

## 三、架构：一条「索引 → 文档 → 代码」的检索数据流

```text
data/index.json          patterns/<分类>/<id>.md        snippets/<分类>/<id>.tsx|html
┌──────────────────┐     ┌───────────────────────┐     ┌────────────────────────┐
│ id: aurora-back.. │     │ ## Context  适用场景    │     │ "use client";          │
│ tags: [渐变,氛围,..]│ ──▶ │ ## Approach 思路/性能/  │ ──▶ │ const CONFIG = {...}   │
│ tech: [react,css] │     │            降级方案     │     │ export default ...     │
│ performance: low  │     │ ## Example  完整代码    │     │ (含 reduced-motion 降级) │
│ files/doc: 路径    │     └───────────────────────┘     └────────────────────────┘
└──────────────────┘          Agent 决策依据                复制注入目标项目
     检索入口
```

索引记录的字段直接服务 AI 检索：

```json
{
  "id": "aurora-background",
  "name": "极光流动背景",
  "category": "backgrounds",
  "tags": ["渐变", "模糊", "氛围", "科技感", "官网Hero", "暗色主题"],
  "tech": ["react", "css"],
  "dependencies": [],
  "files": ["snippets/backgrounds/aurora-background.tsx"],
  "doc": "patterns/backgrounds/aurora-background.md",
  "performance": "low-cost",
  "reducedMotionFallback": "静态色雾构图（CSS animation: none）"
}
```

`tags` 用中文写是有意的——用户的需求描述就是中文（「要个科技感的背景」），中文关键词命中率高一个量级。

## 四、片段长什么样：两段真实代码

### 4.1 极光背景：为什么纯 CSS 反而是最优解

```tsx
// ===== 视觉参数集中区：调色/调速只改这里 =====
const CONFIG = {
  blobs: [
    { color: "#3a86ff", x: "15%", y: "20%", size: 55 },
    { color: "#8338ec", x: "60%", y: "10%", size: 50 },
    { color: "#06d6a0", x: "40%", y: "60%", size: 45 },
    { color: "#ff006e", x: "75%", y: "55%", size: 35 },
  ],
  blur: 90,        // 模糊半径：超过 120 后低端 GPU 明显掉帧
  duration: 26,    // 26s 一轮："缓慢到不被察觉在动"的甜点区
} as const;

// 组件内：transform 动画跑在合成器线程，主线程卡顿也不掉帧
// 这就是不用 Canvas 的理由——同样效果代码量只有 1/3
<div style={{
  borderRadius: "50%",
  background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
  filter: `blur(${CONFIG.blur}px)`,
  willChange: "transform",
  animation: `aurora-drift ${CONFIG.duration}s ease-in-out infinite`,
}} />

// 降级：一行 CSS 完成静态化
// @media (prefers-reduced-motion: reduce) { .aurora-blob { animation: none !important; } }
```

### 4.2 磁吸按钮：为什么 ref + rAF 而不是 setState

```tsx
useEffect(() => {
  const btn = btnRef.current;
  // 三重降级：触屏无 hover 语义 / 系统要求减动 → 跳过绑定，退化为普通按钮
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (isTouch || reduced) return;

  const loop = () => {
    const s = state.current;
    // 磁力手感的来源：当前值每帧向目标值"指数追赶"（先快后慢），
    // 直接跟随是"粘住"，追赶才是"吸附"
    s.cx += (s.tx - s.cx) * CONFIG.ease;
    s.cy += (s.ty - s.cy) * CONFIG.ease;
    // 直接写 style 绕过 React 渲染管线——
    // pointermove 里 setState 一秒能触发上百次重渲染
    btn.style.transform = `translate(${s.cx}px, ${s.cy}px)`;
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}, []);
```

每个片段的注释都遵循同一条原则：**解释「为什么这么写」而不是「写了什么」**。这些「为什么」是 AI 注入后举一反三的依据。

## 五、工程质量：把「文档与代码一致」做成机制

片段库最大的维护噩梦是：**改了代码忘了改文档**，AI 读着过时文档做出错误决策。motion-skill-kit 用两个脚本把一致性变成构建保证：

### 5.1 build-patterns.ts：文档的 Example 段从代码生成

pattern 文档的 Example 段不手写代码，只写锚点：

```markdown
## Example

<!-- EMBED:START:snippets/backgrounds/aurora-background.tsx -->
<!-- EMBED:END -->
```

`npm run build:docs` 扫描锚点，把 snippet 文件内容嵌入两锚点之间。代码只有一份源，文档是它的投影。

### 5.2 validate.ts：61 项自动体检

`npm run validate` 输出健康报告，任何一项 error 都以非零退出码结束（可直接接 CI）：

```text
══════════ motion-skill-kit 片段索引健康报告 ══════════

按校验项汇总：
  索引解析: 1 pass
  TSX 语法: 18 pass        ← ts.createSourceFile 语法级解析全部 .tsx
  代码一致: 42 pass        ← 文档 Example 与 snippet 逐字节比对

全部校验通过 🎉
总计：61 pass · 0 warn · 0 error（片段 42 个 / 文档 42 篇）
```

校验覆盖：索引字段完整性、文件存在性、文档三段式结构（Context/Approach/Example）、TSX 语法解析、`prefers-reduced-motion` 与参数集中区存在性、孤儿文件反向检查。

## 六、安装使用：三分钟接入你的 AI 工作流

### 6.1 Claude Code

```bash
# 全局安装（所有会话可用）
git clone https://github.com/ergou-yu/motion-skill-kit ~/.claude/skills/motion-skill-kit

# 或项目级安装
git clone https://github.com/ergou-yu/motion-skill-kit <你的项目>/.claude/skills/motion-skill-kit
```

之后说「用 motion-skill-kit 里的极光背景做个暗色 Hero」即可。

### 6.2 Cursor（Project Rules 方式）

新建 `<项目>/.cursor/rules/motion-skill-kit.mdc`：

```markdown
---
description: 前端动效片段库。当用户要求炫酷页面、动效背景、生成艺术等视觉效果时应用。
alwaysApply: false
---
需要前端动效时，按以下流程使用 motion-skill-kit（位于 <本库路径>）：
1. 读 data/index.json，按 tags / category / tech / performance 匹配候选片段；
2. 读该片段 doc 字段指向的 patterns/<分类>/<id>.md 了解场景与性能注意；
3. 复制 files 字段指向的 snippets/<分类>/<id>.tsx|html 注入项目；
4. 只调 CONFIG 参数适配设计稿，不重写实现；必须保留 prefers-reduced-motion 降级。
```

### 6.3 人类直接用

不用任何 AI 工具也行：**Finder 双击任意 `snippets/**/*.html`**（比如 `styles/vaporwave.html`、`styles/van-gogh-swirl.html`）就能在浏览器里预览 13 种艺术风格与各类动效效果，看中哪个复制哪个。

## 七、踩坑与设计取舍（真实记录）

**坑 1：块注释里的 `**/` 会提前终止注释。** 构建脚本注释里写了「扫描 patterns 目录下所有 `.md`」本想表达 glob 语义 `**/*.md`，结果 `**/` 序列直接终止了 `/** ... */` 块注释，esbuild 报 `Unexpected "*"`。教训：注释里永远别出现 `*/` 的任何变体。

**坑 2：校验规则要跟得上内容形态。** 第一版 validate 只认 JS 的 `const CONFIG`，新增纯 CSS 风格套件后 11 个片段集体报错——它们的参数在 `:root` CSS 变量里。解法是把「参数集中」定义为两种合法形态（JS CONFIG 或 CSS token 块），规则服务内容，而不是反过来。

**坑 3：为什么坚持零依赖不用 GSAP/Framer Motion？** 曾犹豫过「用 Framer Motion 代码量能省一半」。但 skill 的价值在**可注入性**：注入目标项目可能禁用某依赖、可能有自己的动画栈。零依赖片段是最大公约数；文档里再标注「项目已有 GSAP 时的等价写法」作为可选项，两头兼顾。

**坑 4：AI 调参需要「防呆」设计。** 早期片段参数散落各处，AI 调参经常改坏实现。把参数强制收敛到顶部 `CONFIG` / `:root` 并写进校验规则后，「只改参数区不动实现」才成为可执行的约束，而不是口头约定。

## 八、总结

motion-skill-kit 的核心主张：**AI 前端产出的视觉上限，不取决于模型的编码能力，而取决于它有没有一套经过验证的视觉决策知识库**。项目把这件事拆成了三层：

1. **内容层**：42 个零依赖、带降级、参数集中的片段（含 13 套艺术风格套件）；
2. **行为层**：主动触发 + 自动选型 + 未收录风格联网扩展的自我增长闭环；
3. **工程层**：文档代码单向生成 + 61 项自动体检，一致性靠机制不靠自觉。

后续计划：补充更多风格套件（酸性设计、赛博朋克、新中式）、增加「组合配方」维度（多个片段的成套搭配）、探索从真实网站反向提取风格 token。

> 仓库：<https://github.com/ergou-yu/motion-skill-kit>
> 如果它让你的 AI 写出了更好看的页面，欢迎 Star 支持；也欢迎 PR 你的风格套件——提交前跑一下 `npm run validate`，全绿即收录。

---

**附：片段预览速查**（本地 clone 后双击对应文件即可预览）

| 想看什么 | 双击打开 |
|---|---|
| 蒸汽波（网格地平线 + 落日 + VHS 颗粒） | `snippets/styles/vaporwave.html` |
| 梵高星夜（旋涡笔触流场生成艺术） | `snippets/styles/van-gogh-swirl.html` |
| 浮世绘（分层海浪版画） | `snippets/styles/ukiyo-e.html` |
| 粒子文字汇聚 | `snippets/text-effects/text-particle-converge.html` |
| WebGL 悬停液态置换 | `snippets/image/hover-distort.html` |
| 交互水波 shader | `snippets/shaders/fragment-ripple.html` |
