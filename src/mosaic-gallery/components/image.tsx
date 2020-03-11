import * as React from "react";

export interface IMosaicGalleryImageProps {
  src: string;
  alt?: string;
}

export const MosaicGalleryImage: React.FC<IMosaicGalleryImageProps> = props => {
  const { src, alt } = props;
  return <img className="mosaic-gallery__image" src={src} alt={alt} />;
};

MosaicGalleryImage.defaultProps = {
  alt: "MosaicGalleryImage"
};

MosaicGalleryImage.displayName = "MosaicGalleryImage";
