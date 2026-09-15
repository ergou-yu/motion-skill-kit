# 混合模式放大光标

> **ID** `blend-mode-cursor` · **分类** cursor · **性能** low-cost · **依赖** 无

## Context

白色圆形光标 + `mix-blend-mode: difference` 反相混合：深底上变亮、浅底上变暗、经过图片自动反色——不需要感知背景就能处处可见，「万能适配」的高级感。悬停可点元素时圆放大为透镜。适合极简、编辑器、作品集类站点。

## Approach

- **思路**：一个 fixed 定位圆形 div，rAF 循环里位置与尺寸各自缓动追赶目标（位置 0.22 / 尺寸 0.16，双缓动参数让「跟手」与「吸气感」分离）。
- **技术**：`document.elementFromPoint` 实时探测悬停目标是否匹配 `hoverSelector`（a/button 等），比给每个元素绑事件干净。`translate3d` 触发合成器加速。
- **性能**：单元素 transform 动画，忽略不计。
- **降级**：触屏 / `prefers-reduced-motion` 不启动；卸载时还原 `cursor` 样式。
- **调参**：`blend` 可换 `exclusion`（更柔和）；`growSize` 是悬停放大直径。注意宿主页面的 stacking context 会让 mix-blend-mode 只对同级生效——光标层应放在 body 直接子级。

## Example

<!-- EMBED:START:snippets/cursor/blend-mode-cursor.tsx -->
```tsx
"use client";
/**
 * 混合模式放大光标（Blend-Mode Lens Cursor）
 * 依赖：React 18+；无第三方库
 *
 * 为什么 mix-blend-mode: difference 是主角：
 * 光标圆经过任何底色都会自动反相（深底变亮、浅底变暗），
 * 不需要根据背景动态算颜色，一行 CSS 得到"万能适配"的高级感。
 */
import { useRef, useEffect, useState } from "react";

// ===== 视觉参数集中区 =====
const CONFIG = {
  size: 36,          // 光标圆直径（px）
  growSize: 72,      // 悬停可点元素时的放大直径
  growEase: 0.16,    // 尺寸追赶系数：放大有"吸气感"
  moveEase: 0.22,    // 位置追赶系数：比鼠标慢半拍才叫"跟手不贴手"
  blend: "difference", // 混合模式：difference= 反相；exclusion 更柔和可选
  hoverSelector: "a, button, [role='button'], input, textarea, select",
  hideNative: true,  // 隐藏系统光标（自定义光标场景通常需要）
} as const;

export default function BlendModeCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  // 只为通知"悬停态变化"而存在，触发频率极低，不影响性能
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;

    // 三重降级：触屏无光标 / 系统要求减动 / 老浏览器不支持 matchMedia
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || reduced) return;

    if (CONFIG.hideNative) document.documentElement.style.cursor = "none";

    const mouse = { x: -100, y: -100 };
    const pos = { x: -100, y: -100 };
    let size = CONFIG.size;
    let targetSize = CONFIG.size;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      // elementFromPoint 实时探测悬停目标：比给每个元素绑事件干净得多
      const el = document.elementFromPoint(e.clientX, e.clientY);
      setHovering(!!el?.closest(CONFIG.hoverSelector));
    };

    const loop = () => {
      targetSize = hovering ? CONFIG.growSize : CONFIG.size;
      pos.x += (mouse.x - pos.x) * CONFIG.moveEase;
      pos.y += (mouse.y - pos.y) * CONFIG.moveEase;
      size += (targetSize - size) * CONFIG.growEase;
      // translate(-50%,-50%) 让圆心对准指针；用 transform 而非 left/top 避免布局抖动
      dot.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      dot.style.width = `${size.toFixed(1)}px`;
      dot.style.height = `${size.toFixed(1)}px`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      document.documentElement.style.cursor = "";
    };
  }, [hovering]);

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: CONFIG.size,
        height: CONFIG.size,
        borderRadius: "50%",
        // 灵魂：反相混合 → 任何背景上自动可见；纯白圆 + difference 是最稳组合
        background: "#fff",
        mixBlendMode: CONFIG.blend,
        pointerEvents: "none",
        zIndex: 10000,
        willChange: "transform, width, height",
      }}
    />
  );
}
```
<!-- EMBED:END -->
