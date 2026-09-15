"use client";
/**
 * 故障风文字（Glitch Text）
 * 依赖：React 18+；无第三方库
 *
 * 为什么用三层文字 + clip-path 切片而非 JS 操纵像素：
 * RGB 通道分离（红青错位）+ 随机时间窗的横向切片撕裂，两层把戏叠加
 * 就能覆盖 90% 的"数字故障"想象，全部由 CSS 完成，零每帧 JS。
 */
const CONFIG = {
  main: "#e8e8f0",     // 主文字色：近白
  chromaticA: "#ff004c",// 通道分离色 A（红）：错位残影
  chromaticB: "#00fff0",// 通道分离色 B（青）：A/B 一红一青才是"色差"味
  offset: 3,            // 通道错位量（px）：2~4 足够，大了晃眼
  sliceHeight: 18,      // 撕裂切片高度（%）：小切片更"数字"
  glitchDuration: 2.4,  // 故障周期（秒）：每轮只在其中 ~15% 时间真故障，其余时间安静
  intensity: 12,        // 撕裂横移幅度（px）
  hoverOnly: false,     // true = 只在悬停时故障（更克制，适合正文场景）
} as const;

export default function GlitchText({ text = "GLITCH" }: { text?: string }) {
  return (
    <>
      <style>{`
        @keyframes glitch-slice-a {
          /* 只在前 15% 的时间轴动作：故障要"突发"而非"持续"，持续的就是损坏不是风格 */
          0%   { clip-path: inset(12% 0 76% 0); transform: translateX(-${CONFIG.intensity}px); }
          4%   { clip-path: inset(58% 0 22% 0); transform: translateX(${CONFIG.intensity}px); }
          8%   { clip-path: inset(32% 0 48% 0); transform: translateX(-${CONFIG.intensity / 2}px); }
          12%  { clip-path: inset(80% 0 4% 0);  transform: translateX(${CONFIG.intensity}px); }
          15%, 100% { clip-path: inset(50% 0 50% 0); transform: translateX(0); }
        }
        @keyframes glitch-slice-b {
          0%   { clip-path: inset(65% 0 8% 0);  transform: translateX(${CONFIG.intensity}px); }
          5%   { clip-path: inset(15% 0 70% 0); transform: translateX(-${CONFIG.intensity}px); }
          10%  { clip-path: inset(42% 0 40% 0); transform: translateX(${CONFIG.intensity / 2}px); }
          14%  { clip-path: inset(4% 0 88% 0);  transform: translateX(-${CONFIG.intensity / 2}px); }
          15%, 100% { clip-path: inset(50% 0 50% 0); transform: translateX(0); }
        }
        .glitch-wrap { position: relative; display: inline-block; }
        .glitch-layer {
          position: absolute;
          inset: 0;
          pointer-events: none; /* 残影层不抢事件 */
        }
        .glitch-a {
          color: ${CONFIG.chromaticA};
          transform: translateX(-${CONFIG.offset}px);
          animation: glitch-slice-a ${CONFIG.glitchDuration}s infinite steps(1);
        }
        .glitch-b {
          color: ${CONFIG.chromaticB};
          transform: translateX(${CONFIG.offset}px);
          animation: glitch-slice-b ${CONFIG.glitchDuration}s infinite steps(1);
        }
        /* steps(1) 而非 linear：故障是"跳变"，平滑插值会变成波浪扭动 */
        ${CONFIG.hoverOnly ? `
        .glitch-layer { animation-play-state: paused; }
        .glitch-wrap:hover .glitch-layer { animation-play-state: running; }
        ` : ""}
        @media (prefers-reduced-motion: reduce) {
          /* 降级：残影层整个隐藏，只留干净的主文字 */
          .glitch-layer { display: none !important; }
        }
      `}</style>

      <span className="glitch-wrap">
        {/* 主文字在最上层，红青残影通过 mix-blend-mode 叠出色彩分离感 */}
        <span style={{ position: "relative", color: CONFIG.main, fontWeight: 800, letterSpacing: "0.08em" }}>
          {text}
        </span>
        <span className="glitch-layer glitch-a" aria-hidden="true">{text}</span>
        <span className="glitch-layer glitch-b" aria-hidden="true">{text}</span>
      </span>
    </>
  );
}
