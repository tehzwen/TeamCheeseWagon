
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
		.attr("height", 18);

	svgContainer
		.append("rect")
		.attr("x", 10)
		.attr("y", 10)
		.attr("width", width * frac)
		.attr("height", 5)
		.style("fill", reverse ? '#DC143C' : '#390');
}

function insertCompanyData(id, frac, offset, columnNumber, data, attr, reverse, unit) {
	let base = d3.select(`#${id}-${1 + columnNumber}`)
		.append("div").attr('class', 'ui grid')
		.append("div").attr('class', 'row');

	base.append("div").attr('class', 'middle aligned two wide column')
		.text(`${unit || ''}${data[`${attr}`]}`)

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
	if (a === 0 || b === 0 || isNaN(a) || isNaN(b)) {
		return { offset: 1, frac: 0 };
	} else {
		return (a < b)
			? { offset: 2, frac: (b / a) - 1 }
			: { offset: 1, frac: (a / b) - 1 };
	}
}

function generateMetricComparison(parentNode, title, id, attr, dataA, dataB, reverse, unit) {
	const MAX_WIDTH = 160;

	const a = parseFloat(dataA[`${attr}`].replace(/,/g, ''));
	const b = parseFloat(dataB[`${attr}`].replace(/,/g, ''));
	const { offset, frac } = compare(a, b);

	/* Create row template */
	buildRow(parentNode, title, id);

	/* -------------------- Set up company data ---------------------- */
	insertCompanyData(id, frac, offset, 1, dataA, attr, reverse, unit);
	insertCompanyData(id, frac, offset, 2, dataB, attr, reverse, unit);

	/* -------------------- DRAW RECTANGLE ---------------------- */
	insertRectangle(id, offset, frac, MAX_WIDTH, reverse);
}

export default function generateComparision(dataArr) {
	const [ data1, data2 ] = dataArr;
	
	if (!(data1 && data2)) {
		return;
	}

	// Setup Ticker and Company Names
	d3.select("#t1-2").append('h1').text(`${data1[`Symbol`]}`);
	d3.select("#n1-2").append('h4').text(`${data1[`Name`]}`);

	d3.select("#t1-3").append('h1').text(`${data2[`Symbol`]}`);
	d3.select("#n1-3").append('h4').text(`${data2[`Name`]}`);

	const parentNode1 = d3.select('#card1');
	const parentNode2 = d3.select('#card2');

	/*  -- Metrics -- */
	// Card 1
	generateMetricComparison(parentNode1, 'Market Cap (Millions)','mCap', '($Mil)', data1, data2, false, '$');
	generateMetricComparison(parentNode1, 'Price','price', 'Price', data1, data2, false, '$');
	generateMetricComparison(parentNode1, 'Price/Book Value','priceBook', 'P/Book', data1, data2, true);
	generateMetricComparison(parentNode1, 'Debt/Equity','debtEquity', 'Equity', data1, data2, true);

	// Card 2
	generateMetricComparison(parentNode2, 'Current Dividend', 'currDividend', 'Dividend', data1, data2, false, '$');
	generateMetricComparison(parentNode2, 'Divident Yield', 'divYield', 'Yield', data1, data2, false);
	generateMetricComparison(parentNode2, 'Payouts Per Year', 'payouts', 'Year', data1, data2, false);
    generateMetricComparison(parentNode2, 'Dividend to Earnings Growth','deg', 'DEG', data1, data2, false);
    generateMetricComparison(parentNode2, 'Dividend Growth Rate last 1 Years','dgrowth1', '1-yr', data1, data2);
	generateMetricComparison(parentNode2, 'Dividend Growth Rate last 3 Years','dgrowth2', '3-yr', data1, data2);
	generateMetricComparison(parentNode2, 'Dividend Growth Rate last 5 Years','dgrowth3', '5-yr', data1, data2);

}