"use client";
/**
 * Ken Burns 缓放（Ken Burns Effect）
 * 依赖：React 18+；无第三方库
 *
 * 为什么 transform: scale + translate 一体动画：
 * 全部走合成器（零重排零重绘）；老式 width/height/top/left
 * 动画每帧触发布局，全屏图下必掉帧。
 */
import type { CSSProperties } from "react";

// ===== 视觉参数集中区 =====
const CONFIG = {
  scaleFrom: 1.0,    // 起始缩放
  scaleTo: 1.12,     // 终止缩放：1.08~1.15 是"呼吸"，>1.25 是"灾难片推镜头"
  panX: "-3%",       // 水平漂移：±5% 以内，方向决定"视线引导"（负=向左看）
  panY: "2%",        // 垂直漂移
  duration: 18,      // 单程时长（秒）：Ken Burns 的灵魂是"慢到不被察觉"
  alternate: true,   // 到终点后反向缓回（yo-yo），无限往返
  aspect: "16 / 9",
} as const;

export default function KenBurns({
  src = "https://picsum.photos/1600/900",
  alt = "Ken Burns 缓放示例",
  className,
}: {
  src?: string;
  alt?: string;
  className?: string;
}) {
  const imgStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    // 外扩 6%：漂移 + 缩放过程中图片永远盖满容器，不露底
    position: "absolute",
    inset: "-6%",
    animation: `ken-burns ${CONFIG.duration}s ease-in-out ${CONFIG.alternate ? "infinite alternate" : "forwards"}`,
    willChange: "transform",
  };

  return (
    <>
      <style>{`
        @keyframes ken-burns {
          from {
            transform: scale(${CONFIG.scaleFrom}) translate(0, 0);
          }
          to {
            /* scale 与 translate 写进同一个 transform：整体走合成器，位移按元素自身百分比计 */
            transform: scale(${CONFIG.scaleTo}) translate(${CONFIG.panX}, ${CONFIG.panY});
          }
        }
        @media (prefers-reduced-motion: reduce) {
          /* 降级：定格在起始构图，一张普通的全幅封面图 */
          .kb-img { animation: none !important; }
        }
      `}</style>
      <div
        className={className}
        style={{
          position: "relative",
          aspectRatio: CONFIG.aspect,
          overflow: "hidden",
        }}
      >
        <img className="kb-img" src={src} alt={alt} style={imgStyle} loading="lazy" />
      </div>
    </>
  );
}
