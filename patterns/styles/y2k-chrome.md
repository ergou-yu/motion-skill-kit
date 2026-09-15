# Y2K 铬感风格（Chrome / Iridescent）

> **ID** `y2k-chrome` · **分类** styles · **性能** medium · **依赖** 无

## Context

1998–2003 的「消费科技乐观主义」：铬金属字、虹彩、气泡按钮、星爆、iMac 半透明塑料。千禧年前后科技产品广告的标准像。适合潮流电商、音乐、Z 世代向产品营销页。与蒸汽波的分界：Y2K 明亮天真（天蓝底、果冻渐变），蒸汽波暗紫怀旧（落日、VHS）。

## Approach

- **设计 token**：天空蓝 `#B8E3FF` / 气泡粉 `#FF9AD5` / 丁香紫 `#C8B6FF`，深靛 `#3A3A6A` 替代纯黑保持「塑料感」。
- **铬字配方**：多停靠竖直渐变（白→浅蓝→深→浅→白模拟金属反射天空）+ `background-clip: text` + 斜向高光条往返动画让「光源」动起来。镀铬的本质是**反射环境**，单色渐变骗不了眼睛。
- **组件**：气泡按钮（径向渐变左上高光 + inset 双层内影 = 球体塑料）；全息卡片（斜向彩虹带平移模拟视角变化）；星爆四角星缓闪。
- **性能**：大面积 blur 虹彩背景属中等开销；高光/彩虹带动画是 background-position 类。
- **降级**：`prefers-reduced-motion` 时高光、虹彩、星爆全部定格——静态铬字与气泡同样成立。
- **迁移提示**：所有色值集中在 `:root`；星爆字符（✦）可换成 SVG。

## Example

<!-- EMBED:START:snippets/styles/y2k-chrome.html -->
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Y2K 铬感风格套件（Chrome / Iridescent）</title>
<!--
  Y2K 风格套件：1998-2003 的"消费科技乐观主义"——铬金属、虹彩、
  气泡、星爆、像素字体。双击即可预览。
  与蒸汽波的分界：Y2K 是明亮天真的科技乐观（半透明塑料、镜面），
  蒸汽波是怀旧反讽（落日、VHS 颗粒）。
-->
<style>
  /* ===== 设计 token 集中区 ===== */
  :root {
    --y-sky:   #B8E3FF;    /* 天空蓝：Y2K 的底色永远亮，不阴暗 */
    --y-pink:  #FF9AD5;    /* 气泡粉 */
    --y-lilac: #C8B6FF;    /* 丁香紫 */
    --y-ink:   #3A3A6A;    /* 深靛：替代纯黑，保持"塑料感"而非"油墨感" */
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "Arial Rounded MT Bold", "PingFang SC", sans-serif;
    min-height: 100vh; overflow-x: hidden;
    color: var(--y-ink);
    /* 天蓝→粉的柔和底：Y2K 渐变永远"果冻感"，饱和度中低 */
    background: linear-gradient(160deg, var(--y-sky) 0%, #E7F6FF 40%, var(--y-pink) 100%);
    display: flex; flex-direction: column; align-items: center;
    padding: 72px 20px; gap: 40px;
  }

  /* ---- 虹彩背景光带：conic 彩虹缓慢旋转，垫在内容后面 ---- */
  .iridescent {
    position: fixed; inset: -40%; z-index: 0; pointer-events: none;
    background: conic-gradient(
      from 0deg,
      rgba(255,154,213,0.5), rgba(200,182,255,0.5), rgba(184,227,255,0.5),
      rgba(178,255,234,0.5), rgba(255,241,158,0.5), rgba(255,154,213,0.5)
    );
    filter: blur(90px); opacity: 0.55;
    animation: iridescent-spin 24s linear infinite;
  }
  @keyframes iridescent-spin { to { transform: rotate(360deg); } }

  /* ---- 铬字：多停靠竖直渐变模拟"金属反射天空" ---- */
  .chrome-title {
    position: relative; z-index: 1;
    font-family: "Arial Black", sans-serif;
    font-size: clamp(44px, 9vw, 96px);
    text-transform: uppercase; letter-spacing: 0.04em;
    /* 铬的物理：上反射天空(浅蓝)→中间反射地平线(深)→下反射地面(亮) */
    background: linear-gradient(180deg,
      #fdfeff 0%, #cfe6ff 22%, #6f97d8 40%,
      #2c3f7c 50%, #6f97d8 58%,
      #d8e7fb 78%, #ffffff 100%
    );
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent;
    /* 斜向高光扫过：CSS 动画让"光源"动起来，金属才活 */
    position: relative;
  }
  .chrome-title::after {
    /* 高光层：白→透明窄条左右往返 */
    content: attr(data-text);
    position: absolute; inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.9) 50%, transparent 60%);
    background-size: 250% 100%;
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: chrome-shine 3.2s ease-in-out infinite;
  }
  @keyframes chrome-shine {
    0%   { background-position: 120% 0; }
    100% { background-position: -120% 0; }
  }

  .sub {
    position: relative; z-index: 1;
    letter-spacing: 0.42em; font-size: 13px; color: #6A6AA8;
  }

  /* ---- 气泡按钮：Y2K 的交互件标准像 ---- */
  .bubble-row { position: relative; z-index: 1; display: flex; gap: 22px; flex-wrap: wrap; justify-content: center; }
  .bubble {
    font-family: inherit; font-size: 16px; cursor: pointer;
    color: var(--y-ink);
    padding: 18px 40px; border-radius: 999px;
    border: 2px solid rgba(255,255,255,0.85);
    /* 径向渐变：光源在左上 → 球体感；外圈再一圈淡蓝 halo 当"塑料边" */
    background:
      radial-gradient(circle at 30% 28%, #ffffff 0%, rgba(255,255,255,0) 42%),
      linear-gradient(180deg, rgba(255,255,255,0.85), rgba(200,182,255,0.65));
    box-shadow:
      0 10px 26px rgba(58,58,106,0.18),
      inset 0 -6px 14px rgba(200,182,255,0.55),
      inset 0 6px 10px rgba(255,255,255,0.9);
    /* 悬停轻轻上浮 + 放大：气泡的物理是"飘"，不是"按" */
    transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .bubble:hover { transform: translateY(-6px) scale(1.04); }
  .bubble:active { transform: translateY(-1px) scale(0.98); }

  /* ---- 星爆装饰：四角星 + 像素十字星 ---- */
  .sparkle {
    position: fixed; pointer-events: none; z-index: 2;
    color: #fff;
    filter: drop-shadow(0 0 6px rgba(255,255,255,0.9));
    animation: sparkle-twinkle 2.6s ease-in-out infinite;
  }
  .sparkle.s1 { top: 18%; left: 14%; font-size: 30px; }
  .sparkle.s2 { top: 30%; right: 16%; font-size: 22px; animation-delay: -0.8s; }
  .sparkle.s3 { bottom: 26%; left: 20%; font-size: 18px; animation-delay: -1.6s; }
  @keyframes sparkle-twinkle {
    0%, 100% { opacity: 0.25; transform: scale(0.8) rotate(0deg); }
    50%      { opacity: 1;   transform: scale(1.15) rotate(20deg); }
  }

  /* ---- 全息卡片：虹彩随角度变化的等价模拟 ---- */
  .holo-card {
    position: relative; z-index: 1;
    width: min(340px, 88vw); border-radius: 20px; padding: 26px;
    color: var(--y-ink);
    background: linear-gradient(120deg, rgba(255,255,255,0.75), rgba(184,227,255,0.4));
    border: 1.5px solid rgba(255,255,255,0.9);
    backdrop-filter: blur(8px);
    overflow: hidden;
  }
  .holo-card::before {
    /* 全息条：斜向彩虹带随动画平移，模拟全息贴纸的视角变化 */
    content: ""; position: absolute; inset: -60%;
    background: linear-gradient(115deg,
      transparent 30%, rgba(255,154,213,0.45) 42%,
      rgba(184,227,255,0.45) 50%, rgba(178,255,234,0.45) 58%, transparent 70%
    );
    animation: holo-slide 4.5s ease-in-out infinite alternate;
  }
  @keyframes holo-slide { from { transform: translateX(-22%) rotate(-4deg); } to { transform: translateX(22%) rotate(4deg); } }
  .holo-card > * { position: relative; }
  .holo-card h3 { margin-bottom: 8px; }
  .holo-card p { font-size: 14px; line-height: 1.7; }

  /* 降级：高光/虹彩/星爆全部定格——静态的铬字与气泡同样成立 */
  @media (prefers-reduced-motion: reduce) {
    .iridescent, .chrome-title::after, .sparkle, .holo-card::before { animation: none !important; }
    .bubble { transition: none !important; }
  }
</style>
</head>
<body>
<div class="iridescent" aria-hidden="true"></div>
<span class="sparkle s1" aria-hidden="true">✦</span>
<span class="sparkle s2" aria-hidden="true">✧</span>
<span class="sparkle s3" aria-hidden="true">✦</span>

<div class="chrome-title" data-text="CHROME 2000">CHROME 2000</div>
<div class="sub">消费科技的乐观主义</div>

<div class="bubble-row">
  <button class="bubble">进入未来</button>
  <button class="bubble">关于我们</button>
</div>

<div class="holo-card">
  <h3>全息会员卡 · HOLO CARD</h3>
  <p>虹彩条带与铬字是 Y2K 的两大锚点；气泡按钮负责传达"科技也可以软萌"。把这套 token 换进你的产品页即可。</p>
</div>
</body>
</html>
```
<!-- EMBED:END -->
