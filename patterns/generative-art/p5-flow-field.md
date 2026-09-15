# p5.js 粒子流场

> **ID** `p5-flow-field` · **分类** generative-art · **性能** medium · **依赖** p5.js（CDN）

## Context

数千粒子沿 Perlin 噪声向量场漂移，画出丝绢般的彩色流线——生成艺术的「Hello World 进阶版」。适合全屏氛围背景、互动装置、艺术项目首屏。点击换种子重画，自带「抽卡」乐趣。

## Approach

- **思路**：噪声值映射为 0~4π 方向角形成向量场，粒子每步「顺势」移动一小段并画线；半透明遮罩让旧轨迹慢慢沉底，积累出丝绢层次。
- **技术**：p5.js CDN（UMD 双击可开）。`randomSeed` + `noiseSeed` 双重锁定种子——同一 seed 严格复现同一幅画。粒子有寿命与出界重生机制，防止全部堆死在场边界。
- **性能**：900 粒子每帧 900 次 noise + line，桌面轻松、手机发热；移动端建议粒子数减到 400。
- **降级**：`prefers-reduced-motion` 时 `noLoop()` 前离线跑 400 帧把流线画满——交付一幅静态成品画而非黑屏。
- **调参**：`noiseScale` 控制浪的大小；`fadeAlpha` 控制拖尾长度；`palette` 换色板 = 换情绪。

## Example

<!-- EMBED:START:snippets/generative-art/p5-flow-field.html -->
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>p5.js 流场（Flow Field）</title>
<!--
  p5.js 粒子流场：数千粒子沿噪声向量场漂移，画出丝绢般的流线。
  双击即可预览。点击画面 = 换一批种子重新开始。
  为什么用 p5：噪声函数、画布、循环全部现成，
  做生成艺术草稿的迭代速度是原生 Canvas 的 3 倍。
-->
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #050510; }
  canvas { display: block; }
</style>
</head>
<body>
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
<script>
  // ===== 视觉参数集中区 =====
  const CONFIG = {
    particleCount: 900,   // 粒子数：600~1500；流线的美来自"密"
    noiseScale: 0.003,    // 噪声缩放：越小流域越"大浪"，越大越"碎浪"
    noiseSpeed: 0.0006,   // 场随时间变化的速度：接近 0 = 准静态的丝绸感
    stepSize: 1.6,        // 粒子每步长度：1~2 是"生长"，5+ 是"喷射"
    fadeAlpha: 6,         // 每帧遮罩透明度（0~255）：小=长拖尾累积，大=短促
    palette: ["#7c6cff", "#38f9d7", "#f72585", "#ffd166"], // 抽色板：按权重近似均匀抽
    lifespan: 300,        // 粒子寿命（帧）：到期重生，避免粒子都挤在吸引子上
    seed: 42,             // 随机种子：同种子 = 同一幅画（生成艺术的"可复现"命脉）
  };

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let particles = [];

  function setup() {
    createCanvas(windowWidth, windowHeight);
    background(5, 5, 16);
    randomSeed(CONFIG.seed);
    noiseSeed(CONFIG.seed); // 噪声也吃种子：两重锁定，画面完全可复现
    for (let i = 0; i < CONFIG.particleCount; i++) {
      particles.push(newParticle());
    }
    if (prefersReducedMotion) {
      noLoop();
      // 降级：离线跑 400 帧把流线画满，得到一幅静态"成品画"再停
      for (let i = 0; i < 400; i++) draw();
    }
  }

  function newParticle() {
    return {
      x: random(width),
      y: random(height),
      life: random(CONFIG.lifespan), // 初始寿命随机：粒子不会"齐死齐生"
      color: CONFIG.palette[Math.floor(random(CONFIG.palette.length))],
    };
  }

  function draw() {
    // 半透明遮罩：旧轨迹慢慢沉入背景 → 丝绢质感的关键
    noStroke();
    fill(5, 5, 16, CONFIG.fadeAlpha);
    rect(0, 0, width, height);

    strokeWeight(1.4);
    for (const p of particles) {
      // 噪声角度场：把 2D 噪声值映射成 0~2π 方向，粒子"顺势而为"
      const angle = noise(p.x * CONFIG.noiseScale, p.y * CONFIG.noiseScale, frameCount * CONFIG.noiseSpeed) * TWO_PI * 2;
      const nx = p.x + cos(angle) * CONFIG.stepSize;
      const ny = p.y + sin(angle) * CONFIG.stepSize;

      stroke(p.color + "aa"); // 末尾 aa = 70% 透明度：丝线互相叠出层次
      line(p.x, p.y, nx, ny);

      p.x = nx;
      p.y = ny;
      p.life--;

      // 出界或寿终 → 重生；没有重生机制粒子会全部堆死在场的边界
      if (p.life <= 0 || p.x < -10 || p.x > width + 10 || p.y < -10 || p.y > height + 10) {
        Object.assign(p, newParticle());
      }
    }
  }

  // 点击换种子：一屏一个命，观众有"抽卡"的乐趣
  function mousePressed() {
    CONFIG.seed = Math.floor(random(100000));
    randomSeed(CONFIG.seed);
    noiseSeed(CONFIG.seed);
    background(5, 5, 16);
    particles = particles.map(() => newParticle());
  }

  function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    background(5, 5, 16);
  }
</script>
</body>
</html>
```
<!-- EMBED:END -->
