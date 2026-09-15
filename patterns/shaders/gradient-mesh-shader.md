# Plasma 渐变网格 Shader

> **ID** `gradient-mesh-shader` · **分类** shaders · **性能** medium · **依赖** 无（原生 WebGL1）

## Context

多重正弦场干涉出的流动色场——1970 年代 demoscene 的经典配方，至今仍是「氛围感」的性价比之王。色彩饱满流动，适合音乐/夜生活/创意工具类站点全屏背景，鼠标会扰动色场。

## Approach

- **思路**：三个不同方向/频率的 sin 行波叠加（横向 + 纵向 + 对角）+ 到圆心距离的相位调制 + 鼠标径向扰动源，干涉值归一化后送进 **cos 调色板**（Inigo Quilez 配方：`base + amp × cos(2π(t+phase))`，一个公式生成整条平滑色环）。
- **技术**：WebGL1，调色板参数在 JS 的 CONFIG 里插值进 shader 字符串——改色环不用碰 GLSL 逻辑。
- **性能**：sin 场 + cos 调色板比 fbm 便宜得多，中档设备可全屏满帧；`layers` 加到 5 出大理石纹。
- **降级**：`timeOverride` 固定 t=12s、鼠标扰动置 0，定格为一幅 plasma 色环海报。
- **调参**：`palettePhase` 三通道相位差决定色环走向；`waveScale` 控制色团大小；`timeScale` 控制流速。

## Example

<!-- EMBED:START:snippets/shaders/gradient-mesh-shader.html -->
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Plasma 渐变网格 Shader</title>
<!--
  plasma 渐变网格 shader：多重 sin 场干涉出的流动色场。
  1970 年代 demo scene 的经典配方，至今仍是"氛围感"的性价比之王。
  双击即可预览。
-->
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #0a0510; }
  canvas { display: block; width: 100%; height: 100%; }
</style>
</head>
<body>
<canvas id="gl"></canvas>
<script>
  // ===== 视觉参数集中区 =====
  const CONFIG = {
    // 色轮：plasma 值 0~1 绕一圈；cos 调色板的相位/半径全在这里
    palettePhase: [0.0, 0.8, 1.6],   // R/G/B 相位错开 → 绕出色环
    paletteAmp: 0.5,                  // 振幅：0.5 = 色彩饱满不过曝
    paletteBase: 0.5,                 // 基准：0.5 让上下对称摆动
    waveScale: 3.0,    // sin 场频率：大=细密条纹，小=大团色晕
    timeScale: 0.5,    // 流速
    layers: 3,         // 干涉层数：3 层出"丝绸"，5 层出"大理石"
    // mouse 感应：光标给场加一个局部扰动源
    mousePush: 0.6,
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
    uniform vec2 u_mouse;
    uniform float u_waveScale;
    uniform float u_mousePush;
    uniform float u_layers;

    // cos 调色板（Inigo Quilez 配方）：一个公式生成整条平滑色环，
    // 比 if-else 分段查表优雅且 GPU 友好
    vec3 palette(float t) {
      vec3 phase = vec3(${CONFIG.palettePhase[0]}, ${CONFIG.palettePhase[1]}, ${CONFIG.palettePhase[2]});
      return ${CONFIG.paletteBase} + ${CONFIG.paletteAmp} * cos(6.28318 * (t + phase));
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float aspect = u_resolution.x / u_resolution.y;
      vec2 p = vec2(uv.x * aspect, uv.y) * u_waveScale;

      float t = u_time * ${CONFIG.timeScale};

      // 三重 sin 干涉：不同方向/频率的行波叠加 —— plasma 的全部秘密
      float v = 0.0;
      v += sin(p.x + t);                          // 横向行波
      v += sin((p.y + t) * 1.3);                  // 纵向行波（略快）
      v += sin((p.x + p.y) * 0.7 + t * 1.7);      // 对角行波

      // 鼠标扰动源：光标位置参与一个径向 sin —— 色场"知道"你在
      float md = distance(p, u_mouse * u_waveScale * vec2(aspect, 1.0));
      v += sin(md * 4.0 - t * 2.0) * u_mousePush;

      // 圆心距离调制：中心与边缘的相位错开，色环有了"重心"
      v += sin(length(p) * 1.2 - t);

      // 归一化到 [0,1]：层数越多值域越宽，除回来
      float plasma = v / (u_layers * 2.0 + 1.0) + 0.5;

      gl_FragColor = vec4(palette(plasma), 1.0);
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
  for (const n of ["u_resolution", "u_time", "u_mouse", "u_waveScale", "u_mousePush", "u_layers"]) {
    u[n] = gl.getUniformLocation(program, n);
  }

  const mouse = { x: 0.5, y: 0.5 };
  window.addEventListener("pointermove", (e) => {
    mouse.x = e.clientX / window.innerWidth;
    mouse.y = 1 - e.clientY / window.innerHeight;
  });

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, CONFIG.pixelRatioCap);
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener("resize", resize);
  resize();

  const t0 = performance.now();
  function render(now, timeOverride) {
    // timeOverride：reduced-motion 时传入固定值，直接取一帧成熟构图
    const t = timeOverride ?? (now - t0) / 1000;
    gl.uniform2f(u.u_resolution, canvas.width, canvas.height);
    gl.uniform1f(u.u_time, t);
    gl.uniform2f(u.u_mouse, mouse.x, mouse.y);
    gl.uniform1f(u.u_waveScale, CONFIG.waveScale);
    gl.uniform1f(u.u_mousePush, prefersReducedMotion ? 0 : CONFIG.mousePush);
    gl.uniform1f(u.u_layers, CONFIG.layers);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  if (prefersReducedMotion) {
    render(t0, 12.0); // 降级：t=12s 定格，一幅静态 plasma 色环海报
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
