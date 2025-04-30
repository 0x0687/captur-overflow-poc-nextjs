"use client"
import React, {
    createContext,
    useState,
    useRef,
    useEffect,
    useContext,
    ReactNode,
} from 'react'
import { uploadSessionAction } from '@/app/actions';

// Define data shapes
export interface LocationPoint {
    timestamp: string
    latitude: number
    longitude: number
    accuracy: number
}

export interface Session {
    id: string
    timestamp: string
    locations: LocationPoint[]
    downloadUrl: string
    uploaded: boolean      // new flag
    blobId?: string        // returned id from Walrus
}

// Context value interface
interface LocationContextProps {
    isRecording: boolean
    isPaused: boolean
    locations: LocationPoint[]
    sessions: Session[]
    startRecording: () => void
    pauseRecording: () => void
    resumeRecording: () => void
    stopRecording: () => void
    uploadSession: (sessionId: string) => Promise<void>   // new action
}

// Create context
const LocationContext = createContext<LocationContextProps | undefined>(undefined)

// Provider component
export const LocationProvider = ({ children }: { children: ReactNode }) => {
    const [isRecording, setIsRecording] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [locations, setLocations] = useState<LocationPoint[]>([])
    const [sessions, setSessions] = useState<Session[]>([])
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [])

    // Grab a new geolocation point
    const recordPosition = () => {
        navigator.geolocation.getCurrentPosition(
            pos => {
                const { latitude, longitude, accuracy } = pos.coords
                const timestamp = new Date().toISOString()
                setLocations(prev => [...prev, { timestamp, latitude, longitude, accuracy }])
            },
            err => console.error('Error getting position:', err),
            { enableHighAccuracy: true },
        )
    }

    // Start recording loop
    const startInterval = () => {
        recordPosition()
        intervalRef.current = setInterval(recordPosition, 1000)
    }

    // Controls
    const startRecording = () => {
        if (!navigator.geolocation) {
            alert('Geolocation not supported')
            return
        }
        setLocations([])
        setIsRecording(true)
        setIsPaused(false)
        startInterval()
    }

    const pauseRecording = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
        setIsRecording(false)
        setIsPaused(true)
    }

    const resumeRecording = () => {
        setIsRecording(true)
        setIsPaused(false)
        startInterval()
    }

    const stopRecording = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
        setIsRecording(false)
        setIsPaused(false)

        const sessionData = JSON.stringify(locations, null, 2)
        const blob = new Blob([sessionData], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const sessionId = Date.now().toString()
        const sessionTimestamp = new Date().toISOString()

        setSessions(prev => [
            {
                id: sessionId,
                timestamp: sessionTimestamp,
                locations: [...locations],
                downloadUrl: url,
                uploaded: false,
                blobId: undefined,
            },
            ...prev,
        ])
    }

    // Upload session to Walrus
    const uploadSession = async (sessionId: string) => {
        const session = sessions.find(s => s.id === sessionId)
        if (!session) return
        try {
            // Fetch the blob back from the object URL
            const resp = await fetch(session.downloadUrl)
            const fileBlob = await resp.blob();

            const blobId = await uploadSessionAction(fileBlob);

            // Update session state
            setSessions(prev => prev.map(s =>
                s.id === sessionId
                    ? { ...s, uploaded: true, blobId: blobId }
                    : s
            ))
        } catch (error) {
            console.error('Upload error:', error)
            alert('Failed to upload session')
        }
    }

    return (
        <LocationContext.Provider
            value={{
                isRecording,
                isPaused,
                locations,
                sessions,
                startRecording,
                pauseRecording,
                resumeRecording,
                stopRecording,
                uploadSession,
            }}
        >
            {children}
        </LocationContext.Provider>
    )
}

export const useLocation = (): LocationContextProps => {
    const context = useContext(LocationContext)
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider')
    }
    return context
}
