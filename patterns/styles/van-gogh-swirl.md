# 梵高星夜旋涡（Van Gogh Swirl Canvas）

> **ID** `van-gogh-swirl` · **分类** styles · **性能** high · **依赖** 无

## Context

《星夜》式旋涡笔触生成器：笔触沿流场画短弧线，堆叠出梵高的厚涂肌理。适合全屏氛围背景、艺术项目、冥想/音乐类产品。stroke-based rendering（笔触渲染）是生成艺术里「 painterly 质感」的核心技术。

## Approach

- **流场构造**：三个固定漩涡中心（两星一月）的**切向向量加权叠加**（权重 `exp(-dist/reach)` 随距离衰减）+ 恒定全局风 + 噪声扰动——漩涡之间也有秩序的流动。
- **笔触三要素**：短弧线（`quadraticCurveTo`，控制点垂直于流向随机偏移——弧度即「手抖」）；圆头线帽；宽度与透明度带随机抖动。**长度 16px 左右**，长了是丝带不是笔触。
- **选色逻辑**：距最近涡心的距离分三档色池——涡心亮黄（星月光晕）、中间蓝绿、远处深蓝。这是星夜「光从漩涡里渗出来」的原因。
- **性能**：全屏每帧 60 笔属最贵一档；移动端减半。出场前预铺笔触避免空屏。
- **降级**：`prefers-reduced-motion` 补足 6 秒等效笔触后定格——静态成品画。
- **调参**：`vortices` 数组移动漩涡位置即改变构图；`swirlSpeed` 控制流动快慢。

## Example

<!-- EMBED:START:snippets/styles/van-gogh-swirl.html -->
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>梵高星夜 · 旋涡笔触流场（Van Gogh Swirl Canvas）</title>
<!--
  梵高《星夜》风格生成器：旋涡流场 + 短弧笔触堆叠。
  双击即可预览。
  翻译关键（源自 stroke-based rendering 教程总结）：
  · 笔触沿流向画短弧线（不是直线），颜料感来自"弧度 + 厚度抖动"；
  · 旋涡中心固定几处（星与月），其余区域做流动的次级扰动；
  · 色板限定深蓝→蓝绿→亮黄，亮度跟随与漩涡中心的距离。
-->
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #0b1026; }
  canvas { display: block; }
</style>
</head>
<body>
<canvas id="starry"></canvas>
<script>
  // ===== 视觉参数集中区 =====
  const CONFIG = {
    // 星夜色板：从深夜蓝到月光黄（梵高只用了这几管颜料的感觉）
    colorsDeep:  ["#0e1638", "#16204a", "#1d2b5e"],
    colorsMid:   ["#274077", "#33518c", "#4a6da8"],
    colorsGlow:  ["#e8c86a", "#f2df9a", "#d9a441"],
    strokeLen: 16,         // 笔触长度（px）：短弧，太长就成丝带不是笔触
    strokeW: 3.2,          // 笔触宽度
    layerAlpha: 0.35,      // 笔触不透明度：半干堆叠，颜料肌理的来源
    strokesPerFrame: 60,
    swirlSpeed: 0.00025,   // 整体流动速度
    // 漩涡中心（相对坐标）：两颗"星" + 一轮"月"，星夜的三处高光
    vortices: [
      { x: 0.22, y: 0.30, r: 0.16, strength: 3.2 },  // 左上的星
      { x: 0.68, y: 0.24, r: 0.20, strength: 4.0 },  // 右上的月（最大漩涡）
      { x: 0.50, y: 0.78, r: 0.13, strength: 2.4 },  // 下方的气流涡
    ],
    isMobile: window.matchMedia("(pointer: coarse)").matches,
  };
  if (CONFIG.isMobile) CONFIG.strokesPerFrame = 34;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.getElementById("starry");
  const ctx = canvas.getContext("2d");
  let W, H;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * ratio; canvas.height = H * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = "#0e1638";
    ctx.fillRect(0, 0, W, H); // 深蓝底：未覆盖处露出夜空
  }

  // 次级扰动：让漩涡之间的区域也在缓慢流动（星夜的"风"）
  function curlNoise(x, y, t) {
    return Math.sin(x * 2.1 + t * 1.3) * Math.cos(y * 1.7 - t) +
           Math.sin((x - y) * 1.2 + t * 0.6);
  }

  // 流场方向：各漩涡切向量的加权和 + 噪声风
  function fieldAngle(px, py, t) {
    let vx = 0, vy = 0;
    for (const v of CONFIG.vortices) {
      const dx = px - v.x * W;
      const dy = py - v.y * H;
      const dist = Math.hypot(dx, dy) + 1;
      const reach = v.r * Math.max(W, H);
      if (dist < reach * 2.2) {
        // 切向方向 (-dy, dx)/dist，权重随距离衰减——离涡心越远转得越慢
        const w = v.strength * Math.exp(-dist / reach);
        vx += (-dy / dist) * w;
        vy += (dx / dist) * w;
      }
    }
    // 全局风：一个恒定的东北向流，让非漩涡区也有秩序的流动
    vx += 0.6;
    vy += -0.25;
    // 噪声风：叠加摆动，避免流动过于"机械对称"
    const n = curlNoise(px * 0.002, py * 0.002, t);
    vx += Math.cos(n * 2) * 0.4;
    vy += Math.sin(n * 2) * 0.4;
    return Math.atan2(vy, vx);
  }

  // 距最近涡心的距离 → 选色板：涡心亮黄、中间蓝绿、远处深蓝
  function pickColor(px, py) {
    let minD = Infinity;
    for (const v of CONFIG.vortices) {
      const d = Math.hypot(px - v.x * W, py - v.y * H) / (v.r * Math.max(W, H));
      minD = Math.min(minD, d);
    }
    const pools = minD < 0.55 ? CONFIG.colorsGlow
                : minD < 1.5  ? CONFIG.colorsMid
                : CONFIG.colorsDeep;
    return pools[Math.floor(Math.random() * pools.length)];
  }

  // 画一笔：短弧线（quadraticCurve 微弯）——梵高笔触的姿态
  function stroke(t) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const a = fieldAngle(x, y, t);
    const len = CONFIG.strokeLen * (0.6 + Math.random() * 0.8);
    // 弯曲控制点：垂直于流向随机偏移 → 弧度即"手抖"
    const bend = (Math.random() - 0.5) * len * 0.8;
    const cx = x + Math.cos(a) * len / 2 - Math.sin(a) * bend;
    const cy = y + Math.sin(a) * len / 2 + Math.cos(a) * bend;
    const ex = x + Math.cos(a) * len;
    const ey = y + Math.sin(a) * len;

    ctx.globalAlpha = CONFIG.layerAlpha * (0.5 + Math.random() * 0.5);
    ctx.strokeStyle = pickColor(x, y);
    ctx.lineWidth = CONFIG.strokeW * (0.6 + Math.random() * 0.9);
    ctx.lineCap = "round"; // 圆头：颜料的起点和收尾都是圆润的
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(cx, cy, ex, ey);
    ctx.stroke();
  }

  window.addEventListener("resize", resize);
  resize();

  const t0 = performance.now();
  // 预铺笔触：让画面以"半成品"出场（约 4 秒等效），随后继续生长
  for (let i = 0; i < 240 * CONFIG.strokesPerFrame; i++) stroke(0);

  if (prefersReducedMotion) {
    // 降级：再补 6 秒等效笔触后定格——一幅画完的静态星夜
    for (let i = 0; i < 360 * CONFIG.strokesPerFrame; i++) stroke(1000);
  } else {
    (function loop(now) {
      requestAnimationFrame(loop);
      const t = (now - t0) * CONFIG.swirlSpeed;
      for (let i = 0; i < CONFIG.strokesPerFrame; i++) stroke(t);
    })(t0);
  }
</script>
</body>
</html>
```
<!-- EMBED:END -->
