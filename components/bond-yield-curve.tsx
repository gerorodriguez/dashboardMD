"use client"

import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { BondItem } from "@/lib/api-client"

// ─── Colores ──────────────────────────────────────────────────────────────────
const COLOR_CURVE = "#64748b"  // slate-500

// ─── Polynomial regression (grado 2) ─────────────────────────────────────────

function polyfit2(xs: number[], ys: number[]): [number, number, number] | null {
  const n = xs.length
  if (n < 3) return null

  let s0 = n, s1 = 0, s2 = 0, s3 = 0, s4 = 0
  let t0 = 0, t1 = 0, t2 = 0
  for (let i = 0; i < n; i++) {
    const xi = xs[i], yi = ys[i], x2 = xi * xi
    s1 += xi; s2 += x2; s3 += x2 * xi; s4 += x2 * x2
    t0 += yi; t1 += xi * yi; t2 += x2 * yi
  }

  const M = [
    [s0, s1, s2, t0],
    [s1, s2, s3, t1],
    [s2, s3, s4, t2],
  ]
  for (let col = 0; col < 3; col++) {
    let maxRow = col
    for (let row = col + 1; row < 3; row++)
      if (Math.abs(M[row][col]) > Math.abs(M[maxRow][col])) maxRow = row
    ;[M[col], M[maxRow]] = [M[maxRow], M[col]]
    if (Math.abs(M[col][col]) < 1e-12) continue
    for (let row = col + 1; row < 3; row++) {
      const f = M[row][col] / M[col][col]
      for (let k = col; k <= 3; k++) M[row][k] -= f * M[col][k]
    }
  }
  const x = [0, 0, 0]
  for (let i = 2; i >= 0; i--) {
    x[i] = M[i][3]
    for (let j = i + 1; j < 3; j++) x[i] -= M[i][j] * x[j]
    x[i] /= M[i][i]
  }
  if (x.some(isNaN)) return null
  return [x[0], x[1], x[2]]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtVto(iso?: string): string {
  if (!iso) return "—"
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(2, 4)}`
}

// ─── Tooltip custom ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const entry = payload.find((p: any) => p?.payload?.ticker)
  if (!entry) return null
  const d = entry.payload
  const color = d._color ?? "#ffffff"
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="font-semibold mb-1" style={{ color }}>
        {d.ticker}
        {d.empresa && d.empresa !== d.ticker && (
          <span className="ml-1.5 font-normal text-muted-foreground">{d.empresa}</span>
        )}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        <span className="text-muted-foreground">TIR</span>
        <span className="font-mono text-right">{d.y?.toFixed(2)}%</span>
        <span className="text-muted-foreground">DM</span>
        <span className="font-mono text-right">{d.x?.toFixed(2)}y</span>
        <span className="text-muted-foreground">Vto</span>
        <span className="font-mono text-right">{d.vto}</span>
      </div>
    </div>
  )
}

// ─── Dot renderers ─────────────────────────────────────────────────────────────

function makeDot(color: string) {
  return function Dot(props: any) {
    const { cx, cy } = props
    if (cx == null || cy == null) return null
    return <circle cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={1.5} />
  }
}

function makeActiveDot(color: string) {
  return function ActiveDot(props: any) {
    const { cx, cy } = props
    if (cx == null || cy == null) return null
    return <circle cx={cx} cy={cy} r={7} fill={color} stroke="white" strokeWidth={2} />
  }
}

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface BondYieldSeries {
  label: string
  color: string
  items: BondItem[]
}

interface BondYieldCurveProps {
  title:     string
  subtitle?: string
  series:    BondYieldSeries[]
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function BondYieldCurve({ title, subtitle, series }: BondYieldCurveProps) {
  const allSeries = series.map((s) => ({
    ...s,
    points: s.items
      .filter((b) => b.tir != null && b.mac_dur != null && b.mac_dur > 0)
      .map((b) => ({
        ticker:  b.ticker,
        empresa: b.empresa,
        vto:     fmtVto(b.vto),
        x:       b.mac_dur!,
        y:       +(b.tir! * 100).toFixed(3),
        _color:  s.color,
      }))
      .sort((a, b) => a.x - b.x),
  }))

  const allPoints = allSeries.flatMap((s) => s.points)

  const xs    = allPoints.map((p) => p.x)
  const ys    = allPoints.map((p) => p.y)
  const coefs = polyfit2(xs, ys)

  const curveData: { x: number; y: number }[] = []
  if (coefs && xs.length >= 3) {
    const xMin = Math.min(...xs)
    const xMax = Math.max(...xs)
    for (let i = 0; i <= 80; i++) {
      const xv = xMin + (xMax - xMin) * (i / 80)
      const yv = coefs[0] + coefs[1] * xv + coefs[2] * xv * xv
      curveData.push({ x: +xv.toFixed(3), y: +yv.toFixed(3) })
    }
  }

  if (!allPoints.length) {
    return (
      <div className="flex items-center justify-center py-16 text-xs text-muted-foreground rounded-lg border border-border bg-card">
        Sin datos con TIR disponible
      </div>
    )
  }

  const pad  = 0.5
  const yMin = +(Math.min(...ys) - pad).toFixed(1)
  const yMax = +(Math.max(...ys) + pad).toFixed(1)
  const xMin = +(Math.min(...xs) - 0.1).toFixed(2)
  const xMax = +(Math.max(...xs) + 0.1).toFixed(2)

  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-primary">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>

      <div style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart margin={{ top: 10, right: 20, bottom: 28, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />

            <XAxis
              dataKey="x"
              type="number"
              scale="linear"
              domain={[xMin, xMax]}
              tickFormatter={(v) => `${Number(v).toFixed(1)}y`}
              tick={{ fontSize: 10, fill: "#ffffff" }}
              label={{ value: "Duration (años)", position: "insideBottom", offset: -12, fontSize: 10, fill: "#ffffff" }}
              tickLine={{ stroke: "#ffffff", strokeWidth: 1 }}
              axisLine={{ stroke: "#ffffff", strokeWidth: 1 }}
            />

            <YAxis
              dataKey="y"
              type="number"
              domain={[yMin, yMax]}
              tickFormatter={(v) => `${Number(v).toFixed(1)}%`}
              tick={{ fontSize: 10, fill: "#ffffff" }}
              tickLine={{ stroke: "#ffffff", strokeWidth: 1 }}
              axisLine={{ stroke: "#ffffff", strokeWidth: 1 }}
              width={46}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Curva polinómica */}
            {curveData.length > 0 && (
              <Line
                data={curveData}
                dataKey="y"
                dot={false}
                activeDot={false}
                strokeDasharray="5 3"
                stroke={COLOR_CURVE}
                strokeWidth={1.5}
                isAnimationActive={false}
              />
            )}

            {/* Series (una por grupo) */}
            {allSeries.map((s) => (
              <Line
                key={s.label}
                data={s.points}
                dataKey="y"
                stroke="none"
                strokeWidth={0}
                dot={makeDot(s.color)}
                activeDot={makeActiveDot(s.color)}
                isAnimationActive={false}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda */}
      <div className="mt-2 flex items-center justify-center gap-5 text-xs text-muted-foreground">
        {allSeries.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-5 border-t-2 border-dashed"
            style={{ borderColor: COLOR_CURVE }}
          />
          Curva polinómica
        </span>
      </div>
    </div>
  )
}
