import * as React from "react";
import { MosaicGallery } from "./mosaic-gallery/index";

import images from "../__mocks__/mosaic";
import MosaicEngine from "./../packages/mosaic-engine";

const VIEWPORT_WIDTH = 1000;

const engine = new MosaicEngine();
const data = engine.calculateGallery(images, VIEWPORT_WIDTH);

export const App = () => (
  <MosaicGallery data={data} viewportWidth={VIEWPORT_WIDTH} />
);
