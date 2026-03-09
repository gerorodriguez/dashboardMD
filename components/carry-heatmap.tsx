"use client"

import { useState } from "react"
import { TrendingUp } from "lucide-react"
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

function dateFmt(iso: string): string {
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y.slice(2)}`
}

function cellStyle(r: number): string {
  if (r >=  0.40) return "bg-emerald-600 text-white"
  if (r >=  0.25) return "bg-emerald-500 text-white"
  if (r >=  0.15) return "bg-emerald-400 text-emerald-950"
  if (r >=  0.07) return "bg-emerald-300 text-emerald-950"
  if (r >=  0.02) return "bg-emerald-200 text-emerald-900"
  if (r >=  0.00) return "bg-emerald-100 text-emerald-800"
  if (r >= -0.05) return "bg-red-100    text-red-800"
  if (r >= -0.12) return "bg-red-200    text-red-900"
  if (r >= -0.20) return "bg-red-300    text-red-950"
  return                  "bg-red-400    text-white"
}

const LEGEND = [
  { label: ">40%",   bg: "bg-emerald-600" },
  { label: ">25%",   bg: "bg-emerald-500" },
  { label: ">15%",   bg: "bg-emerald-400" },
  { label: ">7%",    bg: "bg-emerald-300" },
  { label: ">2%",    bg: "bg-emerald-200" },
  { label: "0–2%",   bg: "bg-emerald-100" },
  { label: "0–−5%",  bg: "bg-red-100" },
  { label: "−5–12%", bg: "bg-red-200" },
  { label: "−12–20%",bg: "bg-red-300" },
  { label: "<−20%",  bg: "bg-red-400" },
]

// ─── Componente ───────────────────────────────────────────────────────────────

interface CarryHeatmapProps {
  rawBonds: BondItem[]
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
    <div className="rounded-lg border border-border bg-card overflow-hidden">

      {/* ── Header ── */}
      <div className="border-b border-border bg-secondary/50 px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-primary shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-primary leading-tight">
              Carry Trade — Retorno total en USD
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Vendo USD al TC de entrada · compro LECAP/BONCAP · a vencimiento recompro USD al TC de salida
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground whitespace-nowrap">TC entrada (MEP):</span>
          <input
            type="number"
            value={tcEntrada}
            onChange={e => setTcEntrada(Number(e.target.value))}
            className="w-24 rounded border border-border bg-background px-2 py-1 text-right text-sm font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* ── Heatmap ── */}
      <div className="overflow-x-auto p-4">
        <table className="w-full text-xs" style={{ borderCollapse: "separate", borderSpacing: "3px" }}>
          <thead>
            <tr>
              {/* corner vacío */}
              <th className="w-28" />
              {bonds.map(b => (
                <th key={b.ticker} className="px-2 pb-3 text-center min-w-[80px]">
                  <div className="font-semibold text-foreground text-[11px]">{b.ticker}</div>
                  <div className="text-muted-foreground font-normal text-[10px]">{dateFmt(b.vto)}</div>
                  <div className="text-muted-foreground/50 font-normal text-[10px]">{b.dtm}d</div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {TC_PRESETS.map(tc => {
              const isBreakeven = tc === Math.round(tcEntrada)
              return (
                <tr key={tc}>
                  {/* Etiqueta TC */}
                  <td className="pr-3 text-right whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold ${isBreakeven ? "text-primary" : "text-muted-foreground"}`}>
                      {isBreakeven && <span className="size-1.5 rounded-full bg-primary shrink-0" />}
                      {tc.toLocaleString("es-AR")}
                    </span>
                  </td>

                  {/* Celdas de color */}
                  {bonds.map(b => {
                    const r = retorno(b.px_finish!, b.precio!, tcEntrada, tc)
                    return (
                      <td
                        key={b.ticker}
                        className={`py-2 px-1 text-center font-mono font-semibold rounded-md text-[11px] transition-opacity ${cellStyle(r)} ${isBreakeven ? "ring-1 ring-primary/50 ring-inset" : ""}`}
                      >
                        {fmt(r)}
                      </td>
                    )
                  })}
                </tr>
              )
            })}

            {/* ── Fila custom ── */}
            <tr>
              <td className="pr-3 pt-1 text-right">
                <input
                  type="number"
                  placeholder="TC custom…"
                  value={customTc}
                  onChange={e => setCustomTc(e.target.value)}
                  className="w-28 rounded border border-dashed border-border bg-background px-2 py-1 text-right text-[11px] font-mono placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </td>
              {bonds.map(b => {
                if (!hasCustom) return (
                  <td key={b.ticker} className="py-2 px-1 text-center text-muted-foreground/20 font-mono text-[11px] rounded-md bg-secondary/30">
                    —
                  </td>
                )
                const r = retorno(b.px_finish!, b.precio!, tcEntrada, customNum)
                return (
                  <td
                    key={b.ticker}
                    className={`py-2 px-1 text-center font-mono font-semibold rounded-md text-[11px] ring-1 ring-primary/40 ring-inset ${cellStyle(r)}`}
                  >
                    {fmt(r)}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Leyenda ── */}
      <div className="border-t border-border/40 bg-secondary/30 px-4 py-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
        {LEGEND.map(l => (
          <span key={l.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className={`inline-block h-2.5 w-5 rounded ${l.bg}`} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  )
}
