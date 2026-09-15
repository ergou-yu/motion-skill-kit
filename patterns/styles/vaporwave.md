# 蒸汽波风格（Vaporwave）

> **ID** `vaporwave` · **分类** styles · **性能** medium · **依赖** 无

## Context

Retro-futurism——70/80 年代想象中的未来，情绪是「对已经发生过的未来的怀旧与反讽」。适合音乐/夜生活/潮流/亚文化站点。与近邻的分界（混用会被识破）：**Y2K** 是消费科技乐观（明亮、塑料感）；**Cyberpunk** 是冷色 CRT/HUD；蒸汽波是落日 + 网格 + VHS 的「梦境」。

## Approach

- **设计 token**：热粉 `#FF71CE` × 电青 `#01CDFE` 的招牌对撞 + 薰衣草紫 `#B967FF` 过渡 + 深紫黑天顶 `#150025`。
- **四大要素**：① 网格地平线（**最标志性动作**）——`perspective + rotateX` 透视平面、`repeating-linear-gradient` 画格、background-position 动画让地面涌向「永远到不了的地平线」；② 渐变天空（一帧内暖→冷多色过渡）+ 横切条纹落日；③ VHS 颗粒（feTurbulence + steps 抖动，去掉颗粒就只是个渐变）；④ 铬渐变字（多停靠竖直渐变模拟金属反光，不是单色滤镜）。
- **性能**：blur 色球 + 大面积动画属中等开销；网格动画用 background-position（重绘小面积图案，可接受）。
- **降级**：`prefers-reduced-motion` 时网格停住、光晕定格——变成一张静态怀旧海报。
- **迁移提示**：整页气质型风格，React 中把场景容器做成全屏 section 即可。

## Example

<!-- EMBED:START:snippets/styles/vaporwave.html -->
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>蒸汽波风格套件（Vaporwave）</title>
<!--
  蒸汽波风格套件：retro-futurism——70/80 年代想象中的未来。
  双击即可预览。风格要素（源自 studio2am 规则文总结）：
  网格地平线（最标志性动作）+ 渐变天空 + 落日圆 + VHS 颗粒 + 铬渐变字。
  情绪：对"已经发生过的未来"的怀旧与反讽。
  注意与近邻区分：Y2K=消费科技乐观；Cyberpunk=冷色 CRT/HUD。
-->
<style>
  /* ===== 设计 token 集中区 ===== */
  :root {
    --v-pink:   #FF71CE;   /* 热粉：夜店端主色 */
    --v-cyan:   #01CDFE;   /* 电青：与热粉构成 vaporwave 招牌对撞 */
    --v-purple: #B967FF;   /* 薰衣草紫：柔和端过渡色 */
    --v-deep:   #150025;   /* 深紫黑：天空顶 */
    --v-grid:   rgba(1, 205, 254, 0.5); /* 网格线色：青色发光感 */
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "PingFang SC", sans-serif;
    background: var(--v-deep);
    min-height: 100vh;
    overflow-x: hidden;
    color: #fff;
  }

  /* ---- 场景容器：三层堆叠出"地平线世界" ---- */
  .scene { position: relative; height: 78vh; min-height: 520px; overflow: hidden; }

  /* 1) 渐变天空：暖(地平线粉) → 冷(天顶深紫)，教程强调"一帧内多色过渡" */
  .sky {
    position: absolute; inset: 0;
    background: linear-gradient(
      180deg,
      #150025 0%,      /* 天顶：冷 */
      #3b1160 34%,
      #8d2b8d 58%,
      #FF71CE 78%,     /* 地平线附近：暖 */
      #FFAC9E 100%     /* 收尾：暖橘粉，衔接落日 */
    );
  }

  /* 2) 落日圆：横切条纹是 vaporwave 日落的仪式性画法 */
  .sun {
    position: absolute; left: 50%; top: 46%;
    width: 220px; height: 220px; border-radius: 50%;
    transform: translate(-50%, -50%);
    /* 上黄下粉的竖直渐变 + 底部被"切"掉的透明条纹 */
    background:
      repeating-linear-gradient(
        180deg,
        rgba(21, 0, 37, 0) 0px,   rgba(21, 0, 37, 0) 14px,
        rgba(21, 0, 37, 0.85) 14px, rgba(21, 0, 37, 0.85) 20px
      ),
      linear-gradient(180deg, #FFE74C 0%, #FF71CE 65%, #B967FF 100%);
    /* 条纹越往下越宽：把 mask 换成渐变透明度更顺滑，这里用覆盖条带近似 */
    box-shadow: 0 0 90px rgba(255, 113, 206, 0.55); /* 光晕：落日要发光 */
    animation: sun-breathe 7s ease-in-out infinite;
  }
  @keyframes sun-breathe {
    0%, 100% { box-shadow: 0 0 70px rgba(255,113,206,0.45); }
    50%      { box-shadow: 0 0 120px rgba(255,113,206,0.75); }
  }

  /* 3) 网格地平线：透视平面 + 无限滚动，整个风格的灵魂 */
  .grid-floor {
    position: absolute; left: -50%; right: -50%; bottom: 0; height: 46%;
    /* 透视：把平面绕 X 轴压躺下，消失点在屏幕上方中央 */
    transform: perspective(340px) rotateX(62deg);
    transform-origin: 50% 0;
    /* 网格线：两组 repeating 线拼出格子；background-position 动画 = 地面向我们涌来 */
    background-image:
      repeating-linear-gradient(90deg, var(--v-grid) 0 2px, transparent 2px 80px),
      repeating-linear-gradient(0deg,  var(--v-grid) 0 2px, transparent 2px 80px);
    animation: grid-flow 1.6s linear infinite;
    mask-image: linear-gradient(180deg, transparent 0%, #000 30%); /* 近处渐隐入雾 */
    -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 30%);
  }
  @keyframes grid-flow {
    /* 向下平移一格：视觉上"驶向地平线永远到不了的未来" */
    from { background-position: 0 0, 0 0; }
    to   { background-position: 0 80px, 0 80px; }
  }

  /* ---- VHS 颗粒：去掉了就只是个渐变，留着才有"情绪"（教程原话精神） ---- */
  .grain {
    position: fixed; inset: -50%; width: 200%; height: 200%;
    pointer-events: none; z-index: 50; opacity: 0.09;
    animation: grain-jitter 0.9s steps(4) infinite;
  }
  @keyframes grain-jitter {
    0% { transform: translate(0,0); } 25% { transform: translate(-2%,2%); }
    50% { transform: translate(2%,-1%); } 75% { transform: translate(-1%,-2%); }
    100% { transform: translate(0,0); }
  }

  /* ---- 铬渐变标题：金属字是 vaporwave 排版的高光时刻 ---- */
  .content { position: relative; z-index: 10; text-align: center; padding: 40px 20px 80px; }
  .chrome {
    font-family: "Arial Black", sans-serif;
    font-size: clamp(40px, 8vw, 88px);
    letter-spacing: 0.06em;
    /* 铬 = 高反差多停靠渐变（天/地/天模拟金属反射天空），不是单色滤镜 */
    background: linear-gradient(180deg,
      #ffffff 0%, #b9d9ff 18%, #475fc9 38%, #0b1030 50%,
      #7a4bd6 62%, #d6a4ff 80%, #ffffff 100%
    );
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(3px 3px 0 rgba(1, 205, 254, 0.6)); /* 青/粉双色残影 */
    text-transform: uppercase;
  }
  .sub {
    color: var(--v-cyan); letter-spacing: 0.5em; font-size: 13px; margin-top: 14px;
    text-shadow: 0 0 12px var(--v-cyan); /* 辉光文字：霓虹灯管的等价物 */
  }
  .pill-row { display: flex; gap: 14px; justify-content: center; margin-top: 36px; flex-wrap: wrap; }
  .pill {
    border: 1px solid rgba(255,255,255,0.35);
    background: rgba(255,255,255,0.06);
    padding: 10px 22px; border-radius: 999px; font-size: 14px;
    backdrop-filter: blur(4px);
  }

  /* 降级：网格停住、落日光晕定格、颗粒静止——变成一张静态怀旧海报 */
  @media (prefers-reduced-motion: reduce) {
    .grid-floor, .sun, .grain { animation: none !important; }
  }
</style>
</head>
<body>
<!-- VHS 颗粒层：SVG feTurbulence 生成，与背景特效库 noise-grain 同源 -->
<svg class="grain" aria-hidden="true">
  <filter id="vhs"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/></filter>
  <rect width="100%" height="100%" filter="url(#vhs)"/>
</svg>

<div class="scene">
  <div class="sky"></div>
  <div class="sun"></div>
  <div class="grid-floor"></div>
</div>

<div class="content">
  <div class="chrome">A E S T H E T I C</div>
  <div class="sub">永远到不了的地平线</div>
  <div class="pill-row">
    <span class="pill">网格地平线</span>
    <span class="pill">渐变天空</span>
    <span class="pill">VHS 颗粒</span>
    <span class="pill">铬渐变字</span>
  </div>
</div>
</body>
</html>
```
<!-- EMBED:END -->
