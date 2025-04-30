import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSuiAmount(amount: number, precision = 2) {
  return (amount / 1e9).toFixed(precision) + " SUI"
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