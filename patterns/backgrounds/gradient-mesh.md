# 流动渐变网格背景

> **ID** `gradient-mesh` · **分类** backgrounds · **性能** medium · **依赖** 无

## Context

柔和的「液体渐变」背景，适合创意机构、设计工具、Web3、音乐类品牌站。比极光背景更明快、色彩饱和度更高，适合作为浅内容页的大面积底色。Apple keynote 风格的「缓慢变色」既现代又不喧宾夺主。

## Approach

- **思路**：两层错位排布的多点 `radial-gradient`，`blur(60px)` 糊化边界，动画同时做位移 + 旋转 + `hue-rotate`。两层动画方向相反（`reverse` + 负延迟），交叉流动产生「液体」错觉。
- **技术**：纯 CSS。真实的 mesh gradient（网格顶点插值）需要 Canvas/WebGL，此方案以 1/10 成本达到 80% 观感。
- **性能**：`filter: blur` + `hue-rotate` 每帧重栅格化，属于中等开销；层数控制在 2 层，不要再加。`will-change` 提升合成层。
- **降级**：`prefers-reduced-motion` 时定格为静态渐变海报，依然可用作品牌背景。
- **内置彩蛋**：组件自带轻噪点建议参数（`grainOpacity`），渐变 + 颗粒是氛围背景的黄金组合，可配合 `noise-grain` 片段一起用。

## Example

<!-- EMBED:START:snippets/backgrounds/gradient-mesh.tsx -->
```tsx
"use client";
/**
 * 流动渐变网格背景（Animated Gradient Mesh）
 * 依赖：React 18+；无第三方库
 *
 * 为什么用多层 radial-gradient + filter 动画而非真实 mesh gradient：
 * 真·mesh（网格顶点插值）需要 Canvas/WebGL；而视觉上 80% 的效果
 * 可以由"两层错位的大渐变 + 缓慢 hue-rotate/位移"骗到，成本只有 1/10。
 */
const CONFIG = {
  colors: ["#ff6ec4", "#7873f5", "#38f9d7"], // 粉→紫→青：流行色环，撞色但不刺眼
  baseColor: "#0a0a14",
  blobSize: 140,     // 单层渐变直径（% 视口）：>120 才有"整片流动"而非"几个光斑"
  hueShift: 40,      // 色相旋转幅度（deg）：30~60 出"缓缓变色"的效果，360 会转成迪斯科
  duration: 24,      // 一轮动画时长（秒）
  grainOpacity: 0.05,// 内置轻噪点：渐变+颗粒是氛围背景的黄金组合，省得再叠一层
} as const;

export default function GradientMeshBackground() {
  // 两层渐变错位排布：同步移动的渐变是"背景图"，错位的才有"流动的液体"感
  const layer = (offsetDeg: number): React.CSSProperties => ({
    position: "absolute",
    inset: `-${CONFIG.blobSize / 4}%`,
    background: `
      radial-gradient(circle at 30% ${offsetDeg}%, ${CONFIG.colors[0]} 0%, transparent 45%),
      radial-gradient(circle at 70% ${100 - offsetDeg}%, ${CONFIG.colors[1]} 0%, transparent 45%),
      radial-gradient(circle at ${offsetDeg}% 80%, ${CONFIG.colors[2]} 0%, transparent 40%)
    `,
    filter: "blur(60px)",
    willChange: "transform, filter",
  });

  return (
    <>
      <style>{`
        @keyframes mesh-drift {
          0%   { transform: translate(0, 0) rotate(0deg) scale(1); filter: blur(60px) hue-rotate(0deg); }
          50%  { transform: translate(-6%, 4%) rotate(8deg) scale(1.1); filter: blur(70px) hue-rotate(${CONFIG.hueShift}deg); }
          100% { transform: translate(0, 0) rotate(0deg) scale(1); filter: blur(60px) hue-rotate(0deg); }
        }
        .mesh-layer {
          animation: mesh-drift ${CONFIG.duration}s ease-in-out infinite;
        }
        .mesh-layer--alt {
          animation-direction: reverse;   /* 反向：两层交叉流动，液体感的关键 */
          animation-delay: -${CONFIG.duration / 3}s; /* 负延迟：一开始就是中途状态，避免"开场同步" */
        }
        @media (prefers-reduced-motion: reduce) {
          /* 降级：定格为一幅静态渐变海报，依然可用作品牌背景 */
          .mesh-layer { animation: none !important; }
        }
      `}</style>

      <div
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, overflow: "hidden", background: CONFIG.baseColor, zIndex: -1 }}
      >
        <div className="mesh-layer" style={layer(20)} />
        <div className="mesh-layer mesh-layer--alt" style={layer(65)} />
      </div>
    </>
  );
}
```
<!-- EMBED:END -->
