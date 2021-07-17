// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 90,
    left: 100
  };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//Let's make a space for our chart.

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight + 20);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

let PovXAxis = "poverty";
let HealthYAxis = "healthcare";

function xScale(data, PovXAxis) {
  // Create and update scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[PovXAxis]) * 0.9,
      d3.max(data, d => d[PovXAxis]) * 1.1
    ])
    .range([0, width]);

  return xLinearScale;

}

function yScale(data, HealthYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[HealthYAxis])-2,d3.max(data, d => d[HealthYAxis])+2])
    .range([height, 0]);

  return yLinearScale;

}

// Now we update our axes.
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// Update our circles so that they behave.
function renderXCircles(circlesGroup, newXScale, PovXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[PovXAxis]))
    .attr("dx", d => newXScale(d[PovXAxis]));

  return circlesGroup;
}

function renderYCircles(circlesGroup, newYScale, HealthYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[HealthYAxis]))
    .attr("dy", d => newYScale(d[HealthYAxis])+5)

  return circlesGroup;
}
// Updating text location
function renderXText(circlesGroup, newXScale, PovXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("dx", d => newXScale(d[PovXAxis]));

  return circlesGroup;
}
function renderYText(circlesGroup, newYScale, HealthYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("dy", d => newYScale(d[HealthYAxis])+5)

  return circlesGroup;
}

function updateToolTip(PovXAxis, HealthYAxis, circlesGroup) {

  var xlabel;
  var ylabel;

  if (PovXAxis === "poverty") {
    xlabel = "Poverty:";
  }
  else if (PovXAxis === "age") {
    xlabel = "Age:";
  }
  else if (PovXAxis === "income"){
      xlabel = "Household income:"
  }

  if (HealthYAxis === 'healthcare'){
      ylabel = "Health:"
  }
  else if (HealthYAxis === 'obesity'){
      ylabel = "Obesity:"
  }
  else if (HealthYAxis === 'smokes'){
      ylabel = "Smokes:"
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .style("color", "black")
    .style("background", 'white')
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[PovXAxis]}%<br>${ylabel} ${d[HealthYAxis]}%`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
  .on("mouseout", function(data, index) {
  toolTip.hide(data);
  });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("./data/data.csv").then(function(data, err) {
  // console.log(data)
  if (err) throw err;

  // parse data
  data.forEach(d => {
    d.poverty = +d.poverty;
    d.povertyMoe = +d.povertyMoe;
    d.age = +d.age;
    d.ageMoe = +d.ageMoe;
    d.income = +d.income;
    d.incomeMoe = +d.incomeMoe;
    d.healthcare = +d.healthcare;
    d.healthcareLow = +d.healthcareLow;
    d.healthcareHigh = +d.healthcareHigh;
    d.obesity = +d.obesity;
    d.obesityLow = +d.obesityLow;
    d.obesityHigh = +d.obesityHigh;
    d.smokes = +d.smokes;
    d.smokesLow = +d.smokesLow;
    d.smokesHigh = +d.smokesHigh;
  });

  var xLinearScale = xScale(data, PovXAxis);

  var yLinearScale = yScale(data, HealthYAxis);

  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  var xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("g");

  // Update text
  var circles = circlesGroup.append("circle")
    .attr("cx", d => xLinearScale(d[PovXAxis]))
    .attr("cy", d => yLinearScale(d[HealthYAxis]))
    .attr("r", 15)
    .classed('stateCircle', true);

  var circlesText = circlesGroup.append("text")
    .text(d => d.abbr)
    .attr("dx", d => xLinearScale(d[PovXAxis]))
    .attr("dy", d => yLinearScale(d[HealthYAxis])+5)
    .classed('stateText', true);

  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var PovertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty")
    .classed("active", true)
    .text("In Poverty (%)");

  var AgeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") 
    .classed("inactive", true)
    .text("Age (Median)");

  var IncomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") 
    .classed("inactive", true)
    .text("Household Income (Median)");
  
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)")
  
  var ObeseLabel = ylabelsGroup.append("text")
    .attr("y", -80)
    .attr("x", -(height/2))
    .attr("dy", "1em")
    .attr("value", "obesity") 
    .classed("inactive", true)
    .text("Obese (%)");

  var SmokesLabel = ylabelsGroup.append("text")
    .attr("y", -60)
    .attr("x", -(height/2))
    .attr("dy", "1em")
    .attr("value", "smokes") 
    .classed("inactive", true)
    .text("Smokes (%)");

  var HealthLabel = ylabelsGroup.append("text")
    .attr("y", -40)
    .attr("x", -(height/2))
    .attr("dy", "1em")
    .attr("value", "healthcare") 
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  circlesGroup = updateToolTip(PovXAxis, HealthYAxis, circlesGroup);

  xlabelsGroup.selectAll("text")
    .on("click", function() {
      var value = d3.select(this).attr("value");
      if (value !== PovXAxis) {

        PovXAxis = value;

        // console.log(PovXAxis)

        xLinearScale = xScale(data, PovXAxis);

        xAxis = renderXAxes(xLinearScale, xAxis);

        circles = renderXCircles(circles, xLinearScale, PovXAxis);

        circlesText = renderXText(circlesText, xLinearScale, PovXAxis)  

        circlesGroup = updateToolTip(PovXAxis, HealthYAxis, circlesGroup);

        if (PovXAxis === "age") {
          AgeLabel
            .classed("active", true)
            .classed("inactive", false);
          PovertyLabel
            .classed("active", false)
            .classed("inactive", true);
          IncomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if(PovXAxis === 'income'){
          IncomeLabel
            .classed("active", true)
            .classed("inactive", false);
          PovertyLabel
            .classed("active", false)
            .classed("inactive", true);
          AgeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          IncomeLabel
            .classed("active", false)
            .classed("inactive", true);
          AgeLabel
            .classed("active", false)
            .classed("inactive", true);
          PovertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

  ylabelsGroup.selectAll("text")
  .on("click", function() {
    var value = d3.select(this).attr("value");
    if (value !== HealthYAxis) {

      HealthYAxis = value;

      // console.log(HealthYAxis)

      yLinearScale = yScale(data, HealthYAxis);

      yAxis = renderYAxes(yLinearScale, yAxis);

      circles = renderYCircles(circles, yLinearScale, HealthYAxis);

      circlesText = renderYText(circlesText, yLinearScale, HealthYAxis) 

      circlesGroup = updateToolTip(PovXAxis, HealthYAxis, circlesGroup);

      if (HealthYAxis === "obesity") {
        ObeseLabel
          .classed("active", true)
          .classed("inactive", false);
        SmokesLabel
          .classed("active", false)
          .classed("inactive", true);
        HealthLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if(HealthYAxis === 'smokes'){
        SmokesLabel
          .classed("active", true)
          .classed("inactive", false);
        HealthLabel
          .classed("active", false)
          .classed("inactive", true);
        ObeseLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        HealthLabel
          .classed("active", true)
          .classed("inactive", false);
        SmokesLabel
          .classed("active", false)
          .classed("inactive", true);
        ObeseLabel
          .classed("active", false)
          .classed("inactive", true);
      }
    }
  });
}).catch(function(error) {
  console.log(error);
});