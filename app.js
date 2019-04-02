/*------------------------------------------------------------------------*/
/*------------------------------------------------------------------------*/
/*------------------------------------------------------------------------*/
/*---------------------------- IMPORTS  ---------------------------*/
/*------------------------------------------------------------------------*/
/*------------------------------------------------------------------------*/
/*------------------------------------------------------------------------*/
import compare from './compare.js';


/*------------------------------------------------------------------------*/
/*------------------------------------------------------------------------*/
/*------------------------------------------------------------------------*/
/*---------------------------- STORAGE  ---------------------------*/
/*------------------------------------------------------------------------*/
/*------------------------------------------------------------------------*/
/*------------------------------------------------------------------------*/
class Storage {
  constructor() {
    this.storage = [];
  }

  setStorage(data) {
    this.storage = data;
  }

  getStorage(){
    return this.storage;
  }
}
var store = new Storage();

/*------------------------------------------------------------------------*/
/*------------------------------------------------------------------------*/
/*------------------------------------------------------------------------*/
/*---------------------------- ZOOM IN  ---------------------------*/
/*------------------------------------------------------------------------*/
/*------------------------------------------------------------------------*/
/*------------------------------------------------------------------------*/
var valueName = "Growth"
var overAllHeight = 1000;
var overAllWidth = 1200;
var textColor = 'black';
var themeColor = '#68edbc';
var boxFontSize = 0;

function runZoomIn(sectorName, valueName) {
    d3.select('#toolTip').remove();
    var sectorName = sectorName;

    d3.select('#contents')
        .insert('div')
        .attr('id', 'mydiv')

    var myDiv = d3.select('#mydiv')

    myDiv.insert('h1')
        .text(sectorName)

    var valueOptions = [
        "Growth",
        "PEG",
        "P/E",
        "Price",
        "Dividend"
    ]

    //set first item to the value that was passed from overview
    for (let i = 0; i < valueOptions.length; i++) {
        if (valueOptions[i] === valueName) {
            let temp = valueOptions[0];
            valueOptions[0] = valueName;
            valueOptions[i] = temp;
        }
    }

    myDiv
        .insert("div")
        .attr('id', 'innerButtonDiv')
        .style('margin-left', '5vh')
        .style('display', 'flex')

    var backButton = d3.select("#innerButtonDiv")
        .insert('button')
        .text('Back')

    backButton.on("click", function (d) {
        runOverview();
    });

    var valueSelect = d3.select("#innerButtonDiv")
        .insert("select")
        .style('font-family', 'Courier New, Courier, monospace')
        .style('color', textColor)
        .style('width', '10vw')
        .style('height', '1.5vw')

    valueSelect.selectAll("option")
        .data(valueOptions)
        .enter()
        .append("option")
        .attr("value", function (d) {
            return d;
        })
        .text(function (d) {
            return d;
        });

    getData(sectorName, valueName);

    valueSelect.on("change", function (d) {
        valueName = d3.select(this).property("value");
        getData(sectorName, valueName);
    });

}

function getData(sector, value) {

    d3.select("svg").remove();
    d3.select("#contents")
        .append("svg")
        .style("width", overAllWidth)
        .style("height", overAllHeight)
        .append("g");

    d3.csv("/data/allCCC.csv", function (data) {

        let filteredArray = data.filter((value, index, array) => {
            if (value.Sector === sector) {
                return value;
            }
        });

        var actualData = { "name": "", "children": [] };

        for (let i = 0; i < filteredArray.length; i++) {

            if (filteredArray[i][value] > 0 && filteredArray[i][value] !== "n/a") {
                //console.log(filteredArray[i][value]);
                actualData.children.push({
                    "name": filteredArray[i]["Symbol"],
                    "value": filteredArray[i][value]
                });
            }
        }

        d3.select("#treemap").remove();
        d3.select("#valueSelect").remove();
        d3.select("#toolTip").remove();
        displayTreeMap(actualData);

    });
}

function getAverage(actualData) {
    var total = 0.0;

    for (let i = 0; i < actualData.children.length; i++) {
        if (actualData.children[i].value !== "n/a") {
            total += parseFloat(actualData.children[i].value);
        }

    }

    var avg = total / actualData.children.length;
    return avg;
}

function displayTreeMap(actualData) {
    let color = d3
        .scaleThreshold()
        .domain([-10, -1, 1, 10])
        .range(["#644553", "#8B444E", "#414554", "#347D4E", "#38694F"]);

    var avg = getAverage(actualData);

    var treemapLayout = d3.treemap()
        .size([overAllWidth, overAllHeight])
        .tile(d3.treemapSquarify)
        .paddingOuter(10);

    var root = d3.hierarchy(actualData)

    root.sum(function (d) {
        return d.value;
    });

    treemapLayout(root);

    var blocks = d3.select('svg g')
        .selectAll('rect')
        .data(root.descendants())
        .append('rect')
        .attr('x', function (d) { return d.x0; })
        .attr('y', function (d) { return d.y0; })
        .attr('width', function (d) { return d.x1 - d.x0 + "px"; })
        .attr('height', function (d) { return d.y1 - d.y0 + "px"; })


    blocks.enter()


    var nodes = d3.select('svg g')
        .selectAll('g')
        .data(root.descendants())
        .enter()
        .append('g')

        .attr('transform', function (d) {
            return 'translate(' + [d.x0, d.y0] + ')'
        })


    nodes
        .append('rect')
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; })

    nodes
        .append('text')
        .style('font-family', 'Courier New, Courier, monospace')
        .style('fill', 'white')
        .text(function (d) {

            if (d.value < (avg - d.value)) {
                return "";
            }

            return d.data.name;
        })
        .attr('dx', 4)
        .attr('dy', 14)


    nodes
        .append('text')
        .style('font-weight', 'bold')
        .style('font-family', 'Courier New, Courier, monospace')
        .style('fill', 'white')
        .text(function (d) {
            if (d.value < (avg - d.value)) {
                return "";
            }

            return d.data.value;
        })

        .attr('dx', 4)
        .attr('dy', 35)


    d3.selectAll('rect')
        .attr("id", "data-square")
        .attr('fill', function (d) {
            let diff = (d.value - avg).toFixed();
            return color(diff);
        })
        .attr('stroke', 'white')
}

/*------------------------------------------------------------------------*/
/*------------------------------------------------------------------------*/
/*------------------------------------------------------------------------*/
/*---------------------------- COMPARISION  ---------------------------*/
/*------------------------------------------------------------------------*/
/*------------------------------------------------------------------------*/
/*------------------------------------------------------------------------*/
function cleanUp() {
	d3.select("#t1-2").selectAll("*").remove();
	d3.select("#t1-3").selectAll("*").remove();

	d3.select("#n1-2").selectAll("*").remove();
	d3.select("#n1-3").selectAll("*").remove();

	d3.select('#card1').selectAll("*").filter((d, i) => i > 10).remove();

	d3.select('#card2').selectAll("*").remove();
	const card2 = d3.select('#card2');
	
	const content = card2.append("div").attr('class', 'content');
	content.append("div")
		.attr("class", "center aligned middle aligned column")
		.text("Dividend Information");
	card2.append("div").attr('class', 'row extra content');
}

function compareListener() {
	let selectedArr = [];

	let sel1 = document.getElementById('a1-2');
	let sel2 = document.getElementById('a1-3');

	const tickerOne = sel1.options[sel1.selectedIndex].value;
	const tickerTwo = sel2.options[sel2.selectedIndex].value;

  // const csvArray = JSON.parse(window.localStorage.getItem('dataset'));
  const csvArray = store.getStorage();

  csvArray.map((data) => {
    if (data[`Symbol`] === tickerOne) selectedArr[0] = data;
    if (data[`Symbol`] === tickerTwo) selectedArr[1] = data;
    if (selectedArr.length === 2) {
      cleanUp();
      compare(selectedArr);
    }
  });
}

/*------------------------------------------------------------------------*/
/*------------------------------------------------------------------------*/
/*------------------------------------------------------------------------*/
/*---------------------------- OVERVIEW  ---------------------------*/
/*------------------------------------------------------------------------*/
/*------------------------------------------------------------------------*/
/*------------------------------------------------------------------------*/

var margin = { top: 20, right: 20, bottom: 30, left: 50 };
var width = 1200 - margin.left - margin.right;
var height = 900 - margin.top - margin.bottom;

var sectorTextObjects = [];
var valueSelected;

function init() {
  valueSelected = "Growth";
  let body = d3.select("#body");

  var valueOptions = ["Growth", "PEG", "P/E", "Price", "Dividend"];

  let valueSelect = body
    .insert("div")
    .insert("select")
    .attr("id", "valueSelect")
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
    .attr("value", function (d) {
      return d;
    })
    .text(function (d) {
      return d;
    });

  valueSelect.on("change", function (d) {
    valueSelected = d3.select(this).property("value");
    renderTreeMap("/data/contenders.csv", d3.select(this).property("value"));
  });
}

function renderTreeMap(dataSet, metric) {
  //Removing treemap div and readding it for rerendering of treemap
  d3.select("#treemap").remove();

  d3.select("#contents")
    .append("div")
    .attr("id", "treemap");

  d3.csv(dataSet, function (data) {
    let nest = d3
      .nest()
      .key(function (d) {
        return d.Sector;
      })
      .key(function (d) {
        return d.Symbol;
      })
      .rollup(function (d) {
        return d3.sum(d, function (d) {
          return d[metric];
        });
      });

    let infoNest = d3.nest().key(function (d) {
      return d.Symbol;
    })
      .map(data);

    let averageMap = new Map();

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
      }

      let average = (total / stockCount).toFixed(2);
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
      .hierarchy({ values: nest.entries(data).slice(0, -1) }, function (d) {
        return d.values;
      })
      .sum(function (d) {
        return d.value;
      })
      .sort(function (a, b) {
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
      .attr("id", "toolTip")
      .attr("class", "toolTip");

    let node = d3
      .select("#treemap")
      .selectAll(".node")
      .data(root.leaves())
      .enter()
      .insert("div")
      .on("click", function (d) {
        runZoomIn(d.parent.data.key, valueSelected);
      })
      .on("mousemove", function (d) {
        // http://bl.ocks.org/ndobie/90ae9f1a5c7f88ad4929

        tooltip.style("left", d3.event.pageX + 10 + "px");
        tooltip.style("top", d3.event.pageY - 20 + "px");
        tooltip.style("width", "325px");
        tooltip.style("height", "250px");
        tooltip.style("position", "absolute");
        tooltip.style("display", "inline-block");
        tooltip.style("background", "white");
        tooltip.style("border", "solid");
        tooltip.html(function () {
          let stock = infoNest["$" + d.data.key][0];

          let ticker = '<strong>' + stock["Symbol"] + '</strong> <br/><br/>';

          let industry = 'Industry: ' + stock["Industry"] + '<br/>';
          let price = 'Price: $' + stock["Price"] + '<br/>';
          let eps = 'Earnings Per Share: ' + stock["EPS"] + '<br/>';
          let peg = 'PEG Ratio: ' + stock["PEG"] + '<br/>';

          return ticker + industry + price + eps + peg;
        });
      })
      .on("mouseout", function (d) {
        tooltip.style("display", "none");
      })
      .attr("class", "node")
      .style("left", function (d) {
        return d.x0 + "px";
      })
      .style("top", function (d) {
        return d.y0 + "px";
      })
      .style("width", function (d) {
        return d.x1 - d.x0 + "px";
      })
      .style("height", function (d) {
        return d.y1 - d.y0 + "px";
      })
      .style("background", function (d) {
        let sector = d.parent.data.key;
        let average = averageMap.get(sector);
        let diff = (d.value - average).toFixed();
        return color(diff);
      })
      .insert("div")
      .attr("class", "header")
      .style("left", function (d) {
        return d.x0 + "px";
      })
      .style("top", function (d) {
        return d.y0 + "px";
      })
      .style("width", function (d) {
        return d.x1 - d.x0 + "px";
      })
      .style("height", function (d) {
        return d.y1 - d.y0 + "px";
      });

    node
      .append("div")
      .attr("class", "node-value")
      .text(function (d) {
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
      .style("opacity", function (d) {
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
      .text(function (d) {
        return d.data.key;
      })
      .style("color", "white")
      .style("opacity", function (d) {
        let width = d.x1 - d.x0;
        let height = d.y1 - d.y0;

        let size = width * height;

        if (size < 3000) {
          return 0;
        }
      });

      // window.localStorage.setItem('dataset', JSON.stringify(data))
      store.setStorage(data);

      data.map(function (o, i) {
        const ticker = o[`Symbol`];
        const name = o[`Name`];

        let dd1 = d3.select(`#a1-2`);
        let option1 = dd1
          .append("option")
          .attr("value", ticker)
        option1.append('div').text(`${name} - ${ticker}`)
        
        let dd2 = d3.select(`#a1-3`);
        let option2 = dd2
          .append("option")
          .attr("value", ticker)
        option2.append('div').text(`${name} - ${ticker}`)

        let sel1 = document.getElementById('a1-2');
        sel1.addEventListener("change", compareListener);

        let sel2 = document.getElementById('a1-3');
        sel2.addEventListener("change", compareListener);
      })
  });
}

export default function runOverview() {
  d3.select("h1").remove();
  d3.select("svg").remove();
  d3.select("#innerButtonDiv").remove();

  init();
  renderTreeMap("/data/contenders.csv", "Price");
}

runOverview();

