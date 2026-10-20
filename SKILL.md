---
name: motion-skill-kit
description: 前端页面视觉设计、UI 改版与艺术动效技能。用于设计或改善页面的层级、布局间距、文字、配色、图片、组件状态，以及选择艺术风格、滚动叙事、光标和转场效果。先处理内容与可用性，再按需检索 50 个片段（29 个效果、21 套风格）；包含 Refactoring UI 的简明主题导航、原创实施规范、CSS 参数模板和设计验收流程。普通组件可只用设计基础，无需添加动效；不用于纯后端或与视觉无关的任务。
---

# motion-skill-kit：前端视觉设计与艺术动效

一套供 AI Agent（或人类开发者）执行页面视觉设计、审查界面并检索动效与风格片段的技能库。先让内容、操作和阅读关系清楚，再用合适的艺术表达提升辨识度。

## 设计基础与按需阅读

新页面、UI 改版或“页面不好看但说不清原因”的任务，先读 [页面设计执行入口](references/ui-foundations.md)。仅增加某个效果时，按该效果涉及的区域读取相关基础，不要求重做整页。

| 任务 | 读取材料 |
|---|---|
| 需求转页面、气质与方案比较、与现有设计系统衔接 | [任务与执行流程](references/ui-foundations.md) |
| 层级、标签与数值权重、分组、尺寸档位、表格与响应式 | [层级与布局](references/ui-layout.md) |
| 字体、混排、字号嵌套、行距、颜色角色与状态配对 | [文字与颜色](references/ui-type-color.md) |
| 交互阴影、表面、图片尺寸、上传内容、背景和空状态 | [层次与媒体](references/ui-depth-media.md) |
| 页面完成后的视觉与交互检查、持续学习 | [设计验收](references/ui-review.md) |
| 查询学习来源与原书主题 | [Refactoring UI 来源与范围](references/refactoring-ui-source.md) |
| 为缺少设计变量的项目建立起点 | [原创 CSS 参数模板](templates/ui-foundation-tokens.css) |

机器检索入口是 `data/foundations.json`，按 `tags` 与 `topics` 定位材料；动效继续使用 `data/index.json` 的 `snippets` 数组。基础材料不计入 50 个片段。

执行顺序：**理解任务与真实内容 → 建立静态层级和布局 → 明确字体与颜色角色 → 按需选风格与动效 → 检查状态及目标视口**。既有项目优先复用其设计系统。用户要普通组件或无动画页面时，设计基础仍可使用。

《Refactoring UI》的 218 页阅读覆盖、方法与回查入口见 [来源说明](references/refactoring-ui-source.md)。实施材料按项目问题整理，包含本库的工程补充；书中的示例参数不自动成为项目硬约束，需要章节细节时回查原书。

## 核心原则（注入前必读）

1. **优先原生实现**：大部分片段使用原生 CSS / Canvas / Web Animations API / IntersectionObserver / WebGL；`p5-flow-field` 依赖 p5.js CDN，React 片段要求目标项目已有 React。无需额外安装 GSAP、Framer Motion；查索引的 `dependencies` 与源码确认实际依赖。
2. **参数集中在文件顶部**：效果类片段的视觉参数（颜色、速度、幅度、密度）定义在顶部 `CONFIG` 常量对象；艺术风格套件（styles 类）的设计 token 定义在 `:root` CSS 变量块。按用户需求调参时**只改这些参数区，不改实现逻辑**。
3. **必须保留 `prefers-reduced-motion` 降级**：每个片段都内置了降级逻辑（静态渐变、直接显示最终状态等）。注入后若为节省代码删掉降级分支，视为违规注入。
4. **中文注释解释「为什么」**：片段内的注释解释设计动机（如为什么用 transform 而非 top/left、为什么要节流），注入时可以按目标项目风格改写注释，但不要丢失这些关键信息。

## 主动触发与自动选型策略

### 何时主动触发

任务涉及前端视觉设计时使用本 skill——包括写组件、搭页面、做落地页/官网/H5、改版后台界面和生成原型。先判断是基础设计问题还是效果需求，再选需要的材料；与视觉无关的前端逻辑修改不必套用这套流程。

注意「使用本 skill」= 查阅相关材料并做出**有依据的视觉决策**，不等于「必须注入动效」。查询后得出「本次保持朴素、零动效」同样是合法结论（见「何时不注入艺术效果」）。

### 用户未指明风格时的选型流程

1. **先看用户是否给了氛围词**：「炫酷/科技感」可参考暗色系；「高级/克制」可参考 swiss-grid；「可爱/活泼」可参考 memphis；「复古/潮流」可参考 vaporwave / y2k-chrome / pop-art；「东方/国风」结合内容比较 ink-wash 等候选。这些是候选方向，已有品牌与真实内容优先，不按行业机械套风格。
2. **用户点名了风格但索引查无命中** → 直接跳转下方「未收录风格的扩展流程」（联网调研 → 实现 → 回写入库）。
3. **没有氛围词则按内容类型查下表**（风格 + 动效一起定，避免风格与动效气质打架）：

| 内容类型 | 推荐风格 | 推荐动效组合 |
|---|---|---|
| 科技 / AI / SaaS 官网 | 暗色 + aurora-background 或 gradient-mesh | per-char-reveal + parallax-hero + magnetic-button |
| 开发者工具 / 文档站 | brutalism 或 swiss-grid | reveal-on-scroll + scroll-progress |
| 创意机构 / 作品集 | swiss-grid 或 memphis | blend-mode-cursor + shared-element + mask-reveal |
| 电商大促 / 活动页 | pop-art 或 y2k-chrome | marquee（brutalism 内置）+ hover-distort |
| 音乐 / 夜生活 / 潮流 | vaporwave | gradient-text-flow + noise-grain |
| 艺术 / 文化 / 展览 | ukiyo-e / 印象派 | mask-reveal + fade-slide-route + ken-burns |
| 教育 / 轻松向产品 | memphis | per-char-reveal + reveal-on-scroll |
| 高端 B2B / 金融 / 法律 | swiss-grid | 仅 reveal-on-scroll + scroll-progress（克制） |
| 冥想 / 健康 / 生活方式 | impressionism 或 aurora-background | ken-burns + noise-grain |
| 游戏 / 科幻 | starfield 或 shaders 类 | text-particle-converge + text-scramble |

4. **完全无法判断时先保持静态**：建立清楚的层级、间距和字体颜色角色。只有入场、阅读进度等效果能改善当前任务时才选择相应片段，不默认叠加动画包。
5. **性能预算约束**：整页 `performance: high` 片段最多 1 个、`medium` 最多 2 个；风格套件与背景动效不要同时上两个重量级。
6. **向用户透明**：用具体的内容与任务解释主要视觉选择；不必每次列备选，也不必等待用户确认常规、可逆的实现选择。

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

- 先生成可预览的 demo 检查方向；已有明确项目实施授权时继续注入，不把预览自动变成一次额外审批；
- 注入时同样只改 token 区，不动实现。

### 第 4 步：回写入库（skill 增长——不可省略）

1. snippet 放 `snippets/styles/<id>.html`；
2. 文档放 `patterns/styles/<id>.md`，三段式 Context（风格历史与适用场景，注明资料来源）/ Approach（token + 铁律 + 降级）/ Example（写 EMBED 锚点，见 README）；
3. `data/index.json` 的 `snippets` 数组追加记录（tags 里包含风格的中英文名与别名）；
4. 若是全新分类（不只是 styles），同步更新 `scripts/validate.ts` 的 `CATEGORIES` 白名单与 `SKILL.md` 导航表；
5. 跑 `npm run build:docs && npm run validate`，全绿即入库；
6. 同步需要的版本元数据；按当前项目约定提交。远端推送只在用户授权范围内进行，不推断安装路径为符号链接，也不声称其他副本已同步；
7. 告知用户新增文件与可调用的名称；只有实际完成提交时才报告 commit。

### 扩展的纪律

- 一个风格套件控制在 150~250 行：demo 是「设计语言样板」不是完整网站；
- 调研结论必须来自搜索到的一手资料，禁止把「我猜」写成「教程指出」；
- 高风险风格（光敏闪烁类）即使收录也要在文档 Context 里保留警告。

## 检索流程（Agent 按此步骤操作）

0. **先判断问题**：基础视觉问题先查 `data/foundations.json`，按需读取材料；有风格或动效需求时再走上方选型策略。用户已经指定某效果时直接检索该效果。
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
| 艺术风格 | `patterns/styles/` | memphis-design（孟菲斯）、vaporwave（蒸汽波）、y2k-chrome（Y2K 铬感）、neumorphism（新拟态）、glassmorphism（玻璃拟态）、op-art（欧普视错觉⚠️光敏警告）、brutalism（粗野主义）、swiss-grid（瑞士网格）、impressionism（莫奈点彩）、van-gogh-swirl（梵高星夜）、ukiyo-e（浮世绘）、bauhaus（包豪斯）、pop-art（波普丝网）、acid-graphics（酸性设计）、cyberpunk（赛博朋克）、frutiger-aero（Web 2.0 光泽）、claymorphism（黏土拟态）、art-deco（装饰艺术）、ink-wash（新中式水墨）、pixel-art（像素风）、chinese-horror（中式恐怖⚠️低频惊吓） |

### 艺术风格的使用方式（styles 类特别说明）

styles 类与效果类不同：它交付的是**整套设计语言**（色板 token + 形状公式 + 排版规则 + 组件样式），而非单个动效。使用流程：

1. 按用户的风格描述（如「孟菲斯」「蒸汽波」「梵高那种笔触」）匹配 `tags` 命中风格套件；
2. 读取 pattern 文档拿到**设计 token**（全部集中在 `:root` CSS 变量）与风格铁律（如粗野主义禁模糊、包豪斯禁渐变、玻璃拟态必须有彩色底）；
3. 把 demo 页的 token 与组件样式搬进目标项目，替换成用户内容；
4. 注意各风格文档「Context」中的适用/禁用场景（如新拟态禁用于信息密集页、欧普有光敏警告）。

## 片段形式说明

- **React 片段（`.tsx`）**：函数组件，兼容 React 18+ / Next.js App Router（文件顶部已标 `"use client"`）。直接复制进项目即可使用。
- **原生片段（`.html`）**：单文件、内联 CSS/JS，**双击即可在浏览器打开预览**。WebGL / shader / p5 类片段采用此形式；注入 React 项目时，把 `<script>` 内的逻辑搬进 `useEffect`、DOM 结构搬进 JSX 即可（各 pattern 文档的 Approach 段有迁移提示）。

## 何时不注入艺术效果

以下情况可只用设计基础、保持静态；选择需要的材料即可，无需为了触发 skill 遍历全部动效索引。与视觉无关的修改不适用本节。

- **用户明确要求极简、无动画**，或目标站点是政务/医疗等严肃场景：动效会伤害信息效率，不要注入（结论：推荐零动效或仅 scroll-progress 级别的功能性动效）。
- **项目禁用某技术**（如禁 Canvas、要求严格 CSP 不允许内联脚本）：先读 pattern 文档确认技术栈，冲突时换同类别其他片段或告知用户限制。
- **性能受限环境**：低端移动设备占比高的项目，避免同时注入多个 `performance: "high"` 片段（如 WebGL 置换 + 粒子文字叠加），一次页面最多一个重特效。
- **严格无障碍要求**：即便有 `prefers-reduced-motion` 降级，闪烁类效果（glitch-text）也可能触发不适，需用户明确确认。
- **只是要一个普通组件**（按钮、表单、表格）：按需使用设计基础，复用项目组件；不要为使用片段而强行添加艺术效果。

## 注入检查清单（注入后自查）

- [ ] 主要任务、阅读顺序与操作层级是否清楚，分组与间距是否表达归属
- [ ] 字体、颜色和表面是否复用已有设计系统；更改配色后是否检查相关对比
- [ ] 本次涉及的长内容、窄屏、聚焦、空与错误状态是否可用（按 [设计验收](references/ui-review.md) 选择检查项）
- [ ] `CONFIG` 参数是否已按用户的设计调过（颜色/速度/幅度）
- [ ] `prefers-reduced-motion` 降级分支是否保留
- [ ] 移动端是否按 pattern 文档的 Approach 段做了降级（如降低粒子数、禁用 hover 类效果）
- [ ] 是否向用户说明了降级表现与性能级别
- [ ] 若本次为用户实现了库中不存在的风格/效果，是否已回写文档、片段和索引，并按项目约定处理版本与提交
