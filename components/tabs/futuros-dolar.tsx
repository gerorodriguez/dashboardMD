"use client"

import { MarketTable, type ColumnDef } from "@/components/market-table"
import type { FuturoDolar } from "@/lib/types"

const futuroColumns: ColumnDef<FuturoDolar>[] = [
  { key: "contrato", header: "Contrato", accessor: (r) => r.contrato },
  { key: "vto",      header: "Vto",      accessor: (r) => r.vto },
  { key: "dtm",      header: "DTM",      accessor: (r) => r.dtm,    align: "right", mono: true },
  { key: "precio",   header: "Precio",   accessor: (r) => r.precio, align: "right", mono: true },
  { key: "tna",      header: "TNA",      accessor: (r) => r.tna,    align: "right", mono: true },
  { key: "tea",      header: "TEA",      accessor: (r) => r.tea,    align: "right", mono: true },
  { key: "tem",      header: "TEM",      accessor: (r) => r.tem,    align: "right", mono: true },
]

interface FuturosDolarProps {
  futurosData: FuturoDolar[]
  dolarSpot: string
}

export function FuturosDolarTab({ futurosData, dolarSpot }: FuturosDolarProps) {
  return (
    <div className="flex flex-col gap-6">
      <MarketTable
        title={`Futuros Dolar (Spot: ${dolarSpot})`}
        columns={futuroColumns}
        data={futurosData}
        getRowKey={(r) => r.contrato}
      />
    </div>
  )
}
