import * as React from "react";
import ReactResizeDetector from "react-resize-detector";
import { JustifiedGalleryImage } from "./components/image";

export interface IJustifiedGalleryRowProps {
  recalculatedRow: IJustifiedGalleryCellProps[];
  hasFreeSpace: boolean;
  height: number;
  prevRowsHeight: number;
  width: number;
  columnCount: number;
  id: string;
}

export interface IJustifiedGalleryProps {
  data: IJustifiedGalleryRowProps[];
  viewportWidth: number;
}

export interface IJustifiedGalleryCellProps {
  id: string;
  width: number;
  height: number;
  widthInPercent: number;
  placeholderHeightInPercent: number;
  isLastCell: boolean;
  originalWidth: number;
  originalHeight: number;
  src: string;
  alt?: string;
}

const cellRenderer = (cell: IJustifiedGalleryCellProps) => {
  return (
    <div
      className="justified-gallery__cell"
      style={{
        width: `${cell.widthInPercent}%`,
        margin: cell.isLastCell ? `0 0 0.7% 0` : `0 0.7% 0.7% 0`
      }}
      key={cell.id}
    >
      <JustifiedGalleryImage src={cell.src} alt={cell.alt} />
      <div
        style={{
          paddingTop: `${cell.placeholderHeightInPercent}%`,
          backgroundColor: `rgb(240, 240, 240)`
        }}
      />
    </div>
  );
};

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
  rowHeight: (index: number) => number,
  screenSize: number,
  viewportSize: number
) => {
  const viewportAspectRatio = screenSize / viewportSize;
  return viewportAspectRatio * rowHeight(index);
};

const VirtualizedGrid = props => {
  const {
    numItems,
    rowHeight,
    renderItem,
    areaHeight,
    screenWidth,
    viewportWidth,
    prevRowsHeight
  } = props;
  const [scrollTop, setScrollTop] = React.useState(0);
  const items = [];
  for (let i = 0; i < numItems; i++) {
    const prevHeight = calculatePrevHeightWithGutters(
      i,
      prevRowsHeight(i),
      0.7,
      viewportWidth,
      screenWidth
    );
    const needRender =
      scrollTop <
        prevHeight +
          calculateRowHeight(i, rowHeight, screenWidth, viewportWidth) &&
      prevHeight - 1 < scrollTop + areaHeight;
    if (needRender) {
      items.push(
        renderItem({
          index: i,
          style: {
            position: "absolute",
            top: `${prevHeight}px`,
            width: "100%"
          }
        })
      );
    }
  }

  const onScroll = e => setScrollTop(e.currentTarget.scrollTop);

  return (
    <div className="scroll" style={{ overflowY: "scroll" }} onScroll={onScroll}>
      <div
        className="inner"
        style={{ position: "relative", height: `${areaHeight}px` }}
      >
        {items}
      </div>
    </div>
  );
};

// todo: перейти на FC-компонент
export class JustifiedGallery extends React.PureComponent<IJustifiedGalleryProps> {
  public render() {
    const { data, viewportWidth } = this.props;
    return (
      <ReactResizeDetector handleWidth>
        {({ width }) => (
          <div className="justified-gallery">
            <VirtualizedGrid
              numItems={data.length}
              rowHeight={index => data[index].height}
              prevRowsHeight={index => data[index].prevRowsHeight}
              areaHeight={400}
              screenWidth={width}
              viewportWidth={viewportWidth}
              renderItem={({ index, style }) => {
                return (
                  <div style={style}>
                    {data[index].recalculatedRow.map(cell =>
                      cellRenderer(cell)
                    )}
                  </div>
                );
              }}
            />
          </div>
        )}
      </ReactResizeDetector>
    );
  }
}
