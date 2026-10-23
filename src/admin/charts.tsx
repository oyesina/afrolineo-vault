import React, { useEffect, useRef, useState } from 'react';

/** Measure an element's width so SVG charts draw at real pixel size. */
export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

const niceMax = (v: number) => {
  if (v <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
};

const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });

interface SeriesPoint {
  date: string;
  value: number;
}

/**
 * Single-series time chart. "line" draws a 2px line with a light area;
 * "bar" draws thin rounded bars. Hover shows a crosshair and tooltip.
 */
export function TimeChart({
  data,
  kind,
  color,
  label,
  height = 200,
}: {
  data: SeriesPoint[];
  kind: 'line' | 'bar';
  color: string;
  label: string;
  height?: number;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const pad = { top: 12, right: 12, bottom: 26, left: 36 };
  const w = Math.max(width, 200);
  const innerW = w - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const step = data.length > 1 ? innerW / (data.length - 1) : innerW;
  const slot = innerW / Math.max(data.length, 1);
  const x = (i: number) => (kind === 'bar' ? pad.left + slot * i + slot / 2 : pad.left + step * i);
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;
  const ticks = [0, max / 2, max];
  const labelIdx = data.length > 2 ? [0, Math.floor((data.length - 1) / 2), data.length - 1] : data.map((_, i) => i);

  const linePath = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.value)}`).join(' ');
  const areaPath = `${linePath} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const barW = Math.max(2, Math.min(18, slot - 4));

  return (
    <div ref={ref} className="relative">
      {width > 0 && (
        <svg width={w} height={height} role="img" aria-label={`${label}, daily`} className="block">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.left} x2={w - pad.right} y1={y(t)} y2={y(t)} stroke="#E8E0D3" strokeWidth={1} />
              <text x={pad.left - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="#6B6157">
                {Number.isInteger(t) ? t : t.toFixed(1)}
              </text>
            </g>
          ))}
          {labelIdx.map((i) => (
            <text
              key={i}
              x={x(i)}
              y={height - 6}
              textAnchor={i === 0 && kind === 'line' ? 'start' : i === data.length - 1 && kind === 'line' ? 'end' : 'middle'}
              fontSize={11}
              fill="#6B6157"
            >
              {shortDate(data[i].date)}
            </text>
          ))}

          {kind === 'line' ? (
            <>
              <path d={areaPath} fill={color} opacity={0.1} />
              <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            </>
          ) : (
            data.map((d, i) =>
              d.value > 0 ? (
                <path
                  key={d.date}
                  d={roundedTopBar(x(i) - barW / 2, y(d.value), barW, y(0) - y(d.value))}
                  fill={color}
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
              ) : null,
            )
          )}

          {hover !== null && (
            <>
              <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={y(0)} stroke="#1F1B17" strokeOpacity={0.25} strokeWidth={1} />
              {kind === 'line' && (
                <circle cx={x(hover)} cy={y(data[hover].value)} r={5} fill={color} stroke="#FFFFFF" strokeWidth={2} />
              )}
            </>
          )}

          {/* Hit areas wider than the marks */}
          {data.map((d, i) => (
            <rect
              key={`hit-${d.date}`}
              x={x(i) - slot / 2}
              y={pad.top}
              width={slot}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          ))}
        </svg>
      )}
      {hover !== null && width > 0 && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-ink px-2.5 py-1.5 text-xs text-cream shadow-lg whitespace-nowrap"
          style={{ left: Math.min(Math.max(x(hover), 60), w - 60), top: y(data[hover].value) - 8 }}
        >
          <span className="font-semibold">{data[hover].value}</span> {label.toLowerCase()} · {shortDate(data[hover].date)}
        </div>
      )}
    </div>
  );
}

function roundedTopBar(x: number, y: number, w: number, h: number) {
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
}

/** Ranked horizontal bars with the value written beside each one. */
export function BarList({
  items,
  color = '#2F5D4A',
  format = (v: number) => String(v),
  empty = 'No data yet',
}: {
  items: { label: string; value: number; note?: string }[];
  color?: string;
  format?: (v: number) => string;
  empty?: string;
}) {
  if (!items.length || items.every((i) => i.value === 0)) {
    return <p className="text-sm text-muted py-2">{empty}</p>;
  }
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.label} title={`${item.label}: ${format(item.value)}${item.note ? ` (${item.note})` : ''}`}>
          <div className="flex justify-between gap-3 text-sm mb-1">
            <span className="truncate text-ink-soft">{item.label}</span>
            <span className="shrink-0 font-semibold tabular-nums">
              {format(item.value)}
              {item.note && <span className="font-normal text-muted"> · {item.note}</span>}
            </span>
          </div>
          <div className="h-2 rounded-full bg-sand overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(item.value / max) * 100}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
