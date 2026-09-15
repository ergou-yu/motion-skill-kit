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
