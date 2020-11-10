const nanoid = require('nanoid')

class JustifiedEngine {
  /* Get min height of row  */
  getRowMinHeight(items) {
    return Math.min.apply(
      null,
      items.map((item) => item.height)
    )
  }

  /* Get total width for row */
  getRowTotalWidth(row) {
    return row.map((item) => item.width).reduce((a, b) => a + b, 0)
  }

  /* Resize item by height */
  resizeByHeight(item, newHeight) {
    const { width, height, ...rest } = item
    const aspectRatio = width / height
    return {
      ...rest,
      width: aspectRatio * newHeight,
      height: newHeight,
      originalWidth: item.width,
      originalHeight: item.height,
    }
  }

  /* Recalculate new row sizes */
  recalculateRow(row, viewportWidth, hasFreeSpace) {
    // todo: тяжело читается метод -- надо разбить на 2-3
    const minHeight = this.getRowMinHeight(row)
    const resizedRow = row.map((item) => this.resizeByHeight(item, minHeight))
    const minHeightWithGutter = this.calculateMinHeightWithGutter(
      minHeight,
      row.length,
      0.7 /* 0.7 is gutter in % */
    )
    const newRowHeight = this.recalculateNewRowHeightWithGutter(
      minHeightWithGutter,
      resizedRow,
      viewportWidth
    )
    return resizedRow.map((item, index) => {
      const cell = this.resizeByHeight(item, newRowHeight)
      const widthInPercent =
        (100 * (hasFreeSpace ? cell.originalWidth : cell.width)) / viewportWidth
      const placeholderHeightInPercent = (100 * cell.height) / cell.width
      const isLastCell = row.length === index + 1
      return {
        ...cell,
        id: nanoid(),
        widthInPercent,
        placeholderHeightInPercent,
        isLastCell,
      }
    })
  }

  /* Calculate min height with gutter */
  calculateMinHeightWithGutter(rowMinHeight, rowLength, gutterInPercent) {
    return (rowMinHeight * (100 - (rowLength - 1) * gutterInPercent)) / 100
  }

  /* Recalculate new row height with gutter by viewport width */
  recalculateNewRowHeightWithGutter(
    minHeightWithGutter,
    resizedRow,
    viewportWidth
  ) {
    const totalWidth = this.getRowTotalWidth(resizedRow)
    return (minHeightWithGutter * viewportWidth) / totalWidth
  }

  /* Calculate justified row sizes */
  calculateRow(items, viewportWidth) {
    const row = []
    let totalRowWidth = 0
    let columnCount = 0
    // todo: здесь больше элементов, чем помещается во viewport
    while (items.length > 0 && totalRowWidth <= viewportWidth) {
      const item = items.shift()
      row.push(item)
      totalRowWidth += item.width
      columnCount++
    }
    const hasFreeSpace = totalRowWidth < viewportWidth
    const recalculatedRow = this.recalculateRow(
      row,
      viewportWidth,
      hasFreeSpace
    )
    const currentRowHeight = recalculatedRow[0].height
    return {
      recalculatedRow,
      height: currentRowHeight,
      width: totalRowWidth,
      columnCount,
      hasFreeSpace,
      id: nanoid(),
    }
  }

  /* Calculate justified gallery sizes */
  calculateGallery(items, viewportWidth) {
    const rows = []
    const gutterInPx = (viewportWidth * 0.7) /* 0.7 is gutter in % */ / 100
    let prevRowsHeight = 0

    while (items.length > 0 && viewportWidth) {
      const calculatedRow = this.calculateRow(items, viewportWidth)
      rows.push({ ...calculatedRow, prevRowsHeight })
      prevRowsHeight += calculatedRow.height + gutterInPx
    }
    return rows
  }
}
export default JustifiedEngine
