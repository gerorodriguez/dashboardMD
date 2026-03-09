"use client"

import { Clock, DollarSign, Activity, ArrowLeftRight } from "lucide-react"
import type { MarketData } from "@/lib/types"

export function MarketHeader({ data, actions }: { data: MarketData; actions?: React.ReactNode }) {
  return (
    <header className="border-b border-border pb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl text-balance">
            LBO Dashboard
          </h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {data.fecha}
            </span>
            <span className="text-border">|</span>
            <span>Última actualización: {data.settlement}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
            <Activity className="size-3.5" />
            <span className="sr-only">Estado del mercado:</span>
            EN VIVO
          </span>
        </div>
      </div>

      {/* Tipo de Cambio + Sintetico side by side */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Tipo de Cambio */}
        <div className="rounded-lg border border-border bg-card p-4 lg:col-span-2">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
            <DollarSign className="size-4" />
            Tipo de Cambio
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {data.tipoCambio.map((tc) => (
              <div key={tc.tipo} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{tc.tipo}</span>
                <span className="font-mono font-semibold text-foreground">{tc.valor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Brechas FX */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
            <ArrowLeftRight className="size-4" />
            Brechas
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {data.brechaFX.map((b) => (
              <div key={b.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{b.label}</span>
                <span className="font-mono font-semibold text-foreground">{b.valor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
