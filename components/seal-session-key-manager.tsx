"use client"
import { CheckCircle, Key } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSealSession } from "./providers/seal-session-provider"
import { useCurrentAccount } from "@mysten/dapp-kit"

export default function SealSessionKeyManager() {
    const { initializeSession, initializing, sessionKey } = useSealSession()
    const currentAccount = useCurrentAccount()

    // Require wallet connection before showing session key management
    if (!currentAccount) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        Seal Session Key Manager
                    </CardTitle>
                    <CardDescription>Please connect your account first</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-sm text-muted-foreground">
                        Connect your wallet to manage session keys.
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Seal Session Key Manager
                </CardTitle>
                <CardDescription>Manage your session key initialization status</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="font-medium">Status</span>
                        <span
                            className={cn(
                                "text-sm",
                                sessionKey ? "text-green-600 dark:text-green-500" : "text-amber-600 dark:text-amber-500",
                            )}
                        >
                            {sessionKey ? "Active" : "Inactive"}
                        </span>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        {sessionKey ? (
                            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-500" />
                        ) : (
                            <Key className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                {!sessionKey && (
                    <Button className="w-full" onClick={initializeSession} disabled={initializing}>
                        {initializing ? "Initializing..." : "Initialize Session Key"}
                    </Button>
                )}
                {sessionKey && (
                    <div className="w-full text-center text-sm text-muted-foreground">
                        Session key has been successfully initialized
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}
