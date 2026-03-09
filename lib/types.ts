// Tipo de Cambio
export interface TipoCambio {
  tipo: string
  valor: string
}

// Sintetico USD Linked
export interface SinteticoUSD {
  lecap:    string
  futuro:   string
  vto:      string
  dtm:      number
  teaLecap: string
  teaFut:   string
  sintTea:  string
}

// LECAP & BONCAP (Pesos - Tasa Fija)
export interface LecapBoncap {
  ticker: string
  tipo: "LECAP" | "BONCAP"
  vto: string
  dtm: number
  precio: string       // precio de mercado (usado por rate calculator)
  vf: string           // VPV — Valor a Finish
  resultado: string    // rendimiento directo: VPV/precio − 1
  tna: string
  tea: string
  tem: string
}

// Bonos CER (TIR Real)
export interface BonoCER {
  ticker: string
  tipo: string
  vto: string
  dtm: number
  precio: string
  variacion: string
  variacionPositiva: boolean
  tir: string
  tna: string
  dm: string
  tirHighlighted?: boolean
}

// Futuros Dolar
export interface FuturoDolar {
  contrato: string
  vto: string
  dtm: number
  precio: string
  tna: string
  tea: string
  tem: string
}

// Soberanos USD
export interface SoberanoUSD {
  ticker: string
  vto: string
  dtm: number
  precio: string
  variacion: string
  variacionPositiva: boolean
  ic: string       // intereses corridos
  paridad: string  // precio limpio / valor residual × 100
  tir: string
  dm: string
}

// Bopreales
export interface Bopreal {
  ticker: string
  vto: string
  dtm: number
  precio: string
  variacion: string
  variacionPositiva: boolean
  ic: string
  paridad: string
  tir: string
  dm: string
}

// Obligaciones Negociables (Corporate Bonds)
export interface ObligacionNegociable {
  ticker: string
  empresa: string
  cupon: string
  vto: string
  precio: string
  tir: string
  dm: string
  tirHighlighted?: boolean
}

// CEDEARs
export interface Cedear {
  ticker: string
  nombre: string
  ultimoPrecio: string
  variacionDia: string
  variacionPositiva: boolean
  volumen: string
  ratio: string
}

// ETFs Argentinos
export interface ETFArgentino {
  ticker: string
  nombre: string
  ultimoPrecio: string
  variacionDia: string
  variacionPositiva: boolean
  volumen: string
  patrimonio: string
}

// Acciones Argentinas
export interface AccionArgentina {
  ticker: string
  nombre: string
  ultimoPrecio: string
  variacionDia: string
  variacionPositiva: boolean
  volumen: string
  capitalizacion: string
}

// Cauciones
export interface Caucion {
  plazo: number
  tna: string
  monto: string
  highlighted?: boolean
}

// Market header data
export interface BrechaFX {
  label: string
  valor: string   // porcentaje formateado, ej: "2.34%"
}

export interface MarketData {
  fecha: string
  settlement: string
  tipoCambio: TipoCambio[]
  sinteticoUSD: SinteticoUSD[]
  brechaFX: BrechaFX[]
  cerIndex: string
  dolarSpot: string
}

// News
export interface NewsItem {
  title: string
  url:   string | null
  dt_str: string
}

export interface NewsData {
  Equity: NewsItem[]
  Rates:  NewsItem[]
  Macro:  NewsItem[]
  Energy: NewsItem[]
  Crypto: NewsItem[]
}
