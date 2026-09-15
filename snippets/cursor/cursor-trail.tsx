"use client";
/**
 * 自定义拖尾光标（Cursor Trail）
 * 依赖：React 18+；无第三方库
 *
 * 为什么用 Canvas 而非一串 div：
 * 拖尾需要几十个历史位置同时渲染并逐帧衰减，DOM 方案要维护几十个节点
 * 的 style；Canvas 一层画布全画掉，且能做半径/透明度的连续衰减。
 */
import { useRef, useEffect } from "react";

// ===== 视觉参数集中区 =====
const CONFIG = {
  dotCount: 14,       // 拖尾节点数：10~20；再多只是更"重"，不会更长
  headSize: 8,        // 头部圆点半径（px）
  taper: 0.75,        // 每往后一个节点半径缩放系数：0.75 = 快速收细的"彗尾"
  follow: 0.32,       // 节点间追赶系数：越小尾巴越"甩"，越大越像一根直棍
  color: "160, 190, 255", // 尾巴色（RGB）
  headColor: "#ffffff",
  hideNative: false,  // 是否隐藏系统光标：true 前请确认页面所有可点区域都有 hover 反馈
} as const;

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // 触屏没有光标；reduced-motion 用户要求最少动画 → 双降级，都不启动
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || reduced) return;

    if (CONFIG.hideNative) {
      document.documentElement.style.cursor = "none";
    }

    let W = 0, H = 0;
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * ratio;
      canvas.height = H * ratio;
      ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // pointer 链：第 0 个追鼠标，第 i 个追第 i-1 个 —— "跟屁虫"链式结构
    const trail = Array.from({ length: CONFIG.dotCount }, () => ({ x: -100, y: -100 }));
    const mouse = { x: -100, y: -100 };
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const loop = () => {
      ctx!.clearRect(0, 0, W, H);
      let px = mouse.x, py = mouse.y;
      trail.forEach((dot, i) => {
        // 每个节点追前一个：位置 = 前驱 + (自己 - 前驱) * (1 - follow)
        dot.x += (px - dot.x) * CONFIG.follow;
        dot.y += (py - dot.y) * CONFIG.follow;
        const r = CONFIG.headSize * Math.pow(CONFIG.taper, i);
        const alpha = 0.5 * Math.pow(CONFIG.taper, i);
        ctx!.beginPath();
        ctx!.arc(dot.x, dot.y, Math.max(r, 0.5), 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${CONFIG.color}, ${alpha.toFixed(3)})`;
        ctx!.fill();
        px = dot.x;
        py = dot.y;
      });
      // 头部实心点最后画，压在尾巴上面
      ctx!.beginPath();
      ctx!.arc(mouse.x, mouse.y, CONFIG.headSize * 0.55, 0, Math.PI * 2);
      ctx!.fillStyle = CONFIG.headColor;
      ctx!.fill();
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      document.documentElement.style.cursor = ""; // 还原系统光标，别污染宿主页面
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none", // 光标层永远不拦截点击
        zIndex: 10000,
      }}
    />
  );
}
