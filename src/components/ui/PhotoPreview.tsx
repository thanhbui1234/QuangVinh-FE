import { PhotoProvider, PhotoView } from 'react-photo-view'
import type { ReactElement } from 'react'

export const PhotoPreview = ({ src, children }: { src: string; children?: ReactElement }) => {
  return (
    <PhotoProvider>
      <PhotoView src={src}>{children}</PhotoView>
    </PhotoProvider>
  )
}
