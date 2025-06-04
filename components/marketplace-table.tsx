"use client"

import React, { useEffect, useState, useCallback } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { generateObjectLink } from "@/lib/explorer-link-formatter"
import { BlobSubmissionDto, fetchDataPointsByIds, getRecentlyProcessedDataPoints } from "@/api/queries/data-points"
import { formatAddress, u256ToBase64Url } from "@/lib/utils"
import { DataPointModel, SubscriptionModel } from "@/api/models/captur-models"
import { useBlobPopup } from "./providers/blob-popup-provider"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { toast } from "sonner"
import { downloadBlob } from "@/api/aggregator/download-blob"
import { useSealSession } from "./providers/seal-session-provider"
import { fetchSubscription } from "@/api/queries/subscription"
import { EncryptedObject } from "@mysten/seal"
import { currentPackageId } from "@/api/constants"
import { getClientSealClient } from "@/api/seal-client."
import { buildDecryptProcessedBlobUsingSealTx } from "@/app/actions"
import { fromHex } from "@mysten/bcs"

interface CombinedSubmission {
    submission: BlobSubmissionDto;
    dataPoint: DataPointModel;
}

export function MarketplaceTable() {
    const [combined, setCombined] = useState<CombinedSubmission[]>([]);
    const [isReading, setIsReading] = useState(false);
    const [subscription, setSubscription] = useState<SubscriptionModel | null | undefined>(undefined)
    const currentAccount = useCurrentAccount()
    const { openBlobPopup } = useBlobPopup();
    const { sessionKey } = useSealSession();

    const updateSubscription = useCallback(async () => {
        if (!currentAccount) return
        try {
            const sub = await fetchSubscription(currentAccount.address)
            setSubscription(sub)
        } catch (err) {
            console.error("Failed to fetch subscription:", err)
            setSubscription(null)
        }
    }, [currentAccount])

    useEffect(() => {
        updateSubscription()
    }, [updateSubscription])

    const readBlob = async (blobId: string) => {
        setIsReading(true);
        const response = await downloadBlob(blobId);
        if (!response) {
            console.error("Failed to download blob");
            toast.error("Failed to download blob");
            setIsReading(false);
            return;
        }
        setIsReading(false);

        const bytes = await response.arrayBuffer();
        const text = new TextDecoder().decode(bytes)

        openBlobPopup(text);
    };

    const readAndDecryptBlob = async (blobId: string, dataPointId: string) => {
        try {
            setIsReading(true);

            if (!sessionKey) {
                console.error("Session key not found");
                return;
            }
            if (!subscription) {
                console.error("No subscription found");
                return;
            }

            const response = await downloadBlob(blobId);
            if (!response) {
                console.error("Failed to download blob");
                toast.error("Failed to download blob");
                setIsReading(false);
                return;
            }

            const bytes = await response.arrayBuffer();
            const byteArray = new Uint8Array(bytes);
            const encryptedObject = EncryptedObject.parse(byteArray);
            if (encryptedObject.packageId !== currentPackageId) {
                throw new Error("Encrypted object package ID does not match");
            }
            const sealId = fromHex(encryptedObject.id);
            const txBytes = await buildDecryptProcessedBlobUsingSealTx(
                sealId,
                subscription.id.id,
                dataPointId
            );
            const sealClient = getClientSealClient();
            const decryptedBytes = await sealClient.decrypt({
                data: byteArray,
                sessionKey,
                txBytes,
            });
            setIsReading(false);

            const decodedText = new TextDecoder().decode(decryptedBytes);
            openBlobPopup(decodedText);
        }
        catch (err) {
            console.error("Failed to decrypt blob:", err);
            toast.error("Failed to decrypt blob: " + blobId);
        }
        finally {
            setIsReading(false);
        }

    }

    const loadAll = async () => {
        try {
            // Fetch just the IDs
            const submissions = await getRecentlyProcessedDataPoints();

            // Pull out the IDs
            const ids = submissions.map(s => s.event.capture_id);

            // Fetch the full models in one go
            const fullPoints = await fetchDataPointsByIds(ids);

            // Zip them together into one array of “big” objects
            const merged: CombinedSubmission[] = submissions.map(sub => ({
                submission: sub,
                // find the matching full point by ID (or handle missing ones however you like)
                dataPoint: fullPoints.find(p => p.id.id === sub.event.capture_id)!
            }));

            setCombined(merged);
        } catch (err) {
            console.error("Failed to load submissions + dataPoints", err);
        }
    }

    useEffect(() => {
        loadAll();
    }, []);


    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Capture ID</TableHead>
                        <TableHead className="hidden md:table-cell">Timestamp</TableHead>
                        <TableHead className="hidden md:table-cell">Age Group</TableHead>
                        <TableHead className="hidden md:table-cell">Gender</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {combined.map((c) => {
                        const { digest, timestamp, event } = c.submission
                        const { blob, age_range, gender } = c.dataPoint;
                        const link = generateObjectLink(event.capture_id)
                        const encoded = u256ToBase64Url(blob.fields.blob_id);

                        return (
                            <TableRow key={digest}>
                                <TableCell>
                                    <a
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline"
                                    >
                                        {formatAddress(event.capture_id)}
                                    </a>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {new Date(timestamp).toLocaleString()}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {age_range}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {gender}
                                </TableCell>
                                <TableCell className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        disabled={isReading}
                                        size="sm"
                                        onClick={() => {
                                            readBlob(encoded)
                                        }}
                                    >
                                        Read
                                    </Button>
                                    <Button
                                        variant="outline"
                                        disabled={isReading || !sessionKey || !subscription}
                                        size="sm"
                                        onClick={() => {
                                            readAndDecryptBlob(encoded, event.capture_id)
                                        }}
                                    >
                                        Read and Decrypt
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
