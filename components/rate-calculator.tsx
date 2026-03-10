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

function cerTIR(vf: number, precio: number, dtm: number): number | null {
  if (precio <= 0 || vf <= 0 || dtm <= 0) return null
  return Math.pow(vf / precio, 365 / dtm) - 1
}

function cerPrecio(vf: number, tir: number, dtm: number): number | null {
  if (vf <= 0 || dtm <= 0 || tir <= -1) return null
  return vf / Math.pow(1 + tir, dtm / 365)
}

// ─── LECAP/BONCAP: fórmulas ───────────────────────────────────────────────────

function calcRates(precio: number, vf: number, dtm: number) {
  if (precio <= 0 || vf <= 0 || dtm <= 0) return null
  const rend = (vf / precio) - 1
  const tna  = rend * (365 / dtm)
  const tea  = Math.pow(1 + rend, 365 / dtm) - 1
  const tem  = Math.pow(1 + rend, 30 / dtm) - 1
  return {
    rendimiento: (rend * 100).toFixed(2) + "%",
    tna:         (tna  * 100).toFixed(2) + "%",
    tea:         (tea  * 100).toFixed(2) + "%",
    tem:         (tem  * 100).toFixed(2) + "%",
  }
}

// Inversion desde TNA (simple): precio = VF / (1 + TNA × dtm/365)
function calcPrecioFromTNA(vf: number, tna: number, dtm: number): number | null {
  if (vf <= 0 || dtm <= 0 || tna <= -1) return null
  return vf / (1 + tna * (dtm / 365))
}

// Inversion desde TEA (compound): precio = VF / (1 + TEA)^(dtm/365)
function calcPrecioFromTEA(vf: number, tea: number, dtm: number): number | null {
  if (vf <= 0 || dtm <= 0 || tea <= -1) return null
  return vf / Math.pow(1 + tea, dtm / 365)
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
  const [mode, setMode]               = useState<"price" | "tir">("price")
  // Para LECAP: qué tasa se usa al invertir (TNA o TEA)
  const [lecapRateType, setLecapRateType] = useState<"tna" | "tea">("tna")

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      setCustomValue("")
      setMode("price")
      setLecapRateType("tna")
    }
    onOpenChange(newOpen)
  }, [onOpenChange])

  const isCER = bond ? isCerBond(bond.tipo) : false

  const fmtARS = (n: number) =>
    n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  // ── CER: TIR actual ────────────────────────────────────────────────────────
  const currentCerTIR = useMemo(() => {
    if (!bond || !isCER) return null
    return cerTIR(bond.vf, bond.precioActual, bond.dtm)
  }, [bond, isCER])

  // ── CER: resultado custom ─────────────────────────────────────────────────
  const cerCustomResult = useMemo(() => {
    if (!bond || !isCER) return null
    const val = parseFloat(customValue)
    if (isNaN(val) || val <= 0) return null

    if (mode === "price") {
      const tir = cerTIR(bond.vf, val, bond.dtm)
      if (tir == null) return null
      return { type: "rates" as const, tir, precio: val }
    } else {
      const tir    = val / 100
      const precio = cerPrecio(bond.vf, tir, bond.dtm)
      if (precio == null) return null
      return { type: "price" as const, tir, precio }
    }
  }, [bond, isCER, mode, customValue])

  // ── LECAP: tasas actuales ─────────────────────────────────────────────────
  const currentRates = useMemo(() => {
    if (!bond || isCER) return null
    return calcRates(bond.precioActual, bond.vf, bond.dtm)
  }, [bond, isCER])

  // ── LECAP: resultado custom ───────────────────────────────────────────────
  const lecapCustomResult = useMemo(() => {
    if (!bond || isCER) return null
    const val = parseFloat(customValue)
    if (isNaN(val) || val <= 0) return null

    if (mode === "price") {
      const rates = calcRates(val, bond.vf, bond.dtm)
      if (!rates) return null
      return { type: "rates" as const, rates, precio: val }
    } else {
      // val es la tasa en % (ej: 60.5) → decimal 0.605
      const rate   = val / 100
      const precio = lecapRateType === "tna"
        ? calcPrecioFromTNA(bond.vf, rate, bond.dtm)
        : calcPrecioFromTEA(bond.vf, rate, bond.dtm)
      if (precio == null) return null
      const rates = calcRates(precio, bond.vf, bond.dtm)
      return { type: "price" as const, precio, rates }
    }
  }, [bond, isCER, mode, lecapRateType, customValue])

  if (!bond) return null

  // ── Placeholder según modo ────────────────────────────────────────────────
  const pricePlaceholder = `Ej: ${Math.round(bond.precioActual)}`
  const cerTIRPlaceholder = currentCerTIR != null
    ? `Ej: ${(currentCerTIR * 100).toFixed(2)}`
    : "Ej: 6.89"
  const lecapRatePlaceholder = currentRates
    ? `Ej: ${parseFloat(lecapRateType === "tna" ? currentRates.tna : currentRates.tea).toFixed(2)}`
    : "Ej: 60.50"

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
              : "Ingresá un precio para calcular las tasas, o una tasa para obtener el precio implícito."}
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
                  <span className="font-mono font-semibold text-primary">{(currentCerTIR * 100).toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">TNA: </span>
                  <span className="font-mono font-semibold text-foreground">{(currentCerTIR * 100).toFixed(2)}%</span>
                </div>
              </>
            ) : !isCER && currentRates ? (
              <>
                <div>
                  <span className="text-muted-foreground">TNA: </span>
                  <span className="font-mono font-semibold text-foreground">{currentRates.tna}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">TEA: </span>
                  <span className="font-mono font-semibold text-primary">{currentRates.tea}</span>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* ── Toggle principal (Precio ↔ Tasa) ── */}
        <div className="flex rounded-lg border border-border bg-secondary/30 p-1 gap-1">
          <ModeButton
            active={mode === "price"}
            onClick={() => { setMode("price"); setCustomValue("") }}
            label="Precio → Tasas"
          />
          <ModeButton
            active={mode === "tir"}
            onClick={() => { setMode("tir"); setCustomValue("") }}
            label={isCER ? "TIR → Precio" : "Tasa → Precio"}
          />
        </div>

        {/* ════════════ MODO CER ════════════ */}
        {isCER ? (
          <>
            <CerInput
              mode={mode as "price" | "tir"}
              value={customValue}
              onChange={setCustomValue}
              pricePlaceholder={pricePlaceholder}
              tirPlaceholder={cerTIRPlaceholder}
            />

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
                    <PriceBig value={fmtARS(cerCustomResult.precio)} />
                  </>
                )}
              </div>
            )}

            {customValue && !cerCustomResult && <InvalidHint mode={mode} isCER />}
          </>
        ) : (
          /* ════════════ MODO LECAP / BONCAP ════════════ */
          <>
            {mode === "price" ? (
              /* ── Precio → Tasas ── */
              <>
                <RateInput
                  id="lecap-price"
                  label="Precio de compra"
                  prefix="$"
                  placeholder={pricePlaceholder}
                  value={customValue}
                  onChange={setCustomValue}
                />

                {lecapCustomResult?.type === "rates" && (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                      Tasas al precio {fmtARS(lecapCustomResult.precio)}
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      <RateCard label="Rend."  value={lecapCustomResult.rates.rendimiento} accent />
                      <RateCard label="TNA"    value={lecapCustomResult.rates.tna}         accent />
                      <RateCard label="TEA"    value={lecapCustomResult.rates.tea}         accent highlighted />
                      <RateCard label="TEM"    value={lecapCustomResult.rates.tem}         accent />
                    </div>
                  </div>
                )}

                {/* Tasas al precio actual (referencia) */}
                {!customValue && currentRates && (
                  <div className="rounded-lg border border-border bg-secondary/20 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Tasas al precio actual
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      <RateCard label="Rend." value={currentRates.rendimiento} />
                      <RateCard label="TNA"   value={currentRates.tna} />
                      <RateCard label="TEA"   value={currentRates.tea} highlighted />
                      <RateCard label="TEM"   value={currentRates.tem} />
                    </div>
                  </div>
                )}

                {customValue && !lecapCustomResult && <InvalidHint mode="price" />}
              </>
            ) : (
              /* ── Tasa → Precio ── */
              <>
                {/* Sub-toggle TNA / TEA */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Tipo de tasa:</span>
                  <div className="flex rounded-md border border-border bg-secondary/30 p-0.5 gap-0.5">
                    <button
                      onClick={() => { setLecapRateType("tna"); setCustomValue("") }}
                      className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                        lecapRateType === "tna"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      TNA
                    </button>
                    <button
                      onClick={() => { setLecapRateType("tea"); setCustomValue("") }}
                      className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                        lecapRateType === "tea"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      TEA
                    </button>
                  </div>
                </div>

                <RateInput
                  id="lecap-rate"
                  label={`${lecapRateType.toUpperCase()} objetivo (%)`}
                  suffix="%"
                  placeholder={lecapRatePlaceholder}
                  value={customValue}
                  onChange={setCustomValue}
                />

                {lecapCustomResult?.type === "price" && (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                      Precio implícito a {lecapRateType.toUpperCase()} {parseFloat(customValue).toFixed(2)}%
                    </p>
                    <PriceBig value={fmtARS(lecapCustomResult.precio)} />
                    {lecapCustomResult.rates && (
                      <div className="mt-3 grid grid-cols-4 gap-2 border-t border-border/40 pt-3">
                        <RateCard label="Rend." value={lecapCustomResult.rates.rendimiento} accent />
                        <RateCard label="TNA"   value={lecapCustomResult.rates.tna}         accent />
                        <RateCard label="TEA"   value={lecapCustomResult.rates.tea}         accent highlighted />
                        <RateCard label="TEM"   value={lecapCustomResult.rates.tem}         accent />
                      </div>
                    )}
                  </div>
                )}

                {customValue && !lecapCustomResult && <InvalidHint mode="tir" />}
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function ModeButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  )
}

function RateInput({
  id, label, prefix, suffix, placeholder, value, onChange,
}: {
  id: string
  label: string
  prefix?: string
  suffix?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">{label}</Label>
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{prefix}</span>
          )}
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{suffix}</span>
          )}
          <Input
            id={id}
            type="number"
            step="0.01"
            min="0"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`bg-secondary/50 border-border font-mono text-foreground placeholder:text-muted-foreground/50 ${
              prefix ? "pl-7" : ""
            } ${suffix ? "pr-7" : ""}`}
          />
        </div>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
      </div>
    </div>
  )
}

// Input específico para CER (unifica los dos modos en un bloque)
function CerInput({
  mode, value, onChange, pricePlaceholder, tirPlaceholder,
}: {
  mode: "price" | "tir"
  value: string
  onChange: (v: string) => void
  pricePlaceholder: string
  tirPlaceholder: string
}) {
  return mode === "price" ? (
    <RateInput
      id="cer-price"
      label="Precio de compra"
      prefix="$"
      placeholder={pricePlaceholder}
      value={value}
      onChange={onChange}
    />
  ) : (
    <RateInput
      id="cer-tir"
      label="TIR real objetivo (%)"
      suffix="%"
      placeholder={tirPlaceholder}
      value={value}
      onChange={onChange}
    />
  )
}

function PriceBig({ value }: { value: string }) {
  return (
    <div className="flex items-center justify-center rounded-md bg-secondary/30 p-3">
      <div className="text-center">
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Precio</span>
        <span className="mt-1 block font-mono text-2xl font-bold text-primary">{value}</span>
      </div>
    </div>
  )
}

function InvalidHint({ mode, isCER }: { mode: "price" | "tir"; isCER?: boolean }) {
  return (
    <p className="text-center text-sm text-muted-foreground">
      {mode === "price"
        ? "Ingresá un precio válido mayor a 0"
        : isCER
          ? "Ingresá una TIR en % (ej: 6.89)"
          : "Ingresá una tasa en % (ej: 60.50)"}
    </p>
  )
}

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
