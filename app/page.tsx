"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarketHeader } from "@/components/market-header"
import { RentaFijaPesosTab } from "@/components/tabs/renta-fija-pesos"
import { RentaFijaUSDTab } from "@/components/tabs/renta-fija-usd"
import { RentaVariableTab } from "@/components/tabs/renta-variable"
import { useMarketData } from "@/hooks/use-market-data"
import {
  mapMarketHeader,
  mapLecapBoncap,
  mapBonosCER,
  mapFuturosDolar,
  mapCauciones,
  mapSoberanos,
  mapBopreales,
  mapONs,
  mapAcciones,
  mapCedears,
  mapETFs,
} from "@/lib/data-mappers"
import { Banknote, DollarSign, BarChart3, Loader2, WifiOff } from "lucide-react"

export default function Dashboard() {
  const { data, status, error, lastUpdated } = useMarketData()

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Conectando al mercado...</p>
      </div>
    )
  }

  if (status === "error" || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <WifiOff className="size-8 text-destructive" />
        <p className="text-sm text-destructive">
          {error ?? "No se pudo conectar al backend"}
        </p>
        <p className="text-xs text-muted-foreground">
          Asegurate de que el servidor esté corriendo en{" "}
          <code className="rounded bg-secondary px-1">localhost:8000</code>
        </p>
      </div>
    )
  }

  // Mapear datos del backend a los tipos que esperan los componentes
  const headerData    = mapMarketHeader(data)
  const lecapData     = mapLecapBoncap(data.bonds_pesos?.lecap  ?? [])
  const boncapData    = mapLecapBoncap(data.bonds_pesos?.boncap ?? [])
  const cerData       = mapBonosCER(data.bonds_pesos?.cer       ?? [])
  const futurosData   = mapFuturosDolar(data.futures?.contracts  ?? [])
  const caucionData   = mapCauciones(data.caucion               ?? {})
  const soberanosData = mapSoberanos(data.bonds_usd?.sovereigns  ?? [])
  const boprealesData = mapBopreales(data.bonds_usd?.bopreales   ?? [])
  const onArgData     = mapONs(data.bonds_usd?.on_arg            ?? [])
  const onNYData      = mapONs(data.bonds_usd?.on_ny             ?? [])
  const accionesData  = mapAcciones(data.equities?.acciones      ?? [])
  const cedearsData   = mapCedears(data.equities?.cedears        ?? [])
  const etfsData      = mapETFs(data.equities?.etfs              ?? [])

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-[1440px] px-4 py-6 lg:px-8">
        <MarketHeader data={headerData} />

        {lastUpdated && (
          <p className="mt-2 text-right text-xs text-muted-foreground/60">
            Actualizado: {lastUpdated.toLocaleTimeString("es-AR")}
          </p>
        )}

        <Tabs defaultValue="renta-fija-pesos" className="mt-4">
          <TabsList className="mb-4 h-auto w-full justify-start gap-1 bg-secondary/50 p-1 rounded-lg flex-wrap">
            <TabsTrigger
              value="renta-fija-pesos"
              className="flex items-center gap-2 px-4 py-2.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-md text-muted-foreground"
            >
              <Banknote className="size-4" />
              <span className="hidden sm:inline">Renta Fija</span> ARS
            </TabsTrigger>
            <TabsTrigger
              value="renta-fija-usd"
              className="flex items-center gap-2 px-4 py-2.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-md text-muted-foreground"
            >
              <DollarSign className="size-4" />
              <span className="hidden sm:inline">Renta Fija</span> USD
            </TabsTrigger>
            <TabsTrigger
              value="renta-variable"
              className="flex items-center gap-2 px-4 py-2.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-md text-muted-foreground"
            >
              <BarChart3 className="size-4" />
              <span className="hidden sm:inline">Renta Variable</span>
              <span className="sm:hidden">RV</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="renta-fija-pesos">
            <RentaFijaPesosTab
              lecapData={lecapData}
              boncapData={boncapData}
              cerData={cerData}
              futurosData={futurosData}
              caucionData={caucionData}
              cerIndex={headerData.cerIndex}
              dolarSpot={headerData.dolarSpot}
            />
          </TabsContent>

          <TabsContent value="renta-fija-usd">
            <RentaFijaUSDTab
              soberanosData={soberanosData}
              boprealesData={boprealesData}
              onArgData={onArgData}
              onNYData={onNYData}
            />
          </TabsContent>

          <TabsContent value="renta-variable">
            <RentaVariableTab
              accionesData={accionesData}
              cedearsData={cedearsData}
              etfsData={etfsData}
            />
          </TabsContent>
        </Tabs>

        <footer className="mt-8 border-t border-border pt-4 pb-6 text-center">
          <p className="text-xs text-muted-foreground">Equipo Producto de LBO</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Los datos se actualizan en tiempo real. Precios indicativos sujetos a variacion.
          </p>
        </footer>
      </main>
    </div>
  )
}
