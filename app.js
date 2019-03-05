d3.csv("data/allCCC.csv", function(data) {
    printTickers(data);
    printEPS(data);
});

function printTickers(data) {
    console.log(data["Name"] + " - " + data["Symbol"]);
}

function printEPS(data) {
    console.log("Earnings per share: " + data["EPS"]);
}