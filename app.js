var margin = { top: 20, right: 20, bottom: 30, left: 50 };
width = 1200 - margin.left - margin.right,
height = 900 - margin.top - margin.bottom;

function renderTreeMap(dataSet, metric) {
    d3.csv(dataSet, function(data) {
        let nest = d3.nest()
        .key(function(d) { return d.Sector; })
        .key(function(d) { return d.Symbol; })
        .rollup(function(d) { return d3.sum(d, function(d) { return d[metric]; }); });
    
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
    
        let treemap = d3.treemap()
        .size([width, height])
        .paddingTop(10)
        .paddingRight(5)
        .paddingInner(2)
        .round(true);
    
        let color = d3.scaleThreshold()
        .domain([-10, -1, 1, 10])
        .range(["#644553", "#8B444E", "#414554", "#347D4E", "#38694F"])
    
        let root = d3.hierarchy({values: nest.entries(data).slice(0, -1)}, function(d) { return d.values; })
        .sum(function(d) { return d.value; })
        .sort(function(a, b) { return b.value - a.value; });
    
        treemap(root);
        
        let node = d3.select("#treemap")
        .selectAll(".node")
        .data(root.leaves())
        .enter().append("div")
        .attr("class", "node")
        .style("left", function(d) { return d.x0 + "px"; })
        .style("top", function(d) { return d.y0 + "px"; })
        .style("width", function(d) { return d.x1 - d.x0 + "px"; })
        .style("height", function(d) { return d.y1 - d.y0 + "px"; })
        .style("background", function(d) { 
            let sector = d.parent.data.key;
            let average = averageMap.get(sector);
            let diff = (d.value - average).toFixed();
            return color(diff)
        })
        .append("div")
        .attr("class", "header")
        .style("left", function(d) { return d.x0 + "px"; })
        .style("top", function(d) { return (d.y0 - 20) + "px"; })
        .style("width", function(d) { return d.x1 - d.x0 + "px"; })
        .style("height", function(d) { return d.y1 - d.y0 + "px"; })
        .text(function(d) {
            let sector = d.parent.data.key;
            let metric = d.value;
    
            if (metric === maxMap.get(sector)) {
                if(sector === "Communication Services") {
                    return "Comm. Serv"
                } else {
                    return sector;
                }
    
            }
        })
    
        node.append("div")
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
            return diff
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
    
        node.append("div")
        .attr("class", "node-label")
        .text(function(d) { return d.data.key; })
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

renderTreeMap("/data/contenders.csv", "Price")