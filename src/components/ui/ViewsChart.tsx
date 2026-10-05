import { useState } from "react";
import type { DailyStat } from "../../utils/analytics";

interface ViewsChartProps {
  data: DailyStat[];
  label?: string;
}

const formatDay = (date: string, options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) =>
  new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));

const niceMax = (value: number): number => {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude * 4 >= value) ?? 10;
  return step * magnitude * 4;
};

/** Single-series bar chart of daily views with hover/focus tooltips and a table fallback. */
export default function ViewsChart({ data, label = "Daily views" }: ViewsChartProps): React.ReactElement {
  const [active, setActive] = useState<number | null>(null);
  const width = 720;
  const height = 220;
  const pad = { top: 12, right: 8, bottom: 26, left: 36 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const max = niceMax(Math.max(0, ...data.map((day) => day.views)));
  const slot = plotW / Math.max(1, data.length);
  const barW = Math.max(2, slot - 2); // 2px gap between bars
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => Math.round(max * ratio));
  const labelEvery = Math.ceil(data.length / 6);
  const activeDay = active !== null ? data[active] : null;

  return (
    <figure className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${label}: bar chart for the last ${data.length} days. Data table follows.`}
        onMouseLeave={() => setActive(null)}
      >
        {ticks.map((tick) => {
          const y = pad.top + plotH - (tick / max) * plotH;
          return (
            <g key={tick}>
              <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke="currentColor" strokeOpacity={tick === 0 ? 0.3 : 0.08} />
              <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize="11" fill="currentColor" fillOpacity={0.6}>
                {tick}
              </text>
            </g>
          );
        })}
        {data.map((day, index) => {
          const h = (day.views / max) * plotH;
          const x = pad.left + index * slot + (slot - barW) / 2;
          const y = pad.top + plotH - h;
          const r = Math.min(4, barW / 2, h);
          return (
            <g key={day.date}>
              {h > 0 && (
                <path
                  d={`M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + barW - r} Q${x + barW},${y} ${x + barW},${y + r} V${y + h} Z`}
                  className="fill-primary"
                  fillOpacity={active === null || active === index ? 1 : 0.45}
                />
              )}
              {/* Hit target larger than the mark */}
              <rect
                x={pad.left + index * slot}
                y={pad.top}
                width={slot}
                height={plotH}
                fill="transparent"
                tabIndex={0}
                role="presentation"
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
              />
              {index % labelEvery === 0 && (
                <text x={pad.left + index * slot + slot / 2} y={height - 8} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.6}>
                  {formatDay(day.date)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {activeDay && active !== null && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg border border-base-300 bg-base-100 px-2.5 py-1.5 text-xs shadow-lg"
          style={{ left: `${((pad.left + active * slot + slot / 2) / width) * 100}%` }}
          role="status"
        >
          <span className="block font-semibold">{activeDay.views.toLocaleString()} views</span>
          <span className="text-base-content/60">{formatDay(activeDay.date, { weekday: "short", month: "short", day: "numeric" })}</span>
        </div>
      )}
      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Views</th>
          </tr>
        </thead>
        <tbody>
          {data.map((day) => (
            <tr key={day.date}>
              <td>{formatDay(day.date, { month: "long", day: "numeric" })}</td>
              <td>{day.views}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
