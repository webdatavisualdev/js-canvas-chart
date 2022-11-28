// Define Canvas and Context variables
var canvas, ctx;

// Define tooltip and marketCap, volume text fields
var priceTooltip, dateTooltip, divider, marketCap, volume;

// Variable for Months
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Max Window Size
var maxWindowWidth = 1920, maxWindowHeight = 1080;

// Chart options
var options = {
    // Y Axis option
    yAxis: {
        ticks: 5,
        margin: 10,
        color: "#ccc",
        font: "20px Georgia"
    },
    // X Axis option
    xAxis: {
        ticks: 12,
        textMargin: 15,
        color: "#ccc",
        font: "16px Georgia"
    },
    // Grid option
    grid: {
        x: true,
        y: true,
        color: "#ddd"
    },
    // Line chart option
    lineChart: {
        color: "#2574c7",
        width: 4
    },
    // Bar chart option
    barChart: {
        fillColor: "#ddd",
        width: 15
    },
    data: [],
    type: '7d'
};

// Chart Range
var chartRect = {
    width: 0,
    height: 0,
    marginX: 100,
    marginY: 50
};

window.onload = function () {
    priceTooltip = document.getElementById("priceTooltip");
    dateTooltip = document.getElementById("dateTooltip");
    divider = document.getElementById("divider");
    marketCap = document.getElementById("marketCap");
    volume = document.getElementById("volume");

    initCanvas();
    getData(drawChart, options.type);
	setInterval(function() {
        getData(drawChart, options.type);
    }, 600000);
}

window.onresize = function () {
    resizeCanvas();
    hideTooltip();
    drawChart(options.data);
}

// Initiate canvas
function initCanvas() {
    canvas = document.getElementById("chart");
    resizeCanvas();
    ctx = canvas.getContext("2d");
}

// Set canvas width and height when resize
function resizeCanvas() {
    canvas.width = document.getElementById("chartContainer").offsetWidth;
    canvas.height = canvas.width < 768 ? 400 : maxWindowHeight - 100;
    chartRect.width = canvas.width - chartRect.marginX;
    chartRect.height = canvas.height - chartRect.marginY;
}

// Call this function when click period buttons
function selectPeriod(type, index) {
    for (var i = 0 ; i < document.getElementsByClassName('btn').length ; i ++) {
        document.getElementsByClassName('btn')[i].classList.remove("active");
    }
    document.getElementsByClassName('btn')[index].classList.add("active");
    options.type = type;
    getData(drawChart, options.type);
}


// Draw chart function
function drawChart(data) {
    clearChart();
    hideTooltip();

    options.data = data;

    // Set number of tick in X Axis regarding the period
    switch(options.type) {
        case '24h':
            options.xAxis.ticks = 6;
        break;
        case '7d':
            options.xAxis.ticks = 6;
        break;
        case '1m':
            options.xAxis.ticks = 5;
        break;
        case '3m':
            options.xAxis.ticks = 7;
        break;
        case '1y':
            options.xAxis.ticks = 6;
        break;
        case 'all':
            options.xAxis.ticks = 9;
        break;
        default:
            options.xAxis.ticks = 6;
        break;
    }

    drawGrid();

    var minPrice = 1000000, maxPrice = 0, minVolume = 10000000000000, maxVolume = 0;
    var lineDataSet = [], barDataSet = [];

    // Change data for line chart and bar chart
    data.price.sort(function(a, b) {
        if (a.date > b.date) {
            return 1;
        } else if (a.date < b.date) {
            return -1;
        }
        return 0;
    }).forEach((p, i) => {
        // Merge marketCap and volume data
        for (var i = 0 ; i < data.marketCap.length ; i ++) {
            if (data.marketCap[i].date.substr(0, 16) === p.date.substr(0, 16)) {
                p.marketCap = data.marketCap[i].amount;
                p.marketCapFormatted = data.marketCap[i].amountFormatted;
                break;
            }
        }
        for (var i = 0 ; i < data.volume.length ; i ++) {
            if (data.volume[i].date.substr(0, 16) === p.date.substr(0, 16)) {
                p.volume = data.volume[i].amount;
                p.volumeFormatted = data.volume[i].amountFormatted;
                break;
            }
        }

        switch(options.type) {
            case '24h':
                if (i % 2 === 1) {
                    lineDataSet.push(p);
                }
                barDataSet.push(p);
            break;
            case '7d':
                if (i % 12 === 6) {
                    lineDataSet.push(p);
                }
                if (i % 2 === 1) {
                    barDataSet.push(p);
                }
            break;
            case '1m':
                if (i % 3 === 1) {
                    lineDataSet.push(p);
                }
                barDataSet.push(p);
            break;
            case '3m':
                if (i % 6 === 3) {
                    lineDataSet.push(p);
                }
                if (i % 2 === 1) {
                    barDataSet.push(p);
                }
            break;
            case '1y':
                if (i % 30 === 15) {
                    lineDataSet.push(p);
                }
                if (i % 5 === 2) {
                    barDataSet.push(p);
                }
            break;
            case 'all':
                if (i % 100 === 50) {
                    lineDataSet.push(p);
                }
                if (i % 20 === 10) {
                    barDataSet.push(p);
                }
            break;
            default:
                if (i % 12 === 11) {
                    lineDataSet.push(p);
                }
                if (i % 3 === 2) {
                    barDataSet.push(p);
                }
            break;
        }

        var price = parseInt(p.amount), volumeValue = parseInt(p.volume);
        if (price < minPrice) {
            minPrice = price - options.yAxis.margin;
        } 
        if (price > maxPrice) {
            maxPrice = price + options.yAxis.margin;
        }
        if (volumeValue < minVolume) {
            minVolume = volumeValue - 100000000;
        } 
        if (volumeValue > maxVolume) {
            maxVolume = volumeValue + 100000000;
        }
    });

    // Draw bar chart
    var deltaVolume = chartRect.height / ((maxVolume - minVolume) * 2), bars = [];
    ctx.beginPath();
    ctx.fillStyle = options.barChart.fillColor;
    for (var i = 0 ; i < barDataSet.length ; i ++) {
        bars.push({
            x1: i * chartRect.width / barDataSet.length,
            x2: i * chartRect.width / barDataSet.length + options.barChart.width * chartRect.width / maxWindowWidth,
            y1: chartRect.height - deltaVolume * (parseInt(barDataSet[i].volume) - minVolume),
            y2: chartRect.height - deltaVolume * (parseInt(barDataSet[i].volume) - minVolume) + deltaVolume * (parseInt(barDataSet[i].volume) - minVolume),
            i: i
        });
        ctx.rect(i * chartRect.width / barDataSet.length, chartRect.height - deltaVolume * (parseInt(barDataSet[i].volume) - minVolume), 
            options.barChart.width * chartRect.width / maxWindowWidth, deltaVolume * (parseInt(barDataSet[i].volume) - minVolume));
        ctx.fill();
    }
    ctx.closePath();

    // Draw line chart
    var delta = chartRect.height / (maxPrice - minPrice);
    var circles = [];
    ctx.beginPath();
    ctx.strokeStyle = options.lineChart.color;
    ctx.lineWidth = options.lineChart.width;
    ctx.arc(50 * chartRect.width / maxWindowWidth, chartRect.height - delta * (parseInt(lineDataSet[0].amount) - minPrice), 3, 0, 2 * Math.PI);
    circles.push({
        x: 50 * chartRect.width / maxWindowWidth,
        y: chartRect.height - delta * (parseInt(lineDataSet[0].amount) - minPrice),
        i: 0
    });
    ctx.stroke();
    for (var i = 1 ; i < lineDataSet.length ; i ++) {
        ctx.moveTo(50 * chartRect.width / maxWindowWidth + (i - 1) * chartRect.width / lineDataSet.length, chartRect.height - delta * (parseInt(lineDataSet[i - 1].amount) - minPrice));
        ctx.lineTo(50 * chartRect.width / maxWindowWidth + i * chartRect.width / lineDataSet.length, chartRect.height - delta * (parseInt(lineDataSet[i].amount) - minPrice));
        ctx.arc(50 * chartRect.width / maxWindowWidth + i * chartRect.width / lineDataSet.length, chartRect.height - delta * (parseInt(lineDataSet[i].amount) - minPrice), 3, 0, 2 * Math.PI);
        circles.push({
            x: 50 * chartRect.width / maxWindowWidth + i * chartRect.width / lineDataSet.length,
            y: chartRect.height - delta * (parseInt(lineDataSet[i].amount) - minPrice),
            i: i
        });
        ctx.stroke();
    }
    ctx.closePath();

    // Add mousemove event
    canvas.addEventListener('mousemove', function(e) {
        circles.forEach(c => {
            if (c.x + 5 > e.offsetX && c.x - 5 < e.offsetX && c.y + 5 > e.offsetY && c.y - 5 < e.offsetY) {
                showTooltip(lineDataSet[c.i], c.x, c.y);
            } else {
            }
        });

        bars.forEach(b => {
            if (b.x1 < e.offsetX && b.x2 > e.offsetX && b.y1 < e.offsetY && b.y2 > e.offsetY) {
                showDetailData(barDataSet[b.i]);
            } else {
            }
        });
    });

    drawYAxis(maxPrice, minPrice);
    drawXAxis(barDataSet);
}

// Clean chart rectangle for redraw
function clearChart() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Show tooltip when mouseover the circles of line chart
function showTooltip(data, x, y) {
    priceTooltip.style.display = "block";
    priceTooltip.innerHTML = data.amountFormatted;
    priceTooltip.style.left = x - 35 > 0 ? x - 35 : x + "px";
    priceTooltip.style.top = y - 70 > 0 ? y - 70 : (y + 15) + "px";

    dateTooltip.style.display = "block";
    dateTooltip.innerHTML = getTime(data.date);
    dateTooltip.style.left = x - 20 > 0 ? x - 20 : x + "px";
    dateTooltip.style.top = (chartRect.height) + "px";

    divider.style.display = "block";
    divider.style.left = (x + 7) + "px";
    divider.style.top = y - 70 > 0 ? y - 30 : (y + 55) + "px";
    divider.style.height = ((chartRect.height + 10) - (y - 70 > 0 ? y - 40 : (y + 45)) - 20) + "px";

    marketCap.innerHTML = data.marketCapFormatted + " USD";
    volume.innerHTML = data.volumeFormatted + " USD";
}

// Update marketCap and volume text field when mouseover line chart or bar chart
function showDetailData(data) {
    marketCap.innerHTML = data.marketCapFormatted + " USD";
    volume.innerHTML = data.volumeFormatted + " USD";
}

// Get time as HH:MM
function getTime(dateString) {
    return ("0" + new Date(dateString).getHours()).slice(-2) + ":" + ("0" + new Date(dateString).getMinutes()).slice(-2);
}

// Hide tooltip
function hideTooltip() {
    priceTooltip.style.display = "none";
    dateTooltip.style.display = "none";
    divider.style.display = "none";
}

// Draw Y Axis labels
function drawYAxis(max, min) {
    ctx.beginPath();
    ctx.fillStyle = options.yAxis.color;
    ctx.font = options.yAxis.font;
    var delta = (max - min) / options.yAxis.ticks;
    for (var i = 0 ; i < options.yAxis.ticks ; i ++) {
        ctx.fillText("$" + parseInt(max - i * delta), chartRect.width + 20, i * chartRect.height / options.yAxis.ticks + 20);
    }
    ctx.closePath();
}

// Draw X Axis labels
function drawXAxis(data) {
    var days = [], hours = [];
    var deltaXAxis = parseInt(data.length / options.xAxis.ticks);
    data.forEach((d, index) => {
        var day = new Date(d.date).getDate() + " " + months[new Date(d.date).getMonth()];
        if (index % deltaXAxis === parseInt(deltaXAxis / 2) && options.type !== 'all') {
            days.push(day);
        } else if (index % deltaXAxis === parseInt(deltaXAxis / 2) && options.type === 'all') {
            days.push(day + ", " + new Date(d.date).getFullYear());
        }

        if (index % deltaXAxis === parseInt(deltaXAxis / 2)) {
            hours.push(new Date(d.date).getDate() + " " + months[new Date(d.date).getMonth()] + " " + getTime(d.date));
        }
    });
    ctx.beginPath();
    ctx.fillStyle = options.xAxis.color;
    ctx.font = options.xAxis.font;
    var delta = chartRect.width / options.xAxis.ticks;
    for (var i = 0 ; i < options.xAxis.ticks ; i ++) {
        if (options.type === '24h') {
            ctx.fillText(hours[i], delta / 2 - 30 + i * delta, chartRect.height + chartRect.marginY - 10);
        } else {
            ctx.fillText(days[i], delta / 2 - 15 + i * delta, chartRect.height + chartRect.marginY - 10);
        }
    }
    ctx.closePath();
}

// Draw chart grid
function drawGrid() {
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = options.grid.color;
    if (options.grid.y) {
        for (var i = 1 ; i <= options.yAxis.ticks ; i ++) {
            ctx.moveTo(0, i * chartRect.height / options.yAxis.ticks);
            ctx.lineTo(chartRect.width + chartRect.marginX, i * chartRect.height / options.yAxis.ticks);
            ctx.stroke();
        }
    }
    if (options.grid.x) {
        for (var i = 1 ; i <= options.xAxis.ticks ; i ++) {
            ctx.moveTo(10 + i * chartRect.width / options.xAxis.ticks, 0);
            ctx.lineTo(10 + i * chartRect.width / options.xAxis.ticks, chartRect.height);
            ctx.stroke();
        }
    }
    ctx.closePath();
}

// Call the api to get data
function getData(callback, type) {
    var api = '', apis = [];

    // Set api url regarding the period
    switch(type) {
        case '24h':
            api = "http://sandbox.spendsdk.com/api/marketData?symbol=BTC";
        break;
        case '7d':
            apis = ["http://sandbox.spendsdk.com/api/marketData?symbol=BTC&period=hours&periodFactor=24", 
                "http://sandbox.spendsdk.com/api/marketData?symbol=BTC&period=hours&periodFactor=48",
                "http://sandbox.spendsdk.com/api/marketData?symbol=BTC&period=hours&periodFactor=72",
                "http://sandbox.spendsdk.com/api/marketData?symbol=BTC&period=hours&periodFactor=96",
                "http://sandbox.spendsdk.com/api/marketData?symbol=BTC&period=hours&periodFactor=120",
                "http://sandbox.spendsdk.com/api/marketData?symbol=BTC&period=hours&periodFactor=144"];
        break;
        case '1m':
            api = "http://sandbox.spendsdk.com/api/marketData?symbol=BTC&period=days&periodFactor=30";
        break;
        case '3m':
            api = "http://sandbox.spendsdk.com/api/marketData?symbol=BTC&period=days&periodFactor=90";
        break;
        case '1y':
            api = "http://sandbox.spendsdk.com/api/marketData?symbol=BTC&period=days&periodFactor=365";
        break;
        case 'all':
            api = "http://sandbox.spendsdk.com/api/marketData?symbol=BTC&period=days&periodFactor=10000";
        break;
        default:
            api = "http://sandbox.spendsdk.com/api/marketData?symbol=BTC";
        break;
    }

    if (api !== '') {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                callback(JSON.parse(xhttp.responseText).data);
            }
        };
        xhttp.open("GET", api, true);
        xhttp.send(null);
    } else {
        var arrXhr=[];
        var helperFunc = function (arrIndex) {
            return function() {
            if (arrXhr[arrIndex].readyState === 4) {
                    ProcessResponseForAllItems(apis, arrXhr, callback);
                }
            }
        }
    
        for(var i = 0 ; i < apis.length ; i ++) {
            arrXhr[i]=new XMLHttpRequest();
            arrXhr[i].open('GET', apis[i], true);
            arrXhr[i].onreadystatechange = helperFunc(i);
            arrXhr[i].send(null);
        }
    }
}

// Call this function to get 7 day's data
function ProcessResponseForAllItems(apis, arrXhr, callback) {
    var i, isAllComplete = true, isAllCompleteSucc = true;
    for (i = 0 ; i < apis.length ; i ++) {
        if((!arrXhr[i]) || (arrXhr[i].readyState !== 4)) {
            isAllComplete = false;
            break;
        }
    }
    if (isAllComplete) {
        var data = {
            price: [],
            marketCap: [],
            volume: []
        };
        for(i = 0 ; i < apis.length ; i ++) {
            if (arrXhr[i].status !== 200) {
                isAllCompleteSucc = false;
                break;
            } else {
                data.price = data.price.concat(JSON.parse(arrXhr[i].responseText).data.price);
                data.marketCap = data.marketCap.concat(JSON.parse(arrXhr[i].responseText).data.marketCap);
                data.volume = data.volume.concat(JSON.parse(arrXhr[i].responseText).data.volume);
            }
        } 
        if (isAllCompleteSucc) {
            callback(data);
        }
        else {
            console.log('failed')
        }
    }
}