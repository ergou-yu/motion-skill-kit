# 噪点颗粒覆盖层

> **ID** `noise-grain` · **分类** backgrounds · **性能** low-cost · **依赖** 无

## Context

「胶片颗粒」是高级感页面的隐藏配方——打破数字界面过于干净的塑料感。适合摄影 / 作品集 / 时尚 / 音乐类站点，也可以叠加在任何渐变或 WebGL 背景上增加质感。全站通用，通常作为最顶层 `position: fixed` 覆盖。

## Approach

- **思路**：SVG `feTurbulence` 滤镜在浏览器内原生生成 Perlin 噪声，一个 `<rect>` 铺满视口，`opacity: 0.06` + `mix-blend-mode: overlay` 叠加在页面上。
- **技术**：零 JS 计算。颗粒「闪动」用 CSS `steps()` 关键帧做瞬移（不是平滑移动——平滑移动是果冻，跳变才是颗粒）。SVG 尺寸故意放大到 200% 并外扩 inset，抖动时才不露边。
- **性能**：一次滤镜栅格化 + transform 动画，成本极低。注意 `pointer-events: none`，覆盖层绝不能挡点击。
- **降级**：`prefers-reduced-motion` 时停止抖动，保留静态颗粒层（静态颗粒不构成动态刺激，无需移除）。
- **调参**：`opacity` 是灵魂参数——0.04~0.08 若有似无，超过 0.1 画面变脏。React 中用 `useId()` 生成 filter id，避免同页多实例冲突。

## Example

<!-- EMBED:START:snippets/backgrounds/noise-grain.tsx -->
```tsx
"use client";
/**
 * 噪点颗粒覆盖层（Film Grain / Noise Overlay）
 * 依赖：React 18+；无第三方库
 *
 * 为什么用 SVG feTurbulence 而非 Canvas 随机像素：
 * 浏览器原生 filter 生成噪声，零 JS 计算；且是矢量，任意分辨率不失真。
 * 胶片颗粒是"高级感"的隐藏配方——它打破了数字界面过于干净的塑料感。
 */
import { useId } from "react";

// ===== 视觉参数集中区 =====
const CONFIG = {
  frequency: 0.9,    // 噪声频率：0.6~1.2 之间是"胶片颗粒"，再大变沙尘暴
  octaves: 2,        // 分形层数：2 层够用，更多只是费电
  opacity: 0.06,     // 透明度：关键参数！0.04~0.08 若有似无，超过 0.1 就脏了
  blend: "overlay",  // 混合模式：overlay 保留底色明暗关系只加质感
  jitterSteps: 8,    // 每秒颗粒跳动次数：8 模拟 8fps 胶片放映机的抖动
} as const;

export default function NoiseGrain() {
  // useId 保证同页多个实例时 filter id 不冲突（SSR 安全）
  const filterId = useId();

  return (
    <>
      <style>{`
        @keyframes grain-jitter {
          /* steps() 让位移瞬间跳变而非平滑移动——平滑移动的是"果冻"，跳变的才是"颗粒" */
          0%   { transform: translate(0, 0); }
          12.5%  { transform: translate(-2%, 3%); }
          25%  { transform: translate(3%, -2%); }
          37.5%  { transform: translate(-3%, -3%); }
          50%  { transform: translate(2%, 2%); }
          62.5%  { transform: translate(-1%, 1%); }
          75%  { transform: translate(3%, 1%); }
          87.5%  { transform: translate(-2%, -1%); }
          100% { transform: translate(0, 0); }
        }
        .grain-layer {
          animation: grain-jitter 1s steps(${CONFIG.jitterSteps}) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          /* 降级：停住抖动，保留一层静态颗粒——静态颗粒不构成动态刺激 */
          .grain-layer { animation: none !important; }
        }
      `}</style>

      <svg
        aria-hidden="true"
        className="grain-layer"
        style={{
          position: "fixed",
          inset: "-50%",          // 故意比视口大一圈：抖动位移后才不会露出边缘
          width: "200%",
          height: "200%",
          pointerEvents: "none",  // 覆盖层绝不能挡住下面的点击
          zIndex: 9999,
          opacity: CONFIG.opacity,
          mixBlendMode: CONFIG.blend,
        }}
      >
        <defs>
          <filter id={filterId}>
            {/* feTurbulence 生成 Perlin 噪声；type=fractalNoise 颗粒更细密 */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency={CONFIG.frequency}
              numOctaves={CONFIG.octaves}
              stitchTiles="stitch"
            />
          </filter>
        </defs>
        {/* rect 只是载体：真正的画面全部由 filter 生成 */}
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>
    </>
  );
}
```
<!-- EMBED:END -->
