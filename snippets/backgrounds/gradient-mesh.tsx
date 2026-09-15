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
