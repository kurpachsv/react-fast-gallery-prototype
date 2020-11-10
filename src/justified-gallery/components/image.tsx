import * as React from 'react'

export interface IJustifiedGalleryImageProps {
  src: string
  alt?: string
}

export const JustifiedGalleryImage: React.FC<IJustifiedGalleryImageProps> = (
  props
) => {
  const { src, alt } = props
  return <img className="justified-gallery__image" src={src} alt={alt} />
}

JustifiedGalleryImage.defaultProps = {
  alt: '',
}

JustifiedGalleryImage.displayName = 'JustifiedGalleryImage'
