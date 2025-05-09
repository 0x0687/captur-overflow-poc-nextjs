import { BlobsTable } from "@/components/blobs-table"
import LocationTrackerSettings from "@/components/location-tracker-settings"
import { RecordingControls } from "@/components/recording-controls"
import { SessionsTable } from "@/components/sessions-table"
import { StatusIndicator } from "@/components/status-indicator"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function LocationTrackerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Location Tracker</h1>
        <p className="text-muted-foreground">Record and manage your location sessions</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Settings Card */}
        <LocationTrackerSettings />
        {/* Controls Card */}
        <Card className="col-span-full lg:col-span-1">
          <CardHeader>
            <CardTitle>Recording Controls</CardTitle>
            <CardDescription>Start, stop, and monitor recording status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusIndicator />
            <RecordingControls />
          </CardContent>
        </Card>

        {/* History Card */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Sessions In Memory</CardTitle>
            <CardDescription>View and upload the sessions that are currently residing in memory.</CardDescription>
          </CardHeader>
          <CardContent>
            <SessionsTable />
          </CardContent>
        </Card>

        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Recent Walrus Blobs</CardTitle>
            <CardDescription>View recent walrus blobs for which you are the owner.</CardDescription>
          </CardHeader>
          <CardContent>
            <BlobsTable />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}