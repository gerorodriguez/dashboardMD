"use client"

import { ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { BondItem } from "@/lib/api-client"

// ─── Colores (del calendario) ──────────────────────────────────────────────────
const COLOR_BONCER = "#f43f5e"   // rose-500
const COLOR_LECER  = "#84cc16"   // lime-500
const COLOR_CURVE  = "#64748b"   // slate-500

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

  // Eliminación Gaussiana 3×3
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

// ─── Tooltip custom ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d?.ticker) return null
  const color = d.tipo === "BONCER" ? COLOR_BONCER : COLOR_LECER
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="font-semibold mb-1" style={{ color }}>
        {d.ticker}
        <span className="ml-1.5 font-normal text-muted-foreground">{d.tipo}</span>
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

// ─── Dot renderer para Scatter ────────────────────────────────────────────────

function makeShape(color: string) {
  return function Shape(props: any) {
    const { cx, cy } = props
    if (cx == null || cy == null) return null
    return <circle cx={cx} cy={cy} r={6} fill={color} stroke="white" strokeWidth={1.5} />
  }
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface CerYieldCurveProps {
  rawCer: BondItem[]
}

export function CerYieldCurve({ rawCer }: CerYieldCurveProps) {
  const points = rawCer
    .filter((b) => b.tir != null && b.mac_dur != null && b.mac_dur > 0)
    .map((b) => ({
      ticker: b.ticker,
      tipo:   b.tipo ?? "CER",
      vto:    b.vto ?? "—",
      x:      b.mac_dur!,
      y:      +(b.tir! * 100).toFixed(3),
    }))

  const boncer = [...points.filter((p) => p.tipo === "BONCER")].sort((a, b) => a.x - b.x)
  const lecer  = [...points.filter((p) => p.tipo === "LECER") ].sort((a, b) => a.x - b.x)

  const xs    = points.map((p) => p.x)
  const ys    = points.map((p) => p.y)
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

  if (!points.length) {
    return (
      <div className="flex items-center justify-center h-full py-16 text-xs text-muted-foreground">
        Sin datos CER con TIR disponible
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
        <h3 className="text-sm font-semibold text-primary">Curva de Rendimientos CER</h3>
        <p className="text-xs text-muted-foreground mt-0.5">TIR real (%) vs Duration modificada (años)</p>
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

            {/* BONCER — puntos */}
            <Scatter
              name="BONCER"
              data={boncer}
              shape={makeShape(COLOR_BONCER)}
              isAnimationActive={false}
            />

            {/* LECER — puntos */}
            <Scatter
              name="LECER"
              data={lecer}
              shape={makeShape(COLOR_LECER)}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda */}
      <div className="mt-2 flex items-center justify-center gap-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLOR_BONCER }} />
          BONCER
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLOR_LECER }} />
          LECER
        </span>
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
