"use client"

import { useState } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import type { FciItem } from "@/lib/api-client"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtPct(v: number | null | undefined, decimals = 2): string {
  if (v == null) return "–"
  return `${v >= 0 ? "+" : ""}${v.toFixed(decimals)}%`
}

function fmtNum(v: number | null | undefined, decimals = 2): string {
  if (v == null) return "–"
  return v.toFixed(decimals)
}

function fmtDate(iso: string): string {
  if (!iso) return "–"
  // ISO "2017-10-23T03:00:00.000Z" or "DD/MM/YYYY"
  if (iso.includes("T")) {
    const d = new Date(iso)
    return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }
  return iso
}

const PIE_COLORS = [
  "#6366f1", "#22d3ee", "#a3e635", "#f59e0b", "#f43f5e",
  "#8b5cf6", "#10b981", "#fb923c", "#38bdf8", "#e879f9",
  "#84cc16", "#ef4444",
]

// ─── Sub-tabs ─────────────────────────────────────────────────────────────────

type Tab = "rendimientos" | "composicion" | "costos" | "info"

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      }`}
    >
      {label}
    </button>
  )
}

// ─── Rendimientos ─────────────────────────────────────────────────────────────

function RendimientosTab({ fund }: { fund: FciItem }) {
  const rows = fund.rendimientos_full ?? []
  if (rows.length === 0)
    return <p className="text-sm text-muted-foreground py-6 text-center">Sin datos de rendimiento.</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/30">
            <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Período</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Rendimiento</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">TNA</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Fecha</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {rows.map((r) => {
            const pos = (r.rendimiento ?? 0) >= 0
            return (
              <tr key={r.periodo} className="hover:bg-secondary/20 transition-colors">
                <td className="px-3 py-2 text-xs font-medium text-foreground">{r.periodo}</td>
                <td className={`px-3 py-2 text-right font-mono text-xs tabular-nums ${
                  r.rendimiento == null ? "text-muted-foreground/50" : pos ? "text-green-400" : "text-red-400"
                }`}>
                  {fmtPct(r.rendimiento)}
                </td>
                <td className={`px-3 py-2 text-right font-mono text-xs tabular-nums ${
                  r.tna == null ? "text-muted-foreground/50" : pos ? "text-green-400" : "text-red-400"
                }`}>
                  {fmtPct(r.tna)}
                </td>
                <td className="px-3 py-2 text-right text-xs text-muted-foreground">{r.fecha || "–"}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Composición ──────────────────────────────────────────────────────────────

const CHART_LIMIT = 10

function ComposicionTab({ fund }: { fund: FciItem }) {
  const carteras = fund.carteras ?? []
  if (carteras.length === 0)
    return <p className="text-sm text-muted-foreground py-6 text-center">Sin datos de composición.</p>

  // Sort by pct desc, take top CHART_LIMIT, group rest as "Otros"
  const sorted = [...carteras]
    .filter((c) => (c.pct ?? 0) > 0)
    .sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0))

  const top = sorted.slice(0, CHART_LIMIT)
  const othersTotal = sorted.slice(CHART_LIMIT).reduce((s, c) => s + (c.pct ?? 0), 0)
  const pieData = [
    ...top.map((c) => ({ name: c.nombre, value: c.pct ?? 0 })),
    ...(othersTotal > 0.01 ? [{ name: "Otros", value: othersTotal }] : []),
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Pie chart */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
            >
              {pieData.map((_, idx) => (
                <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} opacity={0.85} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(2)}%`, ""]}
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 6,
                fontSize: 11,
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Holdings list */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Activo</th>
              <th className="px-3 py-2 text-right font-semibold text-muted-foreground">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {sorted.map((c, i) => (
              <tr key={i} className="hover:bg-secondary/20">
                <td className="px-3 py-1.5 flex items-center gap-2">
                  <span
                    className="inline-block size-2 rounded-full shrink-0"
                    style={{ background: i < CHART_LIMIT ? PIE_COLORS[i % PIE_COLORS.length] : "#6b7280" }}
                  />
                  {c.nombre}
                </td>
                <td className="px-3 py-1.5 text-right font-mono tabular-nums text-foreground">
                  {fmtNum(c.pct)}%
                </td>
              </tr>
            ))}
            {othersTotal > 0.01 && (
              <tr className="border-t border-border bg-secondary/10">
                <td className="px-3 py-1.5 text-muted-foreground">Otros</td>
                <td className="px-3 py-1.5 text-right font-mono tabular-nums text-muted-foreground">
                  {fmtNum(othersTotal)}%
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Costos ───────────────────────────────────────────────────────────────────

function CostosTab({ fund }: { fund: FciItem }) {
  const h = fund.honorarios ?? {}
  const cal = fund.calificacion

  const rows: { label: string; value: string }[] = [
    { label: "Gastos de gestión",              value: h.gastos_gestion != null ? `${h.gastos_gestion.toFixed(4)}%` : "–" },
    { label: "Comisión de ingreso",             value: h.comision_ingreso != null ? `${h.comision_ingreso.toFixed(4)}%` : "–" },
    { label: "Comisión de rescate",             value: h.comision_rescate != null ? `${h.comision_rescate.toFixed(4)}%` : "–" },
    { label: "Honorarios de éxito",             value: h.honorarios_exito === "S" ? "Sí" : h.honorarios_exito === "N" ? "No" : (h.honorarios_exito ?? "–") },
    { label: "Comisión de transferencia",       value: h.comision_transferencia != null ? `${h.comision_transferencia.toFixed(4)}%` : "–" },
    { label: "Hon. administración (gerente)",   value: h.hon_admin_gerente != null ? `${h.hon_admin_gerente.toFixed(4)}%` : "–" },
    { label: "Hon. administración (depositaria)", value: h.hon_admin_depositaria != null ? `${h.hon_admin_depositaria.toFixed(4)}%` : "–" },
    { label: "Mínimo de inversión (honorarios)", value: h.minimo_inversion != null ? h.minimo_inversion.toLocaleString("es-AR") : "–" },
  ]

  return (
    <div className="flex flex-col gap-4">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-border/30">
          {rows.map((r) => (
            <tr key={r.label} className="hover:bg-secondary/20 transition-colors">
              <td className="px-3 py-2 text-xs text-muted-foreground">{r.label}</td>
              <td className="px-3 py-2 text-right text-xs font-medium text-foreground">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {cal && (
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Calificación</p>
          <div className="flex items-center gap-3">
            <span className="inline-block rounded px-2 py-1 text-sm font-bold bg-primary/15 text-primary border border-primary/30">
              {cal.nota}
            </span>
            <div>
              <p className="text-xs text-foreground">{cal.calificadora}</p>
              <p className="text-xs text-muted-foreground">{cal.fecha}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Info ─────────────────────────────────────────────────────────────────────

function InfoTab({ fund }: { fund: FciItem }) {
  const rows: { label: string; value: string }[] = [
    { label: "Gestora",               value: fund.gestora_full || fund.gestora },
    { label: "Depositaria",           value: fund.depositaria || "–" },
    { label: "Horizonte",             value: fund.horizonte    || "–" },
    { label: "Duración",              value: fund.duracion     || "–" },
    { label: "Moneda",                value: fund.moneda },
    { label: "Tipo de renta",         value: fund.tipo_renta },
    { label: "Fecha de inicio",       value: fmtDate(fund.inicio) },
    { label: "Días de liquidación",   value: fund.dias_liquidacion != null ? `${fund.dias_liquidacion}D` : "–" },
    { label: "Inversión mínima",      value: fund.inversion_minima != null ? fund.inversion_minima.toLocaleString("es-AR") : "–" },
    { label: "Bloomberg ticker",      value: fund.bloomberg || "–" },
    { label: "ISIN",                  value: fund.isin || "–" },
  ]

  return (
    <div className="flex flex-col gap-4">
      {fund.objetivo && (
        <div className="rounded-lg border border-border bg-secondary/20 p-3">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Objetivo del fondo</p>
          <p className="text-xs text-foreground leading-relaxed">{fund.objetivo}</p>
        </div>
      )}
      <table className="w-full text-sm">
        <tbody className="divide-y divide-border/30">
          {rows.map((r) => (
            <tr key={r.label} className="hover:bg-secondary/20 transition-colors">
              <td className="px-3 py-2 text-xs text-muted-foreground">{r.label}</td>
              <td className="px-3 py-2 text-right text-xs font-medium text-foreground break-all">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Modal principal ──────────────────────────────────────────────────────────

interface FciDetailModalProps {
  fund: FciItem | null
  onClose: () => void
}

export function FciDetailModal({ fund, onClose }: FciDetailModalProps) {
  const [tab, setTab] = useState<Tab>("rendimientos")

  return (
    <Dialog open={fund != null} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0">
        {fund && (
          <>
            {/* Header */}
            <DialogHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
              <div className="flex items-start justify-between gap-3 pr-6">
                <div className="min-w-0">
                  <DialogTitle className="text-sm font-bold text-foreground leading-tight">
                    {fund.clase || fund.nombre}
                  </DialogTitle>
                  <p className="mt-0.5 text-xs text-muted-foreground">{fund.nombre}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">{fund.gestora}</span>
                    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold border ${
                      fund.moneda === "USD"
                        ? "bg-green-500/15 text-green-300 border-green-500/30"
                        : fund.moneda === "ARS"
                        ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                        : "bg-secondary text-muted-foreground border-border"
                    }`}>{fund.moneda}</span>
                    <span className="text-[10px] text-muted-foreground/70 bg-secondary px-1.5 py-0.5 rounded">
                      {fund.tipo_renta}
                    </span>
                    {fund.calificacion && (
                      <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold bg-primary/15 text-primary border border-primary/30">
                        {fund.calificacion.nota}
                      </span>
                    )}
                  </div>
                </div>
                {/* VCP + patrimonio */}
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">VCP</p>
                  <p className="text-sm font-mono font-semibold text-foreground">
                    {fund.vcp != null
                      ? fund.vcp.toLocaleString("es-AR", { minimumFractionDigits: 4, maximumFractionDigits: 6 })
                      : "–"}
                  </p>
                  {fund.patrimonio != null && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {`${fund.moneda === "USD" ? "USD" : "$"} ${(fund.patrimonio / 1_000_000).toFixed(1)}M`}
                    </p>
                  )}
                  {fund.fecha && (
                    <p className="text-[10px] text-muted-foreground/60">{fund.fecha}</p>
                  )}
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="flex gap-1 mt-3">
                <TabBtn label="Rendimientos" active={tab === "rendimientos"} onClick={() => setTab("rendimientos")} />
                <TabBtn label="Composición"  active={tab === "composicion"}  onClick={() => setTab("composicion")}  />
                <TabBtn label="Costos"       active={tab === "costos"}       onClick={() => setTab("costos")}       />
                <TabBtn label="Info"         active={tab === "info"}         onClick={() => setTab("info")}         />
              </div>
            </DialogHeader>

            {/* Content (scrollable) */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {tab === "rendimientos" && <RendimientosTab fund={fund} />}
              {tab === "composicion"  && <ComposicionTab  fund={fund} />}
              {tab === "costos"       && <CostosTab       fund={fund} />}
              {tab === "info"         && <InfoTab         fund={fund} />}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
