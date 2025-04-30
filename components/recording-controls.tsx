"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, Square, Clock } from 'lucide-react'
import { useLocation } from './providers/location-context-provider'

// Utility to format seconds to MM:SS
const defaultFormatTime = (sec: number) => {
  const mm = Math.floor(sec / 60).toString().padStart(2, '0')
  const ss = (sec % 60).toString().padStart(2, '0')
  return `${mm}:${ss}`
}

export function RecordingControls() {
  const {
    isRecording,
    isPaused,
    locations,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  } = useLocation()

  // Derive current state
  const state: 'idle' | 'recording' | 'paused' =
    isRecording ? 'recording' : isPaused ? 'paused' : 'idle'

  // Elapsed seconds is number of recorded samples
  const elapsed = locations.length

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {state === 'idle'
            ? 'Ready to record'
            : state === 'recording'
            ? 'Recording...'
            : 'Paused'}
        </p>
        {state !== 'idle' && (
          <Badge variant="outline" className="font-mono flex items-center space-x-1">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>{defaultFormatTime(elapsed)}</span>
          </Badge>
        )}
      </div>

      <div className="flex gap-2">
        {state === 'idle' ? (
          <Button onClick={startRecording} className="flex-1" size="lg">
            <Play className="mr-2 h-5 w-5" aria-hidden="true" />
            Start Recording
          </Button>
        ) : (
          <>
            <Button
              onClick={state === 'recording' ? pauseRecording : resumeRecording}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              {state === 'recording' ? (
                <>
                  <Pause className="mr-2 h-5 w-5" aria-hidden="true" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" aria-hidden="true" />
                  Resume
                </>
              )}
            </Button>
            <Button onClick={stopRecording} variant="destructive" className="flex-1" size="lg">
              <Square className="mr-2 h-5 w-5" aria-hidden="true" />
              Stop
            </Button>
          </>
        )}
      </div>
    </div>
  )
}