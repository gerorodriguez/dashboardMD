"use client"

import { useState, useCallback } from "react"
import { MarketTable, type ColumnDef } from "@/components/market-table"
import { RateCalculator } from "@/components/rate-calculator"
import { BondYieldCurve } from "@/components/bond-yield-curve"
import type { SoberanoUSD, Bopreal } from "@/lib/types"
import type { BondItem } from "@/lib/api-client"

function parsePrice(str: string): number {
  return parseFloat(str.replace(/[^0-9.-]/g, ""))
}

const soberanosColumns: ColumnDef<SoberanoUSD>[] = [
  { key: "ticker",    header: "Ticker",   accessor: (r) => r.ticker,    clickable: true },
  { key: "vto",       header: "Vto",      accessor: (r) => r.vto },
  { key: "precio",    header: "Precio",   accessor: (r) => r.precio,    align: "right", mono: true },
  { key: "variacion", header: "Var%",     accessor: (r) => r.variacion, align: "right", mono: true, colorize: (r) => r.variacionPositiva },
  { key: "ic",        header: "Int. Cor.", accessor: (r) => r.ic,       align: "right", mono: true },
  { key: "paridad",   header: "Paridad",  accessor: (r) => r.paridad,   align: "right", mono: true },
  { key: "tir",       header: "TIR",      accessor: (r) => r.tir,       align: "right", mono: true },
  { key: "dm",        header: "DM",       accessor: (r) => r.dm,        align: "right", mono: true },
]

const boprealesColumns: ColumnDef<Bopreal>[] = [
  { key: "ticker",    header: "Ticker",    accessor: (r) => r.ticker,    clickable: true },
  { key: "vto",       header: "Vto",       accessor: (r) => r.vto },
  { key: "precio",    header: "Precio",    accessor: (r) => r.precio,    align: "right", mono: true },
  { key: "variacion", header: "Var%",      accessor: (r) => r.variacion, align: "right", mono: true, colorize: (r) => r.variacionPositiva },
  { key: "ic",        header: "Int. Cor.", accessor: (r) => r.ic,        align: "right", mono: true },
  { key: "paridad",   header: "Paridad",   accessor: (r) => r.paridad,   align: "right", mono: true },
  { key: "tir",       header: "TIR",       accessor: (r) => r.tir,       align: "right", mono: true },
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

interface RentaFijaUSDProps {
  soberanosData:  SoberanoUSD[]
  boprealesData:  Bopreal[]
  rawSoberanos:   BondItem[]
  rawBopreales:   BondItem[]
}

export function RentaFijaUSDTab({ soberanosData, boprealesData, rawSoberanos, rawBopreales }: RentaFijaUSDProps) {
  const [calcOpen, setCalcOpen] = useState(false)
  const [selectedBond, setSelectedBond] = useState<BondForCalc | null>(null)

  const handleSoberanoClick = useCallback((row: SoberanoUSD) => {
    const tirRaw = parseFloat(row.tir)
    const dmRaw  = parseFloat(row.dm)
    setSelectedBond({
      ticker:     row.ticker,
      tipo:       "SOBERANO USD",
      vto:        row.vto,
      dtm:        Math.round((new Date(row.vto.split("/").reverse().join("-")).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      precioActual: parsePrice(row.precio),
      vf:         100,
      tirActual:  !isNaN(tirRaw) ? tirRaw / 100 : undefined,
      dmActual:   !isNaN(dmRaw)  ? dmRaw        : undefined,
    })
    setCalcOpen(true)
  }, [])

  const handleBoprealClick = useCallback((row: Bopreal) => {
    const tirRaw = parseFloat(row.tir)
    const dmRaw  = parseFloat(row.dm)
    setSelectedBond({
      ticker:     row.ticker,
      tipo:       "BOPREAL",
      vto:        row.vto,
      dtm:        row.dtm,
      precioActual: parsePrice(row.precio),
      vf:         100,
      tirActual:  !isNaN(tirRaw) ? tirRaw / 100 : undefined,
      dmActual:   !isNaN(dmRaw)  ? dmRaw        : undefined,
    })
    setCalcOpen(true)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <MarketTable
        title="Soberanos USD"
        columns={soberanosColumns}
        data={soberanosData}
        getRowKey={(r) => r.ticker}
        onTickerClick={handleSoberanoClick}
      />
      <MarketTable
        title="Bopreales"
        columns={boprealesColumns}
        data={boprealesData}
        getRowKey={(r) => r.ticker}
        onTickerClick={handleBoprealClick}
      />

      <BondYieldCurve
        title="Curva de Rendimientos USD — Soberanos & Bopreales"
        subtitle="TIR (%) vs Duration modificada (años)"
        series={[
          { label: "Soberanos", color: "#3b82f6", items: rawSoberanos },
          { label: "Bopreales", color: "#f59e0b", items: rawBopreales },
        ]}
      />

      <RateCalculator
        open={calcOpen}
        onOpenChange={setCalcOpen}
        bond={selectedBond}
      />
    </div>
  )
}
