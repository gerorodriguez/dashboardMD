// Tipo de Cambio
export interface TipoCambio {
  tipo: string
  valor: string
}

// Sintetico USD Linked
export interface SinteticoUSD {
  mes: string
  tna: string
  highlighted?: boolean
}

// LECAP & BONCAP (Pesos - Tasa Fija)
export interface LecapBoncap {
  ticker: string
  tipo: "LECAP" | "BONCAP"
  vto: string
  dtm: number
  precio: string
  vf: string
  tna: string
  tea: string
  tem: string
  teaHighlighted?: boolean
}

// Bonos CER (TIR Real)
export interface BonoCER {
  ticker: string
  tipo: string
  vto: string
  dtm: number
  precio: string
  tir: string
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
  precio: string
  vto: string
  tir: string
  dm: string
  tirHighlighted?: boolean
}

// Bopreales
export interface Bopreal {
  ticker: string
  precio: string
  vto: string
  tir: string
  dm: string
  tirHighlighted?: boolean
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
export interface MarketData {
  fecha: string
  settlement: string
  tipoCambio: TipoCambio[]
  sinteticoUSD: SinteticoUSD[]
  cerIndex: string
  dolarSpot: string
}
