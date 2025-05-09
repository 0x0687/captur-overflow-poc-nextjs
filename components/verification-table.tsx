"use client"

import React, { useEffect, useState } from "react"
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
import { BlobSubmissionDto, fetchDataPointsByIds, getRecentlyAddedDataPoints } from "@/api/queries/data-points"
import { formatAddress, u256ToBase64Url } from "@/lib/utils"
import { DataPointModel } from "@/api/models/captur-models"
import { useBlobPopup } from "./providers/blob-popup-provider"
import { useCurrentAccount, useSignTransaction } from "@mysten/dapp-kit"
import { useAdminContext } from "./providers/admin-context-provider"
import { buildApproveDataTransaction, buildDecryptUnprocessedBlobUsingSealTx, executeAndWaitForTransactionBlock } from "@/app/actions"
import { Transaction } from "@mysten/sui/transactions"
import { toast } from "sonner"
import { handleError } from "@/lib/error-messages"
import { useBalance } from "./providers/balance-provider"
import { useSealSession } from "./providers/seal-session-provider"
import { EncryptedObject } from "@mysten/seal"
import { currentPackageId } from "@/api/constants"
import { downloadBlob } from "@/api/aggregator/download-blob"
import { getClientSealClient } from "@/api/seal-client."
import { fromHex } from "@mysten/bcs"

interface CombinedSubmission {
    submission: BlobSubmissionDto;
    dataPoint: DataPointModel;
}

export function VerificationTable() {
    const [combined, setCombined] = useState<CombinedSubmission[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isReading, setIsReading] = useState(false);
    const { openBlobPopup } = useBlobPopup();
    const currentAccount = useCurrentAccount();
    const { processingCap } = useAdminContext();
    const { mutate: signTransaction } = useSignTransaction();
    const { updateBalance } = useBalance();
    const { sessionKey } = useSealSession();

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
            if (!processingCap) {
                console.error("Admin cap not found");
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
            const txBytes = await buildDecryptUnprocessedBlobUsingSealTx(
                sealId,
                processingCap.id.id,
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
            const submissions = await getRecentlyAddedDataPoints();

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

            // Filter out the ones that are already processed
            const filtered = merged.filter(c => c.dataPoint.status === "New");

            setCombined(filtered);
        } catch (err) {
            console.error("Failed to load submissions + dataPoints", err);
        }
    }

    useEffect(() => {
        loadAll();
    }, []);

    const handleApprove = async (capture_id: string) => {
        try {
            setIsSubmitting(true);
            const instanceId = process.env.NEXT_PUBLIC_CAPTUR_OBJECT_ID;
            if (!instanceId) {
                console.error("Instance ID not found in environment variables");
                return;
            }
            if (!currentAccount?.address) {
                console.error("Account not found");
                return;
            }

            if (!processingCap) {
                console.error("Admin cap not found");
                return;
            }

            if (!capture_id) {
                console.error("Age range or gender not set");
                return;
            }

            // TODO: calculate value based on the number of seconds
            const value = 1e6;

            const bytes = await buildApproveDataTransaction(
                currentAccount.address,
                instanceId,
                processingCap.id.id,
                capture_id,
                value
            )

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
                                loadAll(); // Reload the data points after approval
                                updateBalance(); // Update the balance after approval
                            })
                            .catch((error) => {
                                console.error("Transaction failed", error);
                                handleError(error, s => toast.error("Transaction failed: " + s));
                            });
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
            console.error("Error approving data:", errorMsg);
            handleError(errorMsg, s => toast.error("Transaction failed: " + s));
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!combined.length) {
        return (
            <div className="text-center py-8">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                    No data points found
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    There are no recent data submissions.
                </p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Capture ID</TableHead>
                        <TableHead className="hidden md:table-cell">Sender</TableHead>
                        <TableHead className="hidden md:table-cell">Timestamp</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {combined.map((c) => {
                        const { digest, timestamp, event } = c.submission
                        const { status, blob, sender } = c.dataPoint;
                        const link = generateObjectLink(event.capture_id)
                        const encoded = u256ToBase64Url(blob.fields.blob_id);
                        console.log(encoded);

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
                                    {formatAddress(sender)}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {new Date(timestamp).toLocaleString()}
                                </TableCell>
                                <TableCell>{status}</TableCell>
                                <TableCell className="flex items-center space-x-2">
                                    {status === "New" && (
                                        <>
                                            <Button size="sm" disabled={isSubmitting} onClick={() => handleApprove(event.capture_id)}>
                                                Approve
                                            </Button>
                                        </>
                                    )}
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
                                        disabled={isReading || !sessionKey || !processingCap}
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
