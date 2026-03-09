"use client"

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

export function EquityTable({ title, subtitle, columns, data, extraColumns }: EquityTableProps) {
  const allColumns = [...columns, ...extraColumns]

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
