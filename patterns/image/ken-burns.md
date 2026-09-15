# Ken Burns 缓放

> **ID** `ken-burns` · **分类** image · **性能** low-cost · **依赖** 无

## Context

以纪录片摄影师 Ken Burns 命名的经典手法：静止照片极缓慢地缩放 + 漂移，让静态图「活」起来。适合 hero 背景、幻灯片、时间线老照片、全屏 banner。慢到不被察觉，就是它的灵魂。

## Approach

- **思路**：`scale` 1.0→1.12 + `translate` ±3% 的一体 transform 动画，`alternate` 往返呼吸；图片外扩 6%（`inset: -6%`）保证漂移全程盖满容器不露底。
- **技术**：纯 CSS keyframes。全屏图下 `width/top` 类动画每帧布局必掉帧，transform 是唯一正确答案。
- **性能**：合成器动画，功耗极低——它是少数可以放心放移动端全屏的效果。
- **降级**：`prefers-reduced-motion` 定格在起始构图，就是一张普通全幅封面图。
- **调参**：`scaleTo` 1.08~1.15 是呼吸、>1.25 是灾难片推镜头；`duration` 建议 16~24s。

## Example

<!-- EMBED:START:snippets/image/ken-burns.tsx -->
```tsx
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
```
<!-- EMBED:END -->
