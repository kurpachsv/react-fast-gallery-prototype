import * as React from "react";
import ReactResizeDetector from "react-resize-detector";
import { JustifiedGalleryImage } from "./components/image";
import { getVisibleAreaData, calculatePrevHeightWithGutters } from "./utils";

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

const VirtualizedGrid = props => {
  const {
    numItems,
    rowHeight,
    renderItem,
    areaHeight,
    screenWidth,
    viewportWidth,
    prevRowsHeight,
    overScanRowCount,
    totalHeight
  } = props;
  const [scrollTop, setScrollTop] = React.useState(0);
  const items = [];
  for (let i = 0; i < numItems; i++) {
    const visibleAreaData = getVisibleAreaData(
      scrollTop,
      i,
      prevRowsHeight,
      rowHeight,
      viewportWidth,
      screenWidth,
      overScanRowCount,
      numItems,
      areaHeight
    );
    if (visibleAreaData.needRender) {
      items.push(
        renderItem({
          index: i,
          style: {
            position: "absolute",
            top: `${visibleAreaData.prevHeight}px`,
            width: "100%"
          }
        })
      );
    }
  }

  const onScroll = e => setScrollTop(e.currentTarget.scrollTop);

  return (
    <div
      className="scroll"
      style={{ overflowY: "overlay", height: `${areaHeight}px` }}
      onScroll={onScroll}
    >
      <div
        className="inner"
        style={{
          position: "relative",
          height: `${totalHeight}px`
        }}
      >
        {items}
      </div>
    </div>
  );
};

// todo: перейти на FC-компонент
export class JustifiedGallery extends React.PureComponent<
  IJustifiedGalleryProps
> {
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
                  <div style={style} key={data[index].id}>
                    {data[index].recalculatedRow.map(cell =>
                      cellRenderer(cell)
                    )}
                  </div>
                );
              }}
              overScanRowCount={2}
              totalHeight={calculatePrevHeightWithGutters(
                data.length - 1,
                data[data.length - 1].prevRowsHeight,
                0.7,
                viewportWidth,
                width
              )}
            />
          </div>
        )}
      </ReactResizeDetector>
    );
  }
}
