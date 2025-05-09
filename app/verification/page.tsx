"use client"
import { VerificationTable } from "@/components/verification-table"
import { useIsAdmin } from "@/components/providers/admin-context-provider"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import SealSessionKeyManager from "@/components/seal-session-key-manager"

export default function VerificationPage() {
    const isAdmin = useIsAdmin()

    if (!isAdmin) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Verifications can only be done by Captur admins.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Verifications</h1>
                <p className="text-muted-foreground">
                    Approve or reject data points submitted by users.
                </p>
            </header>


            <div className="grid gap-8 md:grid-cols-2">
                <SealSessionKeyManager />

                <Card className="col-span-full">
                    <CardHeader>
                        <CardTitle>Recent Data Points</CardTitle>
                        <CardDescription>
                            View recently submitted data points for verification.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <VerificationTable />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
