# 乱码解码文字

> **ID** `text-scramble` · **分类** text-effects · **性能** low-cost · **依赖** 无

## Context

字符在乱码池中翻滚、从左到右逐位「解锁」成目标文字——黑客终端 / 机密档案的叙事感。适合状态提示（"DECRYPTING..."）、导航项 hover、加载文案、彩蛋页。

## Approach

- **思路**：维护 `unlocked` 计数器，每 3 帧推进一位；未解锁位显示从乱码池随机取的字符。乱码池刻意排除 `0/O`、`1/l` 等易认错字符。
- **技术**：`setInterval` 30ms（约 30fps 的闪动感最有终端味），全部解锁后 `clearInterval` 停表省电；`white-space: pre` 锁定等宽布局防抖。
- **性能**：单 timer + 字符串 map，忽略不计。
- **降级**：`prefers-reduced-motion` 时完全跳过表演，直接呈现最终文字（SSR 首帧也是目标文字，不影响 SEO）。
- **调参**：`unlockStep` 控制推进速度；`charInterval` 控制闪动频率。

## Example

<!-- EMBED:START:snippets/text-effects/text-scramble.tsx -->
```tsx
"use client";
/**
 * 乱码解码文字（Text Scramble / Decode Effect）
 * 依赖：React 18+；无第三方库
 *
 * 为什么每字符维护独立的"解锁帧"：所有字符同时乱闪是噪点，
 * 错开的解锁节奏（中间先解、两边后解或逐个解锁）才是"解码"叙事。
 */
import { useEffect, useRef, useState } from "react";

// ===== 视觉参数集中区 =====
const CONFIG = {
  // 乱码池： deliberately 排除易认错的字符（0/O、1/l），避免观众读错
  glyphs: "!<>-_\\/[]{}—=+*^?#________",
  revealDelay: 800,   // 挂载后等多久开始解码（ms）：给观众一点"预感"
  charInterval: 34,    // 每帧刷新间隔（ms）：~30fps 的乱码闪动最有"终端"味
  unlockStep: 3,      // 每隔几帧多解锁一个字符：控制从左到右的推进速度
  className: "",      // 透传给容器
} as const;

export default function TextScramble({
  text,
  className = CONFIG.className,
}: {
  text: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(text);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // SSR/首屏直接显示目标文字：解码是纯装饰，不该在 HTML 里留乱码影响 SEO/无闪烁
    setDisplay(text);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return; // 降级：完全跳过解码表演，直接呈现最终文字

    let unlocked = 0;      // 已解锁字符数（前 unlocked 位显示真字符）
    let frame = 0;
    let startTimer: ReturnType<typeof setTimeout> | null = null;

    const tick = () => {
      frame++;
      // 每 unlockStep 帧推进一位解锁 → "从左到右逐渐稳定"的经典节奏
      if (frame % CONFIG.unlockStep === 0 && unlocked < text.length) {
        unlocked++;
      }
      setDisplay(
        text
          .split("")
          .map((ch, i) => {
            if (i < unlocked || ch === " ") return ch; // 空格永远原样，结构稳定
            return CONFIG.glyphs[Math.floor(Math.random() * CONFIG.glyphs.length)];
          })
          .join("")
      );
      if (unlocked >= text.length && timerRef.current) {
        clearInterval(timerRef.current); // 全部解锁后停表，不再耗电
        timerRef.current = null;
      }
    };

    startTimer = setTimeout(() => {
      timerRef.current = setInterval(tick, CONFIG.charInterval);
    }, CONFIG.revealDelay);

    return () => {
      if (startTimer) clearTimeout(startTimer);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text]);

  return (
    <span
      className={className}
      style={{
        fontFamily: "'SF Mono', 'Fira Code', monospace",
        whiteSpace: "pre", // 乱码期间字符宽度变化会抖动布局，pre 锁定宽度
      }}
    >
      {display}
    </span>
  );
}
```
<!-- EMBED:END -->
