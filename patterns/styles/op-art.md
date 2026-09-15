# 欧普艺术风格（Op Art / Optical Art）

> **ID** `op-art` · **分类** styles · **性能** low-cost · **依赖** 无

## Context

60 年代 Bridget Riley / Victor Vasarely 的「眼睛被骗」艺术：黑白几何视错觉。冲击力极强，适合艺术展、先锋品牌、海报页的局部装饰。⚠️ **光敏/晕动警告**：视错觉的闪烁可能引发部分观者不适——页面同时最多一个欧普区域，绝不可全屏铺满，速度必须「缓慢」。

## Approach

- **设计 token**：近黑 `#0A0A0A` + 米白 `#F4F1EA`（都不用纯色，保留版画感）+ 唯一强调红 `#E63B2E`（全页 1~2 次，Vasarely 式点睛）。
- **三个视错觉母题**：① 同心圆干涉——两组 `repeating-radial-gradient` 错位叠加 + `mix-blend-mode: multiply`，一组缓慢缩放即产生莫尔水波；② 扭曲条纹——竖条纹缓慢平移 + 一条横向「透镜带」造成密度错觉；③ 波浪格——conic 棋盘格沿对角平移，被解读为 3D 起伏。
- **速度纪律**：动画周期 9~14s。欧普的「慢」是安全阈值，也是高级感来源——快了就是故障风。
- **降级**：`prefers-reduced-motion` 完全静止——静态莫尔/扭曲图案依然是成立的欧普版画。
- **迁移提示**：三个母题都是纯 CSS background，可独立摘出当 hero 装饰条（见 demo 的 `.op-strip` 用法）。

## Example

<!-- EMBED:START:snippets/styles/op-art.html -->
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>欧普艺术风格套件（Op Art / Optical Art）</title>
<!--
  欧普艺术风格套件：黑白几何视错觉——60 年代 Bridget Riley / Victor Vasarely 的
  "眼睛被骗"艺术。双击即可预览。
  ⚠️ 重要警告：欧普的闪烁与扭动可能引发部分观者不适（晕动/光敏）。
  本片段默认只做"缓慢"视错觉，且 prefers-reduced-motion 下完全静止。
  页面同时最多放一个欧普区域，绝不可全屏铺满。
-->
<style>
  /* ===== 设计 token 集中区 ===== */
  :root {
    --o-ink:    #0A0A0A;   /* 近黑：不用纯黑 #000，微微透一点更"版画" */
    --o-paper:  #F4F1EA;   /* 米白：同样不是纯白，纸感 */
    --o-accent: #E63B2E;   /* 唯一强调红：Vasarely 式的点睛，全页只允许出现 1~2 次 */
    --o-speed:  14s;       /* 动画周期：欧普的"慢"是安全阈值，再快就有光敏风险 */
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "PingFang SC", sans-serif;
    background: var(--o-paper);
    color: var(--o-ink);
    display: flex; flex-direction: column; align-items: center;
    gap: 40px; padding: 64px 20px;
  }
  .title { text-align: center; }
  .title h1 {
    font-family: "Arial Black", sans-serif;
    font-size: clamp(34px, 7vw, 68px); letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .title h1 span { color: var(--o-accent); }

  .gallery {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 28px; max-width: 920px; width: 100%;
  }
  .frame {
    aspect-ratio: 1; overflow: hidden;
    border: 3px solid var(--o-ink);
    position: relative;
  }
  .frame figcaption {
    position: absolute; left: 0; bottom: 0; z-index: 3;
    background: var(--o-ink); color: var(--o-paper);
    font-size: 12px; padding: 6px 12px; letter-spacing: 0.14em;
  }

  /* ---- 作品 1：同心圆呼吸（Riley 式）----
     原理：两组同心圆错位叠加，其中一组极缓慢缩放；
     人眼在"圆间距渐变"处无法稳定对焦 → 画面像水波一样晃 */
  .op-circles {
    position: absolute; inset: 0;
    background:
      repeating-radial-gradient(circle at 38% 40%, var(--o-ink) 0 10px, var(--o-paper) 10px 28px),
      repeating-radial-gradient(circle at 62% 60%, var(--o-ink) 0 10px, transparent 10px 28px);
  }
  .op-circles::after {
    content: ""; position: absolute; inset: -20%;
    background: repeating-radial-gradient(circle at 62% 60%, var(--o-ink) 0 10px, var(--o-paper) 10px 28px);
    animation: op-breathe var(--o-speed) ease-in-out infinite alternate;
    mix-blend-mode: multiply; /* 相乘混合让两组圆"干涉"出莫尔条纹 */
  }
  @keyframes op-breathe { from { transform: scale(1); } to { transform: scale(1.12); } }

  /* ---- 作品 2：扭曲线条（Vasarely 式）----
     原理：竖条纹 + 一段"相位扭曲"的重复背景横向极缓慢平移；
     条纹密度突变在大脑里被解读为"表面在扭转" */
  .op-twist {
    position: absolute; inset: 0;
    background: repeating-linear-gradient(
      90deg, var(--o-ink) 0 12px, var(--o-paper) 12px 30px
    );
    animation: op-slide calc(var(--o-speed) * 0.8) linear infinite;
  }
  /* 覆盖一条横向"透镜带"：正弦形状的透明渐变造成密度错觉 */
  .op-twist::after {
    content: ""; position: absolute; inset: 0;
    background: linear-gradient(90deg,
      transparent 0%, rgba(10,10,10,0.9) 18%, transparent 38%,
      transparent 62%, rgba(10,10,10,0.9) 82%, transparent 100%
    );
    mix-blend-mode: screen;
  }
  @keyframes op-slide { from { background-position: 0 0; } to { background-position: 60px 0; } }

  /* ---- 作品 3：方块网格起伏 ----
     原理：黑白格子按对角波次排布，波的相位随动画移动 → 看似 3D 起伏 */
  .op-grid {
    position: absolute; inset: -10%;
    background-image:
      conic-gradient(var(--o-ink) 25%, var(--o-paper) 0 50%, var(--o-ink) 0 75%, var(--o-paper) 0);
    background-size: 46px 46px;
    animation: op-wave calc(var(--o-speed) * 1.4) ease-in-out infinite alternate;
  }
  @keyframes op-wave { from { transform: translate(0,0) scale(1); } to { transform: translate(23px, 23px) scale(1.06); } }

  /* ---- 应用示例：欧普用作 hero 装饰条（克制用法） ---- */
  .op-strip {
    width: min(680px, 92vw); height: 64px;
    border: 3px solid var(--o-ink);
    background: repeating-linear-gradient(45deg, var(--o-ink) 0 10px, var(--o-paper) 10px 20px);
    animation: op-strip-move 9s linear infinite;
  }
  @keyframes op-strip-move { from { background-position: 0 0; } to { background-position: 56.5px 0; } }

  /* 降级：所有视错觉动画完全静止——静态莫尔/扭曲图案依然是成立的欧普版画 */
  @media (prefers-reduced-motion: reduce) {
    .op-circles::after, .op-twist, .op-grid, .op-strip { animation: none !important; }
  }
</style>
</head>
<body>
<header class="title">
  <h1>OP·ART <span>视错觉</span></h1>
  <p style="letter-spacing: 0.3em; font-size: 12px; margin-top: 8px;">盯着看十秒再移开视线 · 缓慢是最安全的速度</p>
</header>

<div class="gallery">
  <figure class="frame">
    <div class="op-circles"></div>
    <figcaption>01 · 同心干涉</figcaption>
  </figure>
  <figure class="frame">
    <div class="op-twist"></div>
    <figcaption>02 · 扭曲条纹</figcaption>
  </figure>
  <figure class="frame">
    <div class="op-grid"></div>
    <figcaption>03 · 波浪格</figcaption>
  </figure>
</div>

<div class="op-strip" role="presentation"></div>
</body>
</html>
```
<!-- EMBED:END -->
