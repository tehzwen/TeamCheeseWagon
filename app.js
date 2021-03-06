/*---------------------------- IMPORTS  ---------------------------*/
import compare from './compare.js';
// import * as d3 from 'd3';

/*--------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------*/
/*---------------------------- STORAGE  -----------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------*/
/*-------------------- Treat this as a Singleton -------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------*/

class Storage {
  constructor() {
    this.dataset = [];
    this.favorites = [];
    this.overview = {
      metric: '',
      datasetName: ''
    }
  }

  setStorage(data) {
    this.dataset = data;
  }

  getStorage() {
    return this.dataset;
  }

  addFavorite(ticker) {
    this.favorites.push(ticker);
  }

  removeFavorite(index) {
    this.favorites.splice(index, 1);
  }

  getFavorites() {
    return [...this.favorites];
  }

  setOverviewOptions(datasetName, metric) {
    if (metric) {
      this.overview = { ...this.overview, metric }
    }
    if (datasetName) {
      this.overview = { ...this.overview, datasetName }
    }
  }

  getOverviewOptions() {
    return { ...this.overview };
  }
}
var store = new Storage();


/*--------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------*/
/*---------------------------- ZOOM IN  ---------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------*/
var valueName = "Growth"
var overAllHeight = 900;
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
        .style('display', 'flex')

    var backButton = d3.select("#innerButtonDiv")
        .insert('button')
        .attr('class', 'ui button large')
        .style('margin-bottom', '10px')
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
        .style('margin-top', '10px')

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

    getData(store.getOverviewOptions().datasetName, sectorName, valueName);

    valueSelect.on("change", function (d) {
        valueName = d3.select(this).property("value");
        getData(store.getOverviewOptions().datasetName, sectorName, valueName);
    });



}

function getData(dataset, sector, value) {

    d3.select("svg").remove();
    d3.select("#contents")
        .append("svg")
        .style("width", overAllWidth)
        .style("height", overAllHeight)
        .append("g");

    d3.csv(dataset, function (data) {

        let filteredArray = data.filter((value, index, array) => {
            if (value.Sector === sector) {
                return value;
            }
        });

        var actualData = { "name": "", "children": [] };

        for (let i = 0; i < filteredArray.length; i++) {

            if (filteredArray[i][value] > 0 && filteredArray[i][value] !== "n/a") {
                actualData.children.push({
                    "name": filteredArray[i]["Symbol"],
                    "value": filteredArray[i][value]
                });
            }
        }

        d3.select("#treemap").remove();
        d3.select("#body").selectAll("*").remove();
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

            // console.log({data: d.data})
            return d.data.value;
        })
        .attr('dx', 4)
        .attr('dy', 35)

      nodes.on("click", function(d){
        if (store.getFavorites().indexOf(d.data.name) !== -1){
          return;
        }
        store.addFavorite(d.data.name);
        renderFavorities()
        renderDropdowns(store.getStorage());
        alert(`Stock: ${d.data.name} was added to favorites`)
      });


    d3.selectAll('rect')
        .attr("id", "data-square")
        .attr('fill', function (d) {
            let diff = (d.value - avg).toFixed();
            return color(diff);
        })
        .attr('stroke', 'white')
}

/*--------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------*/

/*---------------------------- COMPARISION  ---------------------------*/
/*--------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------*/

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

  const csvArray = store.getStorage();

  csvArray.map((data) => {
    if (!data) return;
    if (data[`Symbol`] === tickerOne) selectedArr[0] = data;
    if (data[`Symbol`] === tickerTwo) selectedArr[1] = data;

    if (selectedArr.length === 2) {
      cleanUp();
      compare(selectedArr);
    }
  });
}

/*--------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------*/

/*---------------------------- OVERVIEW  ---------------------------*/
/*--------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------*/


var margin = { top: 20, right: 20, bottom: 30, left: 50 };
var width = 1200 - margin.left - margin.right;
var height = 900 - margin.top - margin.bottom;

var sectorTextObjects = [];
var valueSelected;
var dataSelected;

function init() {
  valueSelected = "Growth";
  dataSelected = "/data/champions.csv";
  let body = d3.select("#body");

  body.selectAll("*").remove();

  var valueOptions = ["Growth", "PEG", "P/E", "Price", "Dividend"];
  var dataOptions = ["Champions", "Contenders"]

    const secondCombo = body.insert("div").attr("class", "combo");
  secondCombo
    .insert("div")
    .text("Select a Dataset")

  let dataSelect = secondCombo
    .insert("div")
    .insert("select")
    .attr("id", "dataSelect")
    .style("font-family", "Courier New, Courier, monospace")
    .style("background-color", "white")
    .style("color", "black")
    .style("width", "10vw")
    .style("height", "1.5vw");

  dataSelect
    .selectAll("option")
    .data(dataOptions)
    .enter()
    .append("option")
    .attr("value", function (d) {
      switch (d) {
        case "Champions":
          return "/data/champions.csv";
        case "Contenders":
          return "/data/contenders.csv";
      }
    })
    .text(function (d) {
      return d;
    });


  const firstCombo = body.insert("div").attr("class", "combo");
  firstCombo
    .insert("div")
    .text("Select a Metric")

  let valueSelect = firstCombo
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
    store.setOverviewOptions(undefined, valueSelected);
    renderTreeMap(d3.select("#dataSelect").property("value"), valueSelected);
  });

  dataSelect.on("change", function (d) {
    dataSelected = d3.select(this).property("value");
    store.setOverviewOptions(d3.select("#dataSelect").property("value"));
    renderTreeMap(dataSelected, d3.select("#valueSelect").property("value"));
  });

}

function getColorDomain(metric) {
  switch(metric) {
    case "Growth":
      return [-5, -1, 1, 5];
      break;
    case "PEG":
      return [-3, -1, 1, 3];
      break;
    case "P/E":
      return [15, 1, -1, -15];
      break;
    case "Price":
      return [50, 10, -10, -50];
      break;
    case "Dividend":
      return [-2, -1, 1, 2];
      break;    
  }
}

function getColorRange(metric) {
  let range = ["#644553", "#8B444E", "#414554", "#347D4E", "#38694F"]

  switch(metric) {
    case "Growth":
    case "PEG":
    case "Dividend":
      return range;
      break;
    case "Price":
    case "P/E":
      return range.reverse();  
  }
}

function getSort(metric, a, b) {
  switch(metric) {
    case "Growth":
    case "PEG":
    case "Dividend":
      return b.value - a.value;
      break;
    case "Price":
    case "P/E":
      return a.value - b.value; 
      break;
  }
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
      .domain(getColorDomain(d3.select("#valueSelect").property("value")))
      .range(getColorRange(d3.select("#valueSelect").property("value")))

    let root = d3
      .hierarchy({ values: nest.entries(data).slice(0, -1) }, function (d) {
        return d.values;
      })
      .sum(function (d) {
        return d.value;
      })
      .sort(function (a, b) {
        return getSort(d3.select("#valueSelect").property("value"), a, b);
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
          let growth = 'Growth: ' + stock["Growth"] + '<br/>';
          let peg = 'PEG Ratio: ' + stock["PEG"] + '<br/>';
          let pe = 'P/E Ratio: ' + stock["P/E"] + '<br/>';
          let price = 'Price: $' + stock["Price"] + '<br/>';
          let dividend = 'Dividend: $' + stock["Dividend"] + '<br/>';
          

          return ticker + industry + growth + peg + pe + price + dividend;
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

      store.setStorage(data);

      renderDropdowns(data);
  });
}

function renderDropdowns(data) {

  d3.select(`#a1-2`).selectAll("*").remove();
  d3.select(`#a1-3`).selectAll("*").remove();

  const select1= d3.select(`#a1-2`);

  select1
    .append("option")
    .attr("disabled", true)
    .text('');
  select1
    .append("option")
    .attr("disabled", true)
    .text('Browse');

  const select2 = d3.select(`#a1-3`);
  select2
    .append("option")
    .attr("disabled", true)
    .text('');
  
  select2
    .append("option")
    .attr("disabled", true)
    .text('Browse');

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
  });

  const firstDropdown = d3.select(`#a1-2`)
  const secondDropdown = d3.select(`#a1-3`)

  const favorites = store.getFavorites();
  favorites.map((d) => {

    const op1 = firstDropdown.insert("option", "option")
      .attr("value", d)
    op1.append('div').text(`${d} - ${d}`)

    const op2 = secondDropdown.insert("option", "option")
      .attr("value", d)
    op2.append('div').text(`${d} - ${d}`)
  })

  d3.select(`#a1-2`).insert("option", "option")
    .attr("disabled", true)
    .append('div').text(`Favorites`)
  
  d3.select(`#a1-3`).insert("option", "option")
    .attr("disabled", true)
    .append('div').text(`Favorites`)
}

function renderFavorities() {
  let favs = d3.select(`#favs`);
  favs.selectAll("*").remove();

  store.getFavorites().map((fTicker) => {
    const favorite = favs.append("div")
      .attr("class", "favorites")

    const fspan = favorite
      .append('span');
    
    fspan.append('span')
      .style("padding-right", "6px")
      .text(fTicker);
    fspan
      .append('i')
      .attr("class", "fas fa-times")
      .style("cursor", "pointer")
      .style("font-size", "22px")
      .on("click", () => {
        store.removeFavorite(store.getFavorites().indexOf(fTicker));
        renderFavorities();
        renderDropdowns(store.getStorage());
      });
    })
}

export default function runOverview() {
  d3.select("h1").remove();
  d3.select("svg").remove();
  d3.select("#innerButtonDiv").remove();

  init();
  const defaultDataset = "/data/champions.csv";
  const defaultMetric = "Growth";
  renderTreeMap(defaultDataset, defaultMetric);
  store.setOverviewOptions(defaultDataset, defaultMetric)
}

runOverview();