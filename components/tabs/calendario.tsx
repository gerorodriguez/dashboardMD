"use client"

import { useState, useEffect, useMemo } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Badge } from "@/components/ui/badge"
import { fetchCalendar, type CalendarEvent } from "@/lib/api-client"

// ─── Colour scheme ──────────────────────────────────────────────────────────
const TIPO_STYLE: Record<string, { pill: string; dot: string; label: string }> = {
  SOBERANO: { pill: "bg-blue-500/20 text-blue-300 border border-blue-500/30",   dot: "bg-blue-400",    label: "Soberano" },
  BOPREAL:  { pill: "bg-violet-500/20 text-violet-300 border border-violet-500/30", dot: "bg-violet-400", label: "Bopreal"  },
  ON_NY:    { pill: "bg-orange-500/20 text-orange-300 border border-orange-500/30", dot: "bg-orange-400", label: "ON NY"    },
  ON_ARG:   { pill: "bg-amber-500/20 text-amber-300 border border-amber-500/30",  dot: "bg-amber-400",  label: "ON Arg"   },
  LECAP:    { pill: "bg-green-500/20 text-green-300 border border-green-500/30",   dot: "bg-green-400",  label: "LECAP"    },
  BONCAP:   { pill: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30", dot: "bg-emerald-400", label: "BONCAP" },
  BONCER:   { pill: "bg-rose-500/20 text-rose-300 border border-rose-500/30",     dot: "bg-rose-400",   label: "BONCER"   },
  LECER:    { pill: "bg-lime-500/20 text-lime-300 border border-lime-500/30",     dot: "bg-lime-400",   label: "LECER"    },
  PAR:      { pill: "bg-pink-500/20 text-pink-300 border border-pink-500/30",     dot: "bg-pink-400",   label: "PAR"      },
}
const DEFAULT_STYLE = { pill: "bg-secondary text-secondary-foreground border border-border", dot: "bg-muted-foreground", label: "Otro" }

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
const DIAS  = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"]

const MAX_VISIBLE = 3   // max pills visible per cell before overflow

// ─── Event detail card ───────────────────────────────────────────────────────
function EventDetail({ ev }: { ev: CalendarEvent }) {
  const style = TIPO_STYLE[ev.tipo_instrumento] ?? DEFAULT_STYLE
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className={`size-2 rounded-full ${style.dot}`} />
        <span className="font-mono font-semibold text-sm">{ev.ticker}</span>
        <span className="text-xs text-muted-foreground">{style.label}</span>
        <span className="ml-auto text-xs text-muted-foreground">{ev.moneda}</span>
      </div>
      {ev.emisor && <p className="text-xs text-muted-foreground pl-4">{ev.emisor}</p>}
      <div className="pl-4 space-y-0.5 text-xs">
        {ev.coupon > 0 && (
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Renta</span>
            <span className="font-mono">{ev.coupon.toFixed(4)} c/100VN</span>
          </div>
        )}
        {ev.amort > 0 && (
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Amortización</span>
            <span className="font-mono">{ev.amort.toFixed(4)} c/100VN</span>
          </div>
        )}
        <div className="flex justify-between gap-4 font-medium border-t border-border pt-0.5 mt-0.5">
          <span>Total</span>
          <span className="font-mono">{ev.total.toFixed(4)} c/100VN</span>
        </div>
      </div>
    </div>
  )
}

// ─── Single event pill ────────────────────────────────────────────────────────
function EventPill({ ev }: { ev: CalendarEvent }) {
  const style = TIPO_STYLE[ev.tipo_instrumento] ?? DEFAULT_STYLE
  const suffix =
    ev.tipo_pago === "RENTA+AMORT" ? " R+A" :
    ev.tipo_pago === "RENTA"       ? " R"   : " A"

  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div className={`text-[10px] px-1 py-0.5 rounded cursor-default truncate leading-tight ${style.pill}`}>
          <span className="font-mono font-medium">{ev.ticker}</span>
          <span className="opacity-60">{suffix}</span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-64 p-3" side="top">
        <EventDetail ev={ev} />
      </HoverCardContent>
    </HoverCard>
  )
}

// ─── Day cell ────────────────────────────────────────────────────────────────
function DayCell({
  day, dateStr, events, isToday, isPast,
}: {
  day: number
  dateStr: string
  events: CalendarEvent[]
  isToday: boolean
  isPast: boolean
}) {
  const visible  = events.slice(0, MAX_VISIBLE)
  const overflow = events.length - MAX_VISIBLE

  return (
    <div
      className={[
        "min-h-[110px] p-1.5 rounded-md border flex flex-col gap-0.5",
        isToday  ? "border-primary bg-primary/5"   : "border-border/40",
        isPast   ? "opacity-40"                     : "",
        events.length > 0 && !isPast ? "bg-card/40" : "",
      ].join(" ")}
    >
      <div className={`text-xs font-medium mb-0.5 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
        {day}
      </div>

      {visible.map((ev, i) => (
        <EventPill key={`${ev.ticker}-${i}`} ev={ev} />
      ))}

      {overflow > 0 && (
        <HoverCard openDelay={150} closeDelay={150}>
          <HoverCardTrigger asChild>
            <button className="text-[10px] text-muted-foreground hover:text-foreground text-left mt-0.5 pl-1 leading-tight">
              +{overflow} más
            </button>
          </HoverCardTrigger>
          <HoverCardContent className="w-72 p-3 max-h-[400px] overflow-y-auto" side="top">
            <p className="text-xs font-medium text-muted-foreground mb-2">{dateStr} — todos los pagos</p>
            <div className="space-y-3">
              {events.map((ev, i) => (
                <EventDetail key={`${ev.ticker}-${i}`} ev={ev} />
              ))}
            </div>
          </HoverCardContent>
        </HoverCard>
      )}
    </div>
  )
}

// ─── Filter legend ────────────────────────────────────────────────────────────
function Legend({
  active, onToggle,
}: {
  active: Set<string>
  onToggle: (tipo: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.entries(TIPO_STYLE).map(([tipo, style]) => (
        <button
          key={tipo}
          onClick={() => onToggle(tipo)}
          className={[
            "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-opacity",
            style.pill,
            active.has(tipo) ? "" : "opacity-30",
          ].join(" ")}
        >
          <span className={`size-1.5 rounded-full ${style.dot}`} />
          {style.label}
        </button>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function CalendarioTab() {
  const [now, setNow]       = useState(() => new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTypes, setActiveTypes] = useState<Set<string>>(
    () => new Set(Object.keys(TIPO_STYLE))
  )

  useEffect(() => {
    fetchCalendar()
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const year  = now.getFullYear()
  const month = now.getMonth()

  const toggleType = (tipo: string) =>
    setActiveTypes(prev => {
      const next = new Set(prev)
      next.has(tipo) ? next.delete(tipo) : next.add(tipo)
      return next
    })

  // Group filtered events by ISO date string
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const ev of events) {
      if (!activeTypes.has(ev.tipo_instrumento)) continue
      const list = map.get(ev.date) ?? []
      map.set(ev.date, [...list, ev])
    }
    return map
  }, [events, activeTypes])

  // Build calendar grid (Mon-based)
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay  = new Date(year, month + 1, 0)
    let startDow = firstDay.getDay()
    startDow = startDow === 0 ? 6 : startDow - 1   // Mon=0 … Sun=6

    const days: (number | null)[] = []
    for (let i = 0; i < startDow; i++) days.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(d)
    while (days.length % 7 !== 0) days.push(null)
    return days
  }, [year, month])

  const today    = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  // Count events in current month for the subtitle
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`
  const monthEventCount = [...eventsByDate.entries()]
    .filter(([d]) => d.startsWith(monthPrefix))
    .reduce((acc, [, evs]) => acc + evs.length, 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 mr-auto">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setNow(new Date(year, month - 1, 1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <div className="text-center min-w-[160px]">
            <p className="font-semibold">{MESES[month]} {year}</p>
            {!loading && (
              <p className="text-xs text-muted-foreground">{monthEventCount} pagos este mes</p>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setNow(new Date(year, month + 1, 1))}>
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => setNow(new Date())}
          >
            Hoy
          </Button>
        </div>
        <Legend active={activeTypes} onToggle={toggleType} />
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DIAS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-[110px] rounded-md border border-border/30 animate-pulse bg-muted/20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="min-h-[110px]" />
            }
            const dateStr  = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            const dayEvs   = eventsByDate.get(dateStr) ?? []
            return (
              <DayCell
                key={dateStr}
                day={day}
                dateStr={dateStr}
                events={dayEvs}
                isToday={dateStr === todayStr}
                isPast={dateStr < todayStr}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
