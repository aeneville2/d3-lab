//wrap everything in a self-executing anonymous function to move to local scope
(function(){
	//pseudo-global variables
	var attrArray = ["Total_Pop_Thousands","PS_WFrTo","DO_WFrTo","IN_WFrTo","IR_WFrTo","LI_WFrTo","AQ_WFrTo",
"MI_WFrTo","PT_WFrTo","PO_WFrTo","PC_WFrTo","TO_WFrTo"]; //list of attributes
	var attrNames = ["Total_Pop_Thousands","Public Supply Withdrawals","Domestic Self-Supplied Withdrawals","Industrial Self-Supplied Withdrawals",
"Irrigation Withdrawals","Livestock Withdrawals","Aquaculture Withdrawals","Mining Withdrawals",
"Thermoelectric Withdrawals","Thermoelectric Once-Through Withdrawals","Thermoelectric Re-Circulating Withdrawals","Total Withdrawals"]; //list of attribute names
	var expressed1 = attrArray[0]; //initial attribute
	var expressed2 = attrArray[11]; //initial attribute 2

	//chart frame dimensions
	var chartWidth = window.innerWidth * 0.3,
		chartHeight = 460,
		leftPadding = 40,
		rightPadding = 2,
		topBottomPadding = 40,
		chartInnerWidth = chartWidth - leftPadding - rightPadding,
		chartInnerHeight = chartHeight - topBottomPadding * 2,
		translate = "translate(" + leftPadding + "," + topBottomPadding + ")";
	//create a heading for the webpage
	var heading = d3.select("body")
		.append("h1")
		.attr("class","heading")
		.text("Estimated Water Use in the United States by County, 2015")
	//create introduction text block
	var introText = d3.select("body")
		.append("h4")
		.attr("class","introText")
		.html("<p>Every 5 years, the United States Geological Survey publishes data on the nation's water use*" + 
		". The map displays the county-level data for water withdrawals (in Mgal/day) per thousand people from the 2015 report, illustrating which counties are withdrawing the most water compared to their population size." +
		" The default is total withdrawals (Mgal/day) per thousand people. Other water-use categories are included: public supply, domestic, industrial, irrigation, livestock, mining, aquaculture, and thermoelectric." +
		" The scatterplot allows a comparison of correlation between withdrawals and population size for each county. Zooming and panning are enabled on both the map and scatterplot." + 
		" To view the source data, click <a href='https://doi.org/10.5066/F7TB15V5'>here.</a></p>");

	var source = d3.select("body")
		.append("p")
		.attr("class","source")
		.text("*Dieter, C.A., Linsey, K.S., Caldwell, R.R., Harris, M.A., Ivahnenko, T.I., Lovelace, J.K., Maupin, M.A., and Barber, N.L., 2018, Estimated Use of Water in the United States County-Level Data for 2015 (ver. 2.0, June 2018): U.S. Geological Survey data release, https://doi.org/10.5066/F7TB15V5.")

	//create a second svg element to hold the scatterplot
	var chart = d3.select("body")
		.append("svg")
		.attr("width", chartWidth)
		.attr("height", chartHeight)
		.attr("class", "chart")
		.call(d3.zoom().scaleExtent([1,8])
			.on("zoom",zoomChart));

	//create a rectangle for chart background fill
	var chartBackground = chart.append("rect")
		.attr("class", "chartBackground")
		.attr("width", chartInnerWidth)
		.attr("height", chartHeight)
		.attr("transform", translate);

	//create frame for chart border
	var chartFrame = chart.append("rect")
		.attr("class", "chartFrame")
		.attr("width", chartInnerWidth)
		.attr("height", chartHeight)
		.attr("transform", translate);

	var chartG = chart.append("g")
		.attr("transform",translate)
		.attr("class","chartG")
		

	//x axis scale and draw
	var x = d3.scaleLinear()
		.domain([0,5000])
		.range([0,chartWidth]);
	chartG.append("g")
		.attr("transform","translate(0," + "(" + chartInnerHeight + "*2))")
		.call(d3.axisTop (x))
		.attr("class","x");

	//y axis scale and draw
	var y = d3.scaleLinear()
		.range([chartHeight, 0])
		.domain([5000,0]);
	chartG.append("g")
		.call(d3.axisLeft(y))
		.attr("class","y");

	//used https://www.d3-graph-gallery.com/graph/interactivity_zoom.html#axisZoom for help in implementing zoom and changing axes
	function zoomChart(){
		d3.select(".x").call(d3.axisTop(d3.event.transform.rescaleX(x))); //adjust x axis based on zoom
		d3.select(".y").call(d3.axisLeft(d3.event.transform.rescaleY(y))); //adjust y axis based on zoom
		d3.select(".dotsG").attr("transform",d3.event.transform); //adjust scatterplot dots
	};

	//begin script when window loads
	window.onload = initialize();

	//the first function called once the html is loaded
	function initialize(){
		setMap();
	};

	//set choropleth map parameters
	function setMap(){
		//map frame dimensions
		var width = window.innerWidth * 0.6;
		var height = 460;

		//create div container for the map
		var mapContainer = d3.select("body")
			.append("div")
			.attr("class","mapContainer")

		//create zoom variable and functionS
		var zoomMap = d3.zoom()
			.scaleExtent([1,8])
			.on("zoom",function(){
				d3.select(".mapG").attr("transform",d3.event.transform)
			});

		//create a new svg element with the above dimensions
		var map = d3.select(".mapContainer")
			.append("svg")
			.attr("class","map")
			.attr("width",width)
			.attr("height",height)
			.call(zoomMap);
		
		//use the Albers equal area conic projection for the contiguous US
		var projection = d3.geoAlbersUsa()
			.scale(1000)
			.translate([width/2,height/2]);

		//create svg path generator using the projection
		var path = d3.geoPath()
			.projection(projection);

		//create group for the map elements
		var mapG = map.append("g")
			.attr("class","mapG")
			.on("mouseover",function(d){
				d3.selectAll(".zoomTooltip").style("opacity",1)
			})
			.on("mouseleave",function(d){
				d3.selectAll(".zoomTooltip").style("opacity",0)
			})

		//create zoom buttons
		//used ADD SOURCE HERE for help with coding!
		var zoomButton = mapContainer.append("button")
			.style("background-color","#fff")
			.attr("class","zoom")
			.attr("id","zoomButton")
			.attr("width","50")
			.attr("height","100")
			.text("Zoom In")
			.on("click",function(){
				zoomMap.scaleBy(map,2)
			});
		var zoomOutButton = mapContainer.append("button")
			.style("background-color","#fff")
			.attr("class","zoom")
			.attr("id","zoomOutButton")
			.attr("width","50")
			.attr("height","100")
			.text("Zoom Out")
			.on("click",function(){
				zoomMap.scaleBy(map,0.5)
			});
		
		//use d3.queue to parallelize asynchronous data loading
		d3.queue()
			.defer(d3.csv, "data/US_water_use.csv") //load attributes from csv
			.defer(d3.json, "data/states_selected.topojson") //load background spatial data
			.defer(d3.json, "data/counties_us.topojson") //load choropleth spatial data
			.await(callback)

		function callback(error,csvData, statesUS,countiesUS){
			//place graticule on the map
			setGraticule(mapG,path);

			//translate TopoJSON data
			var states = topojson.feature(statesUS,statesUS.objects.states_selected);
			console.log(states);

			var counties = topojson.feature(countiesUS,countiesUS.objects.counties_us).features;
			console.log(counties);

			//add states to map
			var stateOutlines = mapG.append("path")
				.datum(states)
				.attr("class","states")
				.attr("d",path)
				//.style("stroke-width","5px");

			//join csv data to geoJSON enumeration units
			countiesJoined = joinData(counties, csvData);
			console.log("countiesJoined: ",countiesJoined);

			//create the color scale
			var colorScale = makeColorScale(csvData);

			//add enumeration units to the map
			setEnumerationUnits(countiesJoined,mapG,path,colorScale);

			//add cooordinated visualization to the map
			setChart(csvData, colorScale);

			createDropdown(csvData);
		}
	}
	function setGraticule(map, path){
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
			
	}
	function codeLocal(props){
		if (props.CODE_LOCAL.startsWith("0")) {return props.CODE_LOCAL.substr(1)}
		else{return props.CODE_LOCAL};
	};
	function joinData(data,csvData){
		//loop through csv to assign each set of csv attribute values to geojson county
		for (var i=0; i<csvData.length; i++){
			var csvCounty = csvData[i]; //the current county
			var csvKey = csvCounty.FIPS; //the CSV primary key

			//loop through geojson counties to find correct county
			for (var a=0; a<data.length; a++){
				var geojsonProps = data[a].properties; //the current county geojson properties
				var geojsonKey = codeLocal(geojsonProps)//the geojson primary key

				//where primary keys match, transfer csv data to get geojson properties object
				if (geojsonKey == csvKey){
					//assign all attributes and values
					attrArray.forEach(function(attr){
						var val = parseFloat(csvCounty[attr]); //get csv attribute value
						geojsonProps[attr] = val; //assign attribute value to geojson properties
					});
				};
			};
		};
		return data;
		
	};
	//function to create color scale generator
	function makeColorScale(data){
		var colorClasses = ["#EFF3FF","#BDD7E7","#6BAED6","#3182BD","#08519C"];

		//create color scale generator
		var colorScale = d3.scaleThreshold()
			.range(colorClasses);

		//build array of all values of the expressed attribute
		var domainArray = [];
		for (var i=0; i<data.length; i++){
			var val = parseFloat(data[i][expressed2])/parseFloat(data[i][expressed1]);
			domainArray.push(val);
		};

		//cluster data using ckmeans clustering algorithm to create natural breaks
		var clusters = ss.ckmeans(domainArray,5);
		//reset domain array to cluster minimums
		domainArray = clusters.map(function(d){
			return d3.min(d);
		});

		//remove first value from domain array to create class breakpoints
		domainArray.shift();
		console.log("domainArray after shift:",domainArray)

		//assign array of expressed values as scale domain
		colorScale.domain(domainArray);

		//pass scaled color values to legend function
		legend(colorScale);

		return colorScale;
	}
	//d3-legend library from d3-legend.susielu.com
	function legend(colorScale){
		//remove pre-existing legend items
		d3.selectAll(".legendContainer").remove()
		//create a color legend based on the colorScale for the current attributes
		var legend = d3.legendColor()
			.shapeWidth(100)
			.orient('horizontal')
			.scale(colorScale)
			.labels(d3.legendHelpers.thresholdLabels)
			.labelFormat(".4f")
		/* var noValueLegend = d3.legendColor()
			.shapeWidth(100)
			.orient('horizontal')
			.labels('No Value')
			.scale("#CCC") */
		//create containers for the legend in the body of the web page and call the legend variable
		var legendBox = d3.select("body")
			.append("svg")
			.attr("class","legendBox")
		var legendContainer = d3.select(".legendBox")
			.append("g")
			.attr("class","legendContainer")
			.call(legend)
		/* var noValueContainer = d3.select(".legendBox")
			.append("g")
			.attr("class","noValueContainer")
			.call(noValueLegend) */
			
	}
	//function to test for data value and return color
	function choropleth(props, colorScale){
		//make sure attribute value is a number
		var val = parseFloat(props[expressed2])/parseFloat(props[expressed1]);
		//if attribute value exists, assign a color; otherwise assign gray
		if (typeof val == 'number' && !isNaN(val)){
			return colorScale(val);
		} else {
			return "#CCC";
		};
	};
	function setEnumerationUnits(data,map,path,colorScale){
		//add counties to map
		var countyShapes = map.selectAll(".counties")
			.data(data)
			.enter()
			.append("path")
			.attr("class",function(d){ return "counties " + d.properties.FIPS})
			.attr("d",path)
			.style("fill",function(d){
				return choropleth(d.properties,colorScale);
			})
			.on("mouseover",mouseover)
			.on("mousemove",mousemove)
			.on("mouseleave",mouseleave);

		//add style descriptor to each path
		var desc = countyShapes.append("desc")
			.text('{"stroke":"#000","stroke-width":"0.5px","stroke-opacity":0.2}');
	}

	//function to create coordinated scatterplot
	//used example code from https://www.d3-graph-gallery.com/graph/scatter_basic.html
	function setChart(csvData, colorScale) {
		var dotsSVG = chartG.append("svg")
			.attr("class","dotsSVG")
			.attr("width",chartInnerWidth)
			.attr("height",chartHeight)
		var dotsG = dotsSVG.append("g")
			.attr("class","dotsG")
 		var dots = dotsG.selectAll(".dots")
			.data(csvData)
			.enter()
			.append("circle")
			.attr("class",function(d){
				return "dots US" + d.FIPS})
			.attr("x",1)
			.attr("r",3)
			.style("stroke-width","0.5")
			.style("stroke","black")
			.on("mouseover",mouseoverChart)
			.on("mouseleave",mouseleaveChart)
			.on("mousemove",mousemoveChart);

		//add style descriptor to each circle in scatterplot
		var desc = dots.append("desc")
			.text('{"stroke":"black","stroke-width":"0.5"}');

		updateChart(csvData,expressed2,colorScale);

		//create a text element for the chart title
		var chartTitle = chart.append("text")
			.attr("x",10)
			.attr("y",20)
			.attr("class","chartTitle")
			.text("Total Population (thousands) vs. Total Withdrawals");

		/*var xLabel = chart.append("text")
				.attr("class","xLabel")
				.attr("x",chartWidth/2)
				.attr("y",20)
		var yLabel = chart.append("text")
				.attr("class","yLabel")
				.attr("y", -30)
				.attr("x",-10 -chartHeight/2 + 20)*/
	};
	
	function createDropdown(csvData){
		//add select element
		var dropdown = d3.select("body")
			.append("select")
			.attr("class","dropdown")
			.on("change",function(){
				changeAttribute(this.value, csvData)
			});

		//add initial option
		var titleOption = dropdown.append("option")
			.attr("class","titleOption")
			.attr("disabled","true")
			.text("Select Water-use Category");

		//var data = attrArray.shift();

		//add attribute name options
		var attrOptions = dropdown.selectAll("attrOptions")
			.data(attrArray)
			.enter()
			.append("option")
			.attr("value",function(d) { return d})
			.text(function(d){
				var i = attrArray.indexOf(d);
				return attrNames[i]});
	};

	//dropdown change listener handler
	function changeAttribute(attribute,csvData){
		//change the expressed attributes
		expressed2 = attribute;

		//recreate the color scale
		var colorScale = makeColorScale(csvData);

		//recolor enumeration units
		var counties = d3.selectAll(".counties")
			.transition()
			.duration(1000)
			.style("fill",function(d){
				return choropleth(d.properties,colorScale)
			});

		//var dots = d3.selectAll(".circle");
		updateChart(csvData,attribute,colorScale);
	};
	//function to update the scatterplot circles and scatterplot title when the attributes change
	function updateChart(csvData, attribute, colorScale){



		d3.selectAll("circle")
			.attr("cx", function(d) {return x(d[expressed1]);})
			.attr("cy", function(d) {return y(d[attribute]);})
			.style("fill",function(d){
				return choropleth(d, colorScale);
			})
			.transition()
			.duration(1000);

		var name = attrArray.indexOf(attribute);

		/*var xLabel = d3.select(".xLabel")
			.text("Total Population (thousands)");

		var yLabel = d3.select(".yLabel")
			.text(attrNames[name]);*/

		var chartTitle = d3.select(".chartTitle")
			.text("Total Population (Thousands) vs. " + attrNames[name]);
	};

	//used https://www.d3-graph-gallery.com/graph/interactivity_tooltip.html#template for help in highlighting and adding tooltips
	//create a toolTip variable
	var toolTip = d3.select("body")
		.append("div")
		.style("opacity",0)
		.attr("class","toolTip");
	var toolTipText = d3.selectAll(".toolTip")
		.append("span")
		.attr("class","toolTipText")

	//when a mouseover event occurs then change the tooltip to be visible and highlight the county/dot
	var mouseover = function(d){
		toolTip.style("opacity",1)
		toolTipText.html(this.FIPS)
		//highlight(object1)
		d3.select(this)
			.style("stroke","blue")
			.style("stroke-width","3px")
			.style("stroke-opacity",1)
		var object = d3.select(this)
		console.log("county",object) 
		var id = d.properties.FIPS
		d3.selectAll(".dots." + id)
			.style("stroke","blue")
			.style("stroke-width","3px")
			.style("stroke-opacity",1)
		console.log("dots",id);
	}
	var mouseoverChart = function(d){
		toolTip.style("opacity",1)
		toolTipText.html(this.FIPS)
		d3.select(this)
			.style("stroke","blue")
			.style("stroke-width","3px")
			.style("stroke-opacity",1)
		var object = d3.select(this)
		console.log("object",object)
		var id = "US" + d.FIPS
		d3.selectAll(".counties." + id)
			.style("stroke","blue")
			.style("stroke-width","3px")
			.style("stroke-opacity",1)
	}
	//when a mousemove event occurs then change the tooltip text on the map
	var mousemove = function(d){
		var i = attrArray.indexOf(expressed2)
		toolTip.style("float","right")
		toolTipText.html("<p><b>" + d.properties.NAME_ALT + ", " + d.properties.REGION + "<br>" + attrNames[i] + "(Mgal/day)/Total Population (thousands): </b>" + (d.properties[expressed2]/d.properties[expressed1]).toFixed(4) + "</p>")
			.style("float","left")
			.style("color","white")
			//.style("left",(d3.mouse(this)[0]+10) + "px")
			//.style("top",(d3.mouse(this)[1]-75) + "px")
	}
	//when a mousemove event occurs then change the tooltip text on the chart
	var mousemoveChart = function(d){
		toolTip.style("float","right")
		var i = attrArray.indexOf(expressed2)
		toolTipText.html("<p><b>" + d.COUNTY + ", " + d.STATE + "</b><br><b>Total Population: </b>" + d[expressed1] + " thousand<br><b>" + attrNames[i] + ":</b> " + d[expressed2] + " Mgal/day</p>")
			.style("left",(d3.mouse(this)[0]+10) + "px")
			.style("top",(d3.mouse(this)[1]-75) + "px")
	};
	//when a mouseleave event occurs then return the style of the feature back to normal and make tooltip transparent
	var mouseleave = function(d){
		toolTip.style("opacity",0)
		d3.select(this)
			.style("stroke", function(){
				return getStyle(this,"stroke");
			})
			.style("stroke-width", function(){
				return getStyle(this,"stroke-width");
			})
			.style("stroke-opacity",function(){
				return getStyle(this,"stroke-opacity");
			});
		
		function getStyle(element, styleName){
			var styleText = d3.select(element)
				.select("desc")
				.text();

			var styleObject = JSON.parse(styleText);

			return styleObject[styleName];
		};
		var id = d.properties.FIPS
		d3.selectAll(".dots." + id)
			.style("stroke", function(){
				return getStyle(this,"stroke");
			})
			.style("stroke-width", function(){
				return getStyle(this,"stroke-width");
			})
			.style("stroke-opacity",function(){
				return getStyle(this,"stroke-opacity");
			});
		
		function getStyle(element, styleName){
			var styleText = d3.select(element)
				.select("desc")
				.text();

			var styleObject = JSON.parse(styleText);

			return styleObject[styleName];
		};
	}
	//when a mouseleave event occurs then return the style of the feature back to normal and make tooltip transparent
	var mouseleaveChart = function(d){
		toolTip.style("opacity",0)
		d3.select(this)
			.style("stroke", function(){
				return getStyle(this,"stroke");
			})
			.style("stroke-width", function(){
				return getStyle(this,"stroke-width");
			})
			.style("stroke-opacity",function(){
				return getStyle(this,"stroke-opacity");
			});
		
		function getStyle(element, styleName){
			var styleText = d3.select(element)
				.select("desc")
				.text();

			var styleObject = JSON.parse(styleText);

			return styleObject[styleName];
		};
		var id = "US" + d.FIPS
		d3.selectAll(".counties." + id)
			.style("stroke", function(){
				return getStyle(this,"stroke");
			})
			.style("stroke-width", function(){
				return getStyle(this,"stroke-width");
			})
			.style("stroke-opacity",function(){
				return getStyle(this,"stroke-opacity");
			});
		
		function getStyle(element, styleName){
			var styleText = d3.select(element)
				.select("desc")
				.text();

			var styleObject = JSON.parse(styleText);

			return styleObject[styleName];
		};
	}
	
}) ();