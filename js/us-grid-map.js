export default class USGridMap {
  constructor({ el, data, highlighted }) {
    this.el = el;
    this.data = data;
    this.highlighted = highlighted;
    this.drawMap();
  }

  drawMap() {
    const rx = 4;
    const cellSize = 32;
    const cellGap = 2;
    const nRows = 8;
    const nCols = 13;

    const width = cellSize * nCols + cellGap * (nCols - 1);
    const height = cellSize * nRows + cellGap * (nRows - 1);

    const getCoords = (col, row) => [col, row].join("-");

    const stateByCoords = d3.index(this.data, (d) =>
      getCoords(+d.col - 1, +d.row - 1),
    );

    const svg = d3
      .select(this.el)
      .classed("grid-map", true)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    const cell = svg
      .selectChildren()
      .data(d3.cross(d3.range(nCols), d3.range(nRows)))
      .join("g")
      .attr("class", "cell")
      .attr("transform", ([col, row]) => {
        const x = col * (cellSize + cellGap);
        const y = row * (cellSize + cellGap);
        return `translate(${x},${y})`;
      });

    cell
      .append("rect")
      .attr("class", "cell__rect")
      .attr("rx", rx)
      .attr("width", cellSize)
      .attr("height", cellSize);

    this.state = cell
      .filter(([col, row]) => stateByCoords.get(getCoords(col, row)))
      .classed("state", true)
      .each((d) => {
        const [col, row] = d;
        d.data = stateByCoords.get(getCoords(col, row));
      })
      .on("click", (event, d) => {
        this.el.dispatchEvent(
          new CustomEvent("highlightchange", {
            bubbles: true,
            detail: {
              state: d.data.code,
            },
          }),
        );
      });

    this.state
      .append("text")
      .attr("class", "cell__label")
      .attr("x", cellSize / 2)
      .attr("y", cellSize / 2)
      .attr("text-anchor", "middle")
      .attr("dy", "0.32em")
      .text((d) => d.data.code);

    this.state.append("title").text((d) => d.data.state);
  }

  highlight(highlighted) {
    this.highlighted = highlighted;
    this.state.classed("highlighted", (d) => highlighted.has(d.data.code));
  }
}
