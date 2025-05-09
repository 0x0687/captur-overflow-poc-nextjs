"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { DataPopup } from "../blob-popup"

type BlobPopupContextType = {
  openBlobPopup: (data: string) => void
  closeBlobPopup: () => void
}

const BlobPopupContext = createContext<BlobPopupContextType | undefined>(undefined)

export function BlobPopupProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState<string>("")

  const openBlobPopup = (data: string) => {
    setData(data)
    setIsOpen(true)
  }

  const closeBlobPopup = () => {
    setIsOpen(false)
  }

  return (
    <BlobPopupContext.Provider value={{ openBlobPopup: openBlobPopup, closeBlobPopup: closeBlobPopup }}>
      {children}
      <DataPopup content={data} isOpen={isOpen} onClose={closeBlobPopup} />
    </BlobPopupContext.Provider>
  )
}

export function useBlobPopup() {
  const context = useContext(BlobPopupContext)
  if (context === undefined) {
    throw new Error("useBlobPopup must be used within a BlobPopupProvider")
  }
  return context
}
