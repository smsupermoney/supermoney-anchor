import React from 'react';

export default function SupermoneyLogo({
  className,
  collapsed = false,
}: {
  className?: string;
  collapsed?: boolean;
}) {
  if (collapsed) {
    return (
      <svg
        viewBox="0 0 32 32"
        height="28"
        width="28"
        className={className}
        aria-label="Supermoney Logo"
      >
        <g>
          <path d="M16 0L32 16L16 32L0 16L16 0Z" fill="hsl(var(--primary))" />
          <path
            d="M16 5 L12 15.5 H 20 L 14 27 L 20 14.5 H 12 Z"
            fill="white"
          />
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 200 32"
      height="28"
      className={className}
      aria-label="Supermoney Logo"
    >
      <g>
        <path d="M16 0L32 16L16 32L0 16L16 0Z" fill="hsl(var(--primary))" />
        <path
          d="M16 5 L12 15.5 H 20 L 14 27 L 20 14.5 H 12 Z"
          fill="white"
        />
        <text
          x="42"
          y="23"
          fontFamily="Inter, sans-serif"
          fontWeight="bold"
          fontSize="20"
          fill="hsl(var(--primary))"
        >
          SUPERMONEY
        </text>
      </g>
    </svg>
  );
}
