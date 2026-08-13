import type { ReactNode } from 'react'

/** The exact Ramify BrandMark used in the workspace home page. */
export function RamifyBrandMark({ size = 20 }: { readonly size?: number }): ReactNode {
  return (
    <svg className="ramify-brand-mark" width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 18V9M10 9C10 5 7 3 3 3M10 11C10 7 13 5 17 5M10 13C10 10 8 8.5 5 8.5"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      />
      <circle cx="3" cy="3" r="1.7" fill="#d95b57" />
      <circle cx="17" cy="5" r="1.7" fill="#d95b57" />
      <circle cx="5" cy="8.5" r="1.5" fill="#eec16f" />
    </svg>
  )
}
