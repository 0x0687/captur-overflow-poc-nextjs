"use client"

import { useEffect, useMemo, useState } from "react"
import { BadgeCheck, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCaptur } from "./providers/captur-context-provider"
import { formatCaptAmount } from "@/lib/utils"
import { SubscriptionModel } from "@/api/models/captur-models"
import { useCurrentAccount, useSignTransaction } from "@mysten/dapp-kit"
import { fetchSubscription } from "@/api/queries/subscription"
import { getCurrentEpoch } from "@/api/queries/epoch"
import { useBalance } from "./providers/balance-provider"
import { buildSubscribeTransaction, executeAndWaitForTransactionBlock } from "@/app/actions"
import { Transaction } from "@mysten/sui/transactions"
import { toast } from "sonner"


export default function SubscriptionCard() {
    const [epochs, setEpochs] = useState<number>(1)
    const [loading, setLoading] = useState<boolean>(false)
    const { captur } = useCaptur();
    const [currentEpoch, setCurrentEpoch] = useState<number | undefined>(undefined);
    const [subscription, setSubscription] = useState<SubscriptionModel | undefined>(undefined);
    const currentAccount = useCurrentAccount();
    const { coins, updateBalance } = useBalance();
    const { mutate: signTransaction } = useSignTransaction()

    const updateSubscription = async () => {
        if (!currentAccount) {
            console.log("Account not found")
            return
        }
        if (!captur?.state) {
            console.log("Captur state not found")
            return
        }
        const tableId = captur.state.fields.subscriptions.fields.id.id;
        const subscription = await fetchSubscription(tableId, currentAccount.address)
        setSubscription(subscription)
    }

    const updateCurrentEpoch = async () => {
        const currentEpoch = await getCurrentEpoch();
        setCurrentEpoch(currentEpoch)
    }

    useEffect(() => {
        console.log("captur: ", captur);
        updateSubscription()
    }, [captur, currentAccount])

    useEffect(() => {
        updateCurrentEpoch()
    }, [])

    const isSubscriptionActive = useMemo(() => {
        if (!subscription) return false
        if (!currentEpoch) return false
        return subscription.end_epoch >= currentEpoch
    }, [subscription, currentEpoch])


    async function handleExtendSubscription() {
        try {
            setLoading(true);
            const captureInstanceId = process.env.NEXT_PUBLIC_CAPTUR_OBJECT_ID;
            if (!captureInstanceId) {
                console.error("Capture instance ID not found");
                return;
            }

            const pricePerEpoch = captur?.price_per_epoch ?? 0;
            if (!pricePerEpoch) {
                console.error("Price per epoch not found");
                return;
            }

            const coinIds = coins?.map(coin => coin.coinObjectId) ?? [];
            if (coinIds.length === 0) {
                console.error("No coins found for payment");
                return;
            }
            console.log("Coin IDs:", coinIds)

            if (!currentAccount?.address) {
                console.error("Account not found");
                return;
            }

            if (!epochs) {
                console.error("Epochs not valid");
                return;
            }

            const totalPrice = pricePerEpoch * epochs;
            console.log("Total price:", totalPrice)

            const bytes = await buildSubscribeTransaction(
                currentAccount.address,
                captureInstanceId,
                totalPrice,
                coinIds
            );

            if (!bytes) {
                console.error("Transaction bytes not found");
                return;
            }


            const tx = Transaction.from(bytes);

            signTransaction(
                { transaction: tx },
                {
                    onSuccess: (result) => {
                        executeAndWaitForTransactionBlock(result.bytes, result.signature)
                            .then(() => {
                                toast.success("Transaction submitted successfully");
                                updateSubscription(); // Reload the blobs after submission
                                updateBalance(); // Reload the balance after submission
                            })
                            .catch((error) => {
                                console.error("Transaction failed", error);
                                toast.error("Transaction failed");
                            })
                            .finally(() => {
                            }
                            );
                    },
                    onError: (error) => {
                        console.error("Error signing transaction:", error);
                        toast.error("Error signing transaction");
                    },
                }
            );
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : "An unknown error occurred"
            console.error("Error extending subscription:", errorMsg);
            toast.error("Error extending subscription: " + errorMsg);
        }
        finally {
            setLoading(false);
        }

    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">Subscription</CardTitle>
                    {isSubscriptionActive ? (
                        <Badge className="bg-green-500 hover:bg-green-600">
                            <BadgeCheck className="mr-1 h-3 w-3" />
                            Active
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
                            <span>Expires on Epoch {subscription?.end_epoch ?? 0}</span>
                        </div>
                    </div>
                )}

                <div className="rounded-lg ">
                    <div className="flex items-center text-sm ">
                        <span>Price per epoch: {formatCaptAmount(captur?.price_per_epoch ?? 0)}</span>
                    </div>
                    <div className="flex items-center text-sm ">
                        <span>Current epoch: {currentEpoch}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="epochs">Extend subscription</Label>
                    <div className="flex space-x-2">
                        <Input
                            id="epochs"
                            type="number"
                            min="1"
                            value={epochs}
                            onChange={(e) => setEpochs(Number.parseInt(e.target.value) || 1)}
                            placeholder="Number of epochs"
                        />
                        <Button onClick={handleExtendSubscription} disabled={loading}>
                            {loading ? "Processing..." : isSubscriptionActive ? "Extend" : "Activate"}
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
