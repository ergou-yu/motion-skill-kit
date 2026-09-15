# fbm 云雾 Shader

> **ID** `noise-cloud-shader` · **分类** shaders · **性能** high · **依赖** 无（原生 WebGL1）

## Context

GPU 版分形噪声云：天空垂直渐变 + domain-warp 扭曲的 fbm 云层，随风漂移并自行翻涌。游戏天空盒、天气类产品、氛围站背景的天花板方案。与 `generative-art/canvas-noise-field`（CPU 孪生）对照学习。

## Approach

- **思路**：value noise（四角 hash + smoothstep 插值，比 Perlin 梯度便宜，做云够用）→ fbm 五层叠加 → **domain warp**：把一层 fbm 的输出加进另一层的采样坐标，「用噪声扰动噪声」，普通 blob 立刻获得卷曲的云质感——这是本片段最值得抄走的一招。
- **技术**：WebGL1 循环边界必须是常量，`u_octaves` 用 `if (float(i) >= u_octaves) break` 控制；天空底色 `pow(uv.y, 0.7)` 垂直渐变，云量由 `u_density` 切分。
- **性能**：每像素 2 次 warp 采样 × 5 层 fbm ≈ 10+ 次 noise，属于最贵一档；低端设备把 `octaves` 降到 3、`pixelRatioCap` 降到 1。
- **降级**：`u_motion` 置 0 冻结全部时间项，渲染 t=60s 的成熟构图一帧（云已充分展开）。
- **调参**：`drift` 风速、`morph` 翻涌速度、`cloudDensity` 0.3 稀疏~0.7 阴天。

## Example

<!-- EMBED:START:snippets/shaders/noise-cloud-shader.html -->
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>fbm 云雾 Shader</title>
<!--
  分形噪声云雾 shader：GPU 上跑 fbm，帧率远超 CPU 版
  （snippets/generative-art/canvas-noise-field.html 是它的 CPU 孪生）。
  双击即可预览。
-->
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #06080f; }
  canvas { display: block; width: 100%; height: 100%; }
</style>
</head>
<body>
<canvas id="gl"></canvas>
<script>
  // ===== 视觉参数集中区 =====
  const CONFIG = {
    octaves: 5,        // fbm 层数：5 层出"真云"细节；GPU 上加层代价远小于 CPU
    baseScale: 1.6,    // 空间频率：基础云团大小
    drift: 0.03,       // 风速（uv/秒）：云的整体漂移
    morph: 0.06,       // 形变速度：云自己的"翻涌"
    skyTop: [0.05, 0.07, 0.16],     // 天顶色（深）
    skyBottom: [0.28, 0.33, 0.52],  // 地平线色（亮）：上深下亮 = 有大气感
    cloudColor: [0.92, 0.95, 1.0],  // 云体色
    cloudDensity: 0.5, // 云量：0.3 稀疏~0.7 阴天
    pixelRatioCap: 2,
  };

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.getElementById("gl");
  const gl = canvas.getContext("webgl", { antialias: false });

  const VERT = `
    attribute vec2 a_position;
    void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
  `;

  const FRAG = `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec3 u_skyTop;
    uniform vec3 u_skyBottom;
    uniform vec3 u_cloudColor;
    uniform float u_octaves;
    uniform float u_baseScale;
    uniform float u_drift;
    uniform float u_morph;
    uniform float u_density;
    uniform float u_motion; // reduced-motion 时置 0：时间冻结

    // hash：经典 one-liner 哈希，返回 [0,1)
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    // value noise：四角 hash + smoothstep 插值 —— 比 Perlin 梯度噪声便宜，
    // 做云完全够用（云不需要梯度的"方向正确"，只需要"平滑随机"）
    float vnoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f); // smoothstep 缓动：插值平滑的关键
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    // fbm：多层不同频率噪声叠加；每层乘 0.5 的 lacunarity/gain 组合
    float fbm(vec2 p) {
      float v = 0.0;
      float amp = 0.5;
      for (int i = 0; i < 5; i++) {
        if (float(i) >= u_octaves) break; // uniform 控制层数（WebGL1 循环边界必须常量）
        v += amp * vnoise(p);
        p = p * 2.03 + vec2(17.3, 9.1); // 位移打破层与层的相关性
        amp *= 0.5;
      }
      return v; // 约 [0, 1)
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float aspect = u_resolution.x / u_resolution.y;
      vec2 p = vec2(uv.x * aspect, uv.y);

      // 云场坐标：整体 drift 平移（风）+ morph 时间形变（翻涌）
      float t = u_time * u_motion;
      vec2 cloudP = p * u_baseScale + vec2(t * u_drift, t * u_drift * 0.3);

      // 二次 fbm 域扭曲（domain warp）：把噪声的输出再喂进坐标 ——
      // "用噪声扰动噪声"，普通 blob 立刻获得云的卷曲质感
      vec2 warp = vec2(
        fbm(cloudP + vec2(0.0, 0.0)),
        fbm(cloudP + vec2(5.2, 1.3))
      );
      float clouds = fbm(cloudP + warp * 1.8);

      // 天空底色：垂直渐变 + 云的密度切分
      vec3 sky = mix(u_skyBottom, u_skyTop, pow(uv.y, 0.7));
      float mask = smoothstep(1.0 - u_density - 0.25, 1.0 - u_density + 0.25, clouds);

      gl_FragColor = vec4(mix(sky, u_cloudColor, mask * 0.85), 1.0);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(program);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = {};
  for (const n of ["u_resolution","u_time","u_skyTop","u_skyBottom","u_cloudColor",
                   "u_octaves","u_baseScale","u_drift","u_morph","u_density","u_motion"]) {
    u[n] = gl.getUniformLocation(program, n);
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, CONFIG.pixelRatioCap);
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener("resize", resize);
  resize();

  const t0 = performance.now();
  function render(now) {
    gl.uniform2f(u.u_resolution, canvas.width, canvas.height);
    gl.uniform1f(u.u_time, (now - t0) / 1000);
    gl.uniform3fv(u.u_skyTop, CONFIG.skyTop);
    gl.uniform3fv(u.u_skyBottom, CONFIG.skyBottom);
    gl.uniform3fv(u.u_cloudColor, CONFIG.cloudColor);
    gl.uniform1f(u.u_octaves, CONFIG.octaves);
    gl.uniform1f(u.u_baseScale, CONFIG.baseScale);
    gl.uniform1f(u.u_drift, CONFIG.drift);
    gl.uniform1f(u.u_morph, CONFIG.morph);
    gl.uniform1f(u.u_density, CONFIG.cloudDensity);
    // 降级：u_motion=0 → 时间项全部冻结，一帧静态云图（构图完整保留）
    gl.uniform1f(u.u_motion, prefersReducedMotion ? 0 : 1);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  if (prefersReducedMotion) {
    render(t0 + 60000); // 取 t=60s 的一帧：云已充分展开的成熟构图
  } else {
    (function loop(now) {
      requestAnimationFrame(loop);
      render(now);
    })(performance.now());
  }
</script>
</body>
</html>
```
<!-- EMBED:END -->
