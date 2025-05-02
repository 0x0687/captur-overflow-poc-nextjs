"use client"

import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { getOwnedBlobs } from '@/api/queries/blob'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { BlobModel } from '@/api/models/shared-models'
import { u256ToBase64Url } from '@/lib/utils'
import { useLocation } from './providers/location-context-provider'
import { aggregatorClient } from '@/api/aggregator/aggregator-client'

const ENV = (process.env.NEXT_PUBLIC_NETWORK as "mainnet" | "devnet" | "testnet" | "localnet");

export function formatAddress(address: string) {
    return `${address.slice(0, 5)}...${address.slice(-5)}`
}

export function generateObjectLink(address: string) {
    if (ENV === "localnet") {
        return `https://custom.suiscan.xyz/custom/object/${address}?network=http%3A%2F%2F127.0.0.1%3A9000`;
    }
    if (ENV === "mainnet") {
        return `https://suiscan.xyz/mainnet/object/${address}`;
    }
    if (ENV === "devnet") {
        return `https://suiscan.xyz/devnet/object/${address}`;
    }
    if (ENV === "testnet") {
        return `https://suiscan.xyz/testnet/object/${address}`;
    }
    console.error("Invalid network");
    return "";
}

export function BlobsTable() {
    const currentAccount = useCurrentAccount()
    const address = currentAccount?.address || "";
    const { sessions } = useLocation();
    const [blobs, setBlobs] = useState<BlobModel[]>([])

    const fetchBlobs = React.useCallback(async () => {
        console.log("Fetching blobs for address:", address)
        if (!address) return
        const owned = await getOwnedBlobs(address)
        setBlobs(owned)
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

    const downloadBlob = async (blobId: string) => {
        const response = await aggregatorClient.routes.getBlob({
            blobId: blobId,
        });

        // wrap it in a Blob
        const blob = new Blob([response], { type: "application/octet-stream" });

        // create a download link and click it
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = blobId + ".json"; // or whatever you want to name the file
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
                                        disabled
                                        onClick={() => {
                                            // TODO: implement submit logic
                                        }}
                                    >
                                        Submit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            downloadBlob(encoded)
                                        }}
                                    >
                                        Download
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
