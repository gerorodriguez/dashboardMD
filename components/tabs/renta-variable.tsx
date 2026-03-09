"use client"

import { EquityTable } from "@/components/equity-table"
import type { AccionArgentina, Cedear, ETFArgentino } from "@/lib/types"

const baseColumns = [
  { key: "ticker", header: "Ticker" },
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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <EquityTable
          title="Acciones Argentinas"
          subtitle="Panel lider MERVAL — Top 15 por volumen"
          columns={baseColumns}
          data={accionesData}
          extraColumns={[
            { key: "volumen", header: "Volumen", align: "right" },
          ]}
        />
        <EquityTable
          title="CEDEARs"
          subtitle="Certificados de Deposito Argentinos — Top 15 por volumen"
          columns={baseColumns}
          data={cedearsData}
          extraColumns={[
            { key: "volumen", header: "Volumen", align: "right" },
          ]}
        />
      </div>
      <EquityTable
        title="ETFs"
        subtitle="Exchange-Traded Funds disponibles en BYMA — Top 10 por volumen"
        columns={baseColumns}
        data={etfsData}
        extraColumns={[
          { key: "volumen", header: "Volumen", align: "right" },
        ]}
      />
    </div>
  )
}
