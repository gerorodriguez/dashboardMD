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
import { ScrollArea } from "@/components/ui/scroll-area"

export interface ColumnDef<T> {
  key: string
  header: string
  accessor: (row: T) => string | number
  highlighted?: (row: T) => boolean
  /** Si se provee, colorea el texto: true = verde (primary), false = rojo (destructive) */
  colorize?: (row: T) => boolean
  align?: "left" | "center" | "right"
  mono?: boolean
  clickable?: boolean
}

interface MarketTableProps<T> {
  title: string
  subtitle?: string
  columns: ColumnDef<T>[]
  data: T[]
  getRowKey: (row: T) => string
  onTickerClick?: (row: T) => void
  /** Si se define, limita las filas visibles y agrega scroll interno */
  maxRows?: number
}

type SortDir = "asc" | "desc" | null

export function MarketTable<T>({
  title,
  subtitle,
  columns,
  data,
  getRowKey,
  onTickerClick,
  maxRows,
}: MarketTableProps<T>) {
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
    const col = columns.find((c) => c.key === sortKey)
    if (!col) return 0
    const va = col.accessor(a)
    const vb = col.accessor(b)
    const na = parseFloat(String(va).replace(/[^0-9.-]/g, ""))
    const nb = parseFloat(String(vb).replace(/[^0-9.-]/g, ""))
    const useNum = !isNaN(na) && !isNaN(nb)
    const cmp = useNum ? na - nb : String(va).localeCompare(String(vb))
    return sortDir === "asc" ? cmp : -cmp
  })

  const scrollable = maxRows !== undefined && data.length > maxRows
  // 2.3125rem ≈ 37px per row
  const scrollHeight = maxRows ? `${maxRows * 2.3125}rem` : undefined

  const tableBody = (
    <Table>
      <TableHeader className="sticky top-0 z-10">
        <TableRow className="border-b-primary/30 hover:bg-transparent">
          {columns.map((col) => (
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
          <TableRow key={getRowKey(row)} className="border-border/50 even:bg-secondary/20 hover:bg-secondary/40">
            {columns.map((col) => {
              const value = col.accessor(row)
              const isHighlighted = col.highlighted?.(row) ?? false
              const isClickable = col.clickable && onTickerClick
              const colorize = col.colorize ? col.colorize(row) : null

              return (
                <TableCell
                  key={col.key}
                  className={`text-sm ${
                    col.mono ? "font-mono" : ""
                  } ${
                    colorize === true  ? "text-primary font-medium" :
                    colorize === false ? "text-destructive font-medium" :
                    isHighlighted      ? "text-accent font-semibold" :
                                         "text-card-foreground"
                  } ${
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                  } ${isClickable ? "cursor-pointer" : ""}`}
                >
                  {isClickable ? (
                    <button
                      type="button"
                      onClick={() => onTickerClick(row)}
                      className="font-semibold text-foreground underline decoration-primary/40 underline-offset-2 transition-colors hover:text-primary hover:decoration-primary"
                    >
                      {value}
                    </button>
                  ) : (
                    value
                  )}
                </TableCell>
              )
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-secondary/50 px-4 py-3">
        <h3 className="text-sm font-semibold text-primary">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {scrollable ? (
        <div className="relative">
          <ScrollArea style={{ height: scrollHeight }}>
            {tableBody}
          </ScrollArea>
          {/* fade gradient al final para indicar que hay más contenido */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent" />
        </div>
      ) : (
        tableBody
      )}
    </div>
  )
}

function SortIcon({ colKey, sortKey, sortDir }: { colKey: string; sortKey: string | null; sortDir: SortDir }) {
  if (sortKey !== colKey) return <ChevronsUpDown className="size-3 opacity-40" />
  if (sortDir === "asc") return <ChevronUp className="size-3 opacity-80" />
  return <ChevronDown className="size-3 opacity-80" />
}
