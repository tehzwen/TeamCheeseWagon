
function buildRow(node, title, id) {
	const row = node.append('div').attr('class', 'row metric');
	row.append('div').attr('id', `${id}-1`).attr('class', 'middle aligned four wide column')
		.text(title);
	row.append('div').attr('id', `${id}-2`).attr('class', 'middle aligned six wide column');
	row.append('div').attr('id', `${id}-3`).attr('class', 'middle aligned six wide column');
}

function insertRectangle(id, offset, frac, width, reverse) {
	var thirdDiv = d3.select(`#${id}-${1 + offset}`)
		.select("div")
		.select("div")
		.selectAll("div")
		.filter((d, i) => (i === 2));

	let svgContainer = thirdDiv
		.append("svg")
		.attr("width", width)
		.attr("height", 18)
		// .style("float","left")

	svgContainer
		.append("rect")
		.attr("x", 10)
		.attr("y", 10)
		.attr("width", width * frac)
		.attr("height", 5)
		.style("fill", reverse ? '#DC143C' : '#390');
}

function insertCompanyData(id, frac, offset, columnNumber, data, attr, reverse) {
	let base = d3.select(`#${id}-${1 + columnNumber}`)
		.append("div").attr('class', 'ui grid')
		.append("div").attr('class', 'row');

	base.append("div").attr('class', 'middle aligned two wide column')
		.text(`${data[`${attr}`]}`)

	let secondColumn = base.append("div").attr('class', 'middle aligned right aligned five wide column')

	if (frac !== 0 && offset === columnNumber) {
		secondColumn.text(`${Math.round(frac * 100)}%`).style("color", reverse ? '#DC143C' : '#390');

	}

	// if (frac !== 0 && offset === 1) {
	// 	secondColumn.text(`${Math.round(frac * 100)}%`).style("color", '#390');
	// }

	base.append("div").attr('class', 'middle aligned eight wide column');
}

function compare(a, b) {
	if (a === 0 || b === 0) {
		return { offset: 1, frac: 0 };
	} else {
		return (a < b)
			? { offset: 2, frac: (b / a) - 1 }
			: { offset: 1, frac: (a / b) - 1 };
	}
}

function generateMultiSelectComparison(node, id, dataA, dataB) {
	const MAX_WIDTH = 160;

	const attr = '3-yr';
	const title = 'Dividend'

	const a = parseFloat(dataA[`${attr}`].replace(/,/g, ''));
	const b = parseFloat(dataB[`${attr}`].replace(/,/g, ''));
	const { offset, frac } = compare(a, b);

	const row = node.append('div').attr('class', 'row metric');
	
	const firstColumn = row.append('div').attr('id', `${id}-1`).attr('class', 'middle aligned four wide column');

	const fGrid = firstColumn
		.append('div').attr('class', 'ui grid');
	fGrid.append('div').attr('class', 'centered row').text(title);
	const fRow = fGrid.append('div').attr('class', 'centered row');
	fRow.append('div').attr('class', 'three wide column')
		.append("button").attr('class', 'ui button ').text(1)
	fRow.append('div').attr('class', 'three wide column')
		.append("button").attr('class', 'ui button ').text(3)
	fRow.append('div').attr('class', 'three wide column')
		.append("button").attr('class', 'ui button').text(5);
	
	row.append('div').attr('id', `${id}-2`).attr('class', 'middle aligned six wide column');
	row.append('div').attr('id', `${id}-3`).attr('class', 'middle aligned six wide column');
	
	/* -------------------- Set up company data ---------------------- */
	insertCompanyData(id, frac, offset, 1, dataA, attr, reverse);
	insertCompanyData(id, frac, offset, 2, dataB, attr, reverse);

	/* -------------------- DRAW RECTANGLE ---------------------- */
	insertRectangle(id, offset, frac, MAX_WIDTH, reverse);
}

function generateMetricComparison(parentNode, title, id, attr, dataA, dataB, reverse) {
	const MAX_WIDTH = 160;

	const a = parseFloat(dataA[`${attr}`].replace(/,/g, ''));
	const b = parseFloat(dataB[`${attr}`].replace(/,/g, ''));
	const { offset, frac } = compare(a, b);

	/* Create row template */
	buildRow(parentNode, title, id);

	/* -------------------- Set up company data ---------------------- */
	insertCompanyData(id, frac, offset, 1, dataA, attr, reverse);
	insertCompanyData(id, frac, offset, 2, dataB, attr, reverse);

	/* -------------------- DRAW RECTANGLE ---------------------- */
	insertRectangle(id, offset, frac, MAX_WIDTH, reverse);
}

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

	d3.csv("/data", (data) => {
		if (data[`Symbol`] === tickerOne) selectedArr[0] = data;
		if (data[`Symbol`] === tickerTwo) selectedArr[1] = data;
	}).then(() => {
		if (selectedArr.length === 2) {
			cleanUp();
			generateComparision(selectedArr);
		}
	});
}



function generateComparision (dataArr) {
	const [ data1, data2 ] = dataArr;

	// Setup Ticker and Company Names
	d3.select("#t1-2").append('h1').text(`${data1[`Symbol`]}`);
	d3.select("#n1-2").append('h4').text(`${data1[`Name`]}`);

	d3.select("#t1-3").append('h1').text(`${data2[`Symbol`]}`);
	d3.select("#n1-3").append('h4').text(`${data2[`Name`]}`);

	const parentNode1 = d3.select('#card1');
	const parentNode2 = d3.select('#card2');

	/*  -- Metrics -- */
	// Card 1
	generateMetricComparison(parentNode1, 'Market Cap','mCap', '($Mil)', data1, data2);
	generateMetricComparison(parentNode1, 'Price','price', 'Price', data1, data2);
	generateMetricComparison(parentNode1, 'Price/Book Value','priceBook', 'P/Book', data1, data2, true);
	generateMetricComparison(parentNode1, 'Debt/Equity','debtEquity', 'Equity', data1, data2, true);

	// Card 2
	generateMetricComparison(parentNode2, 'Current Dividend', 'currDividend', 'Dividend', data1, data2);
	generateMetricComparison(parentNode2, 'Divident Yield', 'divYield', 'Yield', data1, data2);
	generateMetricComparison(parentNode2, 'Payouts Per Year', 'payouts', 'Year', data1, data2);
	generateMetricComparison(parentNode2, 'Dividend to Earnings Growth','deg', 'DEG', data1, data2);
	// generateMetricComparison(parentNode2, 'Dividend Growth Rate last 3 Years','dgrowth', '3-yr', data1, data2);
	// generateMetricComparison(parentNode2, 'Dividend Growth Rate last 1 Years','dgrowth', '1-yr', data1, data2);
	// generateMetricComparison(parentNode2, 'Dividend Growth Rate last 5 Years','dgrowth', '5-yr', data1, data2);

	generateMultiSelectComparison(parentNode2, 'dgrowth', data1, data2);
}

let fullData = [];
let dropdownOptions = [];

function run () {
	d3.csv("/data", (data) => {
		const ticker = data[`Symbol`];
		d3.select(`#a1-2`)
			.append("option")
			.attr("value", ticker)
			.text(ticker)

		d3.select(`#a1-3`)
			.append("option")
			.attr("value", ticker)
			.text(ticker)

	}).then(() => {});
}
run();