import * as React from "react";
import { JustifiedGallery } from "./justified-gallery/index";

import images from "../__mocks__/justified";
import JustifiedEngine from "./../packages/justified-engine";

const VIEWPORT_WIDTH = 1000;

const engine = new JustifiedEngine();
const data = engine.calculateGallery(images, VIEWPORT_WIDTH);

export const App = () => (
  <JustifiedGallery data={data} viewportWidth={VIEWPORT_WIDTH} />
);
