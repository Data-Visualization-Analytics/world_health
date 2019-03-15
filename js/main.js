var margin = { left:80, right:20, top:50, bottom:100 };
var height = 500 - margin.top - margin.bottom, 
    width = 800 - margin.left - margin.right;

var g = d3.select("#chart-area")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + 
            ", " + margin.top + ")");

var time = 0;
//Tooltip
/*var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d; });
{continent: "europe", country: "Portugal", income: 1687, life_exp: 35.6, population: 3136245}

*/

var tip = d3.tip()
.attr("class", "d3-tip")
.offset([-8, 0])
.html(function(d) {  
    var text = "<strong>Country : </strong> <span style='color:red'>" + d.country + "</span><br/>";
    text += "<strong>Continent : </strong> <span style='color:red'>" + d.continent + "</span><br/>";
    text += "<strong>Life Expectancy : </strong> <span style='color:red'>" + d.life_exp + "</span><br/>";
    text += "<strong>GDP per Capita : </strong> <span style='color:red'>" + d.income + "</span><br/>";
    text += "<strong>Population : </strong> <span style='color:red'>" + d.population + "</span><br/>";
    return text;
});

g.call(tip);

// Scales
var x = d3.scaleLog()
    .base(10)
    .range([0, width])
    .domain([142, 150000]);

var y = d3.scaleLinear()
    .range([height, 0])
    .domain([0, 90]);

var area = d3.scaleLinear()
    .range([25*Math.PI, 1500*Math.PI])
    .domain([2000, 1400000000]);

var continentColor = d3.scaleOrdinal(d3.schemeCategory10 );

// Labels
var xLabel = g.append("text")
    .attr("y", height + 50)
    .attr("x", width / 2)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("GDP Per Capita ($)");

var yLabel = g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("x", -170)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Life Expectancy (Years)")

var timeLabel = g.append("text")
    .attr("y", height -10)
    .attr("x", width - 40)
    .attr("font-size", "40px")
    .attr("opacity", "0.4")
    .attr("text-anchor", "middle")
	.text("1800");
	
var countryLabel = g.append("text")

// X Axis
var xAxisCall = d3.axisBottom(x)
    .tickValues([400, 4000, 40000])
    .tickFormat(d3.format("$"));
g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height +")")
    .call(xAxisCall);

// Y Axis
var yAxisCall = d3.axisLeft(y)
    .tickFormat(function(d){ return +d; });
g.append("g")
    .attr("class", "y axis")
    .call(yAxisCall);

//Legends
var continents = ["asia","europe","americas","africa"];

var legend = g.append("g")
            .attr("transform","translate (" + (width-10) + "," +
            (height-125) + ")"); 

continents.forEach((continents,i) => {
    var legendRow = legend.append("g")
            .attr("transform","translate (0, " + (i*20) + ")");
    
            legendRow.append("rect")
                .attr("width",10)
                .attr("height",10)
                .attr("fill", continentColor(continents));

            legendRow.append("text")
                .attr("x", -10)
                .attr("y", 10)
                .attr("text-anchor", "end")
                .style("text-transform", "capitalize")
                .text(continents);
});

d3.json("data/data.json").then(function(data){
    

    // Clean data
    const formattedData = data.map(function(year){
        return year["countries"].filter(function(country){
            var dataExists = (country.income && country.life_exp);
            return dataExists;
        }).map(function(country){
            country.income = +country.income;
            country.life_exp = +country.life_exp;
            return country;            
        })
    });
	
    // Run the code every 0.2 second
    d3.interval(function(){
        // At the end of our data, loop back
        time = (time < 214) ? time+1 : 0
        update(formattedData[time]);            
	}, 150);
	
    // First run of the visualization
    update(formattedData[0]);

})

function update(data) {
    // Standard transition time for the visualization
    var t = d3.transition()
        .duration(100);

    // JOIN new data with old elements.
    var circles = g.selectAll("circle").data(data, function(d){
        return d.country;
    });

    // EXIT old elements not present in new data.
    circles.exit()
        .attr("class", "exit")
        .remove();

    // ENTER new elements present in new data.
    circles.enter()
        .append("circle")
        .attr("class", "enter")
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .attr("fill", function(d) { return continentColor(d.continent); })
		.attr("stroke", function(d) { return d3.rgb(continentColor(d.continent)).darker() })
		.merge(circles)
        .transition(t)
            .attr("cy", function(d){ return y(d.life_exp); })
            .attr("cx", function(d){ return x(d.income) })
            .attr("r", function(d){ return Math.sqrt(area(d.population) / Math.PI) });

    // Update the time label
    timeLabel.text(+(time + 1800))
}