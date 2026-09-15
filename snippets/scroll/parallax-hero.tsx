"use client";
/**
 * 滚动视差 Hero（Parallax Hero）
 * 依赖：React 18+；无第三方库
 *
 * 为什么 rAF + transform 而非 scroll 事件直接改样式：
 * scroll 事件一秒可触发上百次且与渲染不同步；rAF 把读写收敛到
 * 帧边界（先统一读 scrollY 再统一写 transform），避免布局抖动（thrashing）。
 */
import { useRef, useEffect, type ReactNode } from "react";

// ===== 视觉参数集中区 =====
const CONFIG = {
  // 各层速度系数：0=钉死不动，1=跟手滚动，>1=比滚动更快（前景冲得快）
  layers: {
    bg: 0.3,       // 背景层：慢速 → 产生"远景不动近景动"的深度错觉
    mid: 0.55,     // 中景层
    content: 0.85, // 前景内容：接近 1 但不满 → 微妙的"拖拽感"
    titleFade: 0.4,// 标题淡出速度
  },
  fadeRange: 0.6,  // 标题在 Hero 高度的百分之几内完成淡出
} as const;

export default function ParallaxHero({
  title = "深度来自分层",
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return; // 降级：静态 Hero，滚动不触发任何位移

    let raf = 0;
    let ticking = false;

    const update = () => {
      ticking = false;
      const rect = root.getBoundingClientRect();
      // Hero 顶边离开视口顶部的距离就是"已滚过多少"，正负都要处理
      const scrolled = Math.max(0, -rect.top);
      // 只在 Hero 还在视口内时工作：滚过去后停手，白送的优化
      if (rect.bottom < 0) return;

      // 统一"写"阶段：所有 transform 一次性发出
      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(0, ${scrolled * CONFIG.layers.bg}px, 0)`;
      }
      if (midRef.current) {
        midRef.current.style.transform = `translate3d(0, ${scrolled * CONFIG.layers.mid}px, 0)`;
      }
      if (contentRef.current) {
        contentRef.current.style.transform = `translate3d(0, ${scrolled * CONFIG.layers.content}px, 0)`;
        // 前景同时淡出：视差 + 淡出的组合比单纯位移更"贵"
        const heroH = rect.height;
        const fade = Math.min(1, scrolled / (heroH * CONFIG.fadeRange));
        contentRef.current.style.opacity = `${(1 - fade).toFixed(3)}`;
      }
    };

    const onScroll = () => {
      // ticking 门闩：一帧最多执行一次 update，滚动再猛也不超载
      if (!ticking) {
        ticking = true;
        raf = requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update(); // 初始化时先算一次，避免首屏错位
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={rootRef}
      style={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
        background: "#07070f",
      }}
    >
      {/* 远景：大渐变圆，移动最慢 */}
      <div
        ref={bgRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "-15%",           // 四周外扩：慢速层下移后不会露出底边
          background: "radial-gradient(ellipse at 50% 35%, #1b1545 0%, #07070f 65%)",
          willChange: "transform",
        }}
      />
      {/* 中景：网格线 */}
      <div
        ref={midRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "-10%",
          backgroundImage:
            "linear-gradient(rgba(120,120,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(120,120,255,0.08) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          willChange: "transform",
        }}
      />
      {/* 前景内容 */}
      <div ref={contentRef} style={{ position: "relative", textAlign: "center", willChange: "transform, opacity" }}>
        <h1 style={{ color: "#f0f0ff", fontSize: "clamp(2.4rem, 6vw, 5rem)", fontWeight: 800, margin: 0 }}>
          {title}
        </h1>
        {children}
      </div>
    </section>
  );
}
