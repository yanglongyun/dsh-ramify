// 手绘植物装饰 —— 视觉语言取自画布作品「小红花」系列:
// 朱砂红花瓣 + 墨色描边 + 灰绿枝叶,漫画手绘气质。全站装饰的唯一来源。

const INK = '#2c2827';
const RED = '#d95b57';
const CORE = '#eec16f';
const GREEN = '#7d8c77';
const GREEN_SOFT = '#9ab08f';

/* 五瓣小红花的花体,供各装饰在任意坐标复用 */
function FlowerG({ x, y, r = 10, rot = 0 }: { x: number; y: number; r?: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx="0"
          cy={-r * 0.52}
          rx={r * 0.34}
          ry={r * 0.5}
          fill={RED}
          stroke={INK}
          strokeWidth={Math.max(1.1, r * 0.13)}
          strokeLinejoin="round"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle r={r * 0.3} fill={CORE} stroke={INK} strokeWidth={Math.max(1.1, r * 0.13)} />
    </g>
  );
}

/* 小红花图标(积分等小尺寸场景) */
export function RedFlower({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <FlowerG x={12} y={12} r={11} />
    </svg>
  );
}

/* 摇曳的树苗 —— 生成中状态:设计正在发芽 */
export function Sapling({ width = 44, className = '' }: { width?: number; className?: string }) {
  return (
    <svg
      className={`cb-sapling${className ? ` ${className}` : ''}`}
      width={width}
      height={Math.round(width * 1.27)}
      viewBox="0 0 50 63"
      fill="none"
      aria-hidden="true"
    >
      <g className="cb-sapling-sway">
        <path d="M25 57 C24 44 26.5 32 25 19" stroke={GREEN} strokeWidth="3" strokeLinecap="round" />
        <path className="cb-sapling-leaf is-l" d="M25 40 C13 38 9 27 21.5 31.5 C24 33 25 36 25 40 Z" fill={GREEN_SOFT} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        <path className="cb-sapling-leaf is-r" d="M25.5 31 C37 28 41 17 28.5 22 C26 23.5 25.5 27 25.5 31 Z" fill={GREEN} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        <g className="cb-sapling-bud">
          <FlowerG x={25} y={12} r={9.5} rot={-8} />
        </g>
      </g>
      <path d="M14 58.6 H36" stroke={INK} strokeWidth="1.6" strokeLinecap="round" opacity=".24" />
    </svg>
  );
}

/* 落地页角落的弯枝 —— 一根枝、几片叶、两朵花 */
export function BranchDecor({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 230 180"
      fill="none"
      aria-hidden="true"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M10 176 C 52 140 76 106 122 78 C 154 59 182 49 212 46" stroke={GREEN} strokeWidth="3" strokeLinecap="round" />
      <path d="M86 106 C 96 88 110 76 126 70" stroke={GREEN} strokeWidth="2.3" strokeLinecap="round" />
      <path d="M162 58 C 172 47 184 41 196 38" stroke={GREEN} strokeWidth="2" strokeLinecap="round" />
      <path d="M58 136 C 42 126 42 112 60 120 C 64 124 62 130 58 136 Z" fill={GREEN_SOFT} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M104 92 C 96 76 104 64 112 78 C 114 84 110 88 104 92 Z" fill={GREEN} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M146 66 C 152 52 164 48 158 62 C 155 68 150 68 146 66 Z" fill={GREEN_SOFT} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <FlowerG x={128} y={58} r={16} rot={-12} />
      <FlowerG x={204} y={32} r={10.5} rot={18} />
    </svg>
  );
}

/* 章节分隔:两段手绘细线 + 居中一朵小红花 */
export function FloraDivider({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="220"
      height="28"
      viewBox="0 0 220 28"
      fill="none"
      aria-hidden="true"
    >
      <path d="M8 15 C 40 11 66 17 92 14" stroke="#c9cfd8" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M128 14 C 154 17 180 11 212 15" stroke="#c9cfd8" strokeWidth="1.6" strokeLinecap="round" />
      <FlowerG x={110} y={14} r={9.5} />
    </svg>
  );
}

/* 飘落的单片花瓣(落地页 hero 氛围) */
export function Petal({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="14" height="18" viewBox="0 0 14 18" fill="none" aria-hidden="true">
      <path d="M7 1 C 12 4 13 12 7 17 C 1 12 2 4 7 1 Z" fill={RED} stroke={INK} strokeWidth="1.2" strokeLinejoin="round" opacity=".9" />
    </svg>
  );
}
