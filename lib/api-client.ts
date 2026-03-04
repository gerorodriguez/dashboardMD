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
}

export interface FxRates {
  mep?: number
  ccl?: number
  dolar_oficial?: number
  dolar_spot?: number
  cer_index?: number
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

export interface FuturesData {
  spot?: number
  spot_src?: string
  settle: string
  contracts: FutureContract[]
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
