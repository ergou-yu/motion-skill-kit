# 磁吸按钮

> **ID** `magnetic-button` · **分类** cursor · **性能** low-cost · **依赖** 无

## Context

指针靠近时按钮被「磁场」吸向指针，离开后缓动回位，按下微缩、松手弹回。portfolio、studio、潮牌官网的 CTA 标配，传达「这个网站有生命」的第一印象。适合导航项、主要 CTA、社交图标。

## Approach

- **思路**：指针进入半径 120px 的磁场后，按钮目标位移 = 指针相对位移 × 强度（0.4）；rAF 循环里当前值指数缓动追赶目标值——「追赶」才是磁力手感的来源，直接跟随则像粘住。
- **技术**：ref + rAF 直接写 `style.transform`，绕过 React 渲染管线（pointermove 直接 setState 每秒上百次重渲染）。内层文字用更小的跟随系数制造视差层次。
- **性能**：一个 rAF 循环 + transform，成本忽略不计；`pointermove` 用 `passive: true`。
- **降级**：触屏（无 hover 语义）与 `prefers-reduced-motion` 直接跳过绑定，退化为普通按钮。
- **调参**：`radius` 决定多远开始吸；`ease` 越小回弹越「果冻」。

## Example

<!-- EMBED:START:snippets/cursor/magnetic-button.tsx -->
```tsx
"use client";
/**
 * 磁吸按钮（Magnetic Button）
 * 依赖：React 18+；无第三方库
 *
 * 为什么用 rAF 循环 + 缓动插值而非 pointermove 里直接 setState：
 * 直接 setState 每次鼠标事件都触发 React 重渲染（一秒可上百次）；
 * ref + rAF 让 DOM 更新绕过 React 渲染管线，丝滑且零重渲染。
 */
import { useRef, useEffect, type ReactNode } from "react";

// ===== 视觉参数集中区 =====
const CONFIG = {
  radius: 120,       // 磁场半径（px）：按钮中心为圆心，指针进入才被吸
  strength: 0.4,     // 磁吸强度（0~1）：0.4 = 按钮跟随位移为指针距离的 40%
  textFollow: 0.3,   // 内部文字跟随系数：文字比按钮"懒"，产生视差层次
  ease: 0.18,        // 回弹缓动系数：越小回位越"果冻"
  releaseScale: 0.92,// 松手瞬间缩放：先微缩再弹回，模拟"被扯断磁力"
} as const;

export default function MagneticButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  // 目标值与当前值分离：当前值每帧向目标值追赶（缓动），这才是"磁力感"的来源
  const state = useRef({ tx: 0, ty: 0, cx: 0, cy: 0, scale: 1, targetScale: 1 });

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    // 触屏设备没有 hover 语义，磁吸毫无意义，直接跳过绑定
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || reduced) return; // 降级：普通按钮，无磁吸

    let raf = 0;

    const onMove = (e: PointerEvent) => {
      const rect = btn.getBoundingClientRect();
      const bx = rect.left + rect.width / 2;
      const by = rect.top + rect.height / 2;
      const dx = e.clientX - bx;
      const dy = e.clientY - by;
      const dist = Math.hypot(dx, dy);

      if (dist < CONFIG.radius) {
        // 在磁场内：目标位 = 指针相对位移 × 强度（越近吸得越满）
        state.current.tx = dx * CONFIG.strength;
        state.current.ty = dy * CONFIG.strength;
        state.current.targetScale = 1;
      } else {
        // 离开磁场：目标归零，靠缓动慢慢回位
        state.current.tx = 0;
        state.current.ty = 0;
      }
    };

    const loop = () => {
      const s = state.current;
      // 指数缓动逼近：每帧走剩余距离的 ease 比例 → 先快后慢的"磁力拖拽"手感
      s.cx += (s.tx - s.cx) * CONFIG.ease;
      s.cy += (s.ty - s.cy) * CONFIG.ease;
      s.scale += (s.targetScale - s.scale) * CONFIG.ease;
      btn.style.transform = `translate(${s.cx.toFixed(2)}px, ${s.cy.toFixed(2)}px) scale(${s.scale.toFixed(3)})`;
      if (textRef.current) {
        // 文字跟随系数更小 → 永远比按钮慢半拍，这就是内层视差
        textRef.current.style.transform = `translate(${(s.cx * CONFIG.textFollow / CONFIG.strength).toFixed(2)}px, ${(s.cy * CONFIG.textFollow / CONFIG.strength).toFixed(2)}px)`;
      }
      raf = requestAnimationFrame(loop);
    };

    const onDown = () => { state.current.targetScale = 1.06; };
    const onUp = () => {
      // 按下微缩→松手弹回：一段"被扯断"的物理叙事
      state.current.scale = CONFIG.releaseScale;
      state.current.targetScale = 1;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    btn.addEventListener("pointerdown", onDown);
    btn.addEventListener("pointerup", onUp);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      btn.removeEventListener("pointerdown", onDown);
      btn.removeEventListener("pointerup", onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      style={{
        position: "relative",
        padding: "16px 36px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.25)",
        background: "rgba(255,255,255,0.06)",
        color: "#fff",
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: "0.05em",
        cursor: "pointer",
        willChange: "transform",
        transition: "background 0.25s",
        backdropFilter: "blur(6px)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
    >
      <span ref={textRef} style={{ display: "inline-block", willChange: "transform" }}>
        {children}
      </span>
    </button>
  );
}
```
<!-- EMBED:END -->
