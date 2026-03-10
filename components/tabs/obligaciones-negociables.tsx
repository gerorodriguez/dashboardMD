"use client"

import { useState, useCallback } from "react"
import { MarketTable, type ColumnDef } from "@/components/market-table"
import { RateCalculator } from "@/components/rate-calculator"
import { BondYieldCurve } from "@/components/bond-yield-curve"
import type { ObligacionNegociable } from "@/lib/types"
import type { BondItem } from "@/lib/api-client"

function parsePrice(str: string): number {
  return parseFloat(str.replace(/[^0-9.-]/g, ""))
}

const onColumns: ColumnDef<ObligacionNegociable>[] = [
  { key: "ticker",  header: "Ticker",  accessor: (r) => r.ticker,  clickable: true },
  { key: "empresa", header: "Empresa", accessor: (r) => r.empresa },
  { key: "cupon",   header: "Cupón",   accessor: (r) => r.cupon,   align: "right", mono: true },
  { key: "vto",     header: "Vto",     accessor: (r) => r.vto },
  { key: "precio",  header: "Precio",  accessor: (r) => r.precio,  align: "right", mono: true },
  { key: "tir",     header: "TIR",     accessor: (r) => r.tir,     align: "right", mono: true, highlighted: (r) => r.tirHighlighted ?? false },
  { key: "dm",      header: "DM",      accessor: (r) => r.dm,      align: "right", mono: true },
]

interface BondForCalc {
  ticker: string
  tipo: string
  vto: string
  dtm: number
  precioActual: number
  vf: number
}

interface ObligacionesNegociablesProps {
  onNYData:  ObligacionNegociable[]
  onArgData: ObligacionNegociable[]
  rawOnNY:   BondItem[]
  rawOnArg:  BondItem[]
}

export function ObligacionesNegociablesTab({ onNYData, onArgData, rawOnNY, rawOnArg }: ObligacionesNegociablesProps) {
  const [calcOpen, setCalcOpen] = useState(false)
  const [selectedBond, setSelectedBond] = useState<BondForCalc | null>(null)

  const handleClick = useCallback((row: ObligacionNegociable) => {
    setSelectedBond({
      ticker:       row.ticker,
      tipo:         `ON ${row.empresa}`,
      vto:          row.vto,
      dtm:          Math.round(
        (new Date(row.vto.split("/").reverse().join("-")).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
      ),
      precioActual: parsePrice(row.precio),
      vf:           100,
    })
    setCalcOpen(true)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <MarketTable
          title="ON Ley Extranjera (NY)"
          subtitle={`${onNYData.length} instrumentos`}
          columns={onColumns}
          data={onNYData}
          getRowKey={(r) => r.ticker}
          onTickerClick={handleClick}
          maxRows={20}
        />
        <MarketTable
          title="ON Ley Local (Argentina)"
          subtitle={`${onArgData.length} instrumentos`}
          columns={onColumns}
          data={onArgData}
          getRowKey={(r) => r.ticker}
          onTickerClick={handleClick}
          maxRows={20}
        />
      </div>

      <BondYieldCurve
        title="Curva de Rendimientos — ON Ley Extranjera (NY)"
        subtitle="TIR (%) vs Duration modificada (años)"
        series={[{ label: "ON NY", color: "#06b6d4", items: rawOnNY }]}
      />

      <BondYieldCurve
        title="Curva de Rendimientos — ON Ley Local (Argentina)"
        subtitle="TIR (%) vs Duration modificada (años)"
        series={[{ label: "ON Arg", color: "#a855f7", items: rawOnArg }]}
      />

      <RateCalculator
        open={calcOpen}
        onOpenChange={setCalcOpen}
        bond={selectedBond}
      />
    </div>
  )
}
