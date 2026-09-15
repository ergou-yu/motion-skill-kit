"use client";
/**
 * 遮罩揭示图片（Mask Reveal）
 * 依赖：React 18+；无第三方库
 *
 * 为什么用 clip-path 而非 overflow + 高度动画：
 * inset() 动画只触发合成（不重排），且"从中心向四周展开"这类
 * 非矩形揭示只有 clip-path 能优雅表达。
 */
import { useEffect, useState, type CSSProperties } from "react";

// ===== 视觉参数集中区 =====
const CONFIG = {
  // 揭示方向：inset 四边从"全裁"到"全露"的起止值
  modes: {
    center:  { from: "inset(50% 50% 50% 50%)", to: "inset(0% 0% 0% 0%)" }, // 中心绽放
    "wipe-up": { from: "inset(100% 0% 0% 0%)", to: "inset(0% 0% 0% 0%)" }, // 自下而上擦除
    "wipe-right": { from: "inset(0% 100% 0% 0%)", to: "inset(0% 0% 0% 0%)" }, // 从左向右
    corners: { from: "inset(20% 35% 20% 35%)", to: "inset(0% 0% 0% 0%)" }, // 双向拉伸
  },
  mode: "center" as keyof typeof CONFIG.modes,
  duration: 1.1,          // 揭示时长（秒）
  imgScale: 1.18,         // 揭示过程中图片从 1.18 缩到 1：封面感的关键
  easing: "cubic-bezier(0.77, 0, 0.18, 1)", // easeInOutQuart：前段蓄力后段收束
  trigger: "mount" as "mount" | "hover",    // mount=载入即揭示；hover=悬停揭示
  aspect: "16 / 10",
} as const;

export default function MaskRevealImage({
  src = "https://picsum.photos/1280/800",
  alt = "示例图片",
  className,
}: {
  src?: string;
  alt?: string;
  className?: string;
}) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (CONFIG.trigger !== "mount") return;
    // 等一帧再切换状态：保证浏览器记录了初始裁剪态，transition 才会播
    const raf = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const clipFrom = CONFIG.modes[CONFIG.mode].from;
  const clipTo = CONFIG.modes[CONFIG.mode].to;

  const frameStyle: CSSProperties = {
    clipPath: revealed || CONFIG.trigger === "hover" ? clipTo : clipFrom,
    transition: `clip-path ${CONFIG.duration}s ${CONFIG.easing}`,
    overflow: "hidden",
    aspectRatio: CONFIG.aspect,
    position: "relative",
  };

  const imgStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    // 图片反向缩放：遮罩展开 + 图片收缩，两个动作的速度差产生"景深"
    transform: revealed ? "scale(1)" : `scale(${CONFIG.imgScale})`,
    transition: `transform ${CONFIG.duration + 0.15}s ${CONFIG.easing}`, // 图片慢半拍收尾
  };

  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          /* 降级：不做揭示表演，图片直接完整显示 */
          .mr-frame { clip-path: inset(0 0 0 0) !important; transition: none !important; }
          .mr-frame img { transform: none !important; transition: none !important; }
        }
      `}</style>
      <div
        className={`mr-frame ${className ?? ""}`}
        style={frameStyle}
        {...(CONFIG.trigger === "hover"
          ? {
              onMouseEnter: () => setRevealed(true),
              onMouseLeave: () => setRevealed(false),
            }
          : {})}
      >
        <img src={src} alt={alt} style={imgStyle} loading="lazy" />
      </div>
    </>
  );
}
