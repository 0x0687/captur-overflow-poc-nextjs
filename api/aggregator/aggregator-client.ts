// src/lib/api.ts
import { AggregatorClient } from './AggregatorClient'

// a single shared client for browser code
export const aggregatorClient = new AggregatorClient({
  BASE: process.env.NEXT_PUBLIC_AGGREGATOR_BASE_URL
})
