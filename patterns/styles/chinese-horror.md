# 中式恐怖（Chinese Horror）

> **ID** `chinese-horror` · **分类** styles · **性能** low-cost · **依赖** 无
> 收编来源：用户项目《紙嫁衣：歸宅》页面反向提炼（一手 token 实测值）

## Context

褪色红金 × 旧宅暗褐 × 烛光符纸——中式恐怖的内核是「熟悉的东西不对劲」：旧春联、红灯笼、符纸、纸人，全是喜庆物件的褪色版本。适合恐怖解谜游戏、密室逃脱、万圣节/中元节活动页、悬疑小说站。⚠️ 含低频闪烁惊吓元素，光敏敏感用户与儿童向产品禁用。

## Approach

- **设计 token**（实测自原页面）：褪色血红 `#8B3A2F`（**不是正红**——旧春联的红是中式恐怖与喜庆的分界线）、陈旧金 `#C89C57`、旧木 `#393227`、供桌阴翳 `#1B2318`（带绿的暗，比纯黑「潮」）、符纸黄白；繁体衬线字体优先（繁体字型自带古意）。
- **光的三层烛火**：火苗（分层径向渐变）+ 光晕（只照亮「眼前一尺」）+ 烛泪痕。flicker 关键帧用**不规则时间点**（真实烛火不是正弦，是偶尔猛跳一下），光晕与火苗反相慢半拍。
- **动效三律**（原页面 keyframes 语言）：`unease` 全画面 11s 极缓呼吸（暗 10%，察觉不到但不对劲）为底；`flicker` 烛火常驻；`scare` 30s 周期只出现 0.4% 的画面微震——**九成时间是静的，压抑来自静止**，偶发一次才让静止变恐惧。
- **组件**：符纸（撕边 clip-path + 朱砂竖排 + 贴不正的 1.5° 旋转 + 「鎮」印）、暗红灯笼（摆幅 ±2.5°，大了是喜剧）、暗金描边按钮（hover 像被烛火照亮）。
- **降级红线**：`prefers-reduced-motion` 下 scare **彻底移除**（光敏安全），unease/flicker/灯笼全停——一盏不动的烛、一张符、一片暗，「静物恐怖」依然成立。
- **与近邻的分界**：cyberpunk 是霓虹冷光，中式恐怖是烛火暖光里最暗的那种；与浮世绘共享东方符号，但浮世绘明亮分层、中式恐怖褪色压抑。

## Example

<!-- EMBED:START:snippets/styles/chinese-horror.html -->
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>中式恐怖风格套件（Chinese Horror）</title>
<!--
  中式恐怖（Chinese Horror）套件：从用户项目《紙嫁衣：歸宅》页面反向提炼。
  双击即可预览。一手 token（取自原页面）：
  褪色血红 #8B3A2F（旧春联的红，不是正红）、陈旧金 #c89c57、
  旧木暗褐 #393227、供桌阴翳 #1b2318；繁体衬线字体。
  氛围三要素（原页面 keyframes 命名）：candle 烛光 flicker / unease 不安 / scare 惊吓。
  ⚠️ 含低频闪烁惊吓元素：scare 动画全周期只出现 0.5%，且 prefers-reduced-motion 下完全关闭。
-->
<style>
  /* ===== 设计 token 集中区（源自紙嫁衣页面实测值） ===== */
  :root {
    --ch-ink:    #14100B;   /* 墨褐黑：夜宅的底 */
    --ch-wood:   #393227;   /* 旧木色：门框与家具 */
    --ch-shade:  #1B2318;   /* 供桌阴翳：带绿的暗，比纯黑"潮" */
    --ch-blood:  #8B3A2F;   /* 褪色血红：旧春联/灯笼——中式恐怖的红是"旧"的 */
    --ch-ember:  #B36336;   /* 烛火映亮的橙红：一切活的光源 */
    --ch-gold:   #C89C57;   /* 陈旧金：烛台、框线、竖排标题 */
    --ch-paper:  #D8CBB0;   /* 符纸黄白 */
    --ch-serif:  "PingFang TC", "Songti SC", "Microsoft JhengHei", serif; /* 繁体衬线优先：繁体字型自带古意 */
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: var(--ch-serif);
    background:
      /* 底纹：极暗的木纹竖条 + 全局暗角，"老宅的空气" */
      repeating-linear-gradient(90deg, rgba(57, 50, 39, 0.25) 0 3px, transparent 3px 46px),
      radial-gradient(ellipse at 50% 42%, #241C12 0%, var(--ch-ink) 72%);
    color: var(--ch-paper);
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center;
    padding: 72px 20px; gap: 48px;
    overflow-x: hidden;
  }

  /* ---- 不安（unease）：整个画面极缓慢地"呼吸" —— 压抑感的底层 ---- */
  .unease-wrap { animation: unease 11s ease-in-out infinite; }
  @keyframes unease {
    0%, 100% { filter: brightness(1) saturate(1); }
    50%      { filter: brightness(0.9) saturate(0.85); } /* 暗 10%：察觉不到但"不对劲" */
  }

  /* ---- 竖排标题：暗金衬线 + 繁体，从右侧读起 ---- */
  .title-block {
    display: flex; gap: 22px; align-items: flex-start;
    margin-right: auto; margin-left: 8%;
  }
  .title-block h1 {
    writing-mode: vertical-rl;
    font-size: clamp(40px, 8vw, 76px);
    font-weight: 600;
    color: var(--ch-gold);
    letter-spacing: 0.3em;
    /* 褪金字：暗金主体 + 更暗的投影，像鎏金剥落 */
    text-shadow: 0 0 18px rgba(200, 156, 87, 0.22), 2px 2px 0 rgba(20, 16, 11, 0.9);
  }
  .title-block .sub {
    writing-mode: vertical-rl;
    font-size: 14px; letter-spacing: 0.6em;
    color: #7d6b40;
    border-right: 1px solid rgba(200, 156, 87, 0.3);
    padding-right: 12px;
    margin-top: 8px;
  }

  /* ---- 红烛：氛围的绝对核心。烛身 + 火苗 + 光晕三层 ---- */
  .candle-stage { position: relative; width: 220px; height: 300px; }
  .candle-body {
    position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
    width: 34px; height: 150px;
    background: linear-gradient(90deg, #6b4a33 0%, #8a6a4c 30%, #75533a 70%, #5a3d2b 100%);
    border-radius: 6px 6px 3px 3px;
    /* 烛泪：顶部一道凝住的亮痕 */
    box-shadow: inset 0 6px 8px rgba(216, 203, 176, 0.5), 0 0 30px rgba(179, 99, 54, 0.15);
  }
  .flame {
    position: absolute; bottom: 148px; left: 50%;
    width: 14px; height: 30px;
    transform: translateX(-50%);
    border-radius: 50% 50% 50% 50% / 62% 62% 38% 38%;
    /* 火苗分层：外焰橙红、内焰亮黄白 */
    background: radial-gradient(ellipse at 50% 78%, #FFF3D6 0%, #F5C86A 34%, var(--ch-ember) 72%, transparent 100%);
    filter: drop-shadow(0 0 14px rgba(245, 200, 106, 0.8));
    animation: flicker 2.8s ease-in-out infinite;
  }
  /* 光晕：照亮周围"一尺"——中式恐怖的光永远只够照亮眼前 */
  .glow {
    position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%);
    width: 320px; height: 320px; border-radius: 50%;
    background: radial-gradient(circle, rgba(179, 99, 54, 0.20) 0%, rgba(179, 99, 54, 0.07) 42%, transparent 68%);
    animation: flicker 2.8s ease-in-out infinite reverse; /* 与火苗反相：光随火动但慢半拍 */
    pointer-events: none;
  }
  /* flicker 的关键：不规则时间点。真实烛火不是正弦，是"偶尔猛地跳一下" */
  @keyframes flicker {
    0%, 100% { transform: translateX(-50%) scaleY(1) rotate(0deg); opacity: 1; }
    18% { transform: translateX(-50%) scaleY(1.08) rotate(-2deg); }
    22% { transform: translateX(-50%) scaleY(0.92) rotate(2deg); opacity: 0.86; }
    47% { transform: translateX(-50%) scaleY(1.05) rotate(1deg); }
    70% { transform: translateX(-50%) scaleY(0.95) rotate(-1deg); opacity: 0.92; }
    84% { transform: translateX(-50%) scaleY(1.12) rotate(3deg); } /* 偶发的猛跳 */
  }

  /* ---- 符纸：黄纸 + 朱砂竖排 + 撕边，中式恐怖的"界面元素" ---- */
  .talisman {
    position: relative;
    writing-mode: vertical-rl;
    background: linear-gradient(180deg, #d9cba6 0%, var(--ch-paper) 30%, #cbbb92 100%);
    color: var(--ch-blood);
    font-size: 21px; font-weight: 700; letter-spacing: 0.35em;
    padding: 26px 16px;
    /* 撕边：两段 clip-path 让纸的上下缘不整齐 */
    clip-path: polygon(0 3%, 8% 0, 30% 2%, 55% 0, 82% 2%, 100% 0, 100% 97%, 88% 100%, 60% 98%, 25% 100%, 6% 98%, 0 100%);
    box-shadow: 0 10px 26px rgba(0, 0, 0, 0.55);
    transform: rotate(1.5deg); /* 贴符永远贴不正 */
  }
  .talisman::after {
    /* 印章：右下角一方朱印 */
    content: "鎮";
    position: absolute; bottom: 10px; left: 8px;
    writing-mode: horizontal-tb;
    width: 30px; height: 30px; display: grid; place-items: center;
    background: var(--ch-blood); color: var(--ch-paper);
    font-size: 16px; border-radius: 3px;
    transform: rotate(-3deg);
    box-shadow: inset 0 0 4px rgba(80, 20, 12, 0.6);
  }

  /* ---- 暗红灯笼：画面另一侧的一点红，极缓地晃 ---- */
  .lantern {
    position: absolute; top: 12%; right: 9%;
    width: 58px; height: 78px;
    border-radius: 50% 50% 46% 46% / 44% 44% 56% 56%;
    background:
      radial-gradient(ellipse at 50% 62%, rgba(234, 120, 80, 0.55) 0%, transparent 60%),
      linear-gradient(180deg, #7a3328 0%, var(--ch-blood) 50%, #5f271e 100%);
    box-shadow: 0 0 44px rgba(179, 99, 54, 0.25), inset 0 -8px 14px rgba(0, 0, 0, 0.5);
    /* 挂绳 */
    border-top: 2px solid #4a3320;
    transform-origin: 50% -60px;
    animation: lantern-sway 9s ease-in-out infinite;
  }
  .lantern::before {
    content: ""; position: absolute; top: -60px; left: 50%;
    width: 1px; height: 60px; background: #4a3320;
  }
  @keyframes lantern-sway {
    0%, 100% { transform: rotate(-2.5deg); }
    50%      { transform: rotate(2.5deg); } /* 极小摆幅：风大就不是恐怖是喜剧了 */
  }

  /* ---- 惊吓（scare）：30s 周期里只有 0.4s 的画面微震 + 闪红 ----
     纪律：频率极低、时长极短、幅度极小；reduced-motion 下整个动画不存在 */
  body::after {
    content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 90;
    background: rgba(139, 58, 47, 0.12);
    opacity: 0;
    animation: scare 30s steps(1) infinite;
  }
  @keyframes scare {
    0%, 98.6%, 100% { opacity: 0; }
    98.8% { opacity: 1; } 99.0% { opacity: 0; } 99.2% { opacity: 0.7; } 99.4% { opacity: 0; }
  }

  /* ---- 按钮：暗金描边，hover 时像被烛火照亮，绝不用亮色填充 ---- */
  .ch-btn {
    font-family: var(--ch-serif); font-size: 15px; letter-spacing: 0.4em; text-indent: 0.4em;
    cursor: pointer;
    color: var(--ch-gold);
    background: transparent;
    border: 1px solid rgba(200, 156, 87, 0.55);
    padding: 14px 40px;
    transition: box-shadow 0.6s, color 0.6s, border-color 0.6s;
  }
  .ch-btn:hover {
    color: #e8cd8f;
    border-color: #e8cd8f;
    box-shadow: 0 0 24px rgba(200, 156, 87, 0.25), inset 0 0 14px rgba(200, 156, 87, 0.1);
  }
  .ch-btn:focus-visible { outline: 1px dashed var(--ch-paper); outline-offset: 5px; }

  .caption { font-size: 13px; line-height: 2.1; color: #9a8a6a; max-width: 46ch; letter-spacing: 0.12em; }

  /* ---- 降级：unease / flicker / 灯笼 / scare 全部静止。
     中式恐怖的静态版本依然成立——一盏不动的烛、一张符、一片暗，就是"静物恐怖" ---- */
  @media (prefers-reduced-motion: reduce) {
    .unease-wrap, .flame, .glow, .lantern { animation: none !important; }
    body::after { animation: none !important; opacity: 0 !important; } /* 惊吓彻底移除：光敏安全红线 */
    .ch-btn { transition: none !important; }
  }
</style>
</head>
<body>

<div class="lantern" aria-hidden="true"></div>

<div class="unease-wrap" style="display:flex; flex-direction:column; align-items:center; gap:48px; width:100%;">
  <header class="title-block">
    <h1>夜宅無眠</h1>
    <div class="sub">子時三刻 · 燭滅莫回頭</div>
  </header>

  <div class="candle-stage" role="img" aria-label="一支红烛，烛火摇曳">
    <div class="glow"></div>
    <div class="candle-body"></div>
    <div class="flame"></div>
  </div>

  <div style="display:flex; align-items:center; gap:44px; flex-wrap:wrap; justify-content:center;">
    <div class="talisman">鎮宅平安</div>
    <p class="caption">
      褪色的紅、陳舊的金、燭火只照亮眼前一尺——中式恐怖的恐怖不靠血腥，
      靠「熟悉的東西不對勁」。九成時間是靜的：壓抑來自靜止，
      偶發的一次燭跳與畫面微震，才讓靜止變成恐懼。
    </p>
  </div>

  <button class="ch-btn">推門而入</button>
</div>

</body>
</html>
```
<!-- EMBED:END -->
