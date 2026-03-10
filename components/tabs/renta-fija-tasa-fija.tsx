"use client"

import { useState, useCallback } from "react"
import { MarketTable, type ColumnDef } from "@/components/market-table"
import { RateCalculator } from "@/components/rate-calculator"
import { CarryHeatmap } from "@/components/carry-heatmap"
import type { LecapBoncap } from "@/lib/types"
import type { BondItem } from "@/lib/api-client"

function parsePrice(str: string): number {
  return parseFloat(str.replace(/[^0-9.-]/g, ""))
}

const lecapColumns: ColumnDef<LecapBoncap>[] = [
  { key: "ticker",    header: "Ticker",    accessor: (r) => r.ticker,    clickable: true },
  { key: "vto",       header: "Vto",       accessor: (r) => r.vto },
  { key: "dtm",       header: "DTM",       accessor: (r) => r.dtm,       align: "right", mono: true },
  { key: "precio",    header: "Precio",    accessor: (r) => r.precio,    align: "right", mono: true },
  { key: "vf",        header: "VPV",       accessor: (r) => r.vf,        align: "right", mono: true },
  { key: "resultado", header: "R directo", accessor: (r) => r.resultado, align: "right", mono: true },
  { key: "tna",       header: "TNA",       accessor: (r) => r.tna,       align: "right", mono: true },
  { key: "tea",       header: "TEA",       accessor: (r) => r.tea,       align: "right", mono: true },
  { key: "tem",       header: "TEM",       accessor: (r) => r.tem,       align: "right", mono: true },
]

interface BondForCalc {
  ticker: string
  tipo: string
  vto: string
  dtm: number
  precioActual: number
  vf: number
}

interface RentaFijaTasaFijaProps {
  lecapData: LecapBoncap[]
  boncapData: LecapBoncap[]
  rawBonds: BondItem[]
  tcEntradaDefault: number
}

export function RentaFijaTasaFijaTab({
  lecapData,
  boncapData,
  rawBonds,
  tcEntradaDefault,
}: RentaFijaTasaFijaProps) {
  const [calcOpen, setCalcOpen]       = useState(false)
  const [selectedBond, setSelectedBond] = useState<BondForCalc | null>(null)

  const handleClick = useCallback((row: LecapBoncap) => {
    setSelectedBond({
      ticker:       row.ticker,
      tipo:         row.tipo,
      vto:          row.vto,
      dtm:          row.dtm,
      precioActual: parsePrice(row.precio),
      vf:           parsePrice(row.vf),
    })
    setCalcOpen(true)
  }, [])

  const allLecapBoncap = [...lecapData, ...boncapData].sort((a, b) => a.dtm - b.dtm)

  return (
    <div className="flex flex-col gap-6">
      <MarketTable
        title="LECAP & BONCAP (Pesos — Tasa Fija)"
        columns={lecapColumns}
        data={allLecapBoncap}
        getRowKey={(r) => r.ticker}
        onTickerClick={handleClick}
      />

      <CarryHeatmap rawBonds={rawBonds} tcEntradaDefault={tcEntradaDefault} />

      <RateCalculator open={calcOpen} onOpenChange={setCalcOpen} bond={selectedBond} />
    </div>
  )
}
