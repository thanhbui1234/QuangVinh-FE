'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { PhotoPreview } from '../ui/PhotoPreview'
export const ShowFileTask = ({ files }: { files: string[] }) => {
  const [imageMap, setImageMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    files.forEach((url) => {
      const img = new Image()
      img.src = url

      img.onload = () => {
        setImageMap((prev) => ({ ...prev, [url]: true }))
      }

      img.onerror = () => {
        setImageMap((prev) => ({ ...prev, [url]: false }))
      }
    })
  }, [files])

  const getFileName = (url: string) => url.split('/').pop() || 'file'
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
      {files.map((url, index) => {
        const isImage = imageMap[url]
        const fileName = getFileName(url)

        return (
          <Card
            key={index}
            className="group overflow-hidden border bg-background shadow-sm hover:shadow-md transition"
          >
            <CardContent className="p-0">
              {isImage ? (
                <div className="w-full h-40 overflow-hidden">
                  <PhotoPreview src={url}>
                    <img
                      src={url}
                      alt={fileName}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </PhotoPreview>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 bg-muted">
                  <span className="text-5xl">📄</span>
                  <p className="text-xs mt-2 text-center px-2 line-clamp-2">{fileName}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
