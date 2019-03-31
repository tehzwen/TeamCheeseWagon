var margin = { top: 20, right: 20, bottom: 30, left: 50 };
(width = 1200 - margin.left - margin.right),
  (height = 900 - margin.top - margin.bottom);

var sectorTextObjects = [];

function init() {
  let body = d3.select("#body");

  var valueOptions = ["Growth", "PEG", "P/E", "Price", "Dividend"];

  let valueSelect = body
    .insert("div")
    .insert("select")
    .style("margin-left", "5vh")
    .style("font-family", "Courier New, Courier, monospace")
    .style("background-color", "white")
    .style("color", "black")
    .style("width", "10vw")
    .style("height", "1.5vw");

  valueSelect
    .selectAll("option")
    .data(valueOptions)
    .enter()
    .append("option")
    .attr("value", function(d) {
      return d;
    })
    .text(function(d) {
      return d;
    });

  valueSelect.on("change", function(d) {
    //console.log(d3.select(this).property("value"));
    renderTreeMap("/data/contenders.csv", d3.select(this).property("value"));
  });
}

function renderTreeMap(dataSet, metric) {
  //Removing treemap div and readding it for rerendering of treemap
  d3.select("#treemap").remove();

  d3.select("#contents")
    .append("div")
    .attr("id", "treemap");

  d3.csv(dataSet, function(data) {
    let nest = d3
      .nest()
      .key(function(d) {
        return d.Sector;
      })
      .key(function(d) {
        return d.Symbol;
      })
      .rollup(function(d) {
        return d3.sum(d, function(d) {
          return d[metric];
        });
      });

    let infoNest = d3.nest().key(function(d) {
      return d.Symbol;
    })
    .map(data);

    let averageMap = new Map();
    let maxMap = new Map();

    let entries = nest.entries(data).slice(0, -1);

    for (let entry in entries) {
      let sector = entries[entry];
      let sectorName = sector.key;
      let total = 0;
      let stockCount = 0;
      let max = 0;

      for (let index in sector.values) {
        let stock = sector.values[index];
        total += stock.value;
        stockCount++;

        if (stock.value > max) {
          max = stock.value;
        }
      }

      let average = (total / stockCount).toFixed(2);

      maxMap.set(sectorName, max);
      averageMap.set(sectorName, average);
    }

    let treemap = d3
      .treemap()
      .size([width, height])
      .paddingTop(25)
      .paddingRight(5)
      .paddingInner(2)
      .round(true);

    let color = d3
      .scaleThreshold()
      .domain([-10, -1, 1, 10])
      .range(["#644553", "#8B444E", "#414554", "#347D4E", "#38694F"]);

    let root = d3
      .hierarchy({ values: nest.entries(data).slice(0, -1) }, function(d) {
        return d.values;
      })
      .sum(function(d) {
        return d.value;
      })
      .sort(function(a, b) {
        return b.value - a.value;
      });

    treemap(root);

    for (let i = 0; i < root.children.length; i++) {
      d3.select("#treemap")
        .insert("text")
        .text(root.children[i].data.key)
        .style("left", root.children[i].x0 + "px")
        .style("top", root.children[i].y0 + "px")
        .style("position", "absolute");
    }

    let tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "toolTip");

    let node = d3
      .select("#treemap")
      .selectAll(".node")
      .data(root.leaves())
      .enter()
      .insert("div")
      .on("click", function(d) {
        console.log(d.parent.data.key);
        console.log(d.parent);
      })
      .on("mousemove", function(d) {
        tooltip.style("left", d3.event.pageX + 10 + "px");
        tooltip.style("top", d3.event.pageY - 20 + "px");
        tooltip.style("width", "200px");
        tooltip.style("height", "250px");
        tooltip.style("position", "absolute");
        tooltip.style("display", "inline-block");
        tooltip.style("background", "white");
        tooltip.html(function() {
            let stock = infoNest["$" + d.data.key][0];

            let industry = 'Industry: ' + stock["Industry"] + '<br/>'
            let price = 'Price: ' + stock["Price"] + '<br/>'
            let eps = 'Earnings Per Share: ' + stock["EPS"] + '<br/>'

            return industry + price + eps;
        });
      })
      .on("mouseout", function(d) {
        tooltip.style("display", "none");
      })
      .attr("class", "node")
      .style("left", function(d) {
        return d.x0 + "px";
      })
      .style("top", function(d) {
        return d.y0 + "px";
      })
      .style("width", function(d) {
        return d.x1 - d.x0 + "px";
      })
      .style("height", function(d) {
        return d.y1 - d.y0 + "px";
      })
      .style("background", function(d) {
        let sector = d.parent.data.key;
        let average = averageMap.get(sector);
        let diff = (d.value - average).toFixed();
        return color(diff);
      })
      .insert("div")
      .attr("class", "header")
      .style("left", function(d) {
        return d.x0 + "px";
      })
      .style("top", function(d) {
        return d.y0 + "px";
      })
      .style("width", function(d) {
        return d.x1 - d.x0 + "px";
      })
      .style("height", function(d) {
        return d.y1 - d.y0 + "px";
      });

    node
      .append("div")
      .attr("class", "node-value")
      .text(function(d) {
        let sector = d.parent.data.key;
        let average = averageMap.get(sector);
        let diff = (d.value - average).toFixed();

        if (diff > 0) {
          diff = "+" + diff;
        } else if (diff === "-0") {
          diff = 0;
        }
        return diff;
      })
      .style("color", "white")
      .style("opacity", function(d) {
        let width = d.x1 - d.x0;
        let height = d.y1 - d.y0;

        let size = width * height;

        if (size < 3000) {
          return 0;
        }
      });

    node
      .append("div")
      .attr("class", "node-label")
      .text(function(d) {
        return d.data.key;
      })
      .style("color", "white")
      .style("opacity", function(d) {
        let width = d.x1 - d.x0;
        let height = d.y1 - d.y0;

        let size = width * height;

        if (size < 3000) {
          return 0;
        }
      });
  });
}

init();
renderTreeMap("/data/contenders.csv", "Price");
