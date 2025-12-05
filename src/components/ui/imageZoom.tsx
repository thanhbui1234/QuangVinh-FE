'use client'
import { ImageZoom } from '@/components/ui/shadcn-io/image-zoom'
const ImageZoomComponent = ({ src }: { src: any }) => (
  <ImageZoom>
    <img alt="Placeholder image" className="h-auto w-96" height={800} src={src} width={1200} />
  </ImageZoom>
)
export default ImageZoomComponent
