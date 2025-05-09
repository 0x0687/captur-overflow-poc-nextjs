"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { MarketplaceTable } from "@/components/marketplace-table"
import SubscriptionCard from "@/components/subscription-card"

export default function MarketplacePage() {

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
                <p className="text-muted-foreground">
                    Buy a subscription to get access to data points from other users.
                </p>
            </header>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Subscription Card */}
                <SubscriptionCard />
                <Card className="col-span-full">
                    <CardHeader>
                        <CardTitle>Data Points</CardTitle>
                        <CardDescription>
                            View data points that are available for subscribed users.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MarketplaceTable />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
