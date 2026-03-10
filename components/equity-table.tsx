"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TrendingUp, TrendingDown } from "lucide-react"

interface EquityColumn {
  key: string
  header: string
  align?: "left" | "center" | "right"
}

interface EquityRow {
  ticker: string
  nombre: string
  ultimoPrecio: string
  variacionDia: string
  variacionPositiva: boolean
  [key: string]: string | boolean
}

interface EquityTableProps {
  title: string
  subtitle?: string
  columns: EquityColumn[]
  data: EquityRow[]
  extraColumns: { key: string; header: string; align?: "left" | "center" | "right" }[]
}

type SortDir = "asc" | "desc" | null

function parseNum(str: string): number {
  return parseFloat(String(str).replace(/[^0-9.-]/g, ""))
}

export function EquityTable({ title, subtitle, columns, data, extraColumns }: EquityTableProps) {
  const allColumns = [...columns, ...extraColumns]
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  function handleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir("desc")
    } else if (sortDir === "desc") {
      setSortDir("asc")
    } else {
      setSortKey(null)
      setSortDir(null)
    }
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey || !sortDir) return 0
    const va = a[sortKey]
    const vb = b[sortKey]
    const na = parseNum(String(va))
    const nb = parseNum(String(vb))
    const useNum = !isNaN(na) && !isNaN(nb)
    const cmp = useNum ? na - nb : String(va).localeCompare(String(vb))
    return sortDir === "asc" ? cmp : -cmp
  })

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-secondary/50 px-4 py-3">
        <h3 className="text-sm font-semibold text-primary">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-b-primary/30 hover:bg-transparent">
            {allColumns.map((col) => (
              <TableHead
                key={col.key}
                onClick={() => handleSort(col.key)}
                className={`text-xs font-semibold uppercase tracking-wider text-primary/80 bg-secondary/30 select-none cursor-pointer hover:bg-secondary/60 transition-colors ${
                  col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  {col.align === "right" && (
                    <SortIcon colKey={col.key} sortKey={sortKey} sortDir={sortDir} />
                  )}
                  {col.header}
                  {col.align !== "right" && (
                    <SortIcon colKey={col.key} sortKey={sortKey} sortDir={sortDir} />
                  )}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row) => (
            <TableRow key={row.ticker} className="border-border/50 even:bg-secondary/20 hover:bg-secondary/40">
              {allColumns.map((col) => {
                if (col.key === "ticker") {
                  return (
                    <TableCell key={col.key} className="text-sm font-semibold text-foreground">
                      {row.ticker}
                    </TableCell>
                  )
                }
                if (col.key === "nombre") {
                  return (
                    <TableCell key={col.key} className="text-sm text-muted-foreground">
                      {row.nombre}
                    </TableCell>
                  )
                }
                if (col.key === "ultimoPrecio") {
                  return (
                    <TableCell key={col.key} className={`text-sm font-mono font-semibold text-foreground ${col.align === "right" ? "text-right" : ""}`}>
                      {row.ultimoPrecio}
                    </TableCell>
                  )
                }
                if (col.key === "variacionDia") {
                  return (
                    <TableCell key={col.key} className={`text-sm font-mono ${col.align === "right" ? "text-right" : ""}`}>
                      <span className={`inline-flex items-center gap-1 ${row.variacionPositiva ? "text-primary" : "text-destructive"}`}>
                        {row.variacionPositiva ? (
                          <TrendingUp className="size-3.5" />
                        ) : (
                          <TrendingDown className="size-3.5" />
                        )}
                        {row.variacionDia}
                      </span>
                    </TableCell>
                  )
                }
                const value = row[col.key]
                return (
                  <TableCell
                    key={col.key}
                    className={`text-sm font-mono text-card-foreground ${col.align === "right" ? "text-right" : ""}`}
                  >
                    {typeof value === "string" ? value : String(value)}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function SortIcon({ colKey, sortKey, sortDir }: { colKey: string; sortKey: string | null; sortDir: SortDir }) {
  if (sortKey !== colKey) return <ChevronsUpDown className="size-3 opacity-40" />
  if (sortDir === "asc") return <ChevronUp className="size-3 opacity-80" />
  return <ChevronDown className="size-3 opacity-80" />
}
