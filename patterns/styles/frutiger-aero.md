# Frutiger Aero（Web 2.0 Gloss）

> **ID** `frutiger-aero` · **分类** styles · **性能** low-cost · **依赖** 无

## Context

2004–2013 的「Web 2.0 Gloss」——Windows Vista/7 与 Apple Aqua 时代的官方美学：天蓝草绿、水珠气泡、光泽渐变、「科技与自然和谐」的乐观主义。近年 TikTok/YouTube 怀旧内容带动强势复兴，2020s 的「igital nostalgia」代表。适合环保/水处理/健康/清新向产品、怀旧营销页。与 Y2K 的分界：Y2K 是金属铬的未来幻想，Aero 是水润透明的清新现实。

## Approach

- **设计 token**：Vista 天空蓝 `#58B6E8` 为基准 + 草地绿 `#7BC043` + 浅水色高光；Segoe UI 字体（那个时代的官方脸）。
- **零图片云与水珠**：云 = 多重径向渐变拼蓬松形；水珠 = 三层径向渐变（左上高光点「眼神」+ 底部聚光弧 + 近透明珠体）+ inset 双影 + 落影，纯 CSS 上釉。
- **Aqua 光泽配方**：面板/按钮一律「上半白高光、下半深色」的竖直渐变 + `inset 0 1px 0` 顶缘亮线（玻璃厚度）+ `text-shadow 0 -1px 0` 凹刻字。按下时釉光消失 =「按进水里」。
- **纪律**：一切都圆润、透明、水润；避免任何金属铬与硬阴影。
- **降级**：`prefers-reduced-motion` 停云漂/珠浮——静态晴空构图完整。
- **注意**：demo 中云的 keyframes 会覆盖 transform，缩放变体用独立尺寸类实现（见代码注释）。

## Example

<!-- EMBED:START:snippets/styles/frutiger-aero.html -->
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Frutiger Aero 风格套件（Web 2.0 Gloss）</title>
<!--
  Frutiger Aero 套件：2004-2013 的 "Web 2.0 Gloss"——Windows Vista/7 与
  Apple Aqua 时代的官方美学：天蓝草绿、水珠气泡、光泽渐变、
  "科技与自然和谐相处"的乐观主义（近年 TikTok 带动复兴）。
  双击即可预览。
  与 Y2K 的分界：Y2K 是金属铬的"未来幻想"，Aero 是水润透明的"清新现实"。
-->
<style>
  /* ===== 设计 token 集中区 ===== */
  :root {
    --fa-sky:     #58B6E8;    /* Vista 天空蓝：一切的基准色 */
    --fa-sky-deep:#2E7FC2;    /* 深空蓝：渐变下端 */
    --fa-grass:   #7BC043;    /* 草地绿：自然元素 */
    --fa-aqua:    #9BE2FF;    /* 浅水色：高光与气泡 */
    --fa-white:   #F4FBFF;    /* 云白 */
    --fa-text:    #143A5C;    /* 深海蓝文字：保证对比度 */
    --fa-glass:   rgba(255,255,255,0.55); /* 光泽面板底 */
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "Segoe UI", "PingFang SC", "Helvetica Neue", sans-serif; /* Segoe UI：Vista 的官方字体，气质正统 */
    min-height: 100vh;
    color: var(--fa-text);
    display: flex; flex-direction: column; align-items: center;
    padding: 64px 20px; gap: 36px;
    overflow-x: hidden;
    /* 天空背景：天蓝→深蓝的垂直渐变，底部一段草绿弧线（大地） */
    background:
      radial-gradient(120% 42% at 50% 118%, var(--fa-grass) 0%, transparent 60%),
      linear-gradient(180deg, #8FD4F5 0%, var(--fa-sky) 45%, var(--fa-sky-deep) 100%);
  }

  /* ---- 云朵：多重径向渐变拼出的蓬松云（无图片的云） ---- */
  .cloud {
    position: fixed; z-index: 0; pointer-events: none;
    width: 260px; height: 90px;
    background:
      radial-gradient(circle at 22% 65%, var(--fa-white) 0 38px, transparent 39px),
      radial-gradient(circle at 50% 40%, var(--fa-white) 0 48px, transparent 49px),
      radial-gradient(circle at 78% 62%, var(--fa-white) 0 36px, transparent 37px),
      radial-gradient(ellipse at 50% 78%, var(--fa-white) 0 55px 22px, transparent 56px);
    opacity: 0.92;
    animation: cloud-drift 60s linear infinite;
  }
  .cloud.c1 { top: 12%; left: -280px; }
  .cloud.c2 { top: 28%; left: -460px; transform: scale(0.7); animation-delay: -30s; }
  @keyframes cloud-drift { to { transform: translateX(calc(100vw + 740px)); } }
  /* 注意 c2 的 scale 会被 keyframes 覆盖——所以 c2 用独立速度而不用 transform 缩放，见下 */
  .cloud.c2 { transform: none; width: 180px; height: 64px;
    background:
      radial-gradient(circle at 22% 65%, var(--fa-white) 0 27px, transparent 28px),
      radial-gradient(circle at 50% 40%, var(--fa-white) 0 34px, transparent 35px),
      radial-gradient(circle at 78% 62%, var(--fa-white) 0 25px, transparent 26px),
      radial-gradient(ellipse at 50% 78%, var(--fa-white) 0 40px 16px, transparent 41px);
  }

  /* ---- 水珠：Aero 的身份徽章。纯 CSS 上釉：底部投影 + 左上高光点 ---- */
  .bubble {
    position: fixed; border-radius: 50%; pointer-events: none; z-index: 1;
    background:
      /* 左上小高光点：光源反射，水珠的"眼神" */
      radial-gradient(circle at 30% 28%, rgba(255,255,255,0.95) 0 12%, transparent 22%),
      /* 下缘内反光：光穿过后在底部聚成一道亮弧 */
      radial-gradient(circle at 50% 108%, rgba(255,255,255,0.65) 0 40%, transparent 52%),
      /* 珠体：近乎透明的浅蓝 */
      radial-gradient(circle at 42% 38%, rgba(255,255,255,0.5), rgba(155, 226, 255, 0.28) 70%);
    box-shadow:
      inset 0 -4px 10px rgba(255,255,255,0.55),
      inset 0 4px 8px rgba(255,255,255,0.4),
      0 6px 14px rgba(20, 58, 92, 0.25); /* 落在"屏幕"上的投影 */
    animation: bubble-float 9s ease-in-out infinite;
  }
  .bubble.b1 { width: 84px; height: 84px; top: 22%; right: 16%; }
  .bubble.b2 { width: 46px; height: 46px; top: 42%; right: 26%; animation-delay: -3s; }
  .bubble.b3 { width: 26px; height: 26px; top: 16%; right: 30%; animation-delay: -6s; }
  @keyframes bubble-float {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-14px); }
  }

  /* ---- 标题区 ---- */
  .title {
    position: relative; z-index: 2; text-align: center;
  }
  .title h1 {
    font-size: clamp(36px, 7vw, 66px);
    font-weight: 700;
    color: #fff;
    /* Aero 玻璃字：上白下蓝的竖直渐变 + 深色描边阴影（Vista logo 的味道） */
    background: linear-gradient(180deg, #ffffff 30%, #bfe6fa 55%, #7cc4ec 100%);
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 2px 0 rgba(20,58,92,0.35)) drop-shadow(0 6px 18px rgba(20,58,92,0.3));
  }
  .title p { color: #eaf7ff; letter-spacing: 0.28em; font-size: 13px; margin-top: 10px; }

  /* ---- Aqua 光泽面板：上亮下暗的"果冻玻璃"，Web 2.0 的标配 ---- */
  .aqua-panel {
    position: relative; z-index: 2;
    width: min(620px, 92vw);
    border-radius: 18px;
    padding: 30px 34px;
    /* 三层：玻璃底 + 顶部高光横带 + 外部柔影 */
    background: linear-gradient(180deg,
      rgba(255,255,255,0.85) 0%, var(--fa-glass) 42%, rgba(255,255,255,0.35) 100%);
    border: 1px solid rgba(255,255,255,0.8);
    box-shadow:
      0 20px 50px rgba(20, 58, 92, 0.28),
      inset 0 1px 0 rgba(255,255,255,0.95); /* 顶缘 1px 高光：玻璃厚度 */
  }
  .aqua-panel h3 { font-size: 18px; margin-bottom: 10px; color: var(--fa-text); }
  .aqua-panel p  { font-size: 14px; line-height: 1.9; color: #34607f; }

  /* ---- Aqua 按钮：Vista/Leopard 时代的胶囊光泽按钮 ---- */
  .aqua-btn {
    font-family: inherit; font-size: 15px; font-weight: 600; cursor: pointer;
    color: #fff;
    border: 1px solid rgba(20, 58, 92, 0.4);
    border-radius: 999px;
    padding: 13px 34px;
    /* 灵魂：上半白高光、下半深色的胶囊渐变——"上釉" */
    background: linear-gradient(180deg,
      #9be2ff 0%, #58b6e8 48%, #2e7fc2 52%, #4a9cd6 100%);
    text-shadow: 0 -1px 0 rgba(20,58,92,0.45); /* 凹刻字：光从上来字往下凹 */
    box-shadow:
      inset 0 2px 3px rgba(255,255,255,0.85),   /* 顶部釉光 */
      inset 0 -6px 12px rgba(20,58,92,0.25),    /* 底部内暗 */
      0 6px 16px rgba(20,58,92,0.35);           /* 落影 */
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .aqua-btn:hover { transform: translateY(-1px);
    box-shadow: inset 0 2px 3px rgba(255,255,255,0.9), inset 0 -6px 12px rgba(20,58,92,0.25), 0 10px 22px rgba(20,58,92,0.4); }
  .aqua-btn:active { transform: translateY(1px);
    box-shadow: inset 0 3px 8px rgba(20,58,92,0.35); } /* 按下：釉光消失 = "按进水里" */
  .aqua-btn.green { background: linear-gradient(180deg, #a8e063 0%, #7bc043 48%, #4e8f1f 52%, #6cb236 100%); }
  .aqua-btn:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }

  /* 降级：云停漂、水珠停浮——静态的晴空、云、水珠与光泽面板完全成立 */
  @media (prefers-reduced-motion: reduce) {
    .cloud, .bubble { animation: none !important; }
    .aqua-btn { transition: none !important; }
  }
</style>
</head>
<body>

<div class="cloud c1" aria-hidden="true"></div>
<div class="cloud c2" aria-hidden="true"></div>
<div class="bubble b1" aria-hidden="true"></div>
<div class="bubble b2" aria-hidden="true"></div>
<div class="bubble b3" aria-hidden="true"></div>

<div class="title">
  <h1>Harmony&nbsp;Aero</h1>
  <p>科技与自然的乐观主义 · 2004—2013</p>
</div>

<section class="aqua-panel">
  <h3>配方说明</h3>
  <p>
    天空蓝×草地绿的垂直渐变打底，多层径向渐变拼云与水珠（零图片）；
    面板和按钮一律"上釉"——上半白高光下半深色，加 1px 顶缘亮线。
    一切都圆润、透明、水润：这是和金属铬 Y2K 最大的区别。
  </p>
  <div style="display:flex; gap:18px; margin-top:20px; flex-wrap:wrap;">
    <button class="aqua-btn">开始体验</button>
    <button class="aqua-btn green">了解更多</button>
  </div>
</section>

</body>
</html>
```
<!-- EMBED:END -->
