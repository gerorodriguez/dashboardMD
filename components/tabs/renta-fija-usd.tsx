"use client"

import { useState, useCallback } from "react"
import { MarketTable, type ColumnDef } from "@/components/market-table"
import { RateCalculator } from "@/components/rate-calculator"
import type { SoberanoUSD, Bopreal, ObligacionNegociable } from "@/lib/types"

function parsePrice(str: string): number {
  return parseFloat(str.replace(/[^0-9.-]/g, ""))
}

const soberanosColumns: ColumnDef<SoberanoUSD>[] = [
  { key: "ticker", header: "Ticker", accessor: (r) => r.ticker, clickable: true },
  { key: "precio", header: "Precio", accessor: (r) => r.precio, align: "right", mono: true },
  { key: "vto", header: "Vto", accessor: (r) => r.vto },
  { key: "tir", header: "TIR", accessor: (r) => r.tir, align: "right", mono: true, highlighted: (r) => r.tirHighlighted ?? false },
  { key: "dm", header: "DM", accessor: (r) => r.dm, align: "right", mono: true },
]

const boprealesColumns: ColumnDef<Bopreal>[] = [
  { key: "ticker", header: "Ticker", accessor: (r) => r.ticker, clickable: true },
  { key: "precio", header: "Precio", accessor: (r) => r.precio, align: "right", mono: true },
  { key: "vto", header: "Vto", accessor: (r) => r.vto },
  { key: "tir", header: "TIR", accessor: (r) => r.tir, align: "right", mono: true, highlighted: (r) => r.tirHighlighted ?? false },
  { key: "dm", header: "DM", accessor: (r) => r.dm, align: "right", mono: true },
]

const onColumns: ColumnDef<ObligacionNegociable>[] = [
  { key: "ticker", header: "Ticker", accessor: (r) => r.ticker, clickable: true },
  { key: "empresa", header: "Empresa", accessor: (r) => r.empresa },
  { key: "cupon", header: "Cupon", accessor: (r) => r.cupon, align: "right", mono: true },
  { key: "vto", header: "Vto", accessor: (r) => r.vto },
  { key: "precio", header: "Precio", accessor: (r) => r.precio, align: "right", mono: true },
  { key: "tir", header: "TIR", accessor: (r) => r.tir, align: "right", mono: true, highlighted: (r) => r.tirHighlighted ?? false },
  { key: "dm", header: "DM", accessor: (r) => r.dm, align: "right", mono: true },
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
  soberanosData: SoberanoUSD[]
  boprealesData: Bopreal[]
  onArgData: ObligacionNegociable[]
  onNYData: ObligacionNegociable[]
}

export function RentaFijaUSDTab({
  soberanosData,
  boprealesData,
  onArgData,
  onNYData,
}: RentaFijaUSDProps) {
  const [calcOpen, setCalcOpen] = useState(false)
  const [selectedBond, setSelectedBond] = useState<BondForCalc | null>(null)

  const handleSoberanoClick = useCallback((row: SoberanoUSD) => {
    setSelectedBond({
      ticker: row.ticker,
      tipo: "SOBERANO USD",
      vto: row.vto,
      dtm: Math.round((new Date(row.vto.split("/").reverse().join("-")).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      precioActual: parsePrice(row.precio),
      vf: 100,
    })
    setCalcOpen(true)
  }, [])

  const handleBoprealClick = useCallback((row: Bopreal) => {
    setSelectedBond({
      ticker: row.ticker,
      tipo: "BOPREAL",
      vto: row.vto,
      dtm: Math.round((new Date(row.vto.split("/").reverse().join("-")).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      precioActual: parsePrice(row.precio),
      vf: 100,
    })
    setCalcOpen(true)
  }, [])

  const handleOnClick = useCallback((row: ObligacionNegociable) => {
    setSelectedBond({
      ticker: row.ticker,
      tipo: `ON ${row.empresa}`,
      vto: row.vto,
      dtm: Math.round((new Date(row.vto.split("/").reverse().join("-")).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      precioActual: parsePrice(row.precio),
      vf: 100,
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
      <div className="grid gap-6 xl:grid-cols-2">
        <MarketTable
          title="ON Ley Argentina (USD)"
          subtitle="Top por volumen"
          columns={onColumns}
          data={onArgData}
          getRowKey={(r) => r.ticker}
          onTickerClick={handleOnClick}
        />
        <MarketTable
          title="ON Ley Extranjera (USD)"
          subtitle="Top por volumen"
          columns={onColumns}
          data={onNYData}
          getRowKey={(r) => r.ticker}
          onTickerClick={handleOnClick}
        />
      </div>

      <RateCalculator
        open={calcOpen}
        onOpenChange={setCalcOpen}
        bond={selectedBond}
      />
    </div>
  )
}
