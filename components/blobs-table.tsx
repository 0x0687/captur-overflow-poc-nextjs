"use client"

import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { getOwnedBlobs } from '@/api/queries/blob'
import { useCurrentAccount, useSignTransaction } from '@mysten/dapp-kit'
import { BlobModel } from '@/api/models/shared-models'
import { formatAddress, generateObjectLink, u256ToBase64Url } from '@/lib/utils'
import { useLocation } from './providers/location-context-provider'
import { buildSubmitDataTransaction, executeAndWaitForTransactionBlock } from '@/app/actions'
import { useLocationTrackerSettings } from './providers/tracker-settings-provider'
import { Transaction } from '@mysten/sui/transactions'
import { toast } from 'sonner'
import { useBlobPopup } from './providers/blob-popup-provider'
import { getCurrentWalrusEpoch } from '@/api/queries/epoch'
import { downloadBlob } from '@/api/aggregator/download-blob'


export function BlobsTable() {
    const currentAccount = useCurrentAccount()
    const address = currentAccount?.address || "";
    const { sessions } = useLocation();
    const [blobs, setBlobs] = useState<BlobModel[]>([])
    const [isReading, setIsReading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { ageRange, gender } = useLocationTrackerSettings();
    const { mutate: signTransaction } = useSignTransaction();
    const { openBlobPopup: openJsonPopup } = useBlobPopup();

    const fetchBlobs = React.useCallback(async () => {
        console.log("Fetching blobs for address:", address)
        if (!address) return
        const owned = await getOwnedBlobs(address)
        const currentEpoch = await getCurrentWalrusEpoch();
        // Filter out the blobs from another epoch
        const filtered = owned.filter(blob => {
            return blob.registered_epoch === currentEpoch
        })
        setBlobs(filtered)
    }, [address])

    // run on mount, on account change, and *whenever sessions change*
    useEffect(() => {
        fetchBlobs()
    }, [fetchBlobs, sessions])

    if (!currentAccount) {
        return (
            <div className="text-center py-8">
                <p className="text-sm text-gray-500">Connect your wallet to view blobs.</p>
            </div>
        )
    }

    if (blobs.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-sm font-medium text-gray-900 dark:text-white">No blobs found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">You don’t own any blobs yet.</p>
            </div>
        )
    }

    // Deposit submission handler
    async function handleSubmitBlob(blobId: string) {
        try {
            setIsSubmitting(true);
            
            if (!address) {
                console.error("Account not found");
                return;
            }

            if (!ageRange || !gender) {
                console.error("Age range or gender not set");
                return;
            }

            const bytes = await buildSubmitDataTransaction(
                address,
                blobId,
                ageRange,
                gender
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
                                fetchBlobs(); // Reload the blobs after submission
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
            console.error("Error submitting blob:", errorMsg);
            toast.error("Error submitting blob: " + errorMsg);
        }
        finally {
            setIsSubmitting(false);
        }

    }

    // const downloadBlob = async (blobId: string) => {
    //     const response = await aggregatorClient.routes.getBlob({
    //         blobId: blobId,
    //     });

    //     // wrap it in a Blob
    //     const blob = new Blob([response], { type: "application/octet-stream" });

    //     // create a download link and click it
    //     const url = URL.createObjectURL(blob);
    //     const a = document.createElement("a");
    //     a.href = url;
    //     a.download = blobId + ".json"; // or whatever you want to name the file
    //     document.body.appendChild(a);
    //     a.click();
    //     document.body.removeChild(a);
    //     URL.revokeObjectURL(url);
    // };

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
        openJsonPopup(text);
    };

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Address</TableHead>
                        <TableHead className="hidden md:table-cell">Epoch</TableHead>
                        <TableHead>Blob ID (Base64)</TableHead>
                        <TableHead className="hidden md:table-cell">Size (bytes)</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {blobs.map((blob) => {
                        const encoded = u256ToBase64Url(blob.blob_id);
                        const link = generateObjectLink(blob.id.id)

                        return (
                            <TableRow key={blob.id.id}>
                                <TableCell>
                                    <a
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline"
                                    >
                                        {formatAddress(blob.id.id)}
                                    </a>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{blob.registered_epoch}</TableCell>
                                <TableCell className="break-all">{encoded}</TableCell>
                                <TableCell className="hidden md:table-cell">{blob.size.toString()}</TableCell>
                                <TableCell className="flex items-center space-x-2">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        disabled={!address || !ageRange || !gender || isSubmitting}
                                        onClick={() => {
                                            handleSubmitBlob(blob.id.id)
                                        }}
                                    >
                                        Submit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={isReading}
                                        onClick={() => {
                                            readBlob(encoded)
                                        }}
                                    >
                                        Read
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
