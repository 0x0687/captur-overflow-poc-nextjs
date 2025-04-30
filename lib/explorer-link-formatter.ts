const ENV = (process.env.NEXT_PUBLIC_NETWORK as "mainnet" | "devnet" | "testnet" | "localnet");


export function generateObjectLink(address: string) {
    if (ENV == "localnet") {
        return `https://custom.suiscan.xyz/custom/object/${address}?network=http%3A%2F%2F127.0.0.1%3A9000`;
    }
    if (ENV == "mainnet") {
        return `https://suiscan.xyz/mainnet/object/${address}`;
    }
    if (ENV == "devnet") {
        return `https://suiscan.xyz/devnet/object/${address}`;
    }
    if (ENV == "testnet") {
        return `https://suiscan.xyz/testnet/object/${address}`;
    }
    console.error("Invalid network");
    return "";
}

export function generateTxLink(digest: string) {
    if (ENV == "localnet") {
        return `https://custom.suiscan.xyz/custom/tx/${digest}?network=http%3A%2F%2F127.0.0.1%3A9000`;
    }
    if (ENV == "mainnet") {
        return `https://suiscan.xyz/mainnet/tx/${digest}`;
    }
    if (ENV == "devnet") {
        return `https://suiscan.xyz/devnet/tx/${digest}`;
    }
    if (ENV == "testnet") {
        return `https://suiscan.xyz/testnet/tx/${digest}`;
    }
    console.error("Invalid network");
    return "";
}