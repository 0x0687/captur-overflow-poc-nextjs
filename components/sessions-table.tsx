"use client"

import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Check, Eye } from 'lucide-react'   // imported Check icon
import { Badge } from '@/components/ui/badge'
import { useLocation } from './providers/location-context-provider'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useBlobPopup } from './providers/blob-popup-provider'

// Utility to format seconds to HH:MM:SS
const formatTime = (sec: number) => {
  const hrs = Math.floor(sec / 3600)
  const mins = Math.floor((sec % 3600) / 60)
  const secs = sec % 60
  const hh = hrs.toString().padStart(2, '0')
  const mm = mins.toString().padStart(2, '0')
  const ss = secs.toString().padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

export function SessionsTable() {
  const { sessions, isRecording, isPaused, locations, stopRecording, uploadSession, isUploading } = useLocation()
  const hasOngoing = isRecording || isPaused
  const currentAccount = useCurrentAccount()
  const { openBlobPopup: openJsonPopup } = useBlobPopup();
  

  if (!hasOngoing && sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No recordings yet</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Start recording your location to see your sessions here.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead className="hidden md:table-cell">Data Points</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hasOngoing && (
            <TableRow key="ongoing">
              <TableCell>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="font-medium">Ongoing</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{formatTime(locations.length)}</span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="outline">{locations.length} pts</Badge>
              </TableCell>
              <TableCell className="flex items-center space-x-2">
                <Button variant="destructive" size="sm" onClick={stopRecording}>
                  Stop
                </Button>
              </TableCell>
            </TableRow>
          )}

          {sessions.map(session => (
            <TableRow key={session.id}>
              <TableCell>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{new Date(session.timestamp).toLocaleDateString()}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{formatTime(session.locations.length)}</span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="outline">{session.locations.length} pts</Badge>
              </TableCell>
              <TableCell className="flex items-center space-x-2">
                {/* Upload button or checkmark */}
                {session.uploaded ? (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Check className="h-4 w-4" />
                    <span>Uploaded to Walrus</span>
                  </Badge>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => uploadSession(session.id)}
                    disabled={!currentAccount || isUploading}
                  >
                    Upload
                  </Button>
                )}
                {/* View Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openJsonPopup(JSON.stringify(session.locations, null, 2))}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">View</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
