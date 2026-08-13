// 品牌标志：从一根主干自然长出三枚创意果实。图形取自「十人面试间」方案。
export function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 18V9M10 9C10 5 7 3 3 3M10 11C10 7 13 5 17 5M10 13C10 10 8 8.5 5 8.5"
        stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round"
      />
      <circle cx="3" cy="3" r="1.7" fill="#d95b57" />
      <circle cx="17" cy="5" r="1.7" fill="#d95b57" />
      <circle cx="5" cy="8.5" r="1.5" fill="#eec16f" />
    </svg>
  );
}
