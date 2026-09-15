"use client";
/**
 * 共享元素过渡（Shared Element Transition / FLIP）
 * 依赖：React 18+；无第三方库
 *
 * FLIP 四步：
 *   First  —— 动画前量一次旧位置（getBoundingClientRect）
 *   Last   —— DOM 变化后量一次新位置
 *   Invert —— 用 transform 把元素"倒放"回旧位置（用户看不到跳变）
 *   Play   —— 清掉 transform，transition 自动补间到新位置
 * 为什么它高级：观感上"同一个元素在两个布局间连续移动"，
 * 是 Material Design 和 Apple 通行证级别 app 的核心动效语言。
 */
import { useRef, useState, useCallback, type ReactNode } from "react";

// ===== 视觉参数集中区 =====
const CONFIG = {
  duration: 0.45,         // 位移/缩放补间时长（秒）
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  fadeContent: true,      // 非共享内容（正文）做交叉淡入淡出
  fadeDuration: 0.3,
  // 演示数据：换成你的真实数据源
  items: [
    { id: "a", title: "晨雾", color: "#1b2a4a", desc: "远山与雾的层次，FLIP 让点击的卡片连续地长大成详情。" },
    { id: "b", title: "正午", color: "#4a3b1b", desc: "共享元素在两个布局间只有一次 transform 补间，无跳变。" },
    { id: "c", title: "暮色", color: "#3d1b4a", desc: "First-Last-Invert-Play，四步一行核心代码。" },
  ],
} as const;

export default function SharedElementDemo() {
  // null = 网格态；item id = 详情态
  const [activeId, setActiveId] = useState<string | null>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  // 记录 First：切去详情前的旧矩形
  const firstRect = useRef<DOMRect | null>(null);

  const open = useCallback((id: string) => {
    const el = flipRef.current?.querySelector<HTMLElement>(`[data-flip-id="${id}"]`);
    firstRect.current = el ? el.getBoundingClientRect() : null; // First
    setActiveId(id);
  }, []);

  const close = useCallback(() => {
    // 关闭方向反过来：First = 详情卡当前位置
    const el = flipRef.current?.querySelector<HTMLElement>(`[data-flip-id="${activeId}"]`);
    firstRect.current = el ? el.getBoundingClientRect() : null;
    setActiveId(null);
  }, [activeId]);

  // DOM 更新后（useEffect 在 paint 前跑）执行 Invert + Play
  const playFlip = useCallback((node: HTMLElement | null) => {
    if (!node || !firstRect.current) return;
    const last = node.getBoundingClientRect(); // Last
    const first = firstRect.current;

    // Invert：dx/dy/scale 把新元素瞬移回旧位置
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    const sx = first.width / last.width;
    const sy = first.height / last.height;

    // 无位移就别播（避免不必要的 transition 抖动）
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(sx - 1) < 0.01) return;

    node.style.transition = "none";
    node.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;

    // Play：下一帧清掉 transform，CSS transition 接管补间
    requestAnimationFrame(() => {
      node.style.transition = `transform ${CONFIG.duration}s ${CONFIG.easing}`;
      node.style.transform = "";
    });
  }, []);

  const active = CONFIG.items.find((i) => i.id === activeId);

  return (
    <div
      ref={flipRef}
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: 24,
        fontFamily: "'PingFang SC', sans-serif",
        background: "#0a0a14",
        minHeight: "60vh",
      }}
    >
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          /* 降级：直接切换布局，无补间。功能完全可用 */
          .flip-shared { transition: none !important; }
        }
      `}</style>

      {/* 网格态 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, opacity: active ? 0 : 1, transition: `opacity ${CONFIG.fadeDuration}s` }}>
        {CONFIG.items.map((item) => (
          <button
            key={item.id}
            data-flip-id={item.id}
            onClick={() => open(item.id)}
            style={{
              height: 160,
              borderRadius: 14,
              border: "none",
              background: item.color,
              color: "#fff",
              fontSize: 18,
              fontWeight: 700,
              cursor: "pointer",
              willChange: "transform",
            }}
          >
            {item.title}
          </button>
        ))}
      </div>

      {/* 详情态：ref 回调正好承担"DOM 挂载后执行 Invert+Play"的时机 */}
      {active ? (
        <div key={active.id} ref={playFlip} data-flip-id={active.id} className="flip-shared"
          style={{
            borderRadius: 18,
            background: active.color,
            padding: 32,
            color: "#fff",
            minHeight: 320,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            willChange: "transform",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 28 }}>{active.title}</h2>
          <p style={{ margin: 0, lineHeight: 1.8, opacity: 0.85 }}>{active.desc}</p>
          <button
            onClick={close}
            style={{
              alignSelf: "flex-start",
              marginTop: "auto",
              padding: "10px 24px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.4)",
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            返回
          </button>
        </div>
      ) : null}
    </div>
  );
}
