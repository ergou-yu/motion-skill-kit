# 滚动触发揭示序列

> **ID** `reveal-on-scroll` · **分类** scroll · **性能** low-cost · **依赖** 无

## Context

元素进入视口时从透明 + 位移状态浮现，同批列表项按序号 stagger 依次入场。功能页、定价卡、特性区、footer 前的任何内容块都适用——最通用、最不会出错的滚动动效，没有之一。

## Approach

- **思路**：IntersectionObserver 监听可见性，可见时加 `is-revealed` class，动画交给 CSS transition——JS 只发一次信号，之后零成本。
- **技术**：`threshold: 0.15`（可见 15% 触发，比 0 稳、比 0.5 早）；`once: true` 播完即 `unobserve`。stagger 用 CSS 变量 `--ri × delayStep`，列表传 `index={i}` 即得多米诺节奏。
- **性能**：IO 在合成阶段判定，不占主线程。几十个观察对象无压力；上千个时应按容器分组观察。
- **降级**：`prefers-reduced-motion` 时直接加最终态 class（连 observer 都不创建），元素立即可见。
- **调参**：`distance` ≤ 40px 是「浮现」，再大变「滑稽」；方向 up/down/left/right 可切。

## Example

<!-- EMBED:START:snippets/scroll/reveal-on-scroll.tsx -->
```tsx
"use client";
/**
 * 滚动触发揭示序列（Reveal on Scroll）
 * 依赖：React 18+；无第三方库
 *
 * 为什么用 IntersectionObserver 而非 scroll 事件：
 * IO 由浏览器在合成阶段判断可见性，不占主线程、自带阈值控制；
 * scroll 方案要自己防抖节流还容易掉帧，现代浏览器没有理由再用它。
 */
import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";

// ===== 视觉参数集中区 =====
const CONFIG = {
  distance: 40,          // 入场位移（px）：40 以内是"浮现"，再大是"滑稽"
  direction: "up" as "up" | "down" | "left" | "right",
  duration: 0.8,         // 时长（秒）
  delayStep: 0.12,       // 同批子元素的 stagger 步长（秒）
  once: true,            // 只播一次：反复进出视口反复播会让人烦躁
  threshold: 0.15,       // 可见 15% 就触发：比 0 稳（边缘闪烁），比 0.5 早（不等太久）
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

// 位移向量查表：比 if-else 链清晰
const OFFSETS: Record<string, string> = {
  up: `translateY(${CONFIG.distance}px)`,
  down: `translateY(-${CONFIG.distance}px)`,
  left: `translateX(${CONFIG.distance}px)`,
  right: `translateX(-${CONFIG.distance}px)`,
};

export default function RevealOnScroll({
  children,
  index = 0,          // 序号：父级列表里传 i，实现同批 stagger
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  index?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // 可见 → 加 class 触发 CSS transition；由 CSS 接管动画，JS 只发一次信号
            entry.target.classList.add("is-revealed");
            if (CONFIG.once) io.unobserve(entry.target); // 播完就不再观察，省电
          } else if (!CONFIG.once) {
            entry.target.classList.remove("is-revealed");
          }
        }
      },
      { threshold: CONFIG.threshold }
    );

    if (reduced) {
      // 降级：直接加 class 显示最终态，IO 都不用建
      el.classList.add("is-revealed");
      return;
    }

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .reveal-item {
          opacity: 0;
          transform: ${OFFSETS[CONFIG.direction]};
          transition:
            opacity ${CONFIG.duration}s ${CONFIG.easing},
            transform ${CONFIG.duration}s ${CONFIG.easing};
          /* 序号 × 步长 = 该项的入场延迟：一列卡片就有"多米诺"节奏 */
          transition-delay: calc(var(--ri, 0) * ${CONFIG.delayStep}s);
          will-change: opacity, transform;
        }
        .reveal-item.is-revealed {
          opacity: 1;
          transform: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal-item { transition: none !important; opacity: 1; transform: none; }
        }
      `}</style>
      <Tag
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 动态标签的 ref 类型统一为 any
        ref={ref as any}
        className={`reveal-item ${className ?? ""}`}
        style={{ "--ri": index } as CSSProperties}
      >
        {children}
      </Tag>
    </>
  );
}
```
<!-- EMBED:END -->
