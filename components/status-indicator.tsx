"use client"

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useLocation } from './providers/location-context-provider'

export function StatusIndicator() {
  const { isRecording, isPaused } = useLocation()
  const status: 'idle' | 'recording' | 'paused' =
    isRecording ? 'recording' : isPaused ? 'paused' : 'idle'

  const [isBlinking, setIsBlinking] = useState(false)

  useEffect(() => {
    let blinkInterval: NodeJS.Timeout
    if (status === 'recording') {
      blinkInterval = setInterval(() => {
        setIsBlinking((prev) => !prev)
      }, 1000)
    } else {
      setIsBlinking(false)
    }
    return () => {
      if (blinkInterval) clearInterval(blinkInterval)
    }
  }, [status])

  return (
    <div className="flex items-center mb-6 p-3 rounded-lg bg-muted">
      <div className="flex items-center">
        <div
          className={cn(
            'h-3 w-3 rounded-full mr-2',
            status === 'idle' && 'bg-gray-400',
            status === 'recording' && (isBlinking ? 'bg-red-500' : 'bg-red-600'),
            status === 'paused' && 'bg-yellow-500'
          )}
        />
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {status === 'idle' && 'Not Recording'}
          {status === 'recording' && 'Recording'}
          {status === 'paused' && 'Paused'}
        </span>
      </div>
      {status !== 'idle' && (
        <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          Last update: Just now
        </div>
      )}
    </div>
  )
}
