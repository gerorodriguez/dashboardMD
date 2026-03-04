/**
 * lib/ws-client.ts — Hook WebSocket con reconexión automática.
 *
 * useMarketWebSocket(onUpdate):
 *   - Conecta a NEXT_PUBLIC_WS_URL al montar el componente
 *   - Llama onUpdate() con cada mensaje tipo "update" que recibe
 *   - Reconecta automáticamente tras 5s si la conexión se cierra
 *   - Limpia todo al desmontar
 */
'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { SnapshotResponse } from './api-client'

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8000/ws/market'

const RECONNECT_DELAY = 5_000

export function useMarketWebSocket(
  onUpdate: (data: SnapshotResponse) => void,
) {
  const wsRef    = useRef<WebSocket | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Usamos una ref para el callback para evitar re-renders innecesarios
  const cbRef    = useRef(onUpdate)
  cbRef.current  = onUpdate

  const connect = useCallback(() => {
    // Cerrar conexión previa si existe
    if (wsRef.current) {
      wsRef.current.onclose = null
      wsRef.current.close()
    }

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string)
        if (msg?.type === 'update') {
          cbRef.current(msg as SnapshotResponse)
        }
      } catch {
        // ignorar mensajes malformados
      }
    }

    ws.onclose = () => {
      timerRef.current = setTimeout(connect, RECONNECT_DELAY)
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.close()
      }
    }
  }, [connect])
}
