"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface ColumnDef<T> {
  key: string
  header: string
  accessor: (row: T) => string | number
  highlighted?: (row: T) => boolean
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
}

export function MarketTable<T>({
  title,
  subtitle,
  columns,
  data,
  getRowKey,
  onTickerClick,
}: MarketTableProps<T>) {
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
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={`text-xs font-semibold uppercase tracking-wider text-primary/80 bg-secondary/30 ${
                  col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                }`}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={getRowKey(row)} className="border-border/50 hover:bg-secondary/30">
              {columns.map((col) => {
                const value = col.accessor(row)
                const isHighlighted = col.highlighted?.(row) ?? false
                const isClickable = col.clickable && onTickerClick

                return (
                  <TableCell
                    key={col.key}
                    className={`text-sm ${
                      col.mono ? "font-mono" : ""
                    } ${
                      isHighlighted ? "text-accent font-semibold" : "text-card-foreground"
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
    </div>
  )
}
