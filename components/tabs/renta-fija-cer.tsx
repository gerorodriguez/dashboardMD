"use client"

import { useState, useCallback } from "react"
import { MarketTable, type ColumnDef } from "@/components/market-table"
import { RateCalculator } from "@/components/rate-calculator"
import { CerYieldCurve } from "@/components/cer-yield-curve"
import type { BonoCER, Caucion } from "@/lib/types"
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

const caucionColumns: ColumnDef<Caucion>[] = [
  { key: "plazo", header: "Plazo (dias)",  accessor: (r) => r.plazo, align: "center", mono: true },
  { key: "tna",   header: "TNA",           accessor: (r) => r.tna,   align: "right",  mono: true, highlighted: (r) => r.highlighted ?? false },
  { key: "monto", header: "Monto Operado", accessor: (r) => r.monto, align: "right",  mono: true },
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
  caucionData: Caucion[]
  caucionUSDData: Caucion[]
  cerIndex: string
  rawCer: BondItem[]
}

export function RentaFijaCERTab({
  cerData,
  caucionData,
  caucionUSDData,
  cerIndex,
  rawCer,
}: RentaFijaCERProps) {
  const [calcOpen, setCalcOpen]         = useState(false)
  const [selectedBond, setSelectedBond] = useState<BondForCalc | null>(null)

  const handleClick = useCallback((row: BonoCER) => {
    setSelectedBond({
      ticker:       row.ticker,
      tipo:         row.tipo,
      vto:          row.vto,
      dtm:          row.dtm,
      precioActual: parsePrice(row.precio),
      vf:           parsePrice(row.precio) * 1.05,
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

      {/* Curva CER + Cauciones en 2 columnas */}
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <CerYieldCurve rawCer={rawCer} />
        <div className="flex flex-col gap-6">
          <MarketTable
            title="Cauciones Pesos"
            subtitle="Por volumen operado"
            columns={caucionColumns}
            data={caucionData}
            getRowKey={(r) => String(r.plazo)}
          />
          <MarketTable
            title="Cauciones USD"
            columns={caucionColumns}
            data={caucionUSDData}
            getRowKey={(r) => String(r.plazo)}
          />
        </div>
      </div>

      <RateCalculator open={calcOpen} onOpenChange={setCalcOpen} bond={selectedBond} />
    </div>
  )
}
