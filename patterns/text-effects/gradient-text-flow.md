# 流动渐变文字

> **ID** `gradient-text-flow` · **分类** text-effects · **性能** low-cost · **依赖** 无

## Context

色彩在文字内部缓缓流淌——「高端」「活力」兼得的大标题方案，适合品牌 slogan、音乐/创意/活动页主标题。暗色背景 + 粗字重下效果最饱和。

## Approach

- **思路**：文字颜色不能是渐变；唯一原生手段是把渐变画在元素背景上，用 `background-clip: text` + `-webkit-text-fill-color: transparent` 把字「挖空」露出背景，动画只需平移 `background-position`。
- **技术**：纯 CSS。渐变色带首尾同色（数组首尾重复同一个色值）保证循环滚动无缝；`background-size: 200%` 留出平移空间。
- **性能**：background-position 动画会触发重绘，但文字面积小、频率低，实测无压力。不要把 `background-size` 调到 500% 以上。
- **降级**：`prefers-reduced-motion` 时停住平移并回退为单色实字（clip+transparent 组合在个别老引擎有渲染异常，稳妥给实色兜底）。
- **兼容**：`-webkit-background-clip` 前缀必须保留（Safari）。

## Example

<!-- EMBED:START:snippets/text-effects/gradient-text-flow.tsx -->
```tsx
"use client";
/**
 * 流动渐变文字（Animated Gradient Text）
 * 依赖：React 18+；无第三方库
 *
 * 为什么 background-clip: text 是唯一正解：
 * 文字颜色本身不能是渐变；把渐变画在背景上再用文字"裁"出来，
 * 是 CSS 里给文字上渐变的唯一原生手段，动画只需平移背景位置。
 */
const CONFIG = {
  colors: ["#f72585", "#7209b7", "#3a0ca3", "#4cc9f0", "#f72585"], // 首尾同色：循环滚动才无缝
  angle: 90,          // 渐变角度：90°= 水平流动；45° 更有升腾感
  size: 200,          // 背景宽度（%）：>100 才有可平移的空间做流动
  speed: 6,           // 一轮循环秒数：4~8s，再快就是洗车房灯箱
  fallback: "#b8b8ff",// 降级色：reduced-motion 时用的单色
} as const;

export default function GradientTextFlow({
  text = "Create · Motion · Art",
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <>
      <style>{`
        @keyframes gradient-slide {
          /* 为什么是 100%→0%（负向）：让色带向右流动；首尾同色保证 0% 与 100% 无缝衔接 */
          0%   { background-position: ${CONFIG.size}% 0; }
          100% { background-position: 0% 0; }
        }
        .gtf-text {
          background: linear-gradient(
            ${CONFIG.angle}deg,
            ${CONFIG.colors.join(", ")}
          );
          background-size: ${CONFIG.size}% 100%;
          -webkit-background-clip: text;  /* Safari 仍需要前缀 */
          background-clip: text;
          -webkit-text-fill-color: transparent; /* 与 clip 配套：字挖空露出背景 */
          animation: gradient-slide ${CONFIG.speed}s linear infinite;
          /* 挖空文字后字形只剩背景，一定要给个展示区宽度 */
          display: inline-block;
        }
        @media (prefers-reduced-motion: reduce) {
          /* 降级：停住平移并用单色——渐变本身可以保留（静态渐变不是动态刺激），
             但 clip+transparent 在个别老引擎渲染异常，稳妥起见给实色兜底 */
          .gtf-text {
            animation: none !important;
            background: none;
            -webkit-text-fill-color: ${CONFIG.fallback};
            color: ${CONFIG.fallback};
          }
        }
      `}</style>
      <span className={`gtf-text ${className ?? ""}`} style={{ fontWeight: 800, letterSpacing: "0.02em" }}>
        {text}
      </span>
    </>
  );
}
```
<!-- EMBED:END -->
