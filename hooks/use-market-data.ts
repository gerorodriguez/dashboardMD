/**
 * hooks/use-market-data.ts — Hook principal de datos de mercado.
 *
 * Combina:
 *   1. REST snapshot al montar (carga inicial rápida)
 *   2. WebSocket para updates en vivo mientras el componente está montado
 *
 * Devuelve { data, status, lastUpdated }
 *   status: 'loading' | 'ready' | 'error' | 'stale'
 *   stale: hay datos pero el WS está desconectado
 */
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchSnapshot, type SnapshotResponse } from '@/lib/api-client'
import { useMarketWebSocket } from '@/lib/ws-client'

export type DataStatus = 'loading' | 'ready' | 'error' | 'stale'

export interface UseMarketDataResult {
  data: SnapshotResponse | null
  status: DataStatus
  error: string | null
  lastUpdated: Date | null
}

export function useMarketData(): UseMarketDataResult {
  const [data, setData]               = useState<SnapshotResponse | null>(null)
  const [status, setStatus]           = useState<DataStatus>('loading')
  const [error, setError]             = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const wsAliveRef                    = useRef(false)

  // 1. Snapshot inicial vía REST
  useEffect(() => {
    fetchSnapshot()
      .then((snap) => {
        setData(snap)
        setStatus('ready')
        setLastUpdated(new Date())
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err))
        setStatus('error')
      })
  }, [])

  // 2. Updates en vivo vía WebSocket
  const handleUpdate = useCallback((update: SnapshotResponse) => {
    wsAliveRef.current = true
    setData(update)
    setStatus('ready')
    setLastUpdated(new Date())
  }, [])

  useMarketWebSocket(handleUpdate)

  return { data, status, error, lastUpdated }
}
