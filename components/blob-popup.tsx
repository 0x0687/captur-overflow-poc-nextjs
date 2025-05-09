"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface DataPopupProps {
  content: string
  isOpen: boolean
  onClose: () => void
}

export function DataPopup({ content, isOpen, onClose }: DataPopupProps) {
  const [parsedData, setParsedData] = useState<unknown>(null)
  const [isJson, setIsJson] = useState(false)

  useEffect(() => {
    if (content) {
      try {
        const parsed = JSON.parse(content)
        setParsedData(parsed)
        setIsJson(true)
      } catch {
        setParsedData(null)
        setIsJson(false)
      }
    }
  }, [content])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Data Viewer</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <div className="overflow-auto max-h-[calc(90vh-8rem)]">
            <pre className="bg-muted p-4 rounded-md overflow-auto whitespace-pre-wrap break-words">
              {isJson
                ? <code>{JSON.stringify(parsedData, null, 2)}</code>
                : <code>{content}</code>
              }
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
