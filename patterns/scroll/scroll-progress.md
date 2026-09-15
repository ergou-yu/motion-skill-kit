# 顶部滚动进度条

> **ID** `scroll-progress` · **分类** scroll · **性能** low-cost · **依赖** 无

## Context

视口顶部 3px 渐变条随页面滚动从左向右生长。长文（博客、文档、教程）的阅读位置指示，兼作页面「成长感」的装饰。和任何主题都兼容。

## Approach

- **思路**：`progress = scrollY / (scrollHeight - innerHeight)`，写入 `transform: scaleX()`；`transformOrigin` 钉左侧实现从左生长。
- **技术**：为什么 scaleX 不用 width——transform 只触发合成，width 触发布局，滚动热路径上每一点布局成本都被放大成掉帧。rAF 门闩保证一帧最多写一次。
- **性能**：单元素合成动画，几乎免费。页面不满一屏时 progress 保持 0（除零保护）。
- **降级**：`prefers-reduced-motion` 下进度条**保留但去动画**——它是位置信息而非装饰，用户仍需知道自己读到哪里；改为 scroll 事件直写（无 rAF 延迟）。
- **调参**：`height` 别超过 5px；`gradient` 换成品牌双色。

## Example

<!-- EMBED:START:snippets/scroll/scroll-progress.tsx -->
```tsx
"use client";
/**
 * 顶部滚动进度条（Scroll Progress Bar）
 * 依赖：React 18+；无第三方库
 *
 * 为什么 scaleX 而非 width：
 * scaleX 只触发合成（transform），width 触发布局（layout），
 * 滚动热路径上每一点布局成本都会被放大成掉帧。
 */
import { useEffect, useRef } from "react";

// ===== 视觉参数集中区 =====
const CONFIG = {
  height: 3,           // 条高（px）：3px 存在感刚好，5px 以上变"进度条应用"
  gradient: "linear-gradient(90deg, #7c6cff, #38f9d7)", // 渐变：横向流动的成长感
  zIndex: 9999,
  update: "rAF" as "rAF" | "direct", // direct= 每次 scroll 直接写（更简单，理论更费）
} as const;

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    const update = () => {
      // 进度 = 已滚距离 / 可滚总距离；后者为 0（页面不满一屏）时保持 0 而非 NaN
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      // 变形原点钉在最左：scaleX 从左向右生长
      bar.style.transform = `scaleX(${progress.toFixed(4)})`;
    };

    const onScroll = () => {
      if (CONFIG.update === "direct") {
        update();
      } else if (!raf) {
        // rAF 门闩：滚动事件只"预约"下一帧，一帧最多写一次
        raf = requestAnimationFrame(() => {
          raf = 0;
          update();
        });
      }
    };

    if (reduced) {
      // 降级：进度指示不是"动效装饰"而是"位置信息"，保留但改为无过渡直接更新
      window.addEventListener("scroll", update, { passive: true });
      update();
      return () => window.removeEventListener("scroll", update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true }); // 视口变化改变总可滚距离
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: CONFIG.height,
        background: CONFIG.gradient,
        transformOrigin: "0 50%",
        transform: "scaleX(0)",
        zIndex: CONFIG.zIndex,
        willChange: "transform",
      }}
    />
  );
}
```
<!-- EMBED:END -->
