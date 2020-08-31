// https://observablehq.com/@d3/stacked-to-grouped-bars@245
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Stacked-to-Grouped Bars

Animations can preserve object constancy, allowing the reader to follow the data across views. See [Heer and Robertson](http://vis.berkeley.edu/papers/animated_transitions/) for more.`
)});
  main.variable(observer("viewof layout")).define("viewof layout", ["html"], function(html)
{
  const form = html`<form style="font: 12px var(--sans-serif); display: flex; height: 33px; align-items: center;">
  <label style="margin-right: 1em; display: inline-flex; align-items: center;">
    <input type="radio" name="radio" value="stacked" style="margin-right: 0.5em;" checked> Stacked
  </label>
  <label style="margin-right: 1em; display: inline-flex; align-items: center;">
    <input type="radio" name="radio" value="grouped" style="margin-right: 0.5em;"> Grouped
  </label>
</form>`;
  const interval = setInterval(() => {
    form.value = form.radio.value = form.radio.value === "grouped" ? "stacked" : "grouped";
    form.dispatchEvent(new CustomEvent("input"));
  }, 2000);
  form.onchange = () => form.dispatchEvent(new CustomEvent("input")); // Safari
  form.oninput = event => {
    if (event.isTrusted) clearInterval(interval), form.onchange = null;
    form.value = form.radio.value;
  };
  form.value = form.radio.value;
  return form;
}
);
  main.variable(observer("layout")).define("layout", ["Generators", "viewof layout"], (G, _) => G.input(_));
  main.variable(observer("chart")).define("chart", ["d3","width","height","y01z","z","x","margin","xAxis","y","yMax","n","y1Max"], function(d3,width,height,y01z,z,x,margin,xAxis,y,yMax,n,y1Max)
{
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);

  const rect = svg.selectAll("g")
    .data(y01z)
    .join("g")
      .attr("fill", (d, i) => z(i))
    .selectAll("rect")
    .data(d => d)
    .join("rect")
      .attr("x", (d, i) => x(i))
      .attr("y", height - margin.bottom)
      .attr("width", x.bandwidth())
      .attr("height", 0);

  svg.append("g")
      .call(xAxis);

  function transitionGrouped() {
    y.domain([0, yMax]);

    rect.transition()
        .duration(500)
        .delay((d, i) => i * 20)
        .attr("x", (d, i) => x(i) + x.bandwidth() / n * d[2])
        .attr("width", x.bandwidth() / n)
      .transition()
        .attr("y", d => y(d[1] - d[0]))
        .attr("height", d => y(0) - y(d[1] - d[0]));
  }

  function transitionStacked() {
    y.domain([0, y1Max]);

    rect.transition()
        .duration(500)
        .delay((d, i) => i * 20)
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
      .transition()
        .attr("x", (d, i) => x(i))
        .attr("width", x.bandwidth());
  }

  function update(layout) {
    if (layout === "stacked") transitionStacked();
    else transitionGrouped();
  }

  return Object.assign(svg.node(), {update});
}
);
  main.variable(observer("update")).define("update", ["chart","layout"], function(chart,layout){return(
chart.update(layout)
)});
  main.variable(observer("xz")).define("xz", ["d3","m"], function(d3,m){return(
d3.range(m)
)});
  main.variable(observer("yz")).define("yz", ["d3","n","bumps","m"], function(d3,n,bumps,m){return(
d3.range(n).map(() => bumps(m))
)});
  main.variable(observer("y01z")).define("y01z", ["d3","n","yz"], function(d3,n,yz){return(
d3.stack()
    .keys(d3.range(n))
  (d3.transpose(yz)) // stacked yz
  .map((data, i) => data.map(([y0, y1]) => [y0, y1, i]))
)});
  main.variable(observer("yMax")).define("yMax", ["d3","yz"], function(d3,yz){return(
d3.max(yz, y => d3.max(y))
)});
  main.variable(observer("y1Max")).define("y1Max", ["d3","y01z"], function(d3,y01z){return(
d3.max(y01z, y => d3.max(y, d => d[1]))
)});
  main.variable(observer("x")).define("x", ["d3","xz","margin","width"], function(d3,xz,margin,width){return(
d3.scaleBand()
    .domain(xz)
    .rangeRound([margin.left, width - margin.right])
    .padding(0.08)
)});
  main.variable(observer("y")).define("y", ["d3","y1Max","height","margin"], function(d3,y1Max,height,margin){return(
d3.scaleLinear()
    .domain([0, y1Max])
    .range([height - margin.bottom, margin.top])
)});
  main.variable(observer("z")).define("z", ["d3","n"], function(d3,n){return(
d3.scaleSequential(d3.interpolateBlues)
    .domain([-0.5 * n, 1.5 * n])
)});
  main.variable(observer("xAxis")).define("xAxis", ["height","margin","d3","x"], function(height,margin,d3,x){return(
svg => svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0).tickFormat(() => ""))
)});
  main.variable(observer("n")).define("n", function(){return(
5
)});
  main.variable(observer("m")).define("m", function(){return(
58
)});
  main.variable(observer("height")).define("height", function(){return(
500
)});
  main.variable(observer("margin")).define("margin", function(){return(
{top: 0, right: 0, bottom: 10, left: 0}
)});
  main.variable(observer("bumps")).define("bumps", function(){return(
function bumps(m) {
  const values = [];

  // Initialize with uniform random values in [0.1, 0.2).
  for (let i = 0; i < m; ++i) {
    values[i] = 0.1 + 0.1 * Math.random();
  }

  // Add five random bumps.
  for (let j = 0; j < 5; ++j) {
    const x = 1 / (0.1 + Math.random());
    const y = 2 * Math.random() - 0.5;
    const z = 10 / (0.1 + Math.random());
    for (let i = 0; i < m; i++) {
      const w = (i / m - y) * z;
      values[i] += x * Math.exp(-w * w);
    }
  }

  // Ensure all values are positive.
  for (let i = 0; i < m; ++i) {
    values[i] = Math.max(0, values[i]);
  }

  return values;
}
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@6")
)});
  return main;
}
