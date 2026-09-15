# 文字逐字入场

> **ID** `per-char-reveal` · **分类** text-effects · **性能** low-cost · **依赖** 无

## Context

标题「从雾中浮现」般的逐字入场：每字延迟 35ms、带轻微上浮 + 旋转 + 模糊消散。适合任何页面的 H1/H2 首屏标题、章节标题，是最百搭、最不容易过度的文字动效。

## Approach

- **思路**：把文字拆成单字符 `<span>`，每个 span 的 `transition-delay` 由 CSS 变量 `--i × step` 计算——一行变量完成 stagger 编排，浏览器合成器自己排期，主线程卡顿也不「卡字」。
- **技术**：React 状态 `mounted` 做初始态→入场的一次性切换（`requestAnimationFrame` 保证初始态先绘制）。空格不包动画 span，保留自然断行。
- **性能**：纯 transition + transform/filter，几十个字符毫无压力。`blur` 过渡是三个属性里最贵的，正文级大段文字请去掉 blur 只留位移。
- **降级**：`prefers-reduced-motion` 时 transition 归零、文字直接完整呈现。
- **调参**：`step` 0.03~0.05 是「读得清的节奏」；`rotate` 超过 12deg 会变马戏团。

## Example

<!-- EMBED:START:snippets/text-effects/per-char-reveal.tsx -->
```tsx
"use client";
/**
 * 文字逐字入场（Per-Character Reveal）
 * 依赖：React 18+；无第三方库
 *
 * 为什么用 CSS 变量 --i 驱动 stagger 而非 JS 定时器：
 * 每个字符的 animation-delay = index * 步长，浏览器合成器自己排期，
 * 主线程再卡字符也准时出场；JS 方案（setTimeout 逐个加 class）在掉帧时会"卡字"。
 */
import { useState, useEffect, type ReactNode } from "react";

// ===== 视觉参数集中区 =====
const CONFIG = {
  step: 0.035,        // 每个字符的入场延迟（秒）：0.03~0.05 是"读得清的节奏"
  duration: 0.6,      // 单字符动画时长（秒）
  translateY: "0.6em",// 起始下移量：越大入场"弹"感越强
  rotate: 6,          // 起始旋转（deg）：3~8 有俏皮感，>12 变马戏团
  blur: 4,            // 起始模糊（px）：模糊入场 = "从记忆中浮现"的质感
  easing: "cubic-bezier(0.22, 1, 0.36, 1)", // easeOutQuint：快出慢停，优雅收尾
} as const;

// props.text：要拆分的文字；props.as：渲染标签（h1/h2/p...）
export default function PerCharReveal({
  text,
  as: Tag = "h1",
  className,
}: {
  text: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
}) {
  // mounted 控制"初始态 → 入场"的单次切换；空格字符不包 span，保留自然断行
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // 为什么 requestAnimationFrame 包一层：确保浏览器先把初始态画出来，再触发过渡
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const chars: ReactNode[] = [];
  let charIndex = 0; // 注意：空格不占 --i 序号，避免空格吃掉节奏
  for (const ch of text) {
    if (ch === " ") {
      chars.push(<span key={charIndex}>&nbsp;</span>);
    } else {
      chars.push(
        <span
          key={charIndex}
          className="pr-char"
          style={{ "--i": charIndex } as React.CSSProperties}
        >
          {ch}
        </span>
      );
    }
    charIndex++;
  }

  return (
    <>
      <style>{`
        .pr-char {
          display: inline-block;
          opacity: ${mounted ? 1 : 0};
          transform: ${mounted ? "none" : `translateY(${CONFIG.translateY}) rotate(${CONFIG.rotate}deg)`};
          filter: ${mounted ? "blur(0px)" : `blur(${CONFIG.blur}px)`};
          transition:
            opacity ${CONFIG.duration}s ${CONFIG.easing},
            transform ${CONFIG.duration}s ${CONFIG.easing},
            filter ${CONFIG.duration}s ${CONFIG.easing};
          /* 灵魂所在：每个字符的延迟 = 序号 × 步长，一行 CSS 变量完成 stagger */
          transition-delay: calc(var(--i) * ${CONFIG.step}s);
        }
        @media (prefers-reduced-motion: reduce) {
          /* 降级：不做入场表演，文字直接完整呈现 */
          .pr-char { transition: none !important; opacity: 1; transform: none; filter: none; }
        }
      `}</style>
      <Tag className={className} style={{ lineHeight: 1.2 }}>
        {chars}
      </Tag>
    </>
  );
}
```
<!-- EMBED:END -->
