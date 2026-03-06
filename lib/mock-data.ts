import type {
  MarketData,
  LecapBoncap,
  BonoCER,
  FuturoDolar,
  SoberanoUSD,
  Bopreal,
  ObligacionNegociable,
  Cedear,
  ETFArgentino,
  AccionArgentina,
  Caucion,
} from "./types"

export const marketData: MarketData = {
  fecha: "23/02/2026",
  settlement: "24/02/2026",
  tipoCambio: [
    { tipo: "Oficial (A3500)", valor: "$1,370.50" },
    { tipo: "MEP (AL30)", valor: "$1,394.84" },
    { tipo: "CCL (AL30)", valor: "$1,441.41" },
    { tipo: "Canje", valor: "3.34%" },
  ],
  sinteticoUSD: [
    { mes: "FEB 26", tna: "5.08%" },
    { mes: "ABR 26", tna: "7.43%", highlighted: true },
    { mes: "MAY 26", tna: "4.02%" },
    { mes: "JUN 26", tna: "2.89%" },
    { mes: "JUL 26", tna: "1.97%" },
    { mes: "AGO 26", tna: "1.04%" },
  ],
  cerIndex: "698.50",
  dolarSpot: "$1,370.50",
}

export const lecapBoncapData: LecapBoncap[] = [
  { ticker: "S16M6", tipo: "LECAP",  vto: "16/03/2026", dtm: 11,  precio: "$102.63", vf: "$104.62",  resultado: "1.94%",  tna: "35.58%", tea: "42.00%", tem: "2.97%" },
  { ticker: "S17A6", tipo: "LECAP",  vto: "17/04/2026", dtm: 43,  precio: "$104.74", vf: "$110.13",  resultado: "5.15%",  tna: "35.71%", tea: "42.18%", tem: "2.98%" },
  { ticker: "S30A6", tipo: "LECAP",  vto: "30/04/2026", dtm: 56,  precio: "$119.90", vf: "$127.49",  resultado: "7.05%",  tna: "38.86%", tea: "46.59%", tem: "3.24%" },
  { ticker: "S29Y6", tipo: "LECAP",  vto: "29/05/2026", dtm: 85,  precio: "$121.15", vf: "$132.04",  resultado: "8.99%",  tna: "33.90%", tea: "39.70%", tem: "2.83%" },
  { ticker: "S31L6", tipo: "LECAP",  vto: "31/07/2026", dtm: 148, precio: "$102.60", vf: "$117.68",  resultado: "14.70%", tna: "32.30%", tea: "37.54%", tem: "2.69%" },
  { ticker: "S31G6", tipo: "LECAP",  vto: "31/08/2026", dtm: 179, precio: "$108.45", vf: "$127.06",  resultado: "17.16%", tna: "31.15%", tea: "36.01%", tem: "2.60%" },
  { ticker: "S30O6", tipo: "LECAP",  vto: "30/10/2026", dtm: 239, precio: "$110.40", vf: "$135.27",  resultado: "22.54%", tna: "30.29%", tea: "34.86%", tem: "2.52%" },
  { ticker: "S30N6", tipo: "LECAP",  vto: "30/11/2026", dtm: 270, precio: "$102.94", vf: "$129.88",  resultado: "27.14%", tna: "32.32%", tea: "37.56%", tem: "2.69%" },
  { ticker: "T30J6", tipo: "BONCAP", vto: "30/06/2026", dtm: 117, precio: "$129.50", vf: "$144.87",  resultado: "11.87%", tna: "32.99%", tea: "38.46%", tem: "2.75%" },
  { ticker: "T15E7", tipo: "BONCAP", vto: "15/01/2027", dtm: 316, precio: "$121.90", vf: "$161.11",  resultado: "32.17%", tna: "31.81%", tea: "36.88%", tem: "2.65%" },
  { ticker: "T30A7", tipo: "BONCAP", vto: "30/04/2027", dtm: 421, precio: "$112.60", vf: "$157.33",  resultado: "39.72%", tna: "29.45%", tea: "33.77%", tem: "2.49%" },
  { ticker: "T30J7", tipo: "BONCAP", vto: "30/06/2027", dtm: 482, precio: "$108.75", vf: "$156.33",  resultado: "43.75%", tna: "27.87%", tea: "31.72%", tem: "2.36%" },
]

export const bonosCERData: BonoCER[] = [
  { ticker: "TZX26",  tipo: "LECER",  vto: "20/03/26", dtm: 12,   precio: "354",     variacion: "+0.23%", tir: "2.00%",  tna: "2.00%",  dm: "0.03y" },
  { ticker: "X15Y6",  tipo: "LECER",  vto: "15/05/26", dtm: 68,   precio: "100",     variacion: "–",      tir: "3.50%",  tna: "3.50%",  dm: "0.19y" },
  { ticker: "X29Y6",  tipo: "LECER",  vto: "29/05/26", dtm: 82,   precio: "108",     variacion: "–",      tir: "4.00%",  tna: "4.00%",  dm: "0.22y" },
  { ticker: "X31L6",  tipo: "LECER",  vto: "31/07/26", dtm: 145,  precio: "102",     variacion: "–",      tir: "4.50%",  tna: "4.50%",  dm: "0.40y" },
  { ticker: "TZXO6",  tipo: "LECER",  vto: "30/10/26", dtm: 236,  precio: "143",     variacion: "–",      tir: "5.50%",  tna: "5.50%",  dm: "0.65y" },
  { ticker: "TX26",   tipo: "BONCER", vto: "09/11/26", dtm: 246,  precio: "1.253",   variacion: "+0.18%", tir: "5.00%",  tna: "5.00%",  dm: "0.42y" },
  { ticker: "X30N6",  tipo: "LECER",  vto: "30/11/26", dtm: 267,  precio: "103",     variacion: "–",      tir: "5.50%",  tna: "5.50%",  dm: "0.73y" },
  { ticker: "TZXD6",  tipo: "LECER",  vto: "15/12/26", dtm: 282,  precio: "251",     variacion: "–",      tir: "5.50%",  tna: "5.50%",  dm: "0.77y" },
  { ticker: "TZXM7",  tipo: "LECER",  vto: "31/03/27", dtm: 388,  precio: "185",     variacion: "–",      tir: "6.00%",  tna: "6.00%",  dm: "1.06y", tirHighlighted: true },
  { ticker: "TZX27",  tipo: "LECER",  vto: "30/06/27", dtm: 479,  precio: "326",     variacion: "–",      tir: "6.50%",  tna: "6.50%",  dm: "1.31y", tirHighlighted: true },
  { ticker: "TZXA7",  tipo: "LECER",  vto: "30/07/27", dtm: 509,  precio: "99",      variacion: "–",      tir: "7.00%",  tna: "7.00%",  dm: "1.39y", tirHighlighted: true },
  { ticker: "TZX28",  tipo: "LECER",  vto: "30/06/28", dtm: 845,  precio: "300",     variacion: "–",      tir: "7.50%",  tna: "7.50%",  dm: "2.32y", tirHighlighted: true },
  { ticker: "TX28",   tipo: "BONCER", vto: "09/11/28", dtm: 977,  precio: "2.933",   variacion: "+0.12%", tir: "7.00%",  tna: "7.00%",  dm: "1.61y", tirHighlighted: true },
  { ticker: "TX31",   tipo: "BONCER", vto: "01/12/31", dtm: 2094, precio: "1.178",   variacion: "–",      tir: "8.00%",  tna: "8.00%",  dm: "4.45y", tirHighlighted: true },
  { ticker: "DICP",   tipo: "BONCER", vto: "31/12/33", dtm: 2855, precio: "41.215",  variacion: "–",      tir: "9.00%",  tna: "9.00%",  dm: "6.15y", tirHighlighted: true },
]

export const futurosDolarData: FuturoDolar[] = [
  { contrato: "DLR FEB 26", vto: "27/02/2026", dtm: 4, precio: "$1,374", tna: "26.63%", tea: "30.47%", tem: "2.24%" },
  { contrato: "DLR MAR 26", vto: "31/03/2026", dtm: 36, precio: "$1,410", tna: "28.85%", tea: "32.91%", tem: "2.40%" },
  { contrato: "DLR ABR 26", vto: "30/04/2026", dtm: 66, precio: "$1,443", tna: "29.26%", tea: "32.99%", tem: "2.40%" },
  { contrato: "DLR MAY 26", vto: "29/05/2026", dtm: 95, precio: "$1,473", tna: "28.74%", tea: "31.93%", tem: "2.34%" },
  { contrato: "DLR JUN 26", vto: "30/06/2026", dtm: 127, precio: "$1,510", tna: "29.25%", tea: "32.13%", tem: "2.35%" },
  { contrato: "DLR JUL 26", vto: "31/07/2026", dtm: 158, precio: "$1,547", tna: "29.75%", tea: "32.29%", tem: "2.36%" },
  { contrato: "DLR AGO 26", vto: "31/08/2026", dtm: 189, precio: "$1,582", tna: "29.80%", tea: "31.94%", tem: "2.34%" },
  { contrato: "DLR SEP 26", vto: "30/09/2026", dtm: 219, precio: "$1,657", tna: "34.84%", tea: "37.22%", tem: "2.67%" },
  { contrato: "DLR OCT 26", vto: "30/10/2026", dtm: 249, precio: "$1,690", tna: "34.17%", tea: "35.96%", tem: "2.59%" },
  { contrato: "DLR NOV 26", vto: "30/11/2026", dtm: 280, precio: "$1,720", tna: "33.24%", tea: "34.46%", tem: "2.50%" },
  { contrato: "DLR DIC 26", vto: "31/12/2026", dtm: 311, precio: "$1,788", tna: "35.75%", tea: "36.63%", tem: "2.63%" },
]

export const soberanosUSDData: SoberanoUSD[] = [
  { ticker: "AL29D", vto: "09/07/29", dtm: 1220, precio: "61.530", variacion: "+0.54%", variacionPositiva: true,  ic: "0.1109", paridad: "87.74", tir: "7.85%", dm: "1.66" },
  { ticker: "GD29D", vto: "09/07/29", dtm: 1220, precio: "63.390", variacion: "+0.30%", variacionPositiva: true,  ic: "0.1109", paridad: "90.40", tir: "6.10%", dm: "1.70" },
  { ticker: "AL30D", vto: "10/07/30", dtm: 1586, precio: "60.740", variacion: "-0.21%", variacionPositiva: false, ic: "0.0856", paridad: "84.24", tir: "8.67%", dm: "2.05" },
  { ticker: "GD30D", vto: "10/07/30", dtm: 1586, precio: "63.050", variacion: "+0.08%", variacionPositiva: true,  ic: "0.0856", paridad: "87.45", tir: "7.01%", dm: "2.11" },
  { ticker: "AL35D", vto: "10/07/35", dtm: 3415, precio: "74.000", variacion: "+0.14%", variacionPositiva: true,  ic: "0.6561", paridad: "73.34", tir: "9.25%", dm: "5.38" },
  { ticker: "GD35D", vto: "10/07/35", dtm: 3415, precio: "76.500", variacion: "-0.05%", variacionPositiva: false, ic: "0.6561", paridad: "75.84", tir: "8.94%", dm: "5.41" },
  { ticker: "AE38D", vto: "09/01/38", dtm: 4327, precio: "65.000", variacion: "+0.22%", variacionPositiva: true,  ic: "0.7955", paridad: "64.20", tir: "9.57%", dm: "4.64" },
  { ticker: "GD38D", vto: "09/01/38", dtm: 4327, precio: "67.000", variacion: "+0.18%", variacionPositiva: true,  ic: "0.7955", paridad: "66.20", tir: "8.87%", dm: "4.73" },
  { ticker: "AL41D", vto: "09/07/41", dtm: 5604, precio: "64.000", variacion: "–",      variacionPositiva: true,  ic: "0.5578", paridad: "63.44", tir: "9.33%", dm: "5.87" },
  { ticker: "GD41D", vto: "09/07/41", dtm: 5604, precio: "65.500", variacion: "–",      variacionPositiva: true,  ic: "0.5578", paridad: "64.94", tir: "9.02%", dm: "5.93" },
]

export const boprealesData: Bopreal[] = [
  { ticker: "BPA7D", vto: "31/10/27", dtm: 603, precio: "106.100", variacion: "+0.10%", variacionPositiva: true,  ic: "1.7663", paridad: "104.33", tir: "1.84%", dm: "1.35" },
  { ticker: "BPB7D", vto: "31/10/27", dtm: 603, precio: "101.750", variacion: "-0.05%", variacionPositiva: false, ic: "1.7663", paridad: "99.98",  tir: "5.06%", dm: "1.31" },
  { ticker: "BPC7D", vto: "31/10/27", dtm: 603, precio: "100.700", variacion: "+0.20%", variacionPositiva: true,  ic: "1.7663", paridad: "98.93",  tir: "5.87%", dm: "1.30" },
  { ticker: "BPD7D", vto: "31/10/27", dtm: 603, precio: "100.350", variacion: "–",      variacionPositiva: true,  ic: "1.7663", paridad: "98.58",  tir: "6.00%", dm: "1.30" },
  { ticker: "BPA8D", vto: "31/10/28", dtm: 969, precio: "91.500",  variacion: "+0.33%", variacionPositiva: true,  ic: "1.0716", paridad: "90.43",  tir: "7.17%", dm: "2.40" },
  { ticker: "BPB8D", vto: "31/10/28", dtm: 969, precio: "89.500",  variacion: "+0.11%", variacionPositiva: true,  ic: "1.0716", paridad: "88.43",  tir: "8.01%", dm: "2.38" },
]

export const onLeyArgData: ObligacionNegociable[] = [
  { ticker: "YM37D", empresa: "YPF", cupon: "7.00%", vto: "07/05/2027", precio: "103.20", tir: "4.63%", dm: "1.10" },
  { ticker: "YM38D", empresa: "YPF", cupon: "7.50%", vto: "22/07/2027", precio: "103.90", tir: "5.20%", dm: "1.28" },
  { ticker: "YM39D", empresa: "YPF", cupon: "8.50%", vto: "22/07/2030", precio: "109.20", tir: "6.63%", dm: "3.52", tirHighlighted: true },
  { ticker: "PLC4D", empresa: "Pluspetrol", cupon: "8.50%", vto: "31/05/2032", precio: "109.25", tir: "7.16%", dm: "4.62", tirHighlighted: true },
  { ticker: "VSCVD", empresa: "Vista", cupon: "8.50%", vto: "10/06/2033", precio: "111.00", tir: "6.78%", dm: "4.67", tirHighlighted: true },
]

export const onLeyExtData: ObligacionNegociable[] = [
  { ticker: "YMCID", empresa: "YPF", cupon: "9.00%", vto: "02/07/2029", precio: "108.75", tir: "4.77%", dm: "1.65" },
  { ticker: "TLCMD", empresa: "Telecom", cupon: "9.50%", vto: "18/07/2031", precio: "112.00", tir: "6.67%", dm: "3.47", tirHighlighted: true },
  { ticker: "YMCXD", empresa: "YPF", cupon: "8.75%", vto: "11/09/2031", precio: "112.25", tir: "6.86%", dm: "3.74", tirHighlighted: true },
  { ticker: "YM34D", empresa: "YPF", cupon: "8.25%", vto: "17/01/2034", precio: "107.90", tir: "7.07%", dm: "5.10", tirHighlighted: true },
  { ticker: "IRCPD", empresa: "IRSA", cupon: "8.00%", vto: "31/03/2035", precio: "109.25", tir: "7.53%", dm: "6.08", tirHighlighted: true },
]

export const cedearsData: Cedear[] = [
  { ticker: "MELI", nombre: "MercadoLibre", ultimoPrecio: "$72,850.00", variacionDia: "+2.34%", variacionPositiva: true, volumen: "$1,245M", ratio: "60:1" },
  { ticker: "AAPL", nombre: "Apple Inc.", ultimoPrecio: "$36,120.00", variacionDia: "+0.87%", variacionPositiva: true, volumen: "$892M", ratio: "20:1" },
  { ticker: "GOOGL", nombre: "Alphabet", ultimoPrecio: "$28,450.00", variacionDia: "-0.42%", variacionPositiva: false, volumen: "$567M", ratio: "14:1" },
  { ticker: "MSFT", nombre: "Microsoft", ultimoPrecio: "$68,900.00", variacionDia: "+1.15%", variacionPositiva: true, volumen: "$734M", ratio: "17:1" },
  { ticker: "AMZN", nombre: "Amazon", ultimoPrecio: "$32,180.00", variacionDia: "+0.63%", variacionPositiva: true, volumen: "$456M", ratio: "18:1" },
  { ticker: "TSLA", nombre: "Tesla", ultimoPrecio: "$51,200.00", variacionDia: "-1.82%", variacionPositiva: false, volumen: "$1,120M", ratio: "15:1" },
  { ticker: "NVDA", nombre: "NVIDIA", ultimoPrecio: "$19,850.00", variacionDia: "+3.47%", variacionPositiva: true, volumen: "$2,340M", ratio: "10:1" },
  { ticker: "META", nombre: "Meta Platforms", ultimoPrecio: "$95,300.00", variacionDia: "+0.92%", variacionPositiva: true, volumen: "$512M", ratio: "24:1" },
  { ticker: "JPM", nombre: "JPMorgan Chase", ultimoPrecio: "$41,750.00", variacionDia: "-0.31%", variacionPositiva: false, volumen: "$289M", ratio: "8:1" },
  { ticker: "KO", nombre: "Coca-Cola", ultimoPrecio: "$10,680.00", variacionDia: "+0.15%", variacionPositiva: true, volumen: "$178M", ratio: "5:1" },
]

export const etfsData: ETFArgentino[] = [
  { ticker: "SPY", nombre: "SPDR S&P 500", ultimoPrecio: "$82,400.00", variacionDia: "+0.54%", variacionPositiva: true, volumen: "$3,120M", patrimonio: "$450B" },
  { ticker: "QQQ", nombre: "Invesco QQQ", ultimoPrecio: "$76,350.00", variacionDia: "+0.78%", variacionPositiva: true, volumen: "$2,840M", patrimonio: "$220B" },
  { ticker: "EEM", nombre: "iShares MSCI EM", ultimoPrecio: "$6,240.00", variacionDia: "-0.62%", variacionPositiva: false, volumen: "$890M", patrimonio: "$28B" },
  { ticker: "XLE", nombre: "Energy Select", ultimoPrecio: "$13,870.00", variacionDia: "+1.23%", variacionPositiva: true, volumen: "$456M", patrimonio: "$35B" },
  { ticker: "GLD", nombre: "SPDR Gold Shares", ultimoPrecio: "$31,200.00", variacionDia: "+0.34%", variacionPositiva: true, volumen: "$678M", patrimonio: "$62B" },
  { ticker: "IWM", nombre: "iShares Russell 2000", ultimoPrecio: "$33,680.00", variacionDia: "-0.89%", variacionPositiva: false, volumen: "$1,230M", patrimonio: "$58B" },
  { ticker: "DIA", nombre: "SPDR Dow Jones", ultimoPrecio: "$67,120.00", variacionDia: "+0.22%", variacionPositiva: true, volumen: "$567M", patrimonio: "$32B" },
  { ticker: "ARKK", nombre: "ARK Innovation", ultimoPrecio: "$8,450.00", variacionDia: "+2.15%", variacionPositiva: true, volumen: "$345M", patrimonio: "$7B" },
]

export const accionesArgData: AccionArgentina[] = [
  { ticker: "GGAL", nombre: "Grupo Galicia", ultimoPrecio: "$6,845.00", variacionDia: "+3.21%", variacionPositiva: true, volumen: "$4,560M", capitalizacion: "$9.8B" },
  { ticker: "YPF", nombre: "YPF S.A.", ultimoPrecio: "$38,250.00", variacionDia: "+1.87%", variacionPositiva: true, volumen: "$3,890M", capitalizacion: "$15.2B" },
  { ticker: "BMA", nombre: "Banco Macro", ultimoPrecio: "$11,320.00", variacionDia: "+2.45%", variacionPositiva: true, volumen: "$2,340M", capitalizacion: "$7.3B" },
  { ticker: "PAM", nombre: "Pampa Energia", ultimoPrecio: "$3,890.00", variacionDia: "-0.51%", variacionPositiva: false, volumen: "$1,780M", capitalizacion: "$6.1B" },
  { ticker: "SUPV", nombre: "Supervielle", ultimoPrecio: "$2,145.00", variacionDia: "+4.12%", variacionPositiva: true, volumen: "$1,230M", capitalizacion: "$1.5B" },
  { ticker: "TXAR", nombre: "Ternium Argentina", ultimoPrecio: "$1,890.00", variacionDia: "-1.23%", variacionPositiva: false, volumen: "$890M", capitalizacion: "$3.4B" },
  { ticker: "TECO2", nombre: "Telecom Argentina", ultimoPrecio: "$2,670.00", variacionDia: "+0.75%", variacionPositiva: true, volumen: "$1,560M", capitalizacion: "$5.7B" },
  { ticker: "CEPU", nombre: "Central Puerto", ultimoPrecio: "$1,560.00", variacionDia: "+1.93%", variacionPositiva: true, volumen: "$980M", capitalizacion: "$2.3B" },
  { ticker: "LOMA", nombre: "Loma Negra", ultimoPrecio: "$1,234.00", variacionDia: "+0.65%", variacionPositiva: true, volumen: "$456M", capitalizacion: "$1.8B" },
  { ticker: "ALUA", nombre: "Aluar", ultimoPrecio: "$890.00", variacionDia: "-0.89%", variacionPositiva: false, volumen: "$678M", capitalizacion: "$2.1B" },
  { ticker: "CRES", nombre: "Cresud", ultimoPrecio: "$1,450.00", variacionDia: "+2.10%", variacionPositiva: true, volumen: "$345M", capitalizacion: "$1.2B" },
  { ticker: "EDN", nombre: "Edenor", ultimoPrecio: "$1,780.00", variacionDia: "+1.45%", variacionPositiva: true, volumen: "$567M", capitalizacion: "$1.9B" },
]

export const caucionesPesosData: Caucion[] = [
  { plazo: 1, tna: "32.00%", monto: "$18,450M", highlighted: true },
  { plazo: 7, tna: "33.50%", monto: "$12,320M", highlighted: true },
  { plazo: 14, tna: "34.25%", monto: "$8,670M" },
  { plazo: 30, tna: "35.80%", monto: "$5,890M" },
  { plazo: 60, tna: "36.50%", monto: "$3,210M" },
]

export const caucionesUSDData: Caucion[] = [
  { plazo: 1, tna: "2.50%", monto: "USD 45M", highlighted: true },
  { plazo: 7, tna: "3.10%", monto: "USD 32M", highlighted: true },
  { plazo: 14, tna: "3.45%", monto: "USD 18M" },
  { plazo: 30, tna: "3.80%", monto: "USD 12M" },
  { plazo: 60, tna: "4.25%", monto: "USD 6M" },
]
