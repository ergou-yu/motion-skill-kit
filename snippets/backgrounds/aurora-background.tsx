"use client";
/**
 * 极光流动背景（Aurora Background）
 * 依赖：React 18+（Next.js App Router / Vite 通用）；无第三方库
 *
 * 为什么纯 CSS 而不用 Canvas：极光本质是几团大尺寸模糊色块的缓慢漂移，
 * CSS transform 动画跑在合成器线程（compositor thread）上，主线程卡顿也不掉帧，
 * 且代码量只有 Canvas 方案的 1/3。
 */
import type { CSSProperties } from "react";

// ===== 视觉参数集中区：调色 / 调速只改这里 =====
const CONFIG = {
  // 色板：3~4 团色块。为什么偏青绿紫：真实极光的氧/氮辉光就在这个波段，观感"对味"
  blobs: [
    { color: "#3a86ff", x: "15%", y: "20%", size: 55 },  // 蓝
    { color: "#8338ec", x: "60%", y: "10%", size: 50 },   // 紫
    { color: "#06d6a0", x: "40%", y: "60%", size: 45 },   // 青
    { color: "#ff006e", x: "75%", y: "55%", size: 35 },   // 玫红点缀（小一点才不抢戏）
  ],
  blur: 90,          // 模糊半径（px）：越大越"雾化"，但超过 120 后 GPU 开销明显上升
  opacity: 0.55,     // 整体透明度：叠在深底色上，低于 0.7 才有"夜空感"
  duration: 26,      // 一轮漂移时长（秒）：20~30s 是"缓慢到不被察觉在动"的甜点区
  baseColor: "#050510", // 底色：接近纯黑的深蓝，衬托极光
} as const;

// 每团色块独立的漂移节奏：错开才自然，同步移动会露馅"是程序做的"
const DRIFTS: Array<Partial<CSSProperties> & { animationDelay?: string }> = [
  { animationDelay: "0s" },
  { animationDelay: "-8s" },
  { animationDelay: "-16s" },
  { animationDelay: "-4s" },
];

export default function AuroraBackground() {
  return (
    <>
      {/* 为什么用 <style> 而非 CSS 文件：片段要能单文件复制进任意项目 */}
      <style>{`
        @keyframes aurora-drift {
          0%   { transform: translate(0, 0) scale(1) rotate(0deg); }
          33%  { transform: translate(12vw, 8vh) scale(1.15) rotate(10deg); }
          66%  { transform: translate(-8vw, -6vh) scale(0.9) rotate(-8deg); }
          100% { transform: translate(0, 0) scale(1) rotate(0deg); }
        }
        /* 降级：用户开了"减少动态效果"就直接停住，静态色雾本身也是合格的背景 */
        @media (prefers-reduced-motion: reduce) {
          .aurora-blob { animation: none !important; }
        }
      `}</style>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          background: CONFIG.baseColor,
          // 为什么 zIndex: -1：让内容层无需关心背景，直接叠上去即可
          zIndex: -1,
        }}
      >
        {CONFIG.blobs.map((blob, i) => (
          <div
            key={i}
            className="aurora-blob"
            style={{
              position: "absolute",
              left: blob.x,
              top: blob.y,
              width: `${blob.size}vmax`,   // 用 vmax：旋转屏后依然覆盖足够面积
              height: `${blob.size}vmax`,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
              filter: `blur(${CONFIG.blur}px)`,
              opacity: CONFIG.opacity,
              // will-change 提示浏览器把色块提为独立合成层，动画不触发重绘
              willChange: "transform",
              animation: `aurora-drift ${CONFIG.duration}s ease-in-out infinite`,
              ...DRIFTS[i % DRIFTS.length],
            }}
          />
        ))}
      </div>
    </>
  );
}
