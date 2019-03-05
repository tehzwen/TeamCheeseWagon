d3.csv("data/champions.csv", function(data) {
    printDividendInfo(data);
});

function printDividendInfo(data) {
    console.log(data["U.S. Dividend Champions"] + " - " + data["Dividend Information"]);
}