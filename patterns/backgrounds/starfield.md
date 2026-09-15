# 3D 星空 / 流星背景

> **ID** `starfield` · **分类** backgrounds · **性能** medium · **依赖** 无

## Context

「星际穿越」式迎面飞来的星空隧道 + 随机流星。适合太空 / 航天 / 游戏 / 科幻题材落地页，或作为 loading 场景。深空底色 + 冷白星光，天然适配暗色主题。

## Approach

- **思路**：伪 3D——每颗星只有 `(x, y, z)`，透视投影 `screenX = (x/z) * focal + center` 压到 2D；`z` 每帧递减即产生「迎面飞来」感，近处的星更大更亮（除以 z 的自然结果）。
- **技术**：Canvas 2D。飞过镜头的星星送回最远处循环利用；流星从上半屏 45°±10° 入场，轨迹点数组画渐隐拖尾；每帧用 4% 透明度的黑色矩形覆盖而非 clearRect，天然产生运动拖尾。
- **性能**：420 星 + 流星在桌面轻松；移动端自动降到 200 星。闪烁（twinkle）用 sin 波 ±15% 幅度，别调大否则像信号灯。
- **降级**：`prefers-reduced-motion` 时渲染满亮度的一帧静态星空，不生成流星。
- **迁移提示**：注入 React 时放 `useEffect`；流星用 `setTimeout` 链式调度，组件卸载时记得清 timer。

## Example

<!-- EMBED:START:snippets/backgrounds/starfield.html -->
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>3D 星空 / 流星背景</title>
<!--
  3D 星空（透视隧道）+ 随机流星：双击即可预览。
  原理：每颗星只有 (x, y, z) 三个数，投影公式把 3D 压到 2D：
    screenX = (x / z) * focal + centerX
  z 每帧递减 → 星星"迎面飞来"，透视放大 + 亮度随 z 提升都由此而来。
-->
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #030308; }
  canvas { display: block; }
</style>
</head>
<body>
<canvas id="space"></canvas>
<script>
  // ===== 视觉参数集中区 =====
  const CONFIG = {
    starCount: 420,        // 星星数：420 在桌面够密又够快；手机降到 200
    speed: 0.9,           // 隧道前进速度：1.2 以上开始有"跃迁"感
    maxDepth: 900,        // 星星生成的最远深度（伪 3D 的景深范围）
    twinkle: true,        // 星星是否闪烁：闪烁是"活的天空"与"贴图"的分界线
    meteorInterval: [2.5, 6], // 流星间隔范围（秒）：随机才不像报时
    meteorSpeed: 9,
    meteorColor: "255, 255, 255",
    isMobile: window.matchMedia("(pointer: coarse)").matches,
  };
  if (CONFIG.isMobile) CONFIG.starCount = 200;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.getElementById("space");
  const ctx = canvas.getContext("2d");
  let W, H, CX, CY;

  // focal 是"镜头焦距"：值越大视野越窄、纵深感越强（透视越夸张）
  const FOCAL = 320;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    CX = W / 2;
    CY = H / 2;
    canvas.width = W * ratio;
    canvas.height = H * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  // 星星分布在以镜头为中心的立方体内；x/y 取 ±maxDepth 保证任意 z 下都不出屏太多
  function makeStar() {
    return {
      x: Math.random() * CONFIG.maxDepth * 2 - CONFIG.maxDepth,
      y: Math.random() * CONFIG.maxDepth * 2 - CONFIG.maxDepth,
      z: Math.random() * CONFIG.maxDepth,
      // tw 相位随机：每颗星的闪烁节奏错开
      tw: Math.random() * Math.PI * 2,
    };
  }

  let stars = [];
  const meteors = [];

  function spawnMeteor() {
    // 流星永远从上半屏入场（符合直觉：流星向下坠），角度锁定 45°±10°
    const angle = Math.PI * 0.75 + (Math.random() - 0.5) * 0.35;
    meteors.push({
      x: Math.random() * W * 0.8 + W * 0.1,
      y: -20,
      vx: Math.cos(angle) * CONFIG.meteorSpeed,
      vy: Math.sin(angle) * CONFIG.meteorSpeed,
      life: 1,        // 生命值 1→0，控制拖尾透明度与销毁
      trail: [],      // 历史轨迹点：画拖尾用
    });
    // 下一次流星：区间内随机
    const [min, max] = CONFIG.meteorInterval;
    setTimeout(spawnMeteor, (min + Math.random() * (max - min)) * 1000);
  }

  function step(t) {
    // 为什么留残影而非 clearRect：全球用带透明度的黑色矩形覆盖，
    // 星星和流星会自带运动拖尾，一行代码省掉专门的拖尾系统
    ctx.fillStyle = "rgba(3, 3, 8, 0.4)";
    ctx.fillRect(0, 0, W, H);

    for (const s of stars) {
      s.z -= CONFIG.speed;
      if (s.z <= 1) {
        // 飞过镜头 → 送回最远处，星星循环利用，数量恒定
        s.z = CONFIG.maxDepth;
        s.x = Math.random() * CONFIG.maxDepth * 2 - CONFIG.maxDepth;
        s.y = Math.random() * CONFIG.maxDepth * 2 - CONFIG.maxDepth;
      }

      const sx = (s.x / s.z) * FOCAL + CX;
      const sy = (s.y / s.z) * FOCAL + CY;
      if (sx < 0 || sx > W || sy < 0 || sy > H) continue;

      // 越近越大越亮：除以 z 是透视投影的自然结果，无需额外调参
      const size = Math.max(0.4, (1 - s.z / CONFIG.maxDepth) * 2.2);
      let alpha = 1 - s.z / CONFIG.maxDepth;
      if (CONFIG.twinkle) {
        // sin 闪烁：0.7~1.0 的幅度，太大会像信号灯
        alpha *= 0.7 + 0.3 * Math.abs(Math.sin(t * 0.002 + s.tw));
      }
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 225, 255, ${alpha.toFixed(3)})`;
      ctx.fill();
    }

    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx;
      m.y += m.vy;
      m.life -= 0.012;
      m.trail.push({ x: m.x, y: m.y });
      if (m.trail.length > 14) m.trail.shift(); // 拖尾长度封顶

      // 渐隐线段画拖尾：从尾到头透明度递增，头部最亮
      for (let j = 1; j < m.trail.length; j++) {
        const a = (j / m.trail.length) * m.life * 0.8;
        ctx.beginPath();
        ctx.moveTo(m.trail[j - 1].x, m.trail[j - 1].y);
        ctx.lineTo(m.trail[j].x, m.trail[j].y);
        ctx.strokeStyle = `rgba(${CONFIG.meteorColor}, ${a.toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      if (m.life <= 0 || m.y > H + 40) meteors.splice(i, 1);
    }
  }

  window.addEventListener("resize", () => {
    resize();
    stars = Array.from({ length: CONFIG.starCount }, makeStar);
  });

  resize();
  stars = Array.from({ length: CONFIG.starCount }, makeStar);

  if (prefersReducedMotion) {
    // 降级：静止星空（星星满亮度定格）+ 不生成流星。夜空静态图完全可用
    for (const s of stars) {
      const sx = (s.x / s.z) * FOCAL + CX;
      const sy = (s.y / s.z) * FOCAL + CY;
      const size = Math.max(0.4, (1 - s.z / CONFIG.maxDepth) * 2.2);
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 225, 255, ${(1 - s.z / CONFIG.maxDepth).toFixed(3)})`;
      ctx.fill();
    }
  } else {
    (function loop(t) {
      requestAnimationFrame(loop);
      step(t);
    })(0);
    const [min, max] = CONFIG.meteorInterval;
    setTimeout(spawnMeteor, (min + Math.random() * (max - min)) * 1000);
  }
</script>
</body>
</html>
```
<!-- EMBED:END -->
