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

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface BondInfo {
  ticker: string
  tipo: string
  vto: string
  dtm: number
  precioActual: number
  vf: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isCerBond(tipo: string): boolean {
  return tipo === "LECER" || tipo === "BONCER"
}

// ─── CER: fórmulas (act/365, compound) ────────────────────────────────────────
// vf = precio × (1+TIR)^(dtm/365)  →  Precio → TIR y TIR → Precio

function cerTIR(vf: number, precio: number, dtm: number): number | null {
  if (precio <= 0 || vf <= 0 || dtm <= 0) return null
  return Math.pow(vf / precio, 365 / dtm) - 1
}

function cerPrecio(vf: number, tir: number, dtm: number): number | null {
  if (vf <= 0 || dtm <= 0 || tir <= -1) return null
  return vf / Math.pow(1 + tir, dtm / 365)
}

// ─── LECAP/BONCAP: fórmulas existentes ────────────────────────────────────────

function calcRates(precio: number, vf: number, dtm: number) {
  if (precio <= 0 || vf <= 0 || dtm <= 0) return null
  const rendimiento = (vf / precio) - 1
  const tna = rendimiento * (365 / dtm)
  const tea = Math.pow(1 + rendimiento, 365 / dtm) - 1
  const tem = Math.pow(1 + rendimiento, 30 / dtm) - 1
  return {
    rendimiento: (rendimiento * 100).toFixed(2) + "%",
    tna:         (tna         * 100).toFixed(2) + "%",
    tea:         (tea         * 100).toFixed(2) + "%",
    tem:         (tem         * 100).toFixed(2) + "%",
  }
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface RateCalculatorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bond: BondInfo | null
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function RateCalculator({ open, onOpenChange, bond }: RateCalculatorProps) {
  const [customValue, setCustomValue] = useState("")
  const [cerMode, setCerMode]         = useState<"price" | "tir">("price")

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      setCustomValue("")
      setCerMode("price")
    }
    onOpenChange(newOpen)
  }, [onOpenChange])

  const isCER = bond ? isCerBond(bond.tipo) : false

  // ── TIR/TNA actuales (CER) ─────────────────────────────────────────────────
  const currentCerTIR = useMemo(() => {
    if (!bond || !isCER) return null
    return cerTIR(bond.vf, bond.precioActual, bond.dtm)
  }, [bond, isCER])

  // ── Resultado CER custom ───────────────────────────────────────────────────
  const cerCustomResult = useMemo(() => {
    if (!bond || !isCER) return null
    const val = parseFloat(customValue)
    if (isNaN(val) || val <= 0) return null

    if (cerMode === "price") {
      const tir = cerTIR(bond.vf, val, bond.dtm)
      if (tir == null) return null
      return { type: "rates" as const, tir, precio: val }
    } else {
      // input en % (ej: 6.89) → decimal 0.0689
      const tir   = val / 100
      const precio = cerPrecio(bond.vf, tir, bond.dtm)
      if (precio == null) return null
      return { type: "price" as const, tir, precio }
    }
  }, [bond, isCER, cerMode, customValue])

  // ── Tasas actuales (LECAP) ─────────────────────────────────────────────────
  const currentRates = useMemo(() => {
    if (!bond || isCER) return null
    return calcRates(bond.precioActual, bond.vf, bond.dtm)
  }, [bond, isCER])

  const customRates = useMemo(() => {
    if (!bond || isCER) return null
    const price = parseFloat(customValue)
    if (isNaN(price) || price <= 0) return null
    return calcRates(price, bond.vf, bond.dtm)
  }, [bond, isCER, customValue])

  if (!bond) return null

  const fmtARS = (n: number) =>
    n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Calculator className="size-5 text-primary" />
            Calculadora de Tasas
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isCER
              ? "Calculá TIR real ingresando un precio, o el precio implícito de una TIR."
              : "Ingresá un precio para calcular las tasas del instrumento."}
          </DialogDescription>
        </DialogHeader>

        {/* ── Info del bono ── */}
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

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <div>
              <span className="text-muted-foreground">Precio: </span>
              <span className="font-mono font-semibold text-foreground">{fmtARS(bond.precioActual)}</span>
            </div>
            {isCER && currentCerTIR != null ? (
              <>
                <div>
                  <span className="text-muted-foreground">TIR real: </span>
                  <span className="font-mono font-semibold text-primary">
                    {(currentCerTIR * 100).toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">TNA: </span>
                  <span className="font-mono font-semibold text-foreground">
                    {(currentCerTIR * 100).toFixed(2)}%
                  </span>
                </div>
              </>
            ) : !isCER ? (
              <div>
                <span className="text-muted-foreground">VF: </span>
                <span className="font-mono font-semibold text-foreground">{fmtARS(bond.vf)}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* ════════════ MODO CER ════════════ */}
        {isCER ? (
          <>
            {/* Toggle precio / TIR */}
            <div className="flex rounded-lg border border-border bg-secondary/30 p-1 gap-1">
              <button
                onClick={() => { setCerMode("price"); setCustomValue("") }}
                className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                  cerMode === "price"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Precio → TIR / TNA
              </button>
              <button
                onClick={() => { setCerMode("tir"); setCustomValue("") }}
                className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                  cerMode === "tir"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                TIR → Precio
              </button>
            </div>

            {/* Input */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="cer-input" className="text-sm font-medium text-foreground">
                {cerMode === "price" ? "Precio de compra" : "TIR real objetivo (%)"}
              </Label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  {cerMode === "price" ? (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  ) : (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                  )}
                  <Input
                    id="cer-input"
                    type="number"
                    step={cerMode === "price" ? "1" : "0.01"}
                    min="0"
                    placeholder={cerMode === "price"
                      ? `Ej: ${Math.round(bond.precioActual)}`
                      : currentCerTIR != null
                        ? `Ej: ${(currentCerTIR * 100).toFixed(2)}`
                        : "Ej: 6.89"
                    }
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    className={`bg-secondary/50 border-border font-mono text-foreground placeholder:text-muted-foreground/50 ${
                      cerMode === "price" ? "pl-7" : "pr-7"
                    }`}
                  />
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </div>
            </div>

            {/* Resultado */}
            {cerCustomResult && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                {cerCustomResult.type === "rates" ? (
                  <>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                      Tasas al precio {fmtARS(cerCustomResult.precio)}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <RateCard label="TIR real" value={`${(cerCustomResult.tir * 100).toFixed(2)}%`} accent highlighted />
                      <RateCard label="TNA"      value={`${(cerCustomResult.tir * 100).toFixed(2)}%`} accent />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                      Precio implícito a TIR {(cerCustomResult.tir * 100).toFixed(2)}%
                    </p>
                    <div className="flex items-center justify-center rounded-md bg-secondary/30 p-3">
                      <div className="text-center">
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Precio</span>
                        <span className="mt-1 block font-mono text-2xl font-bold text-primary">
                          {fmtARS(cerCustomResult.precio)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {customValue && !cerCustomResult && (
              <p className="text-center text-sm text-muted-foreground">
                {cerMode === "price" ? "Ingresá un precio válido mayor a 0" : "Ingresá una TIR en % (ej: 6.89)"}
              </p>
            )}
          </>
        ) : (
          /* ════════════ MODO ESTÁNDAR (LECAP/BONCAP) ════════════ */
          <>
            {currentRates && (
              <div className="rounded-lg border border-border bg-secondary/20 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tasas al precio actual</p>
                <div className="grid grid-cols-4 gap-3">
                  <RateCard label="Rend." value={currentRates.rendimiento} />
                  <RateCard label="TNA"   value={currentRates.tna} />
                  <RateCard label="TEA"   value={currentRates.tea} highlighted />
                  <RateCard label="TEM"   value={currentRates.tem} />
                </div>
              </div>
            )}

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
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    className="bg-secondary/50 border-border pl-7 font-mono text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </div>
            </div>

            {customRates && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  Tasas al precio {parseFloat(customValue).toFixed(2)}
                </p>
                <div className="grid grid-cols-4 gap-3">
                  <RateCard label="Rend." value={customRates.rendimiento} accent />
                  <RateCard label="TNA"   value={customRates.tna}         accent />
                  <RateCard label="TEA"   value={customRates.tea}         accent highlighted />
                  <RateCard label="TEM"   value={customRates.tem}         accent />
                </div>
              </div>
            )}

            {customValue && !customRates && (
              <p className="text-center text-sm text-muted-foreground">
                {"Ingresá un precio válido mayor a 0"}
              </p>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── RateCard ──────────────────────────────────────────────────────────────────

function RateCard({
  label, value, highlighted, accent,
}: {
  label: string
  value: string
  highlighted?: boolean
  accent?: boolean
}) {
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
