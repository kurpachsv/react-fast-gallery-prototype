const nanoid = require("nanoid");

class MosaicEngine {
  /* Get min height of row  */
  getRowMinHeight(items) {
    return Math.min.apply(
      null,
      items.map(item => item.height)
    );
  }

  /* Get total width for row */
  getRowTotalWidth(row) {
    return row.map(item => item.width).reduce((a, b) => a + b, 0);
  }

  /* Resize item by height */
  resizeByHeight(item, newHeight) {
    const { width, height, ...rest } = item;
    const aspectRatio = width / height;
    return {
      ...rest,
      width: aspectRatio * newHeight,
      height: newHeight,
      originalWidth: item.width,
      originalHeight: item.height
    };
  }

  /* Recalculate new row sizes */
  recalculateRow(row, viewportWidth, hasFreeSpace) {
    // todo: тяжело читается метод -- надо разбить на 2-3
    const minHeight = this.getRowMinHeight(row);
    const heightWithGutter =
      (minHeight * (100 - (row.length - 1) * 0.7)) /* 0.7 is gutter in % */ /
      100;
    const items = row.map(item => this.resizeByHeight(item, minHeight));
    const totalWidth = this.getRowTotalWidth(items);
    const newRowHeight = (heightWithGutter * viewportWidth) / totalWidth;
    return items.map((item, index) => {
      const cell = this.resizeByHeight(item, newRowHeight);
      const widthInPercent =
        (100 * (hasFreeSpace ? cell.originalWidth : cell.width)) /
        viewportWidth;
      const placeholderHeightInPercent = (100 * cell.height) / cell.width;
      const isLastCell = row.length === index + 1;
      return {
        ...cell,
        id: nanoid(),
        widthInPercent,
        placeholderHeightInPercent,
        isLastCell
      };
    });
  }

  /* Calculate mosaic row sizes */
  calculateRow(items, viewportWidth) {
    const row = [];
    let totalRowWidth = 0;
    let columnCount = 0;
    // todo: здесь больше элементов, чем помещается во viewport
    while (items.length > 0 && totalRowWidth <= viewportWidth) {
      const item = items.shift();
      row.push(item);
      totalRowWidth += item.width;
      columnCount++;
    }
    const hasFreeSpace = totalRowWidth < viewportWidth;
    const recalculatedRow = this.recalculateRow(
      row,
      viewportWidth,
      hasFreeSpace
    );
    const currentRowHeight = recalculatedRow[0].height;
    return {
      recalculatedRow,
      height: currentRowHeight,
      width: totalRowWidth,
      columnCount,
      hasFreeSpace,
      id: nanoid()
    };
  }

  /* Calculate mosaic gallery sizes */
  calculateGallery(items, viewportWidth) {
    const rows = [];
    let prevRowsHeight = 0;

    while (items.length > 0 && viewportWidth) {
      const calculatedRow = this.calculateRow(items, viewportWidth);
      rows.push({ ...calculatedRow, prevRowsHeight });
      prevRowsHeight += calculatedRow.height;
    }
    return rows;
  }
}
export default MosaicEngine;
