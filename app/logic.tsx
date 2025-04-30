"use client"
import { useState, useRef, useEffect } from 'react';

interface LocationPoint {
  timestamp: string;
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface Session {
  id: string;
  timestamp: string;
  locations: LocationPoint[];
  downloadUrl: string;
}

export default function LocationTracker() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const recordPosition = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const timestamp = new Date().toISOString();
        setLocations((prev) => [
          ...prev,
          { timestamp, latitude, longitude, accuracy },
        ]);
      },
      (err) => {
        console.error('Error getting position:', err);
      },
      { enableHighAccuracy: true }
    );
  };

  const startInterval = () => {
    // Immediately record once, then every 1 second
    recordPosition();
    intervalRef.current = setInterval(recordPosition, 1000);
  };

  const startRecording = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }
    // Reset state for new session
    setLocations([]);
    setIsRecording(true);
    setIsPaused(false);
    startInterval();
  };

  const pauseRecording = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRecording(false);
    setIsPaused(true);
  };

  const resumeRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    startInterval();
  };

  const stopRecording = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRecording(false);
    setIsPaused(false);

    // Create a downloadable JSON file for this session
    const sessionData = JSON.stringify(locations, null, 2);
    const blob = new Blob([sessionData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const sessionId = Date.now().toString();
    const sessionTimestamp = new Date().toISOString();

    // Add to list of finished sessions (most recent first)
    setSessions((prev) => [
      { id: sessionId, timestamp: sessionTimestamp, locations: [...locations], downloadUrl: url },
      ...prev,
    ]);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Location Tracker</h1>

      <div style={{ marginBottom: '1rem' }}>
        {!isRecording && !isPaused && (
          <button onClick={startRecording}>Start</button>
        )}
        {isRecording && (
          <>
            <button onClick={pauseRecording} style={{ marginRight: '0.5rem' }}>
              Pause
            </button>
            <button onClick={stopRecording}>Stop</button>
          </>
        )}
        {isPaused && (
          <>
            <button onClick={resumeRecording} style={{ marginRight: '0.5rem' }}>
              Resume
            </button>
            <button onClick={stopRecording}>Stop</button>
          </>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <p>Current Session Samples: {locations.length}</p>
      </div>

      <h2>Finished Sessions</h2>
      {sessions.length === 0 ? (
        <p>No sessions recorded yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Date</th>
              <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Samples</th>
              <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Download</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id}>
                <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
                  {new Date(session.timestamp).toLocaleString()}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
                  {session.locations.length}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
                  <a
                    href={session.downloadUrl}
                    download={`locations-${session.id}.json`}
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
