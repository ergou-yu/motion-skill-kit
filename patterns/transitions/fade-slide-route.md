# 路由淡入滑动

> **ID** `fade-slide-route` · **分类** transitions · **性能** low-cost · **依赖** 无（需路由器）

## Context

新页面内容整体淡入 + 轻微上滑（+ 可选模糊收束）。最百搭、最低调的路由转场，任何站点任何主题都成立；与 page-wipe 二选一，内容型站点选这个。

## Approach

- **思路**：容器绑定 `key={pathname}`——路径一变子树重挂载，挂载即播 `route-enter` keyframes。不需要订阅任何路由事件，机制天然可靠。
- **技术**：CSS animation（`both` 保证 from 态在动画前就位）。`usePathname` 需要 client 组件，在 App Router 里于 layout 包一层即可。
- **性能**：整页级动画也只是一个节点的 transform/opacity/filter；`blurIn` 设 false 可去掉最贵的 filter 过渡。
- **降级**：`prefers-reduced-motion` 时 animation 归零，新页面直接呈现。
- **迁移提示**：react-router 把 `usePathname()` 换成 `useLocation().pathname`；组件级转场把 `distance` 降到 12px。

## Example

<!-- EMBED:START:snippets/transitions/fade-slide-route.tsx -->
```tsx
"use client";
/**
 * 路由淡入滑动（Route Fade + Slide）
 * 依赖：React 18+ / Next.js App Router（用法见底部注释，react-router 迁移同理）；无第三方库
 *
 * 为什么用 key 触发重挂载而不是监听路由事件：
 * 给容器绑定 pathname 作 key，路径一变容器整个重挂载，
 * 挂载即播放入场动画——不需要订阅任何路由事件，机制天然可靠。
 */
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// ===== 视觉参数集中区 =====
const CONFIG = {
  distance: 24,      // 入场位移（px）：页面级 24px 适中（组件级建议 12px）
  duration: 0.5,     // 时长（秒）
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  blurIn: true,      // 是否带模糊入场：大页面用 true 很"贵"，性能敏感设 false
  blurAmount: 6,
} as const;

export default function FadeSlideRoute({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <style>{`
        @keyframes route-enter {
          from {
            opacity: 0;
            transform: translateY(${CONFIG.distance}px);
            ${CONFIG.blurIn ? `filter: blur(${CONFIG.blurAmount}px);` : ""}
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
        .route-fade {
          animation: route-enter ${CONFIG.duration}s ${CONFIG.easing} both;
        }
        @media (prefers-reduced-motion: reduce) {
          /* 降级：无动画直接呈现新页面 */
          .route-fade { animation: none !important; }
        }
      `}</style>

      {/* key=pathname：路径变化 → 子树重建 → 入场动画自动播放 */}
      <div key={pathname} className="route-fade">
        {children}
      </div>
    </>
  );
}

/**
 * Next.js App Router 用法：
 *   // app/layout.tsx（需要包一层 client 组件，因为 usePathname 是 hook）
 *   <FadeSlideRoute>{children}</FadeSlideRoute>
 *
 * react-router 迁移：usePathname() 换成 useLocation().pathname 即可，其余不变。
 */
```
<!-- EMBED:END -->
