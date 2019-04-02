// import overview from 'app.js';

// var valueName = "Growth"
// var overAllHeight = 1000;
// var overAllWidth = 1200;
// var textColor = 'black';
// var themeColor = '#68edbc';
// var boxFontSize = 0;

// function runZoomIn(sectorName, valueName) {
//     d3.select('#toolTip').remove();
//     var sectorName = sectorName;

//     d3.select('div')
//         .insert('div')
//         .attr('id', 'mydiv')

//     var myDiv = d3.select('#mydiv')

//     myDiv.insert('h1')
//         .text(sectorName)

//     var valueOptions = [
//         "Growth",
//         "PEG",
//         "P/E",
//         "Price",
//         "Dividend"
//     ]

//     //set first item to the value that was passed from overview
//     for (let i = 0; i < valueOptions.length; i++) {
//         if (valueOptions[i] === valueName) {
//             let temp = valueOptions[0];
//             valueOptions[0] = valueName;
//             valueOptions[i] = temp;
//         }
//     }

//     myDiv
//         .insert("div")
//         .attr('id', 'innerButtonDiv')
//         .style('margin-left', '5vh')
//         .style('display', 'flex')

//     var backButton = d3.select("#innerButtonDiv")
//         .insert('button')
//         .text('Back')

//     backButton.on("click", function (d) {
//         overview();
//     });

//     var valueSelect = d3.select("#innerButtonDiv")
//         .insert("select")
//         .style('font-family', 'Courier New, Courier, monospace')
//         .style('color', textColor)
//         .style('width', '10vw')
//         .style('height', '1.5vw')

//     valueSelect.selectAll("option")
//         .data(valueOptions)
//         .enter()
//         .append("option")
//         .attr("value", function (d) {
//             return d;
//         })
//         .text(function (d) {
//             return d;
//         });

//     getData(sectorName, valueName);

//     valueSelect.on("change", function (d) {
//         valueName = d3.select(this).property("value");
//         getData(sectorName, valueName);
//     });

// }

// function getData(sector, value) {

//     d3.select("svg").remove();
//     d3.select("body")
//         .append("svg")
//         .style("width", overAllWidth)
//         .style("height", overAllHeight)
//         .append("g");

//     d3.csv("/data/allCCC.csv", function (data) {

//         let filteredArray = data.filter((value, index, array) => {
//             if (value.Sector === sector) {
//                 return value;
//             }
//         });

//         var actualData = { "name": "", "children": [] };

//         for (let i = 0; i < filteredArray.length; i++) {

//             if (filteredArray[i][value] > 0 && filteredArray[i][value] !== "n/a") {
//                 //console.log(filteredArray[i][value]);
//                 actualData.children.push({
//                     "name": filteredArray[i]["Symbol"],
//                     "value": filteredArray[i][value]
//                 });
//             }
//         }

//         d3.select("#treemap").remove();
//         d3.select("#valueSelect").remove();
//         d3.select("#toolTip").remove();
//         displayTreeMap(actualData);

//     });
// }

// function getAverage(actualData) {
//     var total = 0.0;

//     for (let i = 0; i < actualData.children.length; i++) {
//         if (actualData.children[i].value !== "n/a") {
//             total += parseFloat(actualData.children[i].value);
//         }

//     }

//     var avg = total / actualData.children.length;
//     return avg;
// }

// function displayTreeMap(actualData) {
//     let color = d3
//         .scaleThreshold()
//         .domain([-10, -1, 1, 10])
//         .range(["#644553", "#8B444E", "#414554", "#347D4E", "#38694F"]);

//     var avg = getAverage(actualData);

//     var treemapLayout = d3.treemap()
//         .size([overAllWidth, overAllHeight])
//         .tile(d3.treemapSquarify)
//         .paddingOuter(10);

//     var root = d3.hierarchy(actualData)

//     root.sum(function (d) {
//         return d.value;
//     });

//     treemapLayout(root);

//     var blocks = d3.select('svg g')
//         .selectAll('rect')
//         .data(root.descendants())
//         .append('rect')
//         .attr('x', function (d) { return d.x0; })
//         .attr('y', function (d) { return d.y0; })
//         .attr('width', function (d) { return d.x1 - d.x0 + "px"; })
//         .attr('height', function (d) { return d.y1 - d.y0 + "px"; })


//     blocks.enter()


//     var nodes = d3.select('svg g')
//         .selectAll('g')
//         .data(root.descendants())
//         .enter()
//         .append('g')

//         .attr('transform', function (d) {
//             return 'translate(' + [d.x0, d.y0] + ')'
//         })


//     nodes
//         .append('rect')
//         .attr('width', function (d) { return d.x1 - d.x0; })
//         .attr('height', function (d) { return d.y1 - d.y0; })

//     nodes
//         .append('text')
//         .style('font-family', 'Courier New, Courier, monospace')
//         .style('fill', 'white')
//         .text(function (d) {

//             if (d.value < (avg - d.value)) {
//                 return "";
//             }

//             return d.data.name;
//         })
//         .attr('dx', 4)
//         .attr('dy', 14)


//     nodes
//         .append('text')
//         .style('font-weight', 'bold')
//         .style('font-family', 'Courier New, Courier, monospace')
//         .style('fill', 'white')
//         .text(function (d) {
//             if (d.value < (avg - d.value)) {
//                 return "";
//             }

//             return d.data.value;
//         })

//         .attr('dx', 4)
//         .attr('dy', 35)


//     d3.selectAll('rect')
//         .attr("id", "data-square")
//         .attr('fill', function (d) {
//             let diff = (d.value - avg).toFixed();
//             return color(diff);
//         })
//         .attr('stroke', 'white')
// }


// //main();