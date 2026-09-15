# 波普艺术风格（Pop Art / Silkscreen）

> **ID** `pop-art` · **分类** styles · **性能** low-cost · **依赖** 无

## Context

Warhol 式丝网印刷四宫格 + 半调网点 + 漫画爆炸框。消费主义与大众文化的狂欢，冲击力顶格。适合潮流电商大促页、音乐节、娱乐营销。与孟菲斯的区别：波普靠「重复 + 重上色」说话，孟菲斯靠「几何装饰散布」说话。

## Approach

- **丝网四宫格**：同一图像 2×2 重复，四格四套双色（黄/品红/青、橘红/黑/黄……）——**重复本身是波普的宣言**。CSS 按 `nth-child` 切换 `--fg/--hi` 变量实现「重上色」，不是滤镜。
- **半调网点**：`radial-gradient` 小圆点平铺（7px 点 / 22px 网格）叠在色块上——放大印刷的「像素」，丝网质感的分辨率。背景速度线用 `repeating-conic-gradient` 放射漫画线。
- **爆炸框**：多角星 `clip-path` + 文字轻微 throb（0.9s 心跳缩放）。「POW!」式文案是波普的标点符号。
- **组件**：硬阴影按压按钮（`box-shadow: 6px 6px 0` 无模糊，与孟菲斯共享印刷语言）。
- **降级**：`prefers-reduced-motion` 停文字跳动——四宫格丝网本身是静态版画，毫无损失。
- **迁移提示**：demo 用纯 CSS 拼笑脸；真实项目把 `.face` 区域换成 `img` + 分色滤镜（`filter` 组合或 SVG feColorMatrix）即可丝网化任意图片。

## Example

<!-- EMBED:START:snippets/styles/pop-art.html -->
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>波普艺术风格套件（Pop Art / Silkscreen）</title>
<!--
  波普艺术风格套件：Warhol 式丝网印刷四宫格 + 半调网点 + 漫画框。
  双击即可预览。
  翻译关键：
  · 丝网印刷 = 每格只有 2~3 色的高反差重上色（不是滤镜）；
  · 同一图像重复 2×2，四格四套色——重复本身是波普的宣言；
  · 半调网点（halftone）：放大印刷的"像素"，用 radial-gradient 网点模拟；
  · 粗黑轮廓 + 漫画速度线 + 爆炸框文案。
-->
<style>
  /* ===== 设计 token 集中区 ===== */
  :root {
    /* 四宫格丝网配色：每格 [底色, 主色, 高光]。低明度高反差是丝网味 */
    --p-bg1: #FFE600; --p-fg1: #E6308C; --p-hi1: #00A8E8;  /* 黄底 / 品红 / 青 */
    --p-bg2: #FF5A36; --p-fg2: #1B1B1B; --p-hi2: #FFE600;  /* 橘红底 / 黑 / 黄 */
    --p-bg3: #00C1A9; --p-fg3: #7B2FBE; --p-hi3: #FFFFFF;  /* 青绿底 / 紫 / 白 */
    --p-bg4: #2B44FD; --p-fg4: #FF7BAC; --p-hi4: #FFE600;  /* 蓝底 / 粉 / 黄 */
    --p-ink: #111111;   /* 轮廓黑：所有线条的最粗档 */
    --p-dot: 7px;       /* 半调网点直径 */
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "Arial Black", "PingFang SC", sans-serif;
    background: #F2EAD9;
    color: var(--p-ink);
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center;
    padding: 56px 20px; gap: 42px;
  }

  /* ---- 四宫格：Warhol 丝网版式的标准形 ---- */
  .silkscreen {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    width: min(560px, 92vw);
  }
  .cell { aspect-ratio: 1; position: relative; overflow: hidden; border: 4px solid var(--p-ink); }

  /* 每格同一副"面孔"，四套色：CSS 变量按 nth-child 切换 */
  .cell:nth-child(1) { background: var(--p-bg1); --fg: var(--p-fg1); --hi: var(--p-hi1); }
  .cell:nth-child(2) { background: var(--p-bg2); --fg: var(--p-fg2); --hi: var(--p-hi2); }
  .cell:nth-child(3) { background: var(--p-bg3); --fg: var(--p-fg3); --hi: var(--p-hi3); }
  .cell:nth-child(4) { background: var(--p-bg4); --fg: var(--p-fg4); --hi: var(--p-hi4); }

  /* 面孔：纯 CSS 拼"波普笑脸"——圆脸 + 嘴 + 睫毛眼，都用 currentColor 级变量上色 */
  .face {
    position: absolute; inset: 12%;
    border-radius: 50%;
    background: var(--fg);
    /* 半调网点叠在脸上：丝网印刷的颗粒就是波普的"分辨率" */
    background-image: radial-gradient(rgba(255,255,255,0.35) var(--p-dot), transparent calc(var(--p-dot) + 1px));
    background-size: 22px 22px;
    border: 5px solid var(--p-ink);
  }
  .eye {
    position: absolute; top: 34%; width: 22%; height: 15%;
    background: var(--p-ink); border-radius: 50%;
  }
  .eye.l { left: 18%; } .eye.r { right: 18%; }
  /* 睫毛：三条短粗线，漫画式表情符号 */
  .eye::before, .eye::after {
    content: ""; position: absolute; top: -12px; width: 4px; height: 12px;
    background: var(--p-ink); border-radius: 2px;
  }
  .eye::before { left: 4px; transform: rotate(-18deg); }
  .eye::after  { right: 4px; transform: rotate(18deg); }

  .mouth {
    position: absolute; left: 50%; bottom: 20%;
    width: 46%; height: 22%;
    transform: translateX(-50%);
    background: var(--hi);
    border: 5px solid var(--p-ink);
    border-radius: 8px 8px 999px 999px;
  }
  /* 张嘴的"惊讶/大笑"是波普表情的默认值 */
  .mouth::after {
    content: ""; position: absolute; left: 8px; right: 8px; bottom: 6px; height: 8px;
    background: var(--p-ink); border-radius: 999px; opacity: 0.7;
  }

  /* 背景速度线：放射状漫画线，用重复锥形渐变 */
  .cell::before {
    content: ""; position: absolute; inset: 0;
    background: repeating-conic-gradient(
      from 0deg at 50% 46%,
      rgba(17,17,17,0.16) 0deg 3deg, transparent 3deg 15deg
    );
  }

  /* ---- 爆炸框文案：漫画的 "POW!" ---- */
  .burst {
    position: relative;
    font-size: clamp(34px, 7vw, 64px);
    text-transform: uppercase;
    padding: 26px 44px;
    /* 星形爆炸框：clip-path 多角星 */
    clip-path: polygon(
      50% 0%, 58% 12%, 72% 4%, 74% 18%, 90% 16%, 86% 32%,
      100% 40%, 88% 50%, 100% 60%, 86% 68%, 90% 84%, 74% 82%,
      72% 96%, 58% 88%, 50% 100%, 42% 88%, 28% 96%, 26% 82%,
      10% 84%, 14% 68%, 0% 60%, 12% 50%, 0% 40%, 14% 32%,
      10% 16%, 26% 18%, 28% 4%, 42% 12%
    );
    background: var(--p-fg2);
    color: var(--p-bg1);
    transform: rotate(-3deg);
    letter-spacing: 0.04em;
  }
  .burst span { display: inline-block; animation: pop-throb 0.9s ease-in-out infinite alternate; }
  @keyframes pop-throb { from { transform: scale(1); } to { transform: scale(1.08) rotate(2deg); } }

  /* ---- 应用：波普按钮 ---- */
  .p-btn {
    font-family: inherit; font-size: 16px; text-transform: uppercase; cursor: pointer;
    background: var(--p-bg1); color: var(--p-ink);
    border: 4px solid var(--p-ink);
    box-shadow: 6px 6px 0 var(--p-ink);   /* 硬阴影：与孟菲斯共享的印刷语言 */
    padding: 14px 30px;
    transition: transform 0.1s linear, box-shadow 0.1s linear;
  }
  .p-btn:hover { transform: translate(2px, 2px); box-shadow: 4px 4px 0 var(--p-ink); }
  .p-btn:active { transform: translate(6px, 6px); box-shadow: 0 0 0 var(--p-ink); }
  .p-btn:focus-visible { outline: 3px dashed var(--p-fg1); outline-offset: 5px; }

  /* 降级：爆炸框文字停止跳动——四宫格丝网本身是静态版画 */
  @media (prefers-reduced-motion: reduce) {
    .burst span { animation: none !important; }
    .p-btn { transition: none !important; }
  }
</style>
</head>
<body>

<div class="silkscreen" role="img" aria-label="波普丝网四宫格：同一张笑脸以四套双色印制">
  <div class="cell"><div class="face"><div class="eye l"></div><div class="eye r"></div><div class="mouth"></div></div></div>
  <div class="cell"><div class="face"><div class="eye l"></div><div class="eye r"></div><div class="mouth"></div></div></div>
  <div class="cell"><div class="face"><div class="eye l"></div><div class="eye r"></div><div class="mouth"></div></div></div>
  <div class="cell"><div class="face"><div class="eye l"></div><div class="eye r"></div><div class="mouth"></div></div></div>
</div>

<div class="burst"><span>POP!</span></div>

<div style="display:flex; gap: 18px; flex-wrap: wrap; justify-content: center;">
  <button class="p-btn">消费艺术</button>
  <button class="p-btn" style="background: var(--p-bg4); color: #fff;">再来一件</button>
</div>

</body>
</html>
```
<!-- EMBED:END -->
