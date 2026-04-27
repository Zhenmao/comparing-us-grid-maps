import USGridMap from "./us-grid-map.js";

Promise.all([
  d3.csv("data/publication-grids.csv"),
  d3.csv("data/links.csv"),
]).then(([grids, links]) => {
  const highlighted = new Set();
  const maps = Array.from({ length: links.length });

  const grid = d3.select("#grid").on("highlightchange", (event) => {
    const { state } = event.detail;
    if (highlighted.has(state)) {
      highlighted.delete(state);
    } else {
      highlighted.add(state);
    }
    maps.forEach((map) => {
      map.highlight(highlighted);
    });
  });

  const grouped = d3.group(grids, (d) => d.publication);

  const card = grid
    .selectChildren()
    .data(links)
    .join("div")
    .attr("class", "card");

  card
    .append("h2")
    .attr("class", "card__title")
    .each(function ({ publication, source }) {
      if (source) {
        d3.select(this)
          .append("a")
          .attr("href", source)
          .attr("target", "_blank")
          .text(publication);
      } else {
        d3.select(this).text(publication);
      }
    });

  card
    .append("div")
    .attr("class", "card__body")
    .append("div")
    .each(function ({ publication }, i) {
      const data = grouped.get(publication);
      maps[i] = new USGridMap({ el: this, data });
    });

  card
    .append("div")
    .attr("class", "card__footer")
    .text(({ publication }) => {
      const data = grouped.get(publication);
      const nCols =
        d3.max(data, (d) => +d.col) - d3.min(data, (d) => +d.col) + 1;
      const nRows =
        d3.max(data, (d) => +d.row) - d3.min(data, (d) => +d.row) + 1;
      return `Dimension: ${nCols} × ${nRows}`;
    });
});
