"use client"

import { useState, useEffect, useMemo } from "react"
import { Loader2, Search, WifiOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { fetchFci, type FciItem } from "@/lib/api-client"
import { mapFci } from "@/lib/data-mappers"
import type { FciRow } from "@/lib/types"

const PAGE_SIZE = 50

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function RendCell({ value, positive }: { value: string; positive: boolean }) {
  const isDash = value === '–'
  return (
    <td className={`px-2 py-1.5 text-right font-mono text-xs tabular-nums whitespace-nowrap ${
      isDash ? 'text-muted-foreground/50' : positive ? 'text-green-400' : 'text-red-400'
    }`}>
      {value}
    </td>
  )
}

function MonedaBadge({ moneda }: { moneda: string }) {
  const style =
    moneda === 'USD' ? 'bg-green-500/15 text-green-300 border-green-500/30' :
    moneda === 'ARS' ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' :
    'bg-secondary text-muted-foreground border-border'
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold border ${style}`}>
      {moneda}
    </span>
  )
}

function FilterSelect({
  label, value, options, onChange,
}: {
  label: string; value: string; options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <span className="text-xs text-muted-foreground">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded border border-border bg-secondary/50 px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function FCITab() {
  const [rawData, setRawData]   = useState<FciItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const [search,        setSearch]        = useState("")
  const [filterGestora, setFilterGestora] = useState("Todas")
  const [filterMoneda,  setFilterMoneda]  = useState("Todas")
  const [filterTipo,    setFilterTipo]    = useState("Todos")
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchFci()
      .then(setRawData)
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar FCI"))
      .finally(() => setLoading(false))
  }, [])

  const fciData = useMemo(() => mapFci(rawData), [rawData])

  const gestoras = useMemo(() =>
    ["Todas", ...Array.from(new Set(fciData.map((f) => f.gestora).filter((g) => g !== '–'))).sort()],
    [fciData])
  const monedas = useMemo(() =>
    ["Todas", ...Array.from(new Set(fciData.map((f) => f.moneda).filter((m) => m !== '–'))).sort()],
    [fciData])
  const tipos = useMemo(() =>
    ["Todos", ...Array.from(new Set(fciData.map((f) => f.tipoRenta).filter((t) => t !== '–'))).sort()],
    [fciData])

  const filtered = useMemo(() => {
    let result = fciData
    if (filterGestora !== "Todas") result = result.filter((f) => f.gestora === filterGestora)
    if (filterMoneda  !== "Todas") result = result.filter((f) => f.moneda  === filterMoneda)
    if (filterTipo    !== "Todos") result = result.filter((f) => f.tipoRenta === filterTipo)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((f) =>
        f.clase.toLowerCase().includes(q) ||
        f.nombre.toLowerCase().includes(q) ||
        f.gestora.toLowerCase().includes(q)
      )
    }
    return result
  }, [fciData, filterGestora, filterMoneda, filterTipo, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const resetPage = (fn: (v: string) => void) => (v: string) => { fn(v); setPage(1) }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <WifiOff className="size-8 text-destructive" />
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  const dataDate = filtered[0]?.fecha ?? fciData[0]?.fecha ?? ''

  return (
    <div className="flex flex-col gap-4">

      {/* ── Barra de filtros ── */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar fondo o gestora..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-8 h-8 text-sm bg-secondary/50"
            />
          </div>
          <FilterSelect label="Gestora"  value={filterGestora} options={gestoras} onChange={resetPage(setFilterGestora)} />
          <FilterSelect label="Moneda"   value={filterMoneda}  options={monedas}  onChange={resetPage(setFilterMoneda)}  />
          <FilterSelect label="Tipo"     value={filterTipo}    options={tipos}    onChange={resetPage(setFilterTipo)}    />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {filtered.length} de {fciData.length} fondos
          {dataDate && <span className="ml-2 opacity-60">— Datos al {dataDate}</span>}
        </p>
      </div>

      {/* ── Tabla ── */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30 text-xs font-semibold text-muted-foreground">
                <th className="sticky left-0 z-10 bg-secondary/80 px-3 py-2.5 text-left min-w-[240px]">Fondo</th>
                <th className="px-2 py-2.5 text-left min-w-[110px]">Gestora</th>
                <th className="px-2 py-2.5 text-left">Moneda</th>
                <th className="px-2 py-2.5 text-left min-w-[110px]">Tipo</th>
                <th className="px-2 py-2.5 text-right min-w-[80px]">VCP</th>
                <th className="px-2 py-2.5 text-right">1D</th>
                <th className="px-2 py-2.5 text-right">1M</th>
                <th className="px-2 py-2.5 text-right">YTD</th>
                <th className="px-2 py-2.5 text-right">1A</th>
                <th className="px-2 py-2.5 text-right">3A</th>
                <th className="px-2 py-2.5 text-right">5A</th>
                <th className="px-2 py-2.5 text-right">2024</th>
                <th className="px-2 py-2.5 text-right">2023</th>
                <th className="px-2 py-2.5 text-right">2022</th>
                <th className="px-2 py-2.5 text-right">2021</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {paginated.map((f, i) => (
                <tr key={i} className="hover:bg-secondary/20 transition-colors">
                  <td className="sticky left-0 z-10 bg-card px-3 py-2 hover:bg-secondary/20">
                    <div
                      className="font-medium text-foreground text-xs leading-tight truncate max-w-[230px]"
                      title={f.clase}
                    >
                      {f.clase}
                    </div>
                  </td>
                  <td className="px-2 py-2 text-xs text-muted-foreground whitespace-nowrap">{f.gestora}</td>
                  <td className="px-2 py-2"><MonedaBadge moneda={f.moneda} /></td>
                  <td className="px-2 py-2 text-xs text-muted-foreground">{f.tipoRenta}</td>
                  <td className="px-2 py-2 text-right font-mono text-xs tabular-nums">{f.vcp}</td>
                  <RendCell value={f.d1}  positive={f.d1Pos}  />
                  <RendCell value={f.m1}  positive={f.m1Pos}  />
                  <RendCell value={f.ytd} positive={f.ytdPos} />
                  <RendCell value={f.y1}  positive={f.y1Pos}  />
                  <RendCell value={f.y3}  positive={f.y3Pos}  />
                  <RendCell value={f.y5}  positive={f.y5Pos}  />
                  <RendCell value={f.ym1} positive={f.ym1Pos} />
                  <RendCell value={f.ym2} positive={f.ym2Pos} />
                  <RendCell value={f.ym3} positive={f.ym3Pos} />
                  <RendCell value={f.ym4} positive={f.ym4Pos} />
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={15} className="py-10 text-center text-sm text-muted-foreground">
                    No hay fondos que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Paginación ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary disabled:opacity-40 transition-colors"
          >
            ← Anterior
          </button>
          <span className="text-xs text-muted-foreground">
            Página {page} / {totalPages} · {filtered.length} fondos
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary disabled:opacity-40 transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}
