import React from 'react';

/**
 * The Afrolineo logo: "AF Voice Tree" (Voice blocks version).
 * An A and an F back to back built from voice-wave bars. The tall centre bar
 * is shared (the A's right leg and the F's spine); the gold bars are the A's
 * crossbar and the F's middle arm, one family line running through the trunk.
 * Master artwork: Figma file "Afrolineo — AF Voice Tree logo", component "AF Mark".
 *
 * tone="dark" (default) is for ink or coloured backgrounds; tone="light" for cream/white.
 */
const INK_BARS: [number, number, number][] = [
  [0, 42, 16], [1, 28, 10], [2, 14, 18], [3, 6, 52], [4, 6, 10], [5, 6, 10], [6, 6, 10],
];
const GOLD_BARS: [number, number, number][] = [
  [1, 40, 10], [2, 40, 10], [4, 40, 10], [5, 40, 10],
];

export default function BrandMark({
  className = '',
  tone = 'dark',
  title,
}: {
  className?: string;
  tone?: 'dark' | 'light';
  title?: string;
}) {
  const bar = tone === 'dark' ? '#F7F3EC' : '#1F1B17';
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {INK_BARS.map(([col, y, h]) => (
        <rect key={`i${col}`} x={5 + col * 8} y={y} width="6" height={h} rx="3" fill={bar} />
      ))}
      {GOLD_BARS.map(([col, y, h]) => (
        <rect key={`g${col}`} x={5 + col * 8} y={y} width="6" height={h} rx="3" fill="#D99A3E" />
      ))}
    </svg>
  );
}
