"use client"

import { TrendingUp, Percent, Globe, Zap, Bitcoin } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import type { NewsData, NewsItem } from "@/lib/types"

// ─── Segment config ───────────────────────────────────────────────────────────

interface SegmentConfig {
  key: keyof NewsData
  label: string
  Icon: React.ElementType
}

const SEGMENTS: SegmentConfig[] = [
  { key: "Equity", label: "Equity",  Icon: TrendingUp },
  { key: "Rates",  label: "Rates",   Icon: Percent    },
  { key: "Macro",  label: "Macro",   Icon: Globe      },
  { key: "Energy", label: "Energy",  Icon: Zap        },
  { key: "Crypto", label: "Crypto",  Icon: Bitcoin    },
]

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-3 w-12 shrink-0 animate-pulse rounded bg-muted" />
    </div>
  )
}

// ─── Single news card ─────────────────────────────────────────────────────────

interface NewsCardProps {
  config: SegmentConfig
  items: NewsItem[]
}

function NewsCard({ config, items }: NewsCardProps) {
  const { label, Icon } = config
  const isEmpty = items.length === 0

  return (
    <Card className="gap-0 py-0 overflow-hidden">
      {/* Header */}
      <CardHeader className="border-b border-border bg-secondary/40 px-4 py-3 [.border-b]:pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-wide text-foreground">
          <Icon className="size-4 text-primary" />
          {label}
        </CardTitle>
      </CardHeader>

      {/* Items */}
      <CardContent className="divide-y divide-border px-4 py-0">
        {isEmpty ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="flex items-start justify-between gap-3 py-2.5">
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="line-clamp-2 flex-1 text-sm leading-snug text-foreground hover:text-primary transition-colors"
                >
                  {item.title}
                </a>
              ) : (
                <span className="line-clamp-2 flex-1 text-sm leading-snug text-foreground">
                  {item.title}
                </span>
              )}
              {item.dt_str && (
                <span className="shrink-0 whitespace-nowrap pt-px font-mono text-[11px] text-muted-foreground">
                  {item.dt_str}
                </span>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

// ─── Tab ──────────────────────────────────────────────────────────────────────

interface NoticiasTabProps {
  newsData: NewsData
}

export function NoticiasTab({ newsData }: NoticiasTabProps) {
  // First 4 segments in a 2-col grid, last segment (Crypto) full width below.
  const gridSegments = SEGMENTS.slice(0, 4)
  const wideSegment  = SEGMENTS[4]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {gridSegments.map((seg) => (
          <NewsCard key={seg.key} config={seg} items={newsData[seg.key]} />
        ))}
      </div>
      <NewsCard config={wideSegment} items={newsData[wideSegment.key]} />
    </div>
  )
}
