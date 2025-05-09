import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSuiAmount(amount: number, precision = 2) {
  return (amount / 1e9).toFixed(precision) + " SUI"
}

export function formatCaptAmount(amount: number, precision = 2) {
  return (amount / 1e6).toFixed(precision) + " CAPT"
}


export function formatBps(bps: number) {
  return (bps / 100).toFixed(2) + "%"
}

export function mistToSUI(mist: number) {
  return (mist / 1e9).toFixed(2)
}

export function formatAddress(address: string) {
  return `${address.slice(0, 5)}...${address.slice(-5)}`
}

/**
 * Convert a 256-bit unsigned integer (decimal) into a 43-char Base64URL string.
 *
 * @param dec - The U256 value, either as a decimal string or a BigInt.
 * @returns The URL-safe Base64 representation (no padding).
 */
export function u256ToBase64Url(dec: string | bigint): string {
  // 1) Make sure we have a BigInt
  const n: bigint = typeof dec === "string" ? BigInt(dec) : dec;

  // 2) Turn it into a hex string, padded to exactly 64 hex chars (32 bytes)
  let hex = n.toString(16);
  if (hex.length > 64) {
    throw new Error("Value exceeds 256 bits");
  }
  hex = hex.padStart(64, "0");

  // 3) Build a Buffer (Node.js) from that hex
  const buf = Buffer.from(hex, "hex"); // length will be 32

  // 4) Reverse for little-endian
  buf.reverse();

  // 5) Standard Base64, then make it URL-safe and strip '='
  const b64 = buf.toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");


  return b64;
}


export function generateObjectLink(address: string) {
  const ENV = (process.env.NEXT_PUBLIC_NETWORK as "mainnet" | "devnet" | "testnet" | "localnet");
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