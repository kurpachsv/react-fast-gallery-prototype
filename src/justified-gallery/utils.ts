// todo: перенести в engine
const calculatePrevHeightWithGutters = (
  index: number,
  prevHeight: number,
  gutterInPercent: number,
  viewportSize: number,
  screenSize: number
) => {
  const gutterInPx = (viewportSize * gutterInPercent) / 100;
  const viewportAspectRatio = screenSize / viewportSize;
  return viewportAspectRatio * (prevHeight + index * gutterInPx);
};

const calculateRowHeight = (
  index: number,
  numItems: number,
  rowHeight: (index: number) => number,
  screenSize: number,
  viewportSize: number
) => {
  if (index < 0 || index >= numItems) {
    return 0;
  }
  const viewportAspectRatio = screenSize / viewportSize;
  return viewportAspectRatio * rowHeight(index);
};

// todo: прикрутить мемоизацию, так как много вычислений, НЕ зависящих от scrollTop внутри scrollTop
const calculateOverScanHeights = (
  index: number,
  numItems: number,
  overScanRowCount: number,
  rowHeight: (index: number) => number,
  screenSize: number,
  viewportSize: number
) => {
  let underHeight = 0;
  let overHeight = 0;
  for (let i = index - overScanRowCount; i < index; i++) {
    underHeight += calculateRowHeight(
      i,
      numItems,
      rowHeight,
      screenSize,
      viewportSize
    );
  }
  for (let j = index + 1; j <= index + overScanRowCount; j++) {
    overHeight += calculateRowHeight(
      j,
      numItems,
      rowHeight,
      screenSize,
      viewportSize
    );
  }
  return {
    underHeight,
    overHeight
  };
};

export interface IVisibleAreaData {
  needRender: boolean;
  prevHeight: number;
}

export const getVisibleAreaData = (
  scrollTop: number,
  index: number,
  prevRowsHeight: (index: number) => number,
  rowHeight: (index: number) => number,
  viewportWidth: number,
  screenWidth: number,
  overScanRowCount: number,
  numItems: number,
  areaHeight: number
): IVisibleAreaData => {
  const prevHeight = calculatePrevHeightWithGutters(
    index,
    prevRowsHeight(index),
    0.7,
    viewportWidth,
    screenWidth
  );
  const overScanHeights = calculateOverScanHeights(
    index,
    numItems,
    overScanRowCount,
    rowHeight,
    screenWidth,
    viewportWidth
  );
  const currentRowHeight = calculateRowHeight(
    index,
    numItems,
    rowHeight,
    screenWidth,
    viewportWidth
  );
  return {
    needRender:
      // элементы выше, чем позиция мыши (scrollTop) - запас вниз (overScanHeights.underHeight)
      scrollTop - overScanHeights.underHeight < prevHeight + currentRowHeight &&
      // элементы ниже, чем позиция мыши (scrollTop) + запас вверх (overScanHeights.overHeight) + область просмотра (areaHeight)
      prevHeight < scrollTop + overScanHeights.overHeight + areaHeight + 1,
    prevHeight
  };
};
