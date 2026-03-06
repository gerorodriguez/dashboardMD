/**
 * lib/data-mappers.ts — Convierte la respuesta del backend a los tipos del frontend.
 *
 * El backend devuelve números (floats). Los componentes del frontend esperan
 * strings formateados (porcentajes, precios, fechas en dd/mm/yy, etc.).
 * Este módulo es la única capa de transformación — el resto del código
 * no debe hacer formateo manual.
 */

import type { SnapshotResponse, BondItem, EquityItem, FutureContract, CaucionData } from './api-client'
import type {
  MarketData, TipoCambio, SinteticoUSD,
  LecapBoncap, BonoCER, FuturoDolar, Caucion,
  SoberanoUSD, Bopreal, ObligacionNegociable,
  AccionArgentina, Cedear, ETFArgentino,
  NewsItem, NewsData,
} from './types'

// ─── Formateadores ───────────────────────────────────────────────────────────

const pct = (n?: number | null, decimals = 2): string =>
  n != null ? `${(n * 100).toFixed(decimals)}%` : '–'

const num = (n?: number | null, decimals = 2): string =>
  n != null ? n.toFixed(decimals) : '–'

const ars = (n?: number | null): string =>
  n != null
    ? n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : '–'

const vol = (ev?: number | null): string =>
  ev && ev > 0 ? `ARS ${(ev / 1_000_000).toFixed(1)}M` : '–'

/** "YYYY-MM-DD" → "DD/MM/YY" */
const dateFmt = (iso?: string): string => {
  if (!iso) return '–'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y.slice(2)}`
}

const dtmFromIso = (iso?: string): number => {
  if (!iso) return 0
  return Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000))
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

export function mapMarketHeader(snap: SnapshotResponse): MarketData {
  const fx = snap.fx_rates ?? {}

  const tipoCambio: TipoCambio[] = [
    { tipo: 'MEP',     valor: num(fx.mep,           2) },
    { tipo: 'CCL',     valor: num(fx.ccl,           2) },
    { tipo: 'Oficial', valor: num(fx.dolar_oficial,  2) },
    { tipo: 'Spot',    valor: num(fx.dolar_spot,     2) },
  ].filter((tc) => tc.valor !== '–')

  const sinteticoUSD: SinteticoUSD[] = (snap.futures?.contracts ?? [])
    .slice(0, 6)
    .map((c) => ({
      mes: c.contrato.replace('DLR/', ''),
      tna: pct(c.tna),
    }))

  return {
    fecha:       new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    settlement:  snap.futures?.settle ? dateFmt(snap.futures.settle) : '',
    tipoCambio,
    sinteticoUSD,
    cerIndex:    fx.cer_index ? num(fx.cer_index, 2) : '–',
    dolarSpot:   fx.dolar_spot ? num(fx.dolar_spot, 2) : '–',
  }
}

export function mapLecapBoncap(items: BondItem[]): LecapBoncap[] {
  return items.map((b) => {
    const vpv    = b.px_finish ?? null
    const precio = b.precio    ?? null
    const resultado = vpv != null && precio != null && precio > 0
      ? `${((vpv / precio - 1) * 100).toFixed(2)}%`
      : '–'
    return {
      ticker:    b.ticker,
      tipo:      (b.tipo as 'LECAP' | 'BONCAP') ?? 'LECAP',
      vto:       dateFmt(b.vto),
      dtm:       b.dtm ?? dtmFromIso(b.vto),
      precio:    num(precio, 4),
      vf:        num(vpv, 2),
      resultado,
      tna:       pct(b.tna),
      tea:       pct(b.tea),
      tem:       pct(b.tem),
    }
  })
}

export function mapBonosCER(items: BondItem[]): BonoCER[] {
  return items.map((b) => ({
    ticker:    b.ticker,
    tipo:      b.tipo ?? 'CER',
    vto:       dateFmt(b.vto),
    dtm:       b.dtm ?? dtmFromIso(b.vto),
    precio:    ars(b.precio),
    variacion: b.variacion != null ? `${b.variacion > 0 ? '+' : ''}${b.variacion.toFixed(2)}%` : '–',
    tir:       pct(b.tir),
    tna:       pct(b.tna),
    dm:        b.mac_dur != null ? `${b.mac_dur.toFixed(2)}y` : '–',
  }))
}

export function mapFuturosDolar(contracts: FutureContract[]): FuturoDolar[] {
  return contracts.map((c) => ({
    contrato: c.contrato,
    vto:      dateFmt(c.vto),
    dtm:      c.dtm,
    precio:   num(c.precio, 2),
    tna:      pct(c.tna),
    tea:      pct(c.tea),
    tem:      pct(c.tem),
  }))
}

export function mapCauciones(caucion: CaucionData): Caucion[] {
  const pesos = caucion?.pesos ?? {}
  const rows: Caucion[] = []
  for (const [sym, entry] of Object.entries(pesos)) {
    if (entry?.bid == null) continue
    const plazoMatch = sym.match(/- (\d+)D$/)
    const plazo = plazoMatch ? parseInt(plazoMatch[1]) : 0
    rows.push({ plazo, tna: pct(entry.bid / 100), monto: vol(entry.ev) })
  }
  rows.sort((a, b) => a.plazo - b.plazo)
  return rows
}

export function mapCaucionesUSD(caucion: CaucionData): Caucion[] {
  const usd = caucion?.usd ?? {}
  const rows: Caucion[] = []
  for (const [sym, entry] of Object.entries(usd)) {
    if (entry?.bid == null) continue
    const plazoMatch = sym.match(/- (\d+)D$/)
    const plazo = plazoMatch ? parseInt(plazoMatch[1]) : 0
    rows.push({ plazo, tna: pct(entry.bid / 100), monto: vol(entry.ev) })
  }
  rows.sort((a, b) => a.plazo - b.plazo)
  return rows
}

export function mapSoberanos(items: BondItem[]): SoberanoUSD[] {
  return items.map((b) => {
    const v = (b as any).variacion as number | null | undefined
    return {
      ticker:            b.ticker,
      vto:               dateFmt(b.vto),
      dtm:               b.dtm ?? dtmFromIso(b.vto),
      precio:            num(b.price_usd, 3),
      variacion:         v != null ? `${v > 0 ? '+' : ''}${v.toFixed(2)}%` : '–',
      variacionPositiva: (v ?? 0) >= 0,
      ic:                num((b as any).ic,      4),
      paridad:           num((b as any).paridad, 2),
      tir:               pct(b.tir),
      dm:                b.mac_dur != null ? `${b.mac_dur.toFixed(2)}y` : '–',
    }
  })
}

export function mapBopreales(items: BondItem[]): Bopreal[] {
  return items.map((b) => {
    const v = (b as any).variacion as number | null | undefined
    return {
      ticker:            b.ticker,
      vto:               dateFmt(b.vto),
      dtm:               b.dtm ?? dtmFromIso(b.vto),
      precio:            num(b.price_usd, 3),
      variacion:         v != null ? `${v > 0 ? '+' : ''}${v.toFixed(2)}%` : '–',
      variacionPositiva: (v ?? 0) >= 0,
      ic:                num((b as any).ic,      4),
      paridad:           num((b as any).paridad, 2),
      tir:               pct(b.tir),
      dm:                b.mac_dur != null ? `${b.mac_dur.toFixed(2)}y` : '–',
    }
  })
}

export function mapONs(items: BondItem[]): ObligacionNegociable[] {
  return items.map((b) => ({
    ticker:  b.ticker,
    empresa: b.empresa ?? b.ticker,
    cupon:   b.cupon ? `${b.cupon}%` : '–',
    vto:     dateFmt(b.vto),
    precio:  num(b.price_usd, 3),
    tir:     pct(b.tir),
    dm:      b.mac_dur != null ? `${b.mac_dur.toFixed(2)}y` : '–',
  }))
}

export function mapAcciones(items: EquityItem[]): AccionArgentina[] {
  return items.map((e) => ({
    ticker:            e.ticker,
    nombre:            e.ticker,
    ultimoPrecio:      num(e.last, 2),
    variacionDia:      e.variacion != null
                         ? `${e.variacion > 0 ? '+' : ''}${e.variacion.toFixed(2)}%`
                         : '–',
    variacionPositiva: (e.variacion ?? 0) >= 0,
    volumen:           vol(e.ev),
    capitalizacion:    '–',
  }))
}

export function mapCedears(items: EquityItem[]): Cedear[] {
  return items.map((e) => ({
    ticker:            e.ticker,
    nombre:            e.ticker,
    ultimoPrecio:      num(e.last, 2),
    variacionDia:      e.variacion != null
                         ? `${e.variacion > 0 ? '+' : ''}${e.variacion.toFixed(2)}%`
                         : '–',
    variacionPositiva: (e.variacion ?? 0) >= 0,
    volumen:           vol(e.ev),
    ratio:             '–',
  }))
}

export function mapETFs(items: EquityItem[]): ETFArgentino[] {
  return items.map((e) => ({
    ticker:            e.ticker,
    nombre:            e.ticker,
    ultimoPrecio:      num(e.last, 2),
    variacionDia:      e.variacion != null
                         ? `${e.variacion > 0 ? '+' : ''}${e.variacion.toFixed(2)}%`
                         : '–',
    variacionPositiva: (e.variacion ?? 0) >= 0,
    volumen:           vol(e.ev),
    patrimonio:        '–',
  }))
}

export function mapNews(raw: Record<string, any[]> | undefined): NewsData {
  const seg = (key: string): NewsItem[] =>
    (raw?.[key] ?? []).map((n: any) => ({
      title:  n.title  ?? '',
      url:    n.url    ?? null,
      dt_str: n.dt_str ?? '',
    }))
  return {
    Equity: seg('Equity'),
    Rates:  seg('Rates'),
    Macro:  seg('Macro'),
    Energy: seg('Energy'),
    Crypto: seg('Crypto'),
  }
}
