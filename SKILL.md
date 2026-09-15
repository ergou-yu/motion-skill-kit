---
name: motion-skill-kit
description: 前端艺术动效代码片段库。只要任务涉及前端页面开发（组件、页面、落地页、官网、H5、后台界面改版等）就应主动使用本 skill 做视觉决策；当用户要求炫酷页面、艺术感官网、动效背景、生成艺术、光标特效、滚动叙事、文字动效、图片特效、页面转场，或指定艺术风格（孟菲斯、蒸汽波、Y2K、新拟态、玻璃拟态、欧普、粗野主义、瑞士网格、印象派/梵高/莫奈笔触、浮世绘、包豪斯、波普）时必须使用。包含 42 个经过验证、零第三方依赖、带 prefers-reduced-motion 降级的可注入片段（动效 29 + 艺术风格套件 13）。用户未指明风格时，按「自动选型策略」自行选择；用户指定的风格未收录时，按「未收录风格的扩展流程」联网搜索教程、实现并回写入库（skill 自我增长）。
---

# motion-skill-kit：前端艺术动效片段库

一套供 AI Agent（或人类开发者）检索、注入**经过验证的动效代码片段**的技能库。目标是让生成的页面在视觉质感上达到「艺术级官网」水准，同时守住性能与无障碍底线。

## 核心原则（注入前必读）

1. **零第三方依赖**：所有片段仅使用原生 CSS / Canvas / Web Animations API / IntersectionObserver / WebGL。不需要安装 GSAP、Framer Motion 等任何库即可运行。若目标项目已有这些库，可参考各 pattern 文档「Approach」中的等价写法建议，但默认注入原版代码。
2. **参数集中在文件顶部**：效果类片段的视觉参数（颜色、速度、幅度、密度）定义在顶部 `CONFIG` 常量对象；艺术风格套件（styles 类）的设计 token 定义在 `:root` CSS 变量块。按用户需求调参时**只改这些参数区，不改实现逻辑**。
3. **必须保留 `prefers-reduced-motion` 降级**：每个片段都内置了降级逻辑（静态渐变、直接显示最终状态等）。注入后若为节省代码删掉降级分支，视为违规注入。
4. **中文注释解释「为什么」**：片段内的注释解释设计动机（如为什么用 transform 而非 top/left、为什么要节流），注入时可以按目标项目风格改写注释，但不要丢失这些关键信息。

## 主动触发与自动选型策略

### 何时主动触发

**只要任务涉及前端页面开发，就默认使用本 skill**——包括但不限于：写组件、搭页面、做落地页/官网/H5、改版后台界面、生成原型。原因：视觉决策（要不要动效、什么气质）应该在写第一行 JSX 之前就发生，而不是写完再补。

注意「使用本 skill」= 查阅索引并做出**有依据的视觉决策**，不等于「必须注入动效」。查询后得出「本次保持朴素、零动效」同样是合法结论（见「何时不使用」）。

### 用户未指明风格时的选型流程

1. **先看用户是否给了氛围词**：「炫酷/科技感」→ 暗色系动效包；「高级/克制」→ swiss-grid；「可爱/活泼」→ memphis；「复古/潮流」→ vaporwave / y2k-chrome / pop-art；「东方/国风」→ ukiyo-e。
2. **用户点名了风格但索引查无命中** → 直接跳转下方「未收录风格的扩展流程」（联网调研 → 实现 → 回写入库）。
3. **没有氛围词则按内容类型查下表**（风格 + 动效一起定，避免风格与动效气质打架）：

| 内容类型 | 推荐风格 | 推荐动效组合 |
|---|---|---|
| 科技 / AI / SaaS 官网 | 暗色 + aurora-background 或 gradient-mesh | per-char-reveal + parallax-hero + magnetic-button |
| 开发者工具 / 文档站 | brutalism 或 swiss-grid | reveal-on-scroll + scroll-progress |
| 创意机构 / 作品集 | swiss-grid 或 memphis | blend-mode-cursor + shared-element + mask-reveal |
| 电商大促 / 活动页 | pop-art 或 y2k-chrome | marquee（brutalism 内置）+ hover-distort |
| 音乐 / 夜生活 / 潮流 | vaporwave | glitch-text + noise-grain |
| 艺术 / 文化 / 展览 | ukiyo-e / op-art / 印象派 | mask-reveal + fade-slide-route + ken-burns |
| 教育 / 轻松向产品 | memphis | per-char-reveal + reveal-on-scroll |
| 高端 B2B / 金融 / 法律 | swiss-grid | 仅 reveal-on-scroll + scroll-progress（克制） |
| 冥想 / 健康 / 生活方式 | impressionism 或 aurora-background | ken-burns + noise-grain |
| 游戏 / 科幻 | starfield 或 shaders 类 | text-particle-converge + glitch-text |

4. **完全无法判断时用「百搭基础包」**：reveal-on-scroll + per-char-reveal + scroll-progress——低风险、低成本、任何页面都不出错，宁缺毋滥。
5. **性能预算约束**：整页 `performance: high` 片段最多 1 个、`medium` 最多 2 个；风格套件与背景动效不要同时上两个重量级。
6. **向用户透明**：输出方案时说明「我选择了 X 风格 + Y 动效，理由是 Z；如果你想要别的气质（列 2 个备选），我可以换」。

### 选型的红线

- 严肃场景（政务/医疗/法务）即使查了库，结论也应是「零或极克制动效」，并说明原因。
- 有光敏风险的片段（glitch-text、op-art）不主动选入，除非用户点名。
- 一次注入的动效不超过 4~5 个：多而杂不如少而准。

## 未收录风格的扩展流程（skill 自我增长）

用户指定的风格在 `data/index.json` 中**没有命中**时（例：「来个 Acid Graphics 酸性设计」「做 Cyberpunk 赛博朋克风」「中式水墨风」），不要凭空硬写，也不要拒绝——按以下流程执行：

### 第 1 步：联网调研（先查资料再动手）

- 搜索关键词组合：`<风格名> 网页设计 特点`、`<风格名> CSS 实现教程`、`<风格名> web design tutorial`；
- 优先找两类资料：**风格定义**（历史渊源、视觉特征清单、代表案例）和**落地教程**（具体的 CSS/canvas 实现手法、色板 hex 值）；
- 必须从资料中提炼出：① 设计 token（色板、字体气质、形状语言）；② 风格铁律（必须做什么/绝不做什么，如「包豪斯禁渐变」级别的约束）；③ 适用与禁用场景。
- ⚠️ 搜不到可靠资料时：告知用户「未找到充分教程，以下基于我的理解实现」，并在文档中标注「未经一手资料验证」。

### 第 2 步：实现风格套件（遵守本 skill 规约）

- 形式：`snippets/styles/<风格 id>.html` 单文件 demo（双击可预览），完整展示配色 + 排版 + 标志性组件；
- token 集中在 `:root` CSS 变量块（id 用风格名的英文短横线形式，如 `acid-graphics`）；
- 必含 `prefers-reduced-motion` 降级、解释「为什么」的中文注释（注释要写风格依据，如「教程指出该风格的网格必须倾斜 15°」）。

### 第 3 步：交付用户

- 先给用户预览 demo，确认风格方向正确后再注入实际项目；
- 注入时同样只改 token 区，不动实现。

### 第 4 步：回写入库（skill 增长）

1. snippet 放 `snippets/styles/<id>.html`；
2. 文档放 `patterns/styles/<id>.md`，三段式 Context（风格历史与适用场景，注明资料来源）/ Approach（token + 铁律 + 降级）/ Example（写 EMBED 锚点，见 README）；
3. `data/index.json` 的 `snippets` 数组追加记录（tags 里包含风格的中英文名与别名）；
4. 若是全新分类（不只是 styles），同步更新 `scripts/validate.ts` 的 `CATEGORIES` 白名单与 `SKILL.md` 导航表；
5. 跑 `npm run build:docs && npm run validate`，全绿即入库完成，并告知用户「该风格已收录，下次可直接点名使用」。

### 扩展的纪律

- 一个风格套件控制在 150~250 行：demo 是「设计语言样板」不是完整网站；
- 调研结论必须来自搜索到的一手资料，禁止把「我猜」写成「教程指出」；
- 高风险风格（光敏闪烁类）即使收录也要在文档 Context 里保留警告。

## 检索流程（Agent 按此步骤操作）

0. **先选型**：用户未指明风格/动效时，先走上方「自动选型策略」确定风格与动效清单，再进入检索；用户已指明则直接进入检索。
1. **读索引**：读取 `data/index.json`，按用户的描述匹配 `tags`（中文关键词）、`category`、`tech`、`performance` 字段，筛选出候选片段。
2. **读文档**：读取候选片段的 `doc` 字段指向的 `patterns/<category>/<id>.md`，了解适用场景（Context）、实现思路与性能注意（Approach）。
3. **取代码**：读取 `files` 字段指向的 `snippets/<category>/<id>.tsx|html`，这是完整可运行的源码。
4. **注入与调参**：把代码复制进目标项目，只修改 `CONFIG` 中的参数适配用户的设计稿（品牌色、节奏快慢），不要重写实现。
5. **说明降级**：向用户说明该片段在 `prefers-reduced-motion` 下的表现（见索引的 `reducedMotionFallback` 字段）。

## 分类导航

| 分类 | 目录 | 片段 |
|---|---|---|
| 背景动效 | `patterns/backgrounds/` | aurora-background（极光）、noise-grain（噪点颗粒）、particle-network（粒子连线）、gradient-mesh（渐变网格）、starfield（3D 星空） |
| 文字动效 | `patterns/text-effects/` | text-particle-converge（粒子文字汇聚）、per-char-reveal（逐字入场）、glitch-text（故障风）、text-scramble（乱码解码）、gradient-text-flow（流动渐变字） |
| 光标交互 | `patterns/cursor/` | magnetic-button（磁吸按钮）、cursor-trail（拖尾光标）、blend-mode-cursor（混合模式光标） |
| 滚动叙事 | `patterns/scroll/` | parallax-hero（视差 Hero）、reveal-on-scroll（滚动触发序列）、scroll-progress（进度条）、horizontal-scroll（横向 pin） |
| 图片特效 | `patterns/image/` | hover-distort（WebGL 置换变形）、mask-reveal（遮罩揭示）、ken-burns（Ken Burns 缓放） |
| 页面转场 | `patterns/transitions/` | page-wipe（遮罩擦除）、shared-element（共享元素 FLIP）、fade-slide-route（路由淡入滑动） |
| 生成艺术 | `patterns/generative-art/` | p5-flow-field（p5 流场）、seeded-random（种子随机）、canvas-noise-field（Perlin 噪声场） |
| 着色器 | `patterns/shaders/` | fragment-ripple（波纹）、noise-cloud-shader（fbm 云雾）、gradient-mesh-shader（plasma 渐变网格） |
| 艺术风格 | `patterns/styles/` | memphis-design（孟菲斯）、vaporwave（蒸汽波）、y2k-chrome（Y2K 铬感）、neumorphism（新拟态）、glassmorphism（玻璃拟态）、op-art（欧普视错觉⚠️光敏警告）、brutalism（粗野主义）、swiss-grid（瑞士网格）、impressionism（莫奈点彩）、van-gogh-swirl（梵高星夜）、ukiyo-e（浮世绘）、bauhaus（包豪斯）、pop-art（波普丝网） |

### 艺术风格的使用方式（styles 类特别说明）

styles 类与效果类不同：它交付的是**整套设计语言**（色板 token + 形状公式 + 排版规则 + 组件样式），而非单个动效。使用流程：

1. 按用户的风格描述（如「孟菲斯」「蒸汽波」「梵高那种笔触」）匹配 `tags` 命中风格套件；
2. 读取 pattern 文档拿到**设计 token**（全部集中在 `:root` CSS 变量）与风格铁律（如粗野主义禁模糊、包豪斯禁渐变、玻璃拟态必须有彩色底）；
3. 把 demo 页的 token 与组件样式搬进目标项目，替换成用户内容；
4. 注意各风格文档「Context」中的适用/禁用场景（如新拟态禁用于信息密集页、欧普有光敏警告）。

## 片段形式说明

- **React 片段（`.tsx`）**：函数组件，兼容 React 18+ / Next.js App Router（文件顶部已标 `"use client"`）。直接复制进项目即可使用。
- **原生片段（`.html`）**：单文件、内联 CSS/JS，**双击即可在浏览器打开预览**。WebGL / shader / p5 类片段采用此形式；注入 React 项目时，把 `<script>` 内的逻辑搬进 `useEffect`、DOM 结构搬进 JSX 即可（各 pattern 文档的 Approach 段有迁移提示）。

## 何时不使用本 skill

以下条目指的是「不注入动效/风格」，而**不是「不查阅本 skill」**——前端任务仍应先查索引做决策，只是决策结果为「保持朴素」时，要向用户说明原因而不是沉默地什么都不做。

- **用户明确要求极简、无动画**，或目标站点是政务/医疗等严肃场景：动效会伤害信息效率，不要注入（结论：推荐零动效或仅 scroll-progress 级别的功能性动效）。
- **项目禁用某技术**（如禁 Canvas、要求严格 CSP 不允许内联脚本）：先读 pattern 文档确认技术栈，冲突时换同类别其他片段或告知用户限制。
- **性能受限环境**：低端移动设备占比高的项目，避免同时注入多个 `performance: "high"` 片段（如 WebGL 置换 + 粒子文字叠加），一次页面最多一个重特效。
- **严格无障碍要求**：即便有 `prefers-reduced-motion` 降级，闪烁类效果（glitch-text）也可能触发不适，需用户明确确认。
- **只是要一个普通组件**（按钮、表单、表格）：本库是艺术动效库，不是组件库，不要滥用。

## 注入检查清单（注入后自查）

- [ ] `CONFIG` 参数是否已按用户的设计调过（颜色/速度/幅度）
- [ ] `prefers-reduced-motion` 降级分支是否保留
- [ ] 移动端是否按 pattern 文档的 Approach 段做了降级（如降低粒子数、禁用 hover 类效果）
- [ ] 是否向用户说明了降级表现与性能级别
