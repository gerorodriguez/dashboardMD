"use client"

import React from "react"
import { Clock } from "lucide-react"
import type { GlobalTrackerData, GlobalTrackerAsset } from "@/lib/api-client"

// ─── Helpers de color ─────────────────────────────────────────────────────────

function cellClass(v: number | null | undefined): string {
  if (v === null || v === undefined) return "bg-secondary/30 text-muted-foreground/40"
  if (v >=  15) return "bg-emerald-600 text-white"
  if (v >=   8) return "bg-emerald-500 text-white"
  if (v >=   3) return "bg-emerald-400 text-emerald-950"
  if (v >=   1) return "bg-emerald-300 text-emerald-950"
  if (v >=   0) return "bg-emerald-100 text-emerald-800"
  if (v >=  -3) return "bg-red-100 text-red-800"
  if (v >=  -8) return "bg-red-200 text-red-900"
  if (v >= -15) return "bg-red-300 text-red-950"
  return "bg-red-400 text-white"
}

function fmt(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—"
  return `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`
}

function fmtPrice(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—"
  if (Math.abs(v) >= 10000) return v.toLocaleString("en-US", { maximumFractionDigits: 0 })
  if (Math.abs(v) >= 1000)  return v.toLocaleString("en-US", { maximumFractionDigits: 0 })
  if (Math.abs(v) >= 10)    return v.toLocaleString("en-US", { maximumFractionDigits: 0 })
  return v.toFixed(2)
}

// ─── Fila de activo ───────────────────────────────────────────────────────────

function AssetRow({ asset }: { asset: GlobalTrackerAsset }) {
  const pctCols: Array<{ key: keyof GlobalTrackerAsset; label: string }> = [
    { key: "d1",         label: "1D"      },
    { key: "w1",         label: "1W"      },
    { key: "m1",         label: "1M"      },
    { key: "ytd",        label: "YTD"     },
    { key: "y1",         label: "1Y"      },
    { key: "y3",         label: "3Y"      },
    { key: "low52_pct",  label: "52W↓"   },
    { key: "high52_pct", label: "52W↑"   },
  ]

  return (
    <tr>
      <td className="sticky left-0 z-10 bg-card py-1.5 pr-3 font-medium text-foreground whitespace-nowrap text-[11px]">
        {asset.name}
      </td>
      <td className="px-2 py-1.5 text-center font-mono text-muted-foreground text-[11px]">
        {asset.ticker}
      </td>
      <td className="px-2 py-1.5 text-center font-mono text-foreground text-xs">
        {fmtPrice(asset.current)}
      </td>
      {pctCols.map(({ key }) => {
        const v = asset[key] as number | null
        const is52w = key === "low52_pct" || key === "high52_pct"
        return (
          <td key={key} className={`py-1.5 text-center font-mono text-xs rounded ${cellClass(v)} ${is52w ? "pl-5 border-l border-border/60" : "px-1"}`}>
            {fmt(v)}
          </td>
        )
      })}
    </tr>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface GlobalTrackerTabProps {
  data?: GlobalTrackerData | null
}

export function GlobalTrackerTab({ data }: GlobalTrackerTabProps) {
  if (!data?.groups?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
        <Clock className="size-8 animate-pulse" />
        <p className="text-sm">Cargando datos de mercado global...</p>
        <p className="text-xs text-muted-foreground/60">Puede tardar unos segundos (descarga vía Yahoo Finance)</p>
      </div>
    )
  }

  const pctHeaders = ["1D", "1W", "1M", "YTD", "1Y", "3Y", "52W↓", "52W↑"]

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">

      {/* Header */}
      <div className="border-b border-border bg-secondary/50 px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="text-sm font-semibold text-primary leading-tight">Global Market Tracker</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Retornos totales en USD por activo y período temporal
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 text-xs font-medium text-amber-800 dark:text-amber-400">
            <Clock className="size-3" />
            {data.delay_note}
          </span>
          <span className="text-xs text-muted-foreground">
            {data.as_of}
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto p-4">
        <table className="w-full text-xs" style={{ borderCollapse: "separate", borderSpacing: "3px" }}>
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-card min-w-[160px] pb-3 pr-3 text-left text-muted-foreground font-medium text-[11px]">
                Activo
              </th>
              <th className="min-w-[70px] px-2 pb-3 text-center text-muted-foreground font-medium text-[11px]">
                Ticker
              </th>
              <th className="min-w-[90px] px-2 py-2 text-center text-muted-foreground font-medium">
                Precio
              </th>
              {pctHeaders.map((h) => (
                <th
                  key={h}
                  className={`min-w-[60px] px-1 py-2 text-center text-muted-foreground font-medium ${h.startsWith("52W") ? "pl-5 border-l border-border/60" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.groups.map((group) => (
              <React.Fragment key={group.name}>
                {/* Fila de grupo */}
                <tr>
                  <td
                    colSpan={3 + pctHeaders.length}
                    className="pt-3 pb-1 pl-1 font-semibold text-primary text-[11px] tracking-wide"
                  >
                    {group.name}
                  </td>
                </tr>
                {/* Filas de activos */}
                {group.assets.map((asset) => (
                  <AssetRow key={asset.ticker} asset={asset} />
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Leyenda */}
      <div className="border-t border-border/40 bg-secondary/30 px-4 py-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
        {[
          { label: ">15%",    bg: "bg-emerald-600" },
          { label: ">8%",     bg: "bg-emerald-500" },
          { label: ">3%",     bg: "bg-emerald-400" },
          { label: ">1%",     bg: "bg-emerald-300" },
          { label: "0–1%",    bg: "bg-emerald-100" },
          { label: "0–−3%",   bg: "bg-red-100" },
          { label: "−3–8%",   bg: "bg-red-200" },
          { label: "−8–15%",  bg: "bg-red-300" },
          { label: "<−15%",   bg: "bg-red-400" },
        ].map(l => (
          <span key={l.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className={`inline-block h-2.5 w-5 rounded ${l.bg}`} />
            {l.label}
          </span>
        ))}
        <span className="text-[10px] text-muted-foreground/60 ml-auto">
          52W↓ = vs mínimo · 52W↑ = vs máximo
        </span>
      </div>
    </div>
  )
}
