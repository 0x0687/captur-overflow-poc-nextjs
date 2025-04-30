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

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Recording History</CardTitle>
            <CardDescription>View and manage past sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <SessionsTable />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}