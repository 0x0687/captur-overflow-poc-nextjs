"use client"

import React, { useEffect, useMemo, useState, useCallback } from "react"
import { BadgeCheck, Clock, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCaptur } from "./providers/captur-context-provider"
import { formatCaptAmount } from "@/lib/utils"
import { SubscriptionModel } from "@/api/models/captur-models"
import { useCurrentAccount, useSignTransaction } from "@mysten/dapp-kit"
import { fetchSubscription } from "@/api/queries/subscription"
import { getCurrentEpoch } from "@/api/queries/epoch"
import { useBalance } from "./providers/balance-provider"
import {
    buildExtendSubscriptionTransaction,
    buildNewSubscribeTransaction,
    executeAndWaitForTransactionBlock,
} from "@/app/actions"
import { Transaction } from "@mysten/sui/transactions"
import { toast } from "sonner"

export default function SubscriptionCard() {
    const [epochs, setEpochs] = useState<number>(1)
    const [actionLoading, setActionLoading] = useState<boolean>(false)

    const [subscription, setSubscription] = useState<SubscriptionModel | null | undefined>(undefined)
    const [currentEpoch, setCurrentEpoch] = useState<number | undefined>(undefined)

    const [isSubLoading, setIsSubLoading] = useState<boolean>(false)
    const [isEpochLoading, setIsEpochLoading] = useState<boolean>(false)

    const { captur } = useCaptur()
    const capturLoaded = captur !== undefined && captur !== null

    const currentAccount = useCurrentAccount()
    const { coins, updateBalance } = useBalance()
    const { mutate: signTransaction } = useSignTransaction()

    const updateSubscription = useCallback(async () => {
        if (!currentAccount) return
        setIsSubLoading(true)
        try {
            const sub = await fetchSubscription(currentAccount.address)
            setSubscription(sub)
        } catch (err) {
            console.error("Failed to fetch subscription:", err)
            setSubscription(null)
        } finally {
            setIsSubLoading(false)
        }
    }, [currentAccount])

    const updateEpoch = useCallback(async () => {
        setIsEpochLoading(true)
        try {
            const epoch = await getCurrentEpoch()
            setCurrentEpoch(epoch)
        } catch (err) {
            console.error("Failed to fetch current epoch:", err)
        } finally {
            setIsEpochLoading(false)
        }
    }, [])

    useEffect(() => {
        updateSubscription()
    }, [updateSubscription])

    useEffect(() => {
        updateEpoch()
    }, [updateEpoch])

    const isInitialLoading = isSubLoading || isEpochLoading || !capturLoaded

    const isSubscriptionActive = useMemo(() => {
        if (!subscription || !currentEpoch) return false
        return subscription.end_epoch >= currentEpoch
    }, [subscription, currentEpoch])

    async function handleExtendSubscription() {
        setActionLoading(true)
        try {
            // (original extend logic unchanged)
            if (subscription === undefined) throw new Error("Subscription not loaded")
            const captureInstanceId = process.env.NEXT_PUBLIC_CAPTUR_OBJECT_ID!
            const pricePerEpoch = captur!.price_per_epoch
            const coinIds = coins?.map((c) => c.coinObjectId) ?? []
            const totalPrice = pricePerEpoch * epochs
            const bytes = subscription
                ? await buildExtendSubscriptionTransaction(
                    currentAccount!.address,
                    captureInstanceId,
                    subscription.id.id,
                    totalPrice,
                    coinIds
                )
                : await buildNewSubscribeTransaction(
                    currentAccount!.address,
                    captureInstanceId,
                    totalPrice,
                    coinIds
                )
            const tx = Transaction.from(bytes!)
            signTransaction(
                { transaction: tx },
                {
                    onSuccess: (result) => {
                        executeAndWaitForTransactionBlock(result.bytes, result.signature)
                            .then(() => {
                                toast.success("Transaction submitted successfully")
                                updateSubscription()
                                updateBalance()
                            })
                            .catch((e) => {
                                console.error(e)
                                toast.error("Transaction failed")
                            })
                    },
                    onError: (err) => {
                        console.error(err)
                        toast.error("Error signing transaction")
                    },
                }
            )
        } catch (err) {
            console.error(err)
            toast.error(`Error: ${err instanceof Error ? err.message : String(err)}`)
        } finally {
            setActionLoading(false)
        }
    }

    // Show spinner on initial load
    if (isInitialLoading) {
        return (
            <Card className="w-full max-w-md">
                <CardContent className="flex items-center justify-center h-40">
                    <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">Subscription</CardTitle>
                    {isSubscriptionActive ? (
                        <Badge className="bg-green-500 hover:bg-green-600">
                            <BadgeCheck className="mr-1 h-3 w-3" /> Active
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-gray-500">
                            Inactive
                        </Badge>
                    )}
                </div>
                <CardDescription>Manage your subscription details</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {isSubscriptionActive && (
                    <div className="rounded-lg p-3 bg-muted">
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-2 h-4 w-4" />
                            <span>Expires on Epoch {subscription!.end_epoch}</span>
                        </div>
                    </div>
                )}

                <div className="rounded-lg">
                    <div className="flex items-center text-sm">
                        <span>Price per epoch: {formatCaptAmount(captur.price_per_epoch)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                        <span>Current epoch: {currentEpoch}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="epochs">Extend subscription</Label>
                    <div className="flex space-x-2">
                        <Input
                            id="epochs"
                            type="number"
                            min={1}
                            value={epochs}
                            onChange={(e) => setEpochs(Number(e.target.value) || 1)}
                            placeholder="Number of epochs"
                            disabled={actionLoading}
                        />
                        <Button onClick={handleExtendSubscription} disabled={actionLoading}>
                            {actionLoading
                                ? <Loader2 className="animate-spin h-4 w-4" />
                                : isSubscriptionActive ? 'Extend' : 'Activate'}
                        </Button>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="border-t px-6 py-3 font-semibold">
                {isSubscriptionActive
                    ? "Your subscription is currently active. You can extend it at any time."
                    : "Your subscription is inactive. Activate it to gain access."}
            </CardFooter>
        </Card>
    )
}