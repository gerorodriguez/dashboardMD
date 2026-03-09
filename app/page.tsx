"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarketHeader } from "@/components/market-header"
import { RentaFijaPesosTab } from "@/components/tabs/renta-fija-pesos"
import { RentaFijaUSDTab } from "@/components/tabs/renta-fija-usd"
import { FuturosDolarTab } from "@/components/tabs/futuros-dolar"
import { RentaVariableTab } from "@/components/tabs/renta-variable"
import { ObligacionesNegociablesTab } from "@/components/tabs/obligaciones-negociables"
import { NoticiasTab } from "@/components/tabs/noticias"
import { CalendarioTab } from "@/components/tabs/calendario"
import { GlobalTrackerTab } from "@/components/tabs/global-tracker"
import { useMarketData } from "@/hooks/use-market-data"
import {
  mapMarketHeader,
  mapLecapBoncap,
  mapBonosCER,
  mapFuturosDolar,
  mapCauciones,
  mapCaucionesUSD,
  mapSoberanos,
  mapBopreales,
  mapONs,
  mapAcciones,
  mapCedears,
  mapETFs,
  mapNews,
} from "@/lib/data-mappers"
import { Banknote, DollarSign, BarChart3, Building2, Newspaper, CalendarDays, TrendingUp, Loader2, WifiOff, Globe } from "lucide-react"

export default function Dashboard() {
  const { data, status, error, lastUpdated } = useMarketData()
  const [activeTab, setActiveTab] = useState("renta-fija-pesos")

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
  const sinteticosData = headerData.sinteticoUSD
  const caucionData    = mapCauciones(data.caucion               ?? {})
  const caucionUSDData = mapCaucionesUSD(data.caucion            ?? {})
  const soberanosData = mapSoberanos(data.bonds_usd?.sovereigns  ?? [])
  const boprealesData = mapBopreales(data.bonds_usd?.bopreales   ?? [])
  const onArgData     = mapONs(data.bonds_usd?.on_arg            ?? [])
  const onNYData      = mapONs(data.bonds_usd?.on_ny             ?? [])
  const accionesData  = mapAcciones(data.equities?.acciones      ?? [])
  const cedearsData   = mapCedears(data.equities?.cedears        ?? [])
  const etfsData      = mapETFs(data.equities?.etfs              ?? [])
  const newsData      = mapNews(data.news)

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-[1440px] px-4 py-6 lg:px-8">
        <MarketHeader
          data={headerData}
          actions={
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab("global-tracker")}
                className={`inline-flex items-center justify-center rounded-md p-1.5 text-xs transition-colors hover:bg-secondary ${activeTab === "global-tracker" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                title="Global Market Tracker"
              >
                <Globe className="size-3.5" />
              </button>
              <button
                onClick={() => setActiveTab("noticias")}
                className={`inline-flex items-center justify-center rounded-md p-1.5 text-xs transition-colors hover:bg-secondary ${activeTab === "noticias" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                title="Noticias"
              >
                <Newspaper className="size-3.5" />
              </button>
              <button
                onClick={() => setActiveTab("calendario")}
                className={`inline-flex items-center justify-center rounded-md p-1.5 text-xs transition-colors hover:bg-secondary ${activeTab === "calendario" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                title="Calendario"
              >
                <CalendarDays className="size-3.5" />
              </button>
            </div>
          }
        />

        {lastUpdated && (
          <p className="mt-2 text-right text-xs text-muted-foreground/60">
            Actualizado: {lastUpdated.toLocaleTimeString("es-AR")}
          </p>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
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
            <TabsTrigger
              value="obligaciones-negociables"
              className="flex items-center gap-2 px-4 py-2.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-md text-muted-foreground"
            >
              <Building2 className="size-4" />
              <span className="hidden sm:inline">Oblig. Negociables</span>
              <span className="sm:hidden">ONs</span>
            </TabsTrigger>
            <TabsTrigger
              value="futuros-dolar"
              className="flex items-center gap-2 px-4 py-2.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-md text-muted-foreground"
            >
              <TrendingUp className="size-4" />
              <span className="hidden sm:inline">Futuros</span> $
            </TabsTrigger>
          </TabsList>

          <TabsContent value="renta-fija-pesos">
            <RentaFijaPesosTab
              lecapData={lecapData}
              boncapData={boncapData}
              cerData={cerData}
              caucionData={caucionData}
              caucionUSDData={caucionUSDData}
              cerIndex={headerData.cerIndex}
              rawBonds={[...(data.bonds_pesos?.lecap ?? []), ...(data.bonds_pesos?.boncap ?? [])]}
              tcEntradaDefault={data.fx_rates?.mep ?? 1500}
            />
          </TabsContent>

          <TabsContent value="renta-fija-usd">
            <RentaFijaUSDTab
              soberanosData={soberanosData}
              boprealesData={boprealesData}
            />
          </TabsContent>

          <TabsContent value="renta-variable">
            <RentaVariableTab
              accionesData={accionesData}
              cedearsData={cedearsData}
              etfsData={etfsData}
            />
          </TabsContent>

          <TabsContent value="obligaciones-negociables">
            <ObligacionesNegociablesTab
              onNYData={onNYData}
              onArgData={onArgData}
            />
          </TabsContent>

          <TabsContent value="futuros-dolar">
            <FuturosDolarTab
              futurosData={futurosData}
              sinteticosData={sinteticosData}
              dolarSpot={headerData.dolarSpot}
            />
          </TabsContent>

          <TabsContent value="global-tracker">
            <GlobalTrackerTab data={data.global_tracker} />
          </TabsContent>

          <TabsContent value="noticias">
            <NoticiasTab newsData={newsData} />
          </TabsContent>

          <TabsContent value="calendario">
            <CalendarioTab />
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
