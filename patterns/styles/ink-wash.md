# 新中式水墨（Ink Wash）

> **ID** `ink-wash` · **分类** styles · **性能** low-cost · **依赖** 无

## Context

宣纸留白、墨分五色、朱砂一点、宋体排版的东方美学。「计白当黑」——留白是构图的一半而非空旷。适合茶/酒/香/文创/书院/文旅/高端地产（东方线）。与浮世绘的分界：水墨是「墨的浓淡干湿」（一套色阶），浮世绘是「色板的分层」（多套纯色）。

## Approach

- **设计 token**：宣纸暖白底 `#F4F0E6` + 墨色四阶（浓墨 `#1A1A18` 立骨 / 重墨行文 / 淡墨作注 / 飞白为界）+ 朱砂 `#B03A2E` **全页唯一彩色，只给印章**。
- **墨晕配方**：径向渐变 + 大半径 `blur(18px)`（「洇」的本体）；远山 = 三层不同透明度的 SVG 三角 + 1.5px blur，浓淡表现远近。
- **笔触线**：两端透明的渐变 + 微旋转 -0.3°（手绘的笔触永远不完全水平）。
- **排版**：宋体（横细竖粗，印刷术的正统）+ 行高 2.4 + 首字下沉（古籍起首字）+ `writing-mode: vertical-rl` 竖排引言与主标题纵横对照；内容偏居左、右侧整片留白（那是山、是水、是观者的想象）。
- **交互**：按钮 hover 晕开两圈淡墨（墨滴入水）；印章带 `rotate(2deg)` 的手工落印感。
- **降级**：`prefers-reduced-motion` 停墨晕呼吸——静态浓淡布局本身就是一幅完整水墨构图。

## Example

<!-- EMBED:START:snippets/styles/ink-wash.html -->
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>新中式水墨风格套件（Ink Wash）</title>
<!--
  新中式水墨套件：宣纸留白、墨分五色、朱砂一点、书法气质。
  双击即可预览。风格要素（源自中式网页设计案例总结）：
  墨晕用透明度渐变 + blur 模拟；留白是"计白当黑"的构图而非空旷；
  朱砂红全页只允许一处（印章/落款）。
  与浮世绘的分界：水墨是"墨的浓淡干湿"，浮世绘是"色板的分层"。
-->
<style>
  /* ===== 设计 token 集中区 ===== */
  :root {
    --iw-paper:   #F4F0E6;    /* 宣纸底：暖白偏黄，不是冷白 */
    --iw-ink-1:   #1A1A18;    /* 浓墨：标题与主体 */
    --iw-ink-2:   #5A5A54;    /* 重墨：正文 */
    --iw-ink-3:   #9C9C93;    /* 淡墨：辅助信息 */
    --iw-ink-4:   #D5D2C8;    /* 飞白：极淡的墨痕/分隔 */
    --iw-cinnabar:#B03A2E;    /* 朱砂：全页唯一彩色，只给印章 */
    --iw-serif:   "Songti SC", "Noto Serif SC", SimSun, serif; /* 宋体：横细竖粗，印刷术的正统 */
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: var(--iw-serif);
    background: var(--iw-paper);
    color: var(--iw-ink-2);
    min-height: 100vh;
    /* 宣纸肌理：极淡的噪点让纸"是纸" */
    background-image: radial-gradient(rgba(90, 90, 84, 0.05) 1px, transparent 1px);
    background-size: 26px 26px;
    display: flex; justify-content: center;
    padding: 72px 24px;
  }
  .page {
    width: min(760px, 100%);
    /* 计白当黑：内容偏左，右侧整片留白是中国画呼吸的地方 */
    padding-right: 18%;
    position: relative;
  }

  /* ---- 远山：三层墨色叠出的山影（filter: blur 让边缘"晕开"） ---- */
  .mountains {
    position: absolute; top: -40px; right: -40px;
    width: 300px; height: 150px; z-index: 0; pointer-events: none;
    filter: blur(1.5px); /* 墨在宣纸上洇开的一毫米 */
    opacity: 0.9;
  }
  /* 墨云：一团大而淡的墨晕在标题后方，"背景的呼吸" */
  .ink-blot {
    position: absolute; top: 10px; left: -60px;
    width: 260px; height: 200px; z-index: 0; pointer-events: none;
    background: radial-gradient(ellipse at 50% 50%,
      rgba(26, 26, 24, 0.16) 0%, rgba(26, 26, 24, 0.10) 38%, transparent 68%);
    filter: blur(18px); /* 大 blur 是"洇"的本体：墨量随距离衰减 */
    animation: ink-breathe 12s ease-in-out infinite;
  }
  @keyframes ink-breathe {
    /* 墨晕极缓慢地浓淡变化：像纸在潮气里呼吸，几乎不可察觉 */
    0%, 100% { opacity: 0.8; transform: scale(1); }
    50%      { opacity: 1;   transform: scale(1.05); }
  }

  /* ---- 标题：大号浓墨 + 竖排引言 ---- */
  h1 {
    position: relative; z-index: 1;
    font-size: clamp(40px, 8vw, 72px);
    font-weight: 700;
    color: var(--iw-ink-1);
    letter-spacing: 0.18em;
    line-height: 1.25;
  }
  .vertical-quote {
    position: absolute; top: 4px; left: min(400px, 52%); z-index: 1;
    writing-mode: vertical-rl;  /* 竖排：从右往左读，与主标题形成纵横对照 */
    font-size: 17px; letter-spacing: 0.5em;
    color: var(--iw-ink-3);
    border-left: 1px solid var(--iw-ink-4); /* 一线为界：竖排的"栏" */
    padding-left: 14px;
    height: 300px;
  }

  /* ---- 正文 ---- */
  .content { position: relative; z-index: 1; margin-top: 48px; }
  .content p {
    font-size: 15px; line-height: 2.4;          /* 行高 2.4：字距疏朗是文人气 */
    letter-spacing: 0.06em;
    margin-bottom: 26px;
    text-align: justify;
  }
  .content p:first-of-type::first-letter {
    /* 首字放大：古籍"起首字"的网页化 */
    font-size: 2.6em; float: left; line-height: 1;
    margin: 6px 12px 0 0; color: var(--iw-ink-1); font-weight: 700;
  }

  /* ---- 墨线分隔：一条"笔触"横线，两端飞白 ---- */
  .brush-rule {
    height: 3px; margin: 40px 0;
    background: linear-gradient(90deg,
      transparent, rgba(26,26,24,0.15) 8%, rgba(26,26,24,0.7) 30%,
      rgba(26,26,24,0.7) 70%, rgba(26,26,24,0.15) 92%, transparent);
    /* 微微歪斜：手绘的笔触永远不完全水平 */
    transform: rotate(-0.3deg);
  }

  /* ---- 印章：朱砂方印 + 篆刻白字，全页唯一的颜色 ---- */
  .seal {
    display: inline-flex; align-items: center; justify-content: center;
    width: 64px; height: 64px;
    background: var(--iw-cinnabar);
    color: var(--iw-paper);
    writing-mode: vertical-rl;
    font-size: 17px; letter-spacing: 0.2em; font-weight: 700;
    border-radius: 4px;
    /* 印泥质感：一点点内阴影 + 四角微缺（border-radius 不均匀） */
    box-shadow: inset 0 0 6px rgba(120, 20, 10, 0.55);
    transform: rotate(2deg);
    margin-top: 28px;
  }

  /* ---- 墨点按钮：浓墨圆点 + hover 洇开 ---- */
  .iw-btn {
    font-family: var(--iw-serif); font-size: 15px; letter-spacing: 0.3em; text-indent: 0.3em;
    cursor: pointer;
    color: var(--iw-paper);
    background: var(--iw-ink-1);
    border: none;
    padding: 14px 38px;
    border-radius: 999px;
    position: relative;
    transition: box-shadow 0.4s ease;
  }
  .iw-btn:hover {
    /* 洇墨：hover 时外围晕开一圈淡墨，墨滴入水的意象 */
    box-shadow: 0 0 0 10px rgba(26, 26, 24, 0.08), 0 0 0 20px rgba(26, 26, 24, 0.04);
  }
  .iw-btn:focus-visible { outline: 2px dashed var(--iw-cinnabar); outline-offset: 6px; }

  /* 降级：墨晕呼吸停止——静态的浓淡布局本身就是一幅完整的水墨构图 */
  @media (prefers-reduced-motion: reduce) {
    .ink-blot { animation: none !important; }
    .iw-btn { transition: none !important; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- 远山：三个墨色三角，浓淡表现远近 -->
  <svg class="mountains" viewBox="0 0 300 150" aria-hidden="true">
    <path d="M0,150 L90,52 L180,150 Z"  fill="rgba(26,26,24,0.10)"/>  <!-- 淡墨：远 -->
    <path d="M80,150 L170,30 L260,150 Z" fill="rgba(26,26,24,0.20)"/> <!-- 中墨：中 -->
    <path d="M170,150 L240,66 L300,150 Z" fill="rgba(26,26,24,0.34)"/><!-- 重墨：近 -->
  </svg>
  <div class="ink-blot" aria-hidden="true"></div>

  <h1>计白当黑</h1>
  <div class="vertical-quote">墨分五色 · 气韵生动</div>

  <div class="content">
    <p>
      水墨的气质不在墨，在白。留白不是"没画的地方"，而是构图的另一半——
      所以本页内容偏居左侧，右侧整片空着：那是山，是水，是雾，是观者自己的想象。
    </p>
    <p>
      墨只用一套色阶：浓墨立骨（标题）、重墨行文、淡墨作注、飞白为界。
      全页唯一彩色是朱砂，且只给印章一处——少即是多，正是"新中式"的新。
    </p>

    <div class="brush-rule" aria-hidden="true"></div>

    <p style="color: var(--iw-ink-3); font-size: 14px;">
      墨晕 = 径向渐变 + 大半径 blur；笔触线 = 两端透明的渐变 + 微旋转；
      宣纸 = 暖白底 + 极淡噪点。三件套齐，水墨的"纸感"就成了。
    </p>

    <div style="display:flex; align-items:flex-end; gap:32px; flex-wrap:wrap;">
      <button class="iw-btn">落笔</button>
      <span class="seal">墨者</span>
    </div>
  </div>

</div>
</body>
</html>
```
<!-- EMBED:END -->
