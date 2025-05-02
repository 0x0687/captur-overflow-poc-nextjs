// src/lib/api.ts
import { PublisherClient } from './PublisherClient'

// a single shared client for browser code
export const publisherClient = new PublisherClient({
  BASE: process.env.NEXT_PUBLIC_PUBLISHER_BASE_URL
})
