"use client"

import { useState, useCallback } from "react"
import { MarketTable, type ColumnDef } from "@/components/market-table"
import { RateCalculator } from "@/components/rate-calculator"
import { CerYieldCurve } from "@/components/cer-yield-curve"
import type { BonoCER } from "@/lib/types"
import type { BondItem } from "@/lib/api-client"

function parsePrice(str: string): number {
  return parseFloat(str.replace(/[^0-9.-]/g, ""))
}

const cerColumns: ColumnDef<BonoCER>[] = [
  { key: "ticker",    header: "Ticker",    accessor: (r) => r.ticker,    clickable: true },
  { key: "tipo",      header: "Tipo",      accessor: (r) => r.tipo },
  { key: "vto",       header: "Vto",       accessor: (r) => r.vto },
  { key: "dtm",       header: "DTM",       accessor: (r) => r.dtm,       align: "right", mono: true },
  { key: "precio",    header: "Precio",    accessor: (r) => r.precio,    align: "right", mono: true },
  { key: "variacion", header: "Var%",      accessor: (r) => r.variacion, align: "right", mono: true, colorize: (r) => r.variacionPositiva },
  { key: "tir",       header: "TIR",       accessor: (r) => r.tir,       align: "right", mono: true, highlighted: (r) => r.tirHighlighted ?? false },
  { key: "tna",       header: "TNA",       accessor: (r) => r.tna,       align: "right", mono: true },
  { key: "dm",        header: "DM",        accessor: (r) => r.dm,        align: "right", mono: true },
]


interface BondForCalc {
  ticker: string
  tipo: string
  vto: string
  dtm: number
  precioActual: number
  vf: number
}

interface RentaFijaCERProps {
  cerData: BonoCER[]
  cerIndex: string
  rawCer: BondItem[]
}

export function RentaFijaCERTab({
  cerData,
  cerIndex,
  rawCer,
}: RentaFijaCERProps) {
  const [calcOpen, setCalcOpen]         = useState(false)
  const [selectedBond, setSelectedBond] = useState<BondForCalc | null>(null)

  const handleClick = useCallback((row: BonoCER) => {
    const price = parsePrice(row.precio)
    // tir viene formateado "6.89%" → parseFloat da 6.89 → /100 = 0.0689
    const tir = parseFloat(row.tir) / 100
    // Derivamos VF a partir del precio y TIR actuales (inversa de la fórmula)
    // precio = VF / (1+TIR)^(dtm/365)  →  VF = precio × (1+TIR)^(dtm/365)
    const vf = !isNaN(tir) && tir > -1 && row.dtm > 0
      ? price * Math.pow(1 + tir, row.dtm / 365)
      : 0
    setSelectedBond({
      ticker:       row.ticker,
      tipo:         row.tipo,
      vto:          row.vto,
      dtm:          row.dtm,
      precioActual: price,
      vf,
    })
    setCalcOpen(true)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <MarketTable
        title={`Bonos CER (TIR Real) \u2014 CER: ${cerIndex}`}
        columns={cerColumns}
        data={cerData}
        getRowKey={(r) => r.ticker}
        onTickerClick={handleClick}
      />

      <CerYieldCurve rawCer={rawCer} />

      <RateCalculator open={calcOpen} onOpenChange={setCalcOpen} bond={selectedBond} />
    </div>
  )
}
