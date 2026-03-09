"use client"

import { useState } from "react"
import type { BondItem } from "@/lib/api-client"

// ─── Constantes ───────────────────────────────────────────────────────────────

const TC_PRESETS = [1300, 1350, 1400, 1450, 1500, 1550, 1600, 1650, 1700]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function retorno(vpv: number, precio: number, tcEntrada: number, tcSalida: number): number {
  return (vpv / precio) * (tcEntrada / tcSalida) - 1
}

function fmt(r: number): string {
  return `${r >= 0 ? "+" : ""}${(r * 100).toFixed(1)}%`
}

function cellClass(r: number): string {
  if (r >=  0.40) return "bg-emerald-700 text-white"
  if (r >=  0.25) return "bg-emerald-600 text-white"
  if (r >=  0.15) return "bg-emerald-500 text-white"
  if (r >=  0.07) return "bg-emerald-400 text-emerald-950"
  if (r >=  0.02) return "bg-emerald-200 text-emerald-950"
  if (r >=  0.00) return "bg-emerald-100 text-emerald-950"
  if (r >= -0.05) return "bg-red-100   text-red-900"
  if (r >= -0.12) return "bg-red-200   text-red-900"
  if (r >= -0.20) return "bg-red-300   text-red-900"
  return                  "bg-red-400   text-white"
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface CarryHeatmapProps {
  rawBonds: BondItem[]    // bonds_pesos.lecap + boncap con precio y px_finish numéricos
  tcEntradaDefault: number
}

export function CarryHeatmap({ rawBonds, tcEntradaDefault }: CarryHeatmapProps) {
  const [tcEntrada, setTcEntrada] = useState(Math.round(tcEntradaDefault))
  const [customTc, setCustomTc]   = useState("")

  const bonds = rawBonds
    .filter(b => b.precio && b.precio > 0 && b.px_finish && b.px_finish > 0 && (b.dtm ?? 0) > 0)
    .sort((a, b) => (a.dtm ?? 0) - (b.dtm ?? 0))

  if (!bonds.length) return null

  const customNum = parseFloat(customTc)
  const hasCustom = !isNaN(customNum) && customNum > 100

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-primary">
            Carry Trade — Retorno total en USD por escenario de TC
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Vendo USD hoy → compro LECAP/BONCAP → a vencimiento recompro USD al TC indicado
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground whitespace-nowrap">TC entrada (MEP):</span>
          <input
            type="number"
            value={tcEntrada}
            onChange={e => setTcEntrada(Number(e.target.value))}
            className="w-24 rounded border border-border bg-background px-2 py-1 text-right text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-card w-28 py-1 pr-3 text-left text-muted-foreground font-medium">
                TC salida
              </th>
              {bonds.map(b => (
                <th key={b.ticker} className="min-w-[72px] px-1 py-1 text-center font-medium text-foreground">
                  <div>{b.ticker}</div>
                  <div className="font-normal text-muted-foreground">({b.dtm}d)</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&>tr]:border-t [&>tr]:border-border/40">
            {TC_PRESETS.map(tc => (
              <tr key={tc}>
                <td className="sticky left-0 z-10 bg-card py-1 pr-3 font-medium text-muted-foreground whitespace-nowrap">
                  TC {tc.toLocaleString("es-AR")}
                </td>
                {bonds.map(b => {
                  const r = retorno(b.px_finish!, b.precio!, tcEntrada, tc)
                  return (
                    <td key={b.ticker} className={`px-1 py-1 text-center font-mono rounded ${cellClass(r)}`}>
                      {fmt(r)}
                    </td>
                  )
                })}
              </tr>
            ))}

            {/* Fila custom */}
            <tr className="border-t-2 border-border">
              <td className="sticky left-0 z-10 bg-card py-1 pr-3">
                <input
                  type="number"
                  placeholder="TC custom"
                  value={customTc}
                  onChange={e => setCustomTc(e.target.value)}
                  className="w-24 rounded border border-border bg-background px-2 py-1 text-right text-xs font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </td>
              {bonds.map(b => {
                if (!hasCustom) return (
                  <td key={b.ticker} className="px-1 py-1 text-center text-muted-foreground/30">—</td>
                )
                const r = retorno(b.px_finish!, b.precio!, tcEntrada, customNum)
                return (
                  <td key={b.ticker} className={`px-1 py-1 text-center font-mono rounded ${cellClass(r)}`}>
                    {fmt(r)}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Leyenda */}
      <div className="mt-3 flex items-center gap-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-emerald-500" />
          Retorno positivo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-red-300" />
          Retorno negativo
        </span>
      </div>
    </div>
  )
}
