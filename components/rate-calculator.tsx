"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calculator, ArrowRight, Loader2 } from "lucide-react"
import { fetchPricer, type PricerResult } from "@/lib/api-client"

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface BondInfo {
  ticker:       string
  tipo:         string
  vto:          string
  dtm:          number
  precioActual: number
  vf:           number
  tirActual?:   number   // decimal (0.089 = 8.9%), para soberanos/ONs
  dmActual?:    number   // años, para soberanos/ONs
}

// ─── Clasificación ───────────────────────────────────────────────────────────

function isCerBond(tipo: string) { return tipo === "LECER" || tipo === "BONCER" }
function isUsdBond(tipo: string) { return tipo === "SOBERANO USD" || tipo === "BOPREAL" || tipo.startsWith("ON ") }

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

function calcPrecioFromTNA(vf: number, tna: number, dtm: number): number | null {
  if (vf <= 0 || dtm <= 0 || tna <= -1) return null
  return vf / (1 + tna * (dtm / 365))
}

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
  const [customValue, setCustomValue]     = useState("")
  const [mode, setMode]                   = useState<"price" | "tir">("price")
  const [lecapRateType, setLecapRateType] = useState<"tna" | "tea">("tna")

  // USD bond async state
  const [usdResult, setUsdResult]   = useState<PricerResult | null>(null)
  const [usdLoading, setUsdLoading] = useState(false)
  const [usdError, setUsdError]     = useState<string | null>(null)

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      setCustomValue("")
      setMode("price")
      setLecapRateType("tna")
      setUsdResult(null)
      setUsdError(null)
    }
    onOpenChange(newOpen)
  }, [onOpenChange])

  const isCER = bond ? isCerBond(bond.tipo) : false
  const isUSD = bond ? isUsdBond(bond.tipo)  : false

  const fmtARS = (n: number) =>
    n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const fmtUSD = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 })

  // ── USD bond: fetch desde backend con debounce ────────────────────────────
  useEffect(() => {
    if (!isUSD || !bond) return
    setUsdResult(null)
    setUsdError(null)

    const val = parseFloat(customValue)
    if (isNaN(val) || val <= 0) return

    setUsdLoading(true)
    const timer = setTimeout(async () => {
      try {
        const params = mode === "price" ? { price: val } : { tir: val / 100 }
        const result = await fetchPricer(bond.ticker, params)
        setUsdResult(result)
        setUsdError(null)
      } catch (e) {
        setUsdError(e instanceof Error ? e.message : "Error al calcular")
        setUsdResult(null)
      } finally {
        setUsdLoading(false)
      }
    }, 400)

    return () => { clearTimeout(timer); setUsdLoading(false) }
  }, [customValue, mode, bond, isUSD])

  // Reset resultado cuando cambia el modo
  useEffect(() => {
    setUsdResult(null)
    setUsdError(null)
  }, [mode])

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
    if (!bond || isCER || isUSD) return null
    return calcRates(bond.precioActual, bond.vf, bond.dtm)
  }, [bond, isCER, isUSD])

  // ── LECAP: resultado custom ───────────────────────────────────────────────
  const lecapCustomResult = useMemo(() => {
    if (!bond || isCER || isUSD) return null
    const val = parseFloat(customValue)
    if (isNaN(val) || val <= 0) return null
    if (mode === "price") {
      const rates = calcRates(val, bond.vf, bond.dtm)
      if (!rates) return null
      return { type: "rates" as const, rates, precio: val }
    } else {
      const rate   = val / 100
      const precio = lecapRateType === "tna"
        ? calcPrecioFromTNA(bond.vf, rate, bond.dtm)
        : calcPrecioFromTEA(bond.vf, rate, bond.dtm)
      if (precio == null) return null
      const rates = calcRates(precio, bond.vf, bond.dtm)
      return { type: "price" as const, precio, rates }
    }
  }, [bond, isCER, isUSD, mode, lecapRateType, customValue])

  if (!bond) return null

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
            {isUSD
              ? "Valuación con flujos futuros. Precio → TIR o TIR → Precio."
              : isCER
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
              <span className="font-mono font-semibold text-foreground">
                {isUSD ? fmtUSD(bond.precioActual) : fmtARS(bond.precioActual)}
              </span>
            </div>
            {isUSD && bond.tirActual != null ? (
              <>
                <div>
                  <span className="text-muted-foreground">TIR: </span>
                  <span className="font-mono font-semibold text-primary">
                    {(bond.tirActual * 100).toFixed(2)}%
                  </span>
                </div>
                {bond.dmActual != null && (
                  <div>
                    <span className="text-muted-foreground">DM: </span>
                    <span className="font-mono font-semibold text-foreground">
                      {bond.dmActual.toFixed(2)}y
                    </span>
                  </div>
                )}
              </>
            ) : isCER && currentCerTIR != null ? (
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
            ) : !isCER && !isUSD && currentRates ? (
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

        {/* ── Toggle principal ── */}
        <div className="flex rounded-lg border border-border bg-secondary/30 p-1 gap-1">
          <ModeButton
            active={mode === "price"}
            onClick={() => { setMode("price"); setCustomValue("") }}
            label="Precio → TIR / DM"
          />
          <ModeButton
            active={mode === "tir"}
            onClick={() => { setMode("tir"); setCustomValue("") }}
            label="TIR → Precio"
          />
        </div>

        {/* ════════════ MODO USD ════════════ */}
        {isUSD ? (
          <>
            <RateInput
              id="usd-input"
              label={mode === "price" ? "Precio (USD por 100 VN)" : "TIR objetivo (%)"}
              prefix={mode === "price" ? "$" : undefined}
              suffix={mode === "price" ? undefined : "%"}
              placeholder={mode === "price"
                ? `Ej: ${bond.precioActual.toFixed(3)}`
                : bond.tirActual != null ? `Ej: ${(bond.tirActual * 100).toFixed(2)}` : "Ej: 8.90"
              }
              value={customValue}
              onChange={setCustomValue}
            />

            {usdLoading && (
              <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Calculando...
              </div>
            )}

            {usdError && !usdLoading && (
              <p className="text-center text-sm text-destructive">{usdError}</p>
            )}

            {!usdLoading && usdResult?.mode === "price_to_tir" && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  Tasas al precio {fmtUSD(usdResult.price)}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <RateCard label="TIR"  value={`${(usdResult.tir * 100).toFixed(2)}%`} accent highlighted />
                  <RateCard label="TNA"  value={`${(usdResult.tna * 100).toFixed(2)}%`} accent />
                  <RateCard label="DM"   value={`${usdResult.dm.toFixed(2)}y`}           accent />
                </div>
                {usdResult.ic > 0 && (
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Int. Corridos: <span className="font-mono">{usdResult.ic.toFixed(4)}</span>
                  </p>
                )}
              </div>
            )}

            {!usdLoading && usdResult?.mode === "tir_to_price" && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  Precio implícito a TIR {(usdResult.tir * 100).toFixed(2)}%
                </p>
                <PriceBig value={fmtUSD(usdResult.price)} />
                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border/40 pt-3">
                  <RateCard label="DM" value={`${usdResult.dm.toFixed(2)}y`} accent />
                  {usdResult.ic > 0 && (
                    <RateCard label="Int. Cor." value={usdResult.ic.toFixed(4)} accent />
                  )}
                </div>
              </div>
            )}

            {customValue && !usdLoading && !usdResult && !usdError && (
              <InvalidHint mode={mode} isUSD />
            )}
          </>

        ) : isCER ? (
          /* ════════════ MODO CER ════════════ */
          <>
            <CerInput
              mode={mode as "price" | "tir"}
              value={customValue}
              onChange={setCustomValue}
              pricePlaceholder={`Ej: ${Math.round(bond.precioActual)}`}
              tirPlaceholder={currentCerTIR != null ? `Ej: ${(currentCerTIR * 100).toFixed(2)}` : "Ej: 6.89"}
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
              <>
                <RateInput
                  id="lecap-price"
                  label="Precio de compra"
                  prefix="$"
                  placeholder={`Ej: ${Math.round(bond.precioActual)}`}
                  value={customValue}
                  onChange={setCustomValue}
                />

                {lecapCustomResult?.type === "rates" && (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                      Tasas al precio {fmtARS(lecapCustomResult.precio)}
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      <RateCard label="Rend." value={lecapCustomResult.rates.rendimiento} accent />
                      <RateCard label="TNA"   value={lecapCustomResult.rates.tna}         accent />
                      <RateCard label="TEA"   value={lecapCustomResult.rates.tea}         accent highlighted />
                      <RateCard label="TEM"   value={lecapCustomResult.rates.tem}         accent />
                    </div>
                  </div>
                )}

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
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Tipo de tasa:</span>
                  <div className="flex rounded-md border border-border bg-secondary/30 p-0.5 gap-0.5">
                    {(["tna", "tea"] as const).map((rt) => (
                      <button
                        key={rt}
                        onClick={() => { setLecapRateType(rt); setCustomValue("") }}
                        className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                          lecapRateType === rt
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {rt.toUpperCase()}
                      </button>
                    ))}
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
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  )
}

function RateInput({
  id, label, prefix, suffix, placeholder, value, onChange,
}: {
  id: string; label: string; prefix?: string; suffix?: string
  placeholder: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">{label}</Label>
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{prefix}</span>}
          {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{suffix}</span>}
          <Input
            id={id}
            type="number"
            step="0.01"
            min="0"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`bg-secondary/50 border-border font-mono text-foreground placeholder:text-muted-foreground/50 ${prefix ? "pl-7" : ""} ${suffix ? "pr-7" : ""}`}
          />
        </div>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
      </div>
    </div>
  )
}

function CerInput({ mode, value, onChange, pricePlaceholder, tirPlaceholder }: {
  mode: "price" | "tir"; value: string; onChange: (v: string) => void
  pricePlaceholder: string; tirPlaceholder: string
}) {
  return mode === "price"
    ? <RateInput id="cer-price" label="Precio de compra" prefix="$" placeholder={pricePlaceholder} value={value} onChange={onChange} />
    : <RateInput id="cer-tir"   label="TIR real objetivo (%)" suffix="%" placeholder={tirPlaceholder} value={value} onChange={onChange} />
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

function InvalidHint({ mode, isCER, isUSD }: { mode: "price" | "tir"; isCER?: boolean; isUSD?: boolean }) {
  return (
    <p className="text-center text-sm text-muted-foreground">
      {mode === "price"
        ? "Ingresá un precio válido mayor a 0"
        : isUSD  ? "Ingresá una TIR en % (ej: 8.90)"
        : isCER  ? "Ingresá una TIR en % (ej: 6.89)"
        :          "Ingresá una tasa en % (ej: 60.50)"}
    </p>
  )
}

function RateCard({ label, value, highlighted, accent }: {
  label: string; value: string; highlighted?: boolean; accent?: boolean
}) {
  return (
    <div className="flex flex-col items-center rounded-md bg-secondary/30 p-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`mt-0.5 font-mono text-sm font-bold ${
        highlighted ? (accent ? "text-primary" : "text-accent") : "text-foreground"
      }`}>
        {value}
      </span>
    </div>
  )
}
