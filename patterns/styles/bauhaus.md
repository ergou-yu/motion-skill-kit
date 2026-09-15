# 包豪斯风格（Bauhaus）

> **ID** `bauhaus` · **分类** styles · **性能** low-cost · **依赖** 无

## Context

1919–1933 德绍包豪斯：红黄蓝三原色 + 圆方三角三原形 + 网格构成。现代设计教育的起点，百年不过时。适合设计机构、建筑/家具品牌、教育产品、极简海报。包豪斯的立场：抽象掉一切叙事，只留色彩、形式、比例的关系。

## Approach

- **设计 token**：包豪斯红 `#D02A1F`（偏橘）/ 芥末黄 `#F0A80C` / 普鲁士蓝 `#1F4B8E` + 结构黑 + 米白纸底。**三戒律：禁渐变、禁阴影、禁照片**——形式自身的比例就是全部内容。
- **构成方法**：6×6 等距网格上拼形状；大圆偏离中心压轴线（视觉主体）、1/4 圆占角（`border-radius: 100% 0 0 0` 是包豪斯招牌形状）、水平杆稳定构图、三角用 `clip-path`。间隙统一——网格纪律。
- **排版**：Futura（或开源替代 Jost / Century Gothic）+ 全大写 + 宽字距。
- **动效立场**：只有「旋转」是被允许的包豪斯动效——形式自身的运动（demo 里 1/4 圆以角落为轴 26s 一圈）。
- **降级**：`prefers-reduced-motion` 停转——静态构成本来就是包豪斯的主形态。
- **迁移提示**：构成块都是 div + CSS，注入 React 后可参数化形状位置生成系列海报。

## Example

<!-- EMBED:START:snippets/styles/bauhaus.html -->
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>包豪斯风格套件（Bauhaus）</title>
<!--
  包豪斯风格套件（1919-1933 德绍时期）：红黄蓝黑四原色 +
  圆方三角三原形 + 网格构成。双击即可预览。
  翻译关键：包豪斯是"设计的基础课程"——抽象掉一切叙事，
  只留色彩、形式、比例三者的关系。禁止渐变、禁止阴影、禁止照片。
-->
<style>
  /* ===== 设计 token 集中区 ===== */
  :root {
    --ba-red:    #D02A1F;   /* 包豪斯红：偏橘的正红 */
    --ba-yellow: #F0A80C;   /* 包豪斯黄：芥末黄而非柠檬黄 */
    --ba-blue:   #1F4B8E;   /* 包豪斯蓝：普鲁士蓝 */
    --ba-ink:    #141414;   /* 结构黑：线条与文字 */
    --ba-paper:  #EFE9DC;   /* 米白底：包豪斯海报纸 */
    --ba-gap: 14px;         /* 构成间隙：所有形状之间等距——网格纪律 */
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "Futura", "Century Gothic", "PingFang SC", sans-serif;
    background: var(--ba-paper);
    color: var(--ba-ink);
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center;
    padding: 56px 20px; gap: 40px;
  }

  /* ---- 构成海报：一个 grid 拼出的经典包豪斯构图 ---- */
  .poster {
    width: min(680px, 92vw);
    aspect-ratio: 3 / 4;
    display: grid;
    /* 6×6 等分网格：包豪斯构成的基础母题（可换成 4×4 / 8×8） */
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(6, 1fr);
    gap: var(--ba-gap);
    padding: var(--ba-gap);
    background: var(--ba-paper);
    border: 3px solid var(--ba-ink);
  }
  /* 形状通用：无圆角、无阴影、无渐变——形式的三戒律 */
  .shape { position: relative; }
  .red   { background: var(--ba-red); }
  .blue  { background: var(--ba-blue); }
  .yellow { background: var(--ba-yellow); }
  .ink   { background: var(--ba-ink); }

  .s-circle { border-radius: 50%; }                    /* 圆 */
  .s-quarter { border-radius: 100% 0 0 0; }             /* 1/4 圆：包豪斯的招牌形状 */
  .s-half-h  { border-radius: 999px 999px 0 0; }        /* 半圆拱 */

  /* 构图布局：大圆压轴线 + 1/4 圆角落 + 横竖杆件 */
  .big-circle { grid-column: 2 / 6; grid-row: 1 / 4; }  /* 视觉主体：偏离中心的大圆 */
  .quarter-1  { grid-column: 1 / 3; grid-row: 4 / 7; }
  .bar-h      { grid-column: 3 / 7; grid-row: 4 / 5; }  /* 水平杆：稳定构图 */
  .tri-block  { grid-column: 4 / 7; grid-row: 5 / 7;
                /* 三角形：clip-path 是包豪斯三角的唯一网页画法 */
                clip-path: polygon(50% 0, 100% 100%, 0 100%); }
  .small-sq   { grid-column: 3 / 4; grid-row: 5 / 7; }
  .v-bar      { grid-column: 1 / 2; grid-row: 1 / 4; }

  /* 微动效：只有"旋转"是被允许的包豪斯动效——形式自身的运动 */
  .s-quarter.quarter-1 { animation: ba-rotate 26s linear infinite; transform-origin: 0 100%; }
  @keyframes ba-rotate { to { transform: rotate(360deg); } }
  /* 大圆极缓慢自转看不出（正圆），改用内部标线的做法见下 */

  /* ---- 应用区：包豪斯排版组件 ---- */
  .ba-section {
    width: min(680px, 92vw);
    display: grid; grid-template-columns: auto 1fr; gap: 22px; align-items: center;
  }
  .ba-num {
    width: 58px; height: 58px; display: grid; place-items: center;
    font-size: 22px; font-weight: 700; color: var(--ba-paper);
  }
  .ba-section h2 { font-size: 17px; letter-spacing: 0.12em; text-transform: uppercase; }
  .ba-section p  { font-size: 13.5px; line-height: 1.8; color: #4a4a42; margin-top: 4px; }

  /* 包豪斯按钮：色块 + 黑描边 + 按下平移（无阴影渐变） */
  .ba-btn {
    font-family: inherit; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
    font-size: 14px; cursor: pointer;
    background: var(--ba-red); color: var(--ba-paper);
    border: 3px solid var(--ba-ink);
    padding: 14px 30px;
    transition: transform 0.1s linear;
  }
  .ba-btn:hover { background: var(--ba-yellow); color: var(--ba-ink); }
  .ba-btn:active { transform: translate(3px, 3px); }
  .ba-btn:focus-visible { outline: 3px solid var(--ba-blue); outline-offset: 3px; }

  .ba-footer { display: flex; gap: 18px; }

  /* 降级：1/4 圆停转。静态构成本来就是包豪斯的主形态 */
  @media (prefers-reduced-motion: reduce) {
    .s-quarter.quarter-1 { animation: none !important; }
    .ba-btn { transition: none !important; }
  }
</style>
</head>
<body>

<div class="poster" role="img" aria-label="包豪斯构成海报：红圆、蓝四分之一圆、黄横杆与黑三角">
  <div class="shape ink v-bar"></div>
  <div class="shape red s-circle big-circle"></div>
  <div class="shape yellow bar-h"></div>
  <div class="shape blue s-quarter quarter-1"></div>
  <div class="shape ink small-sq"></div>
  <div class="shape red tri-block"></div>
</div>

<div class="ba-section">
  <div class="ba-num red">01</div>
  <div>
    <h2>三原色三原形</h2>
    <p>红黄蓝 + 圆方三角。包豪斯基础课程的全部家当——任何复杂设计都能拆回这六个元素。</p>
  </div>
</div>

<div class="ba-section">
  <div class="ba-num blue">02</div>
  <div>
    <h2>网格构成</h2>
    <p>形状在等距网格上拼合，间隙统一。禁止渐变、阴影、照片：形式自身的比例就是全部内容。</p>
  </div>
</div>

<div class="ba-section">
  <div class="ba-num yellow" style="color: var(--ba-ink);">03</div>
  <div>
    <h2>无衬线大写</h2>
    <p>Futura 是包豪斯的老搭档；现代项目用 Futura 替代品（Jost / Century Gothic）即可。</p>
  </div>
</div>

<div class="ba-footer">
  <button class="ba-btn">Form</button>
  <button class="ba-btn" style="background: var(--ba-blue);">Farbe</button>
</div>

</body>
</html>
```
<!-- EMBED:END -->
