"use client"

import { EquityTable } from "@/components/equity-table"
import type { AccionArgentina, Cedear, ETFArgentino } from "@/lib/types"

const baseColumns = [
  { key: "ticker", header: "Ticker" },
  { key: "nombre", header: "Nombre" },
  { key: "ultimoPrecio", header: "Precio", align: "right" as const },
  { key: "variacionDia", header: "Var. Dia", align: "right" as const },
]

interface RentaVariableProps {
  accionesData: AccionArgentina[]
  cedearsData: Cedear[]
  etfsData: ETFArgentino[]
}

export function RentaVariableTab({
  accionesData,
  cedearsData,
  etfsData,
}: RentaVariableProps) {
  return (
    <div className="flex flex-col gap-6">
      <EquityTable
        title="Acciones Argentinas"
        subtitle="Panel lider MERVAL — Top 10 por volumen"
        columns={baseColumns}
        data={accionesData}
        extraColumns={[
          { key: "volumen", header: "Volumen", align: "right" },
          { key: "capitalizacion", header: "Cap. Mercado", align: "right" },
        ]}
      />
      <EquityTable
        title="CEDEARs"
        subtitle="Certificados de Deposito Argentinos — Top 10 por volumen"
        columns={baseColumns}
        data={cedearsData}
        extraColumns={[
          { key: "volumen", header: "Volumen", align: "right" },
          { key: "ratio", header: "Ratio", align: "right" },
        ]}
      />
      <EquityTable
        title="ETFs"
        subtitle="Exchange-Traded Funds disponibles en BYMA — Top 10 por volumen"
        columns={baseColumns}
        data={etfsData}
        extraColumns={[
          { key: "volumen", header: "Volumen", align: "right" },
          { key: "patrimonio", header: "Patrimonio", align: "right" },
        ]}
      />
    </div>
  )
}
