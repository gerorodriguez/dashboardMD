"use client"

import { useState, useCallback, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calculator, ArrowRight } from "lucide-react"

interface BondInfo {
  ticker: string
  tipo: string
  vto: string
  dtm: number
  precioActual: number
  vf: number
}

function parseNumber(str: string): number {
  return parseFloat(str.replace(/[^0-9.-]/g, ""))
}

function calcRates(precio: number, vf: number, dtm: number) {
  if (precio <= 0 || vf <= 0 || dtm <= 0) return null
  const rendimiento = (vf / precio) - 1
  const tna = rendimiento * (365 / dtm)
  const tea = Math.pow(1 + rendimiento, 365 / dtm) - 1
  const tem = Math.pow(1 + rendimiento, 30 / dtm) - 1
  return {
    rendimiento: (rendimiento * 100).toFixed(2) + "%",
    tna: (tna * 100).toFixed(2) + "%",
    tea: (tea * 100).toFixed(2) + "%",
    tem: (tem * 100).toFixed(2) + "%",
  }
}

interface RateCalculatorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bond: BondInfo | null
}

export function RateCalculator({ open, onOpenChange, bond }: RateCalculatorProps) {
  const [customPrice, setCustomPrice] = useState("")

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) setCustomPrice("")
    onOpenChange(newOpen)
  }, [onOpenChange])

  const currentRates = useMemo(() => {
    if (!bond) return null
    return calcRates(bond.precioActual, bond.vf, bond.dtm)
  }, [bond])

  const customRates = useMemo(() => {
    if (!bond) return null
    const price = parseFloat(customPrice)
    if (isNaN(price) || price <= 0) return null
    return calcRates(price, bond.vf, bond.dtm)
  }, [bond, customPrice])

  if (!bond) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Calculator className="size-5 text-primary" />
            Calculadora de Tasas
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {"Ingresa un precio para calcular las tasas del instrumento."}
          </DialogDescription>
        </DialogHeader>

        {/* Bond info */}
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-primary">{bond.ticker}</span>
              <span className="ml-2 rounded-sm bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {bond.tipo}
              </span>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>Vto: {bond.vto}</div>
              <div>DTM: {bond.dtm}</div>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Precio actual: </span>
              <span className="font-mono font-semibold text-foreground">${bond.precioActual.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">VF: </span>
              <span className="font-mono font-semibold text-foreground">${bond.vf.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Current rates */}
        {currentRates && (
          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tasas al precio actual</p>
            <div className="grid grid-cols-4 gap-3">
              <RateCard label="Rend." value={currentRates.rendimiento} />
              <RateCard label="TNA" value={currentRates.tna} />
              <RateCard label="TEA" value={currentRates.tea} highlighted />
              <RateCard label="TEM" value={currentRates.tem} />
            </div>
          </div>
        )}

        {/* Custom price input */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="custom-price" className="text-sm font-medium text-foreground">
            Simular con otro precio
          </Label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input
                id="custom-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ej: 105.50"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="bg-secondary/50 border-border pl-7 font-mono text-foreground placeholder:text-muted-foreground/50"
              />
            </div>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
          </div>
        </div>

        {/* Calculated rates */}
        {customRates && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
              Tasas al precio ${parseFloat(customPrice).toFixed(2)}
            </p>
            <div className="grid grid-cols-4 gap-3">
              <RateCard label="Rend." value={customRates.rendimiento} accent />
              <RateCard label="TNA" value={customRates.tna} accent />
              <RateCard label="TEA" value={customRates.tea} accent highlighted />
              <RateCard label="TEM" value={customRates.tem} accent />
            </div>
          </div>
        )}

        {customPrice && !customRates && (
          <p className="text-center text-sm text-muted-foreground">
            {"Ingresa un precio valido mayor a 0"}
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}

function RateCard({ label, value, highlighted, accent }: { label: string; value: string; highlighted?: boolean; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center rounded-md bg-secondary/30 p-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`mt-0.5 font-mono text-sm font-bold ${
        highlighted
          ? accent ? "text-primary" : "text-accent"
          : "text-foreground"
      }`}>
        {value}
      </span>
    </div>
  )
}
