"use client"

import {
  ComposedChart, Scatter, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts"
import type { BondItem } from "@/lib/api-client"

// ─── Colores (del calendario) ──────────────────────────────────────────────────
const COLOR_BONCER = "#f43f5e"   // rose-500
const COLOR_LECER  = "#84cc16"   // lime-500
const COLOR_CURVE  = "#64748b"   // slate-500

// ─── Polynomial regression (grado 2) ─────────────────────────────────────────
// Resuelve: [a, b, c] tal que y ≈ a + b·x + c·x²
// Método: eliminación Gaussiana sobre las ecuaciones normales 3×3.

function gaussElim(A: number[][], b: number[]): number[] {
  const n = A.length
  const M = A.map((row, i) => [...row, b[i]])

  for (let col = 0; col < n; col++) {
    // Pivot
    let maxRow = col
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[maxRow][col])) maxRow = row
    }
    ;[M[col], M[maxRow]] = [M[maxRow], M[col]]
    if (Math.abs(M[col][col]) < 1e-12) continue
    for (let row = col + 1; row < n; row++) {
      const f = M[row][col] / M[col][col]
      for (let k = col; k <= n; k++) M[row][k] -= f * M[col][k]
    }
  }
  // Back substitution
  const x = new Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    x[i] = M[i][n]
    for (let j = i + 1; j < n; j++) x[i] -= M[i][j] * x[j]
    x[i] /= M[i][i]
  }
  return x
}

function polyfit2(xs: number[], ys: number[]): [number, number, number] | null {
  const n = xs.length
  if (n < 3) return null

  let s0 = n, s1 = 0, s2 = 0, s3 = 0, s4 = 0
  let t0 = 0, t1 = 0, t2 = 0
  for (let i = 0; i < n; i++) {
    const xi = xs[i], yi = ys[i]
    const x2 = xi * xi
    s1 += xi; s2 += x2; s3 += x2 * xi; s4 += x2 * x2
    t0 += yi; t1 += xi * yi; t2 += x2 * yi
  }

  const A = [
    [s0, s1, s2],
    [s1, s2, s3],
    [s2, s3, s4],
  ]
  const bv = [t0, t1, t2]
  const [a, b, c] = gaussElim(A, bv)
  if ([a, b, c].some(isNaN)) return null
  return [a, b, c]
}

// ─── Tooltip custom ────────────────────────────────────────────────────────────

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

// ─── Legend custom ─────────────────────────────────────────────────────────────

function CustomLegend() {
  return (
    <div className="flex items-center justify-center gap-5 text-xs text-muted-foreground mt-1">
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLOR_BONCER }} />
        BONCER
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLOR_LECER }} />
        LECER
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-6 w-4 border-t-2 border-dashed" style={{ borderColor: COLOR_CURVE }} />
        Curva polinómica
      </span>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface CerYieldCurveProps {
  rawCer: BondItem[]
}

export function CerYieldCurve({ rawCer }: CerYieldCurveProps) {
  // Filtrar bonos con TIR y DM válidos
  const points = rawCer
    .filter((b) => b.tir != null && b.mac_dur != null && b.mac_dur > 0)
    .map((b) => ({
      ticker: b.ticker,
      tipo:   b.tipo ?? "CER",
      vto:    b.vto ?? "—",
      x:      b.mac_dur!,
      y:      b.tir! * 100,     // fracción → porcentaje
    }))

  const boncer = points.filter((p) => p.tipo === "BONCER")
  const lecer  = points.filter((p) => p.tipo === "LECER")

  // Curva polinómica grado 2 sobre todos los puntos
  const xs    = points.map((p) => p.x)
  const ys    = points.map((p) => p.y)
  const coefs = polyfit2(xs, ys)

  const curveData: { x: number; y: number }[] = []
  if (coefs && xs.length >= 3) {
    const xMin = Math.min(...xs)
    const xMax = Math.max(...xs)
    const steps = 60
    for (let i = 0; i <= steps; i++) {
      const xv = xMin + (xMax - xMin) * (i / steps)
      const yv = coefs[0] + coefs[1] * xv + coefs[2] * xv * xv
      curveData.push({ x: +xv.toFixed(3), y: +yv.toFixed(3) })
    }
  }

  if (!points.length) {
    return (
      <div className="flex items-center justify-center h-full py-16 text-xs text-muted-foreground">
        Sin datos CER
      </div>
    )
  }

  const yMin = Math.floor(Math.min(...ys) - 1)
  const yMax = Math.ceil(Math.max(...ys)  + 1)

  return (
    <div className="rounded-lg border border-border bg-card p-4 h-full flex flex-col">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-primary">Curva de Rendimientos CER</h3>
        <p className="text-xs text-muted-foreground mt-0.5">TIR real (%) vs Duration modificada (años)</p>
      </div>

      <div className="flex-1 min-h-0" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart margin={{ top: 10, right: 16, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />

            <XAxis
              dataKey="x"
              type="number"
              domain={["auto", "auto"]}
              tickFormatter={(v) => `${v.toFixed(1)}y`}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              label={{ value: "Duration (años)", position: "insideBottom", offset: -4, fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />

            <YAxis
              domain={[yMin, yMax]}
              tickFormatter={(v) => `${v.toFixed(1)}%`}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              width={44}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Curva polinómica */}
            {curveData.length > 0 && (
              <Line
                data={curveData}
                dataKey="y"
                dot={false}
                strokeDasharray="5 3"
                stroke={COLOR_CURVE}
                strokeWidth={1.5}
                isAnimationActive={false}
              />
            )}

            {/* Scatter BONCER */}
            <Scatter
              data={boncer}
              fill={COLOR_BONCER}
              r={5}
              name="BONCER"
            />

            {/* Scatter LECER */}
            <Scatter
              data={lecer}
              fill={COLOR_LECER}
              r={5}
              name="LECER"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <CustomLegend />
    </div>
  )
}
