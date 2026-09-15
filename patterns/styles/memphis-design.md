# 孟菲斯风格（Memphis Design）

> **ID** `memphis-design` · **分类** styles · **性能** low-cost · **依赖** 无

## Context

1981 年米兰 Memphis 小组开创的后现代风格：打破「一个设计不超过三色」的清规，用高饱和撞色 + 点线面几何 + 手绘感笔触制造愉悦与玩趣（MTV 早期 logo、Solo Jazz 杯都是它的代表作）。适合年轻品牌、活动页、教育/创意产品；**不适合**需要严肃稳重情绪的场景——它的所有情绪都指向快乐。

## Approach

- **设计 token**：亮黄 `#FFD100` / 撞粉 `#FF71CE` / 撞青 `#00C2D1` / 撞橙 `#FF6E27` / 撞紫 `#7C4DFF`，米白底 + 粗黑描边兜住画面。伪立体阴影公式：`6px 6px 0 var(--m-ink)`——实心、无模糊、固定偏移。
- **实现**：圆点阵背景（`radial-gradient` 平铺）、锯齿线（45° 双 gradient 拼）、几何装饰散布且**不受栅格限制**；卡片带 ±1.5° 微旋转（完全对齐的卡片是瑞士风，不是孟菲斯）。粗无衬线字体。
- **动效建议**：装饰图形缓慢摇摆 + hover 按压（位移吃阴影）。教程原话：加微妙动效避免显得扁平过时。
- **降级**：`prefers-reduced-motion` 停止摇摆，图形本身是静态装饰无需移除。
- **迁移提示**：token 全在 `:root` CSS 变量，注入 React 时把 `<style>` 搬进组件即可。

## Example

<!-- EMBED:START:snippets/styles/memphis-design.html -->
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>孟菲斯风格套件（Memphis Design）</title>
<!--
  孟菲斯风格套件：1980 年代米兰 Memphis 小组的后现代设计语言。
  双击即可预览。风格要素（源自优设/腾讯云教程总结）：
  打破配色谱率的撞色 + 点线面几何 + 手绘感笔触 + 伪立体 + 粗黑描边。
  适用于：愉悦、互动、年轻化场景；不适用于：严肃/稳重场景。
-->
<style>
  /* ===== 设计 token 集中区：换肤只改这里 ===== */
  :root {
    --m-yellow: #FFD100;   /* 孟菲斯标志性亮黄 */
    --m-pink:   #FF71CE;   /* 撞粉 */
    --m-cyan:   #00C2D1;   /* 撞青 */
    --m-orange: #FF6E27;   /* 撞橙 */
    --m-purple: #7C4DFF;   /* 撞紫 */
    --m-ink:    #111111;   /* 粗黑描边：孟菲斯的"轮廓纪律" */
    --m-paper:  #FFF8EE;   /* 米白底：比纯白柔和，衬得撞色不脏 */
    /* 伪立体阴影公式：实心、无模糊、固定偏移——80 年代印刷质感的精髓 */
    --m-shadow: 6px 6px 0 var(--m-ink);
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "Arial Black", "PingFang SC", sans-serif; /* 无衬线粗体：教程明确"非衬线是最受欢迎的选择" */
    background: var(--m-paper);
    /* 点阵背景：radial-gradient 两点定位拼成一格，repeat 平铺全屏 */
    background-image: radial-gradient(var(--m-purple) 2.2px, transparent 2.6px);
    background-size: 34px 34px;
    color: var(--m-ink);
    min-height: 100vh;
    overflow-x: hidden;
  }
  .page { max-width: 960px; margin: 0 auto; padding: 64px 24px; position: relative; }

  /* ---- 装饰图形：绝对定位散布，不受栅格限制（教程原话"自由图形，不受栅格限制"） ---- */
  .deco { position: absolute; pointer-events: none; z-index: 0; }
  .d-tri {
    width: 0; height: 0; border-left: 34px solid transparent; border-right: 34px solid transparent;
    border-bottom: 58px solid var(--m-orange);
    top: 90px; right: 6%; transform: rotate(18deg);
    /* 微妙动效：教程建议"加动效避免显得扁平过时"——缓慢摇摆即可 */
    animation: memphis-sway 5s ease-in-out infinite alternate;
  }
  .d-zigzag {
    top: 210px; left: 2%; width: 120px; height: 26px;
    /* 锯齿线：linear-gradient 45°/-45° 各画一半，拼出连续三角波 */
    background:
      linear-gradient(45deg, var(--m-cyan) 25%, transparent 25%) 0 0 / 26px 26px,
      linear-gradient(-45deg, var(--m-cyan) 25%, transparent 25%) 13px 0 / 26px 26px;
    animation: memphis-sway 4s ease-in-out infinite alternate-reverse;
  }
  .d-circle {
    bottom: 120px; right: 4%; width: 76px; height: 76px; border-radius: 50%;
    background: var(--m-pink); border: 5px solid var(--m-ink);
    animation: memphis-bob 3.4s ease-in-out infinite;
  }
  @keyframes memphis-sway { from { transform: rotate(-8deg); } to { transform: rotate(14deg); } }
  @keyframes memphis-bob  { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }

  /* ---- 标题区 ---- */
  .hero { position: relative; z-index: 1; }
  .tag {
    display: inline-block; background: var(--m-ink); color: var(--m-yellow);
    padding: 6px 14px; transform: rotate(-3deg); font-size: 13px; letter-spacing: 0.2em;
    /* 旋转标签：孟菲斯排版"不对称、夸张比例"的直接表达 */
  }
  h1 {
    font-size: clamp(44px, 9vw, 92px); line-height: 0.95; margin: 18px 0 10px;
    /* 标题三色错位：每个词独立色块，打破"一个标题一个色"的惯例 */
    text-transform: uppercase;
  }
  h1 .w1 { background: var(--m-yellow); padding: 0 12px; box-shadow: var(--m-shadow); }
  h1 .w2 { color: var(--m-paper); background: var(--m-pink); padding: 0 12px; box-shadow: var(--m-shadow); display: inline-block; transform: rotate(2deg); }
  h1 .w3 {
    /* 波浪下划线：text-decoration 波浪自带手绘感 */
    text-decoration: underline wavy var(--m-cyan) 5px; text-underline-offset: 10px;
  }

  /* ---- 卡片：伪立体的主要载体 ---- */
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 28px; margin-top: 56px; position: relative; z-index: 1; }
  .card {
    background: #fff; border: 4px solid var(--m-ink); box-shadow: var(--m-shadow);
    padding: 22px; position: relative;
    /* 悬停"按压"：位移压缩阴影——伪立体世界的物理反馈 */
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
  .card:hover { transform: translate(3px, 3px); box-shadow: 3px 3px 0 var(--m-ink); }
  .card:nth-child(1) { transform: rotate(-1.2deg); }
  .card:nth-child(2) { transform: rotate(1.4deg); }
  .card:nth-child(3) { transform: rotate(-0.6deg); }
  /* 卡片小脏乱差微旋转是关键：完全对齐的卡片是"瑞士风格"，不是孟菲斯 */
  .card .badge {
    position: absolute; top: -16px; left: 16px;
    background: var(--m-cyan); border: 3px solid var(--m-ink);
    font-size: 12px; padding: 4px 10px; transform: rotate(-4deg);
  }
  .card h3 { font-size: 19px; margin: 10px 0 8px; }
  .card p  { font-family: "PingFang SC", sans-serif; font-weight: normal; font-size: 14px; line-height: 1.7; opacity: 0.85; }

  /* ---- 按钮：撞色 + 实心偏移阴影 + 黑描边三件套 ---- */
  .actions { margin-top: 48px; display: flex; gap: 18px; flex-wrap: wrap; position: relative; z-index: 1; }
  .btn {
    font-family: inherit; font-size: 16px; cursor: pointer;
    border: 4px solid var(--m-ink); box-shadow: var(--m-shadow);
    padding: 14px 30px; background: var(--m-yellow);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .btn.alt { background: var(--m-purple); color: #fff; }
  .btn:hover { transform: translate(3px, 3px); box-shadow: 3px 3px 0 var(--m-ink); }
  .btn:active { transform: translate(6px, 6px); box-shadow: 0 0 0 var(--m-ink); }

  /* 降级：装饰微动效停止（图形本身是静态装饰，保留不影响无障碍） */
  @media (prefers-reduced-motion: reduce) {
    .d-tri, .d-zigzag, .d-circle { animation: none !important; }
    .card, .btn { transition: none !important; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="deco d-tri"></div>
  <div class="deco d-zigzag"></div>
  <div class="deco d-circle"></div>

  <header class="hero">
    <span class="tag">MEMPHIS · 1981</span>
    <h1>
      <span class="w1">打破</span><br>
      <span class="w2">一切</span> <span class="w3">规则</span>
    </h1>
    <p style="font-weight: normal; font-family: 'PingFang SC', sans-serif; max-width: 46ch; line-height: 1.8;">
      撞色、几何、手绘感笔触与伪立体——为愉悦而设计。把下面的卡片与按钮换成你的内容即可。
    </p>
  </header>

  <div class="cards">
    <div class="card">
      <span class="badge">撞色</span>
      <h3>打破配色谱率</h3>
      <p>三种以上高饱和色并置是常态：黄/粉/青/橙/紫任选组合，米白底与黑描边负责"兜住"画面。</p>
    </div>
    <div class="card">
      <span class="badge" style="background: var(--m-orange); color: #fff;">点线面</span>
      <h3>几何即装饰</h3>
      <p>圆点阵、锯齿、波浪线、三角与圆——装饰不依赖照片，全部由几何图形承担。</p>
    </div>
    <div class="card">
      <span class="badge" style="background: var(--m-pink);">伪立体</span>
      <h3>实心偏移阴影</h3>
      <p>无模糊的硬阴影制造"贴纸凸起"感，这是孟菲斯与拟物风的分界线。</p>
    </div>
  </div>

  <div class="actions">
    <button class="btn">加入派对</button>
    <button class="btn alt">了解更多</button>
  </div>
</div>
</body>
</html>
```
<!-- EMBED:END -->
