/*Sheet by Aspen Neville, 2022*/

//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap(){
	//map frame dimensions
	var width = 960,
		height = 460;

	//create new svg container for the map
	var map = d3.select("body")
		.append("svg")
		.attr("class","map")
		.attr("width",width)
		.attr("height",height);

	//create Albers equal area conic projection centered on France
	/*var projection = d3.geoAlbers()
		.center([0, 37.1])
		.rotate([-95.7, 0, 0])
		.parallels([29.5, 45.5])
		.scale(2500)
		.translate([width/2, height/2]);*/

	var projection = d3.geoAlbersUsa()
		.scale(100)
		.translate([width/2,height/2]); 

	var path = d3.geoPath()
		.projection(projection);

/* 	var stateTest2 = d3.json("data/states.topojson",function(data){
		map.append("path")
			.datum(topojson.feature(data, data.objects.ne_10m_admin_1_states_provinces))
			.attr("class","states")
			.attr("d",path);
	})

	var stateTest = map.append("path")
		.datum(d3.json("data/states.topojson", function(data){
			return topojson.feature(data,data.objects.ne_10m_admin_1_states_provinces)
		}))
		.attr("class","states")
		.attr("d",path);
	console.log(stateTest);*/

 	var countyTest = d3.json("data/counties_us_2.geojson", function(data){
		map.selectAll(".countyData2")
			.data(data.features)
			.enter()
			.append("path")
			.attr("d",path)
			.attr("class",function(d){
				return "county " + d.properties.FIPS;
			});
	})
	console.log(countyTest) 

	var state = d3.json("data/states.topojson", function(error, data){
		console.log(error,data)
		return topojson.feature(data, data.objects.ne_10m_admin_1_states_provinces);
	})
	//add counties to map
	var stateOutlines = map.append("path")
		.datum(state)
		.attr("class","states")
		.attr("d",path);
	//console.log(counties);
	console.log(state);
	console.log(stateOutlines); 

	/* function loadStates(data){
		d3.json(data,function(error,data){
			return topojson.features(data,data.objects.ne_10m_admin_1_states_provinces);
		})
	} */

	/* function loadStates(data){
		d3.json(data,function(error,data){
			if (error) return console.error(error);
			console.log(data)
			return data
		})
	}


	//use queue to parallelize asynchronous data loading
	d3.queue()
		//.defer(d3.csv, "data/US_water_use.csv") //load attributes from csv
		.defer(loadStates,"data/states_selected_2.topojson") //load base shape layer
		.defer(d3.json, "data/counties_us_2.topojson") //load choropleth spatial data
		.await(callback);

	function callback(error, waterData, states, counties){
		if (error) return console.error(error);
		console.log(error);
		console.log(waterData)
		//console.log(utah);
		//console.log(waterData);
		console.log(states);
		console.log(counties);

		//create graticule generator
		var graticule = d3.geoGraticule()
			.step([5,5]); //place graticule lines every 5 degrees of longitude and latitude

		var gratBackground = map.append("path")
			.datum(graticule.outline()) //bind graticule background
			.attr("class","gratBackground") //assign class for styling
			.attr("d", path) //project graticule

		var gratLines = map.selectAll(".gratlines") //select graticule elements that will be created
			.data(graticule.lines()) //bind graticule lines to each element to be created
			.enter() //create an element for each datum
			.append("path") //append each element to the svg as a path element
			.attr("class","gratLines") //assign class for styling
			.attr("d", path); //project graticule lines

		//translate topoJSON data to geoJSON
		//var states = topojson.feature(states, states.objects.ne_10m_admin_1_states_provinces);
		var statesUS = topojson.feature(states, states.objects.states_selected_2);
		var countiesUS = topojson.features(counties, counties.objects.counties_us_2).features;

		//add counties to map
		var stateOutlines = map.append("path")
			.datum(statesUS)
			.attr("class","states")
			.attr("d",path);

		var countyData = map.selectAll(".countyData")
			.data(countiesUS)
			.enter()
			.append("path")
			.attr("class",function(d){
				return "county " + d.properties.FIPS;
			})
			.attr("d",path);
	}; */
};

//function to create coordinated bar chart
function setChart(csvData, colorScale){
	//chart frame dimensions
	var chartWidth = window.innerWidth * 0.425,
		chartHeight = 473,
		leftPadding = 25,
		rightPadding = 2,
		topBottomPadding = 5,
		chartInnerWidth = chartWidth - leftPadding - rightPadding,
		chartInnerHeight = chartHeight - topBottomPadding * 2,
		translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

	//create a second svg element to hold the bar chart
	var chart = d3.select("body")
		.append("svg")
		.attr("width", chartWidth)
		.attr("height", chartHeight)
		.attr("class", "chart");

	//create a rectangle for chart background fill
	var chartBackground = chart.append("rect")
		.attr("class", "chartBackground")
		.attr("width", chartInnerWidth)
		.attr("height", chartInnerHeight)
		.attr("transform", translate);

	//create a scale to size bars proportionally to frame
	var yScale = d3.scaleLinear()
		.range([463, 0])
		.domain([0, 100]);

	//set bars for each county
	var bars = chart.selectAll(".bar")
		.data(csvData)
		.enter()
		.append("rect")
		.sort(function(a, b){
			return b[expressed] - a[expressed]
		})
		.attr("class",function(d){
			return "bar " + d.COUNTY;
		})
		.attr("width", chartInnerWidth)
		.attr("x", function(d,i){
			return i * (chartInnerWidth / csvData.length) + leftPadding;
		})
		.attr("height", function(d){
			return 463 - yScale(parseFloat(d[expressed]));
		})
		.attr("y", function(d){
			return yScale(parseFloat(d[expressed])) + topBottomPadding;
		})
		.style("fill", function(d){
			return choropleth(d, colorScale);
		});

	//create a text element for the chart title
	var chartTitle = chart.append("text")
		.attr("x",40)
		.attr("y",40)
		.attr("class","chartTitle")
		.text(expressed + " for each county");

	//create vertical axis generator
	var yAxis = d3.axisLeft()
		.scale(yScale)
		.orient("left");

	//place axis
	var axis = chart.append("g")
		.attr("class", "axis")
		.attr("transform", translate)
		.call(yAxis);

	//create frame for chart border
	var chartFrame = chart.append("rect")
		.attr("class", "chartFrame")
		.attr("width", chartInnerWidth)
		.attr("height", chartInnerHeight)
		.attr("transform", translate)

		var data = csvData

		var histogram = d3.selectAll(".histogram")
			.value(function(d) {return d.attribute/d.expressed1;});

		var bins = histogram(data);

		var x = d3.selectAll(".x")

		var y = d3.selectAll(".y")
			.domain([0,d3.max(bins, function(d) {return d.length;})])

		var barRect = chartG.selectAll(".barRect")
			.data(bins)
			.enter()
			.append("rect")
				.attr("class",".barRect")
				.attr("transform", function(d) {return "translate(" + x(d.x0) + "," + y(d.length) + ")";})
				.attr("width",function(d) {return x(d.x1) - x(d.x0) -1;})
				.attr("height",function(d) {return chartInnerHeight - y(d.length);})
				.style("fill","#69b3a2");
		/* var data = csvData;

		//build array of all values of the expressed attribute
		var domainArray = [];
		for (var i=0; i<data.length; i++){
			var val = parseFloat(data[i][attribute]);
			domainArray.push(val);
		};

		console.log(data)

		//summary statistics for box:
		var data_sorted = domainArray.sort(d3.ascending);
		console.log(data_sorted);
		var q1 = d3.quantile(data_sorted, 0.25);
		var median = d3.quantile(data_sorted, 0.5);
		var q3 = d3.quantile(data_sorted, 0.75);
		var innerQuantileRange = q3 - q1;
		var min = q1 - 1.5 * innerQuantileRange;
		var max = q3 + 1.5 * innerQuantileRange;

		//Y scale
		var y = d3.scaleLinear()
			.domain([0,1000])
			.range([chartHeight,0])
		
		chartG.call(d3.axisBottom(y));

		d3.selectAll(".boxline")
			.attr("x1",y(min))
			.attr("x2",y(max));

		d3.selectAll(".box")
			.attr("x",y(q3))
			.attr("width",(y(q1) - y(q3)));

		//show median, min, and max horizontal lines
		var horizLines = chartG.selectAll(".horizLines")
			.data([min,median,max])
			.enter()
			.append("line")
				.attr("y1", center-width/2)
				.attr("y2", center+width/2)
				.attr("x1", function(d) {return y(d);})
				.attr("x2", function(d) {return y(d);})
				.attr("stroke","black"); */
				var x = d3.scaleLinear()
				.domain([0,1000])
				.range([0,chartInnerWidth])
				chartG.append("g")
					.attr("class","x")
					.call(d3.axisBottom(x));
	
			var histogram = d3.histogram()
				.attr("class","histogram")
				.domain(x.domain())
				.thresholds(x.ticks(10));
	
			var y = d3.scaleLinear()
				.range([chartInnerHeight,0])
				chartG.append("g")
					.attr("class","y")
					.call(d3.axisLeft(y));
	
			/* //main vertical line
			var boxline = chartG.append("line")
				.attr("class","boxline")
				.attr("y1",center)
				.attr("y2",center)
				//.attr("y1",y(min))
				//.attr("y2",y(max))
				.attr("stroke","black");
	
			//show the box
			var box = chartG.append("rect")
				.attr("class", "box")
				.attr("y", center - width / 2)
				.attr("height",width)
				.attr("stroke","black")
				.style("fill","#69b3a2");
	
			var horizLines = chartG.selectAll(".horizLines"); */