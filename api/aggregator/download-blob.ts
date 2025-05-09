

export async function downloadBlob(blobId: string): Promise<Blob | undefined> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_AGGREGATOR_BASE_URL}/v1/blobs/${blobId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (response.status === 200) {
        return await response.blob();
    } else {
        console.error('Failed to download blob:', response.statusText);
        return undefined;
    }
}