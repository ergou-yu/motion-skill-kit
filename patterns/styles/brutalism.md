# 粗野主义风格（Brutalism Web）

> **ID** `brutalism` · **分类** styles · **性能** low-cost · **依赖** 无

## Context

把混凝土建筑的「裸露结构」搬进网页：粗边框、硬阴影、系统等宽字体、高饱和撞色、零圆角零渐变零模糊。Figma/Gumroad 早期、Bloomberg 特稿都在用。适合开发者工具、独立产品、宣言式落地页。与瑞士风同源（都反装饰）但方向相反：瑞士是秩序的极致，粗野是生猛的极致。

## Approach

- **设计 token**：米白底 `#FFFDF5` + 纯黑 + 高饱和黄 `#FFDE00` / 电光蓝 `#2545FF`。边框 3~5px、硬阴影偏移 8px **且无模糊**——blur 一加就变成新拟态。
- **组件公式**：按钮按压 = 位移吃掉阴影（`translate(6px,6px)` + `box-shadow: 0 0 0`），transition 用 `linear` 0.08s——粗野不搞缓动曲线。链接永远下划线（信息诚实），hover 反色。
- **排版**：系统等宽字体栈（`Courier New, ui-monospace`）+ 全大写 + 超大标题顶格。拒绝 webfont 的 300KB——浏览器自带的就是材料。
- **允许的动效**：跑马灯条（marquee）是少数被认可的粗野动效；其余全靠 hover 按压。
- **降级**：`prefers-reduced-motion` 停跑马灯、按压改直切——静态版本毫无损失。
- **迁移提示**：零图片零图标依赖，token 四个变量，注入任意框架都是纯 CSS。

## Example

<!-- EMBED:START:snippets/styles/brutalism.html -->
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>粗野主义风格套件（Brutalism Web）</title>
<!--
  粗野主义风格套件：把混凝土建筑的"裸露结构"搬进网页——
  粗边框、硬阴影、系统字体、高饱和撞色、零圆角零渐变零阴影模糊。
  双击即可预览。
  与瑞士风格同源（都反装饰）但方向相反：瑞士=秩序的极致，粗野=生猛的极致。
-->
<style>
  /* ===== 设计 token 集中区 ===== */
  :root {
    --b-bg:     #FFFDF5;    /* 米白：不是纯白，纸感 */
    --b-ink:    #000000;    /* 纯黑：粗野主义不搞微妙 */
    --b-yellow: #FFDE00;    /* 高饱和黄：主按钮 */
    --b-blue:   #2545FF;    /* 电光蓝：链接/强调 */
    --b-green:  #00C853;    /* 亮绿：成功态 */
    --b-border: 4px;        /* 边框宽度：3~5px，再细就不"粗野"了 */
    --b-shadow: 8px;        /* 硬阴影偏移：必须无模糊！blur 一加就变成新拟态 */
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    /* 系统等宽字体栈：粗野主义宣言——拒绝精心挑选的品牌字体 */
    font-family: "Courier New", ui-monospace, SFMono-Regular, Menlo, monospace;
    background: var(--b-bg);
    color: var(--b-ink);
    padding: 48px 20px;
  }
  .wrap { max-width: 880px; margin: 0 auto; }

  /* ---- 超大标题：占满、顶格、不留情面 ---- */
  h1 {
    font-size: clamp(40px, 10vw, 96px);
    line-height: 0.92; letter-spacing: -0.02em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .tagline {
    display: inline-block;
    background: var(--b-ink); color: var(--b-bg);
    padding: 8px 14px; font-size: 14px; letter-spacing: 0.24em;
    text-transform: uppercase; margin-bottom: 40px;
  }

  /* ---- 组件三件套：边框 + 硬阴影 + 位移按压 ---- */
  .b-card {
    border: var(--b-border) solid var(--b-ink);
    box-shadow: var(--b-shadow) var(--b-shadow) 0 var(--b-ink);
    background: var(--b-bg);
    padding: 24px;
    margin-bottom: 32px;
  }
  .b-card h2 { font-size: 20px; text-transform: uppercase; margin-bottom: 12px; }
  .b-card p  { font-size: 15px; line-height: 1.75; }

  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 32px; margin-bottom: 32px; }
  .grid .b-card { margin-bottom: 0; }
  /* 高亮卡片：直接整卡上底色，不做渐变不做透明 */
  .b-card.hl-yellow { background: var(--b-yellow); }
  .b-card.hl-blue   { background: var(--b-blue); color: var(--b-bg); }

  /* ---- 按钮：粗野的交互 = 物理按压（位移吃掉阴影） ---- */
  .b-btn {
    font-family: inherit; font-size: 16px; font-weight: bold;
    text-transform: uppercase; cursor: pointer;
    background: var(--b-yellow); color: var(--b-ink);
    border: var(--b-border) solid var(--b-ink);
    box-shadow: 6px 6px 0 var(--b-ink);
    padding: 14px 28px;
    transition: transform 0.08s linear, box-shadow 0.08s linear; /* 快进快出：粗野不搞缓动曲线 */
  }
  .b-btn:hover { transform: translate(2px, 2px); box-shadow: 4px 4px 0 var(--b-ink); }
  .b-btn:active { transform: translate(6px, 6px); box-shadow: 0 0 0 var(--b-ink); }
  .b-btn.alt { background: var(--b-bg); }
  .b-btn:focus-visible { outline: 3px dashed var(--b-blue); outline-offset: 4px; }

  /* ---- 链接：蓝色 + 永远下划线（粗野主义的信息诚实） ---- */
  a { color: var(--b-blue); text-decoration: underline; text-decoration-thickness: 2px; }
  a:hover { background: var(--b-blue); color: var(--b-bg); }

  /* ---- 跑马灯条：粗野主义少数允许的"动效" ---- */
  .marquee {
    border-top: var(--b-border) solid var(--b-ink);
    border-bottom: var(--b-border) solid var(--b-ink);
    background: var(--b-ink); color: var(--b-bg);
    overflow: hidden; white-space: nowrap;
    padding: 10px 0; margin-bottom: 40px;
  }
  .marquee span {
    display: inline-block;
    padding-left: 100%;
    animation: marquee-run 14s linear infinite;
    letter-spacing: 0.2em; font-size: 14px; text-transform: uppercase;
  }
  @keyframes marquee-run { to { transform: translateX(-100%); } }

  /* ---- 表格线分隔：结构即装饰 ---- */
  .b-list { list-style: none; }
  .b-list li {
    border-bottom: 2px solid var(--b-ink);
    padding: 14px 4px; display: flex; justify-content: space-between;
    font-size: 14px;
  }

  footer { margin-top: 48px; font-size: 13px; text-align: center; letter-spacing: 0.1em; }

  /* 降级：跑马灯停走、按压改直切——粗野主义的静态版本毫无损失 */
  @media (prefers-reduced-motion: reduce) {
    .marquee span { animation: none !important; padding-left: 0; }
    .b-btn { transition: none !important; }
  }
</style>
</head>
<body>
<div class="wrap">
  <h1>RAW HTML.</h1>
  <h1>NO MERCY.</h1>
  <span class="tagline">粗野主义 · brutalism · since 1950s</span>

  <div class="marquee" aria-hidden="true">
    <span>NO GRADIENT ✦ NO BLUR ✦ NO ROUNDED CORNERS ✦ SYSTEM FONTS ✦ HARD SHADOWS ONLY ✦ NO GRADIENT ✦ NO BLUR ✦ NO ROUNDED CORNERS ✦ </span>
  </div>

  <div class="grid">
    <div class="b-card hl-yellow">
      <h2>01 边框</h2>
      <p>3~5px 纯黑边框是结构本身。内容直接站在结构上，不靠留白和阴影讨好眼睛。</p>
    </div>
    <div class="b-card">
      <h2>02 硬阴影</h2>
      <p>偏移阴影、零模糊、零透明度。有 blur 的阴影是别的主义，不是这个。</p>
    </div>
    <div class="b-card hl-blue">
      <h2>03 系统字体</h2>
      <p>等宽字体 + 全大写。拒绝 webfont 的 300KB，浏览器自带的就是材料本身。</p>
    </div>
  </div>

  <div class="b-card">
    <h2>清单 · the list</h2>
    <ul class="b-list">
      <li><span>圆角 border-radius</span><span>0px</span></li>
      <li><span>阴影模糊 blur</span><span>0px</span></li>
      <li><span>渐变 gradient</span><span>NONE</span></li>
      <li><span>字体加载量</span><span>0KB</span></li>
    </ul>
    <div style="display:flex; gap:18px; margin-top:24px; flex-wrap:wrap;">
      <button class="b-btn">按下试试</button>
      <button class="b-btn alt">次要操作</button>
      <a href="#" style="font-size:16px; align-self:center;">这是个链接 →</a>
    </div>
  </div>

  <footer>BUILT WITH ZERO DECORATION. 2026.</footer>
</div>
</body>
</html>
```
<!-- EMBED:END -->
