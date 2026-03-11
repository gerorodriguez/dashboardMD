/**
 * lib/api-client.ts — Cliente REST para el backend market-data-tools.
 *
 * Expone:
 *   fetchSnapshot() → SnapshotResponse completo (usado en carga inicial)
 *
 * Todos los tipos reflejan exactamente las shapes que produce el backend.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

// ─── Pricer endpoint ─────────────────────────────────────────────────────────

export interface PricerResult {
  ticker:  string
  mode:    'price_to_tir' | 'tir_to_price'
  price:   number
  tir:     number
  tna:     number
  dm:      number
  ic:      number
  settle:  string
}

export async function fetchPricer(
  ticker: string,
  params: { price: number } | { tir: number },
): Promise<PricerResult> {
  const query = 'price' in params
    ? `price=${params.price}`
    : `tir=${(params as { tir: number }).tir}`
  const res = await fetch(`${API_BASE}/api/pricer/${encodeURIComponent(ticker)}?${query}`, {
    cache: 'no-store',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }))
    throw new Error((err as any).detail ?? `Error ${res.status}`)
  }
  return res.json()
}

// ─────────────────────────────────────────────────────────────────────────────

export async function fetchSnapshot(): Promise<SnapshotResponse> {
  const res = await fetch(`${API_BASE}/api/snapshot`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`GET /api/snapshot falló con ${res.status}`)
  }
  return res.json()
}

// ─── Tipos del backend ───────────────────────────────────────────────────────

export interface NewsItem {
  title:  string
  url:    string | null
  dt_str: string
}

export interface SnapshotResponse {
  seq: number
  bonds_usd: BondsUSD
  bonds_pesos: BondsPesos
  equities: EquitiesData
  futures: FuturesData
  caucion: CaucionData
  fx_rates: FxRates
  news?: Record<string, NewsItem[]>
  global_tracker?: GlobalTrackerData
}

export interface GlobalTrackerAsset {
  name:        string
  ticker:      string
  current:     number | null
  d1:          number | null
  w1:          number | null
  m1:          number | null
  ytd:         number | null
  y1:          number | null
  y3:          number | null
  low52_pct:   number | null
  high52_pct:  number | null
}

export interface GlobalTrackerGroup {
  name:   string
  assets: GlobalTrackerAsset[]
}

export interface GlobalTrackerData {
  as_of:        string
  last_updated: string
  is_live:      boolean
  delay_note:   string
  groups:       GlobalTrackerGroup[]
}

export interface FxRates {
  mep?: number
  ccl?: number
  dolar_oficial?: number
  dolar_spot?: number
  cer_index?: number
  merval?: number
  merval_ccl?: number
}

export interface BondItem {
  ticker: string
  price_usd?: number
  precio?: number        // ARS (LECAP/BONCAP)
  px_finish?: number
  vto: string            // ISO date "YYYY-MM-DD"
  dtm: number
  tir?: number
  mac_dur?: number
  mod_dur?: number
  empresa?: string
  cupon?: string
  tna?: number
  tea?: number
  tem?: number
  tipo?: string
  se?: number
  variacion?: number | null
}

export interface BondsUSD {
  sovereigns: BondItem[]
  bopreales: BondItem[]
  on_ny: BondItem[]
  on_arg: BondItem[]
}

export interface BondsPesos {
  lecap: BondItem[]
  boncap: BondItem[]
  cer: BondItem[]
}

export interface FutureContract {
  contrato: string
  vto: string
  dtm: number
  precio: number
  tna: number
  tea: number
  tem: number
}

export interface SinteticoItem {
  lecap:     string
  futuro:    string
  vto:       string
  dtm:       number
  tea_lecap: number
  tea_fut:   number
  sint_tea:  number
}

export interface FuturesData {
  spot?: number
  spot_src?: string
  settle?: string
  contracts: FutureContract[]
  sinteticos?: SinteticoItem[]
}

export interface CaucionEntry {
  bid?: number
  offer?: number
  ev?: number
}

export interface CaucionData {
  pesos?: Record<string, CaucionEntry>
  usd?: Record<string, CaucionEntry>
}

export interface EquityItem {
  ticker: string
  last?: number
  close?: number
  variacion?: number | null
  ev: number
}

export interface EquitiesData {
  acciones: EquityItem[]
  cedears: EquityItem[]
  etfs: EquityItem[]
}

export interface CalendarEvent {
  date: string
  ticker: string
  tipo_instrumento: string
  moneda: 'USD' | 'ARS'
  coupon: number
  amort: number
  total: number
  tipo_pago: 'RENTA' | 'AMORT' | 'RENTA+AMORT'
  emisor?: string
}

export async function fetchCalendar(): Promise<CalendarEvent[]> {
  const res = await fetch(`${API_BASE}/api/calendar`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`GET /api/calendar falló con ${res.status}`)
  return res.json()
}

// ─── FCI ─────────────────────────────────────────────────────────────────────

export interface FciRendPeriod {
  periodo:     string
  rendimiento: number | null
  tna:         number | null
  fecha:       string
}

export interface FciCartera {
  nombre: string
  pct:    number | null
}

export interface FciCalificacion {
  nota:         string
  calificadora: string
  fecha:        string
}

export interface FciHonorarios {
  gastos_gestion:          number | null
  comision_ingreso:        number | null
  comision_rescate:        number | null
  honorarios_exito:        string | null
  minimo_inversion:        number | null
  hon_admin_gerente:       number | null
  hon_admin_depositaria:   number | null
  comision_transferencia:  number | null
}

export interface FciItem {
  nombre:      string
  clase:       string
  gestora:     string
  gestora_full: string
  moneda:      string
  tipo_renta:  string
  vcp:         number | null
  patrimonio:  number | null
  fecha:       string
  d1:  number | null
  m1:  number | null
  ytd: number | null
  y1:  number | null
  y3:  number | null
  y5:  number | null
  ym1: number | null
  ym2: number | null
  ym3: number | null
  ym4: number | null
  // Modal enriched fields
  rendimientos_full: FciRendPeriod[]
  carteras:          FciCartera[]
  calificacion:      FciCalificacion | null
  honorarios:        FciHonorarios
  objetivo:          string
  horizonte:         string
  duracion:          string
  depositaria:       string
  inicio:            string
  dias_liquidacion:  number | null
  bloomberg:         string
  isin:              string
  inversion_minima:  number | null
}

export async function fetchFci(): Promise<FciItem[]> {
  const res = await fetch(`${API_BASE}/api/fci`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`GET /api/fci falló con ${res.status}`)
  return res.json()
}
