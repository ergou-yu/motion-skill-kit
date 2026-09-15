# 遮罩擦除页面转场

> **ID** `page-wipe` · **分类** transitions · **性能** low-cost · **依赖** 无（需路由器）

## Context

全屏色块先盖住旧页 → 切换路由 → 再向同方向擦出的「幕布式」转场。把路由切换瞬间的白屏/跳变藏进遮罩，观感即无缝。适合作品集、品牌站的多页导航，暗色主题最搭。

## Approach

- **思路**：`phase` 三态机（idle → cover → reveal）：盖住（translateY 100%→0）→ 停 120ms（给路由渲染留时间 + 节奏呼吸点）→ 揭开（0→-100%，方向连续 = 「擦过」感）。
- **技术**：Next.js App Router 的 `useRouter`，`pointer-events: none` 保证遮罩永不拦截交互；render-prop 把 `wipeTo(href)` 交给子组件，代替 `<Link>` 触发导航。
- **性能**：单元素 transform 过渡；`holdAtCover` 期间遮罩静止零成本。
- **降级**：`prefers-reduced-motion` 时直接 `router.push`（跳过表演），导航功能必须保留。
- **迁移提示**：react-router 把 `useRouter().push` 换成 `useNavigate()().navigate` 等价；SPA 内部 tab 切换也能用同一组件。

## Example

<!-- EMBED:START:snippets/transitions/page-wipe.tsx -->
```tsx
"use client";
/**
 * 遮罩擦除页面转场（Page Wipe Transition）
 * 依赖：React 18+ / Next.js App Router（react-router 等价迁移见文档）；无第三方库
 *
 * 为什么"先盖后擦"而不是直接切页：
 * 路由切换时浏览器会白屏一瞬（新页面尚未渲染）；
 * 用一块全屏遮罩先盖住旧页 → 切换路由 → 遮罩再揭开，
 * 把"加载的尴尬"藏进遮罩里，观感就是无缝擦除。
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// ===== 视觉参数集中区 =====
const CONFIG = {
  color: "#0d0c1d",      // 遮罩色：品牌深色，比纯黑柔和
  duration: 0.55,        // 单程（盖上/揭开）时长（秒）
  easing: "cubic-bezier(0.77, 0, 0.18, 1)", // 前段蓄力后段收束
  direction: "up" as "up" | "down" | "left" | "right", // 擦除方向
  holdAtCover: 120,      // 盖住后停留（ms）：给路由渲染留时间，也是节奏上的"呼吸点"
} as const;

// 每个方向对应遮罩的进入/离开位移
const DIR: Record<string, { inY: string; outY: string }> = {
  up:    { inY: "100%", outY: "-100%" },
  down:  { inY: "-100%", outY: "100%" },
  left:  { inY: "0%", outY: "0%" },
  right: { inY: "0%", outY: "0%" },
};

export default function PageWipeTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "cover" | "reveal">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 暴露带转场的导航函数：页面里用 wipeTo("/about") 代替 <Link>
  const wipeTo = useCallback(
    (href: string) => {
      if (phase !== "idle") return; // 转场进行中忽略重复触发（防抖）
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        // 降级：直接跳转，不做表演。路由本身的功能必须保留
        router.push(href);
        return;
      }
      setPhase("cover");
      // 遮罩盖住 → 停一拍切路由 → 再揭开
      timerRef.current = setTimeout(() => {
        router.push(href);
        timerRef.current = setTimeout(() => setPhase("reveal"), CONFIG.holdAtCover);
      }, CONFIG.duration * 1000);
    },
    [phase, router]
  );

  // 揭开动画播完回到待命
  useEffect(() => {
    if (phase === "reveal") {
      const t = setTimeout(() => setPhase("idle"), CONFIG.duration * 1000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // 提供给子组件的上下文通过 render prop 传递（避免引 createContext 增加样板）
  return (
    <>
      <style>{`
        .wipe-overlay {
          position: fixed;
          inset: 0;
          z-index: 9998;
          pointer-events: none; /* 遮罩只是视觉，永远不拦截交互 */
          background: ${CONFIG.color};
          transform: translateY(${DIR[CONFIG.direction].inY});
        }
        .wipe-overlay.cover {
          /* 进入（盖住）：从下方整体推上来 */
          transform: translateY(0);
          transition: transform ${CONFIG.duration}s ${CONFIG.easing};
        }
        .wipe-overlay.reveal {
          /* 离开（揭开）：继续向上推出去，方向一致 = "擦过"的连续感 */
          transform: translateY(${DIR[CONFIG.direction].outY});
          transition: transform ${CONFIG.duration}s ${CONFIG.easing};
        }
        @media (prefers-reduced-motion: reduce) {
          .wipe-overlay { display: none !important; }
        }
      `}</style>

      {(typeof children === "function" ? (children as (nav: (href: string) => void) => React.ReactNode)(wipeTo) : children)}

      <div
        className={`wipe-overlay ${phase}`}
        aria-hidden="true"
        style={{ visibility: phase === "idle" ? "hidden" : "visible" }}
      />
    </>
  );
}
```
<!-- EMBED:END -->
