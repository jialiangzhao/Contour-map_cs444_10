// 
// a10.js
// class: CSC444 Assignment 10
// name: jialiangzhao <jialiangzhao@email.arizona.edu>
//Date: April 9
//comment:In this assignment, we divide an image into many
// small pieces, and then group them into line segments by 
//drawing the sides of a square. Finally draw them with lines
// or colors.
//



////////////////////////////////////////////////////////////////////////
// Global variables, preliminaries, and helper functions

let svgSize = 490;
let bands = 49;

let xScale = d3.scaleLinear().domain([0, bands]).  range([0, svgSize]);
let yScale = d3.scaleLinear().domain([-1,bands-1]).range([svgSize, 0]);

function createSvg(sel)
{
  return sel
    .append("svg")
    .attr("width", svgSize)
    .attr("height", svgSize);
}

function createGroups(data) {
  return function(sel) {
    return sel
      .append("g")
      .selectAll("rect")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", function(d) {
        return "translate(" + xScale(d.Col) + "," + yScale(d.Row) + ")";
      });
  };
}

d3.selection.prototype.callReturn = function(callable)
{
  return callable(this);
};

// This function returns the pair [min/max] for a cell d.
function gridExtent(d) {
  return [Math.min(d.NW, d.NE, d.SW, d.SE),
          Math.max(d.NW, d.NE, d.SW, d.SE)];
}



////////////////////////////////////////////////////////////////////////
// Functions for isocontouring

// Given a cell d and an isovalude value, this returns a 4-bit polarity
// signature in result.case as an integer [0,15].  Any bit that is 1
// indicates that the associate cell corner is on or above the contour.
function polarity(d, value) {
  let result = {
    NW: d.NW < value ? 0 : 1,
    NE: d.NE < value ? 0 : 1,
    SW: d.SW < value ? 0 : 1,
    SE: d.SE < value ? 0 : 1
  };
  result.case = result.NW + result.NE * 2 + result.SW * 4 + result.SE * 8;
  return result;
}


// currentContour is a global variable which stores the value
// of the contour we are currently extracting
var currentContour;

function includesOutlineContour(d) {
  let extent = gridExtent(d);
  return currentContour >= extent[0] && currentContour <= extent[1];
}

//In this part, I need to paint the color on the content 
//of the grid that is smaller than the current value. In 
//this way, the content covered by the current value can be
// filled.
function includesFilledContour(d) {
  let extent = gridExtent(d);
  return currentContour >= extent[0];
}

//In this function, I first need to find the scale 
//corresponding to each edge. Then connect each edge, 
//connect differently in different situations.
function generateOutlineContour(d) {
  let wScale = d3.scaleLinear().domain([d.SW, d.NW]).range([0, 10]);
  let eScale = d3.scaleLinear().domain([d.SE, d.NE]).range([0, 10]);
  let nScale = d3.scaleLinear().domain([d.NW, d.NE]).range([0, 10]);
  let sScale = d3.scaleLinear().domain([d.SW, d.SE]).range([0, 10]);
  let x1=0;
  let y1=0;
  let x2=0;
  let y2=0;
  
  switch (polarity(d, currentContour).case) {
    case 0:
    case 15:
      break
    case 1 :
    case 14:
      y1=wScale(currentContour);
      x2=nScale(currentContour);
      y2=10;
      break
    case 2:
    case 13:
      x1=10; 
      y1=eScale(currentContour);
      x2=nScale(currentContour);
      y2=10;
      break;
    case 4:
    case 11:
      y1=wScale(currentContour);
      x2=sScale(currentContour);
      break;
    case 8:
    case 7:
      x1=10;
      y1=eScale(currentContour);
      x2=sScale(currentContour);
      break;
    case 3:
    case 12:
      x2=10;
      y1=wScale(currentContour);
      y2=eScale(currentContour);
      break;
    case 10:
    case 5:
      y1=10;
      x1=nScale(currentContour);
      x2=sScale(currentContour);
      break;
    case 9:
    case 6:
      y1=wScale(currentContour);
      x2=sScale(currentContour);
      return d3.line()([[x1,y1],[x2,y2]])+
      d3.line()([[nScale(currentContour),10],[10,eScale(currentContour)]]);
   
  }

  return d3.line()([[x1,y1],[x2,y2]]);
}

//This is the colored part, and the colored part is
//different from the line drawing part. Because the line
// drawing part does not need to distinguish the shape within
// the square. And the color needs to fill the square so different colors are needed.
function generateFilledContour(d) {
  let wScale = d3.scaleLinear().domain([d.SW, d.NW]).range([0, 10]);
  let eScale = d3.scaleLinear().domain([d.SE, d.NE]).range([0, 10]);
  let nScale = d3.scaleLinear().domain([d.NW, d.NE]).range([0, 10]);
  let sScale = d3.scaleLinear().domain([d.SW, d.SE]).range([0, 10]);
  let x1=0;
  let y1=0;
  let x2=0;
  let y2=0;
  
  switch (polarity(d, currentContour).case) {
    case 0:
      return d3.line()([[0,0],[0,10],[10,10],[10,0]]);
    case 15:
      break
    case 1 :
      y1=wScale(currentContour);
      x2=nScale(currentContour);
      y2=10;
      return d3.line()([[x1,y1],[x2,y2],[10,10],[10,0],[0,0]]);
      
    case 14:
      y1=wScale(currentContour);
      x2=nScale(currentContour);
      y2=10;
      return d3.line()([[x1,y1],[x2,y2],[0,10],[0,y1]]);
  
    case 2:
      x1=10; 
      y1=eScale(currentContour);
      x2=nScale(currentContour);
      y2=10;
      return d3.line()([[x1,y1],[x2,y2],[0,10],[0,0],[10,0]]);
    case 13:
      x1=10; 
      y1=eScale(currentContour);
      x2=nScale(currentContour);
      y2=10;
      return d3.line()([[x1,y1],[x2,y2],[10,10],[x1,y1]]);
    case 4:
      y1=wScale(currentContour);
      x2=sScale(currentContour);
      return d3.line()([[x1,y1],[x2,y2],[10,0],[10,10],[0,10]]);
    case 11:
      y1=wScale(currentContour);
      x2=sScale(currentContour);
      return d3.line()([[x1,y1],[x2,y2],[0,0]]);
    case 8:
      x1=10;
      y1=eScale(currentContour);
      x2=sScale(currentContour);
      return d3.line()([[x1,y1],[x2,y2],[0,0],[0,10],[10,10]]);
    
    case 7:
      x1=10;
      y1=eScale(currentContour);
      x2=sScale(currentContour);
      return d3.line()([[x1,y1],[x2,y2],[10,0]]); 
      
    case 3:
      x2=10;
      y1=wScale(currentContour);
      y2=eScale(currentContour);
      return d3.line()([[x1,y1],[x2,y2],[10,0],[0,0]]);
    case 12:
      x2=10;
      y1=wScale(currentContour);
      y2=eScale(currentContour);
      return d3.line()([[x1,y1],[x2,y2],[10,10],[0,10]]);
    case 10:
      y1=10;
      x1=nScale(currentContour);
      x2=sScale(currentContour);
      return d3.line()([[x1,y1],[x2,y2],[0,0],[0,10]]);
    case 5:
      y1=10;
      x1=nScale(currentContour);
      x2=sScale(currentContour);
      return d3.line()([[x1,y1],[x2,y2],[10,0],[10,10]]);
    case 9:
      y1=wScale(currentContour);
      x2=sScale(currentContour);
      return d3.line()([[x1,y1],[x2,y2],[0,0]])+
      d3.line()([[nScale(currentContour),10],[10,eScale(currentContour)],[10,10]]);
      
    case 6:
      y1=wScale(currentContour);
      x2=sScale(currentContour);
      return d3.line()([[x1,y1],[x2,y2],[10,0]
        ,[10,eScale(currentContour)],[nScale(currentContour),10],[0,10]]);
  }
  return d3.line()([[x1,y1],[x2,y2]]);
  
}



////////////////////////////////////////////////////////////////////////
// Visual Encoding portion that handles the d3 aspects


// d3 function to compute isocontours for all cells that span given a
// range of values, [minValue,maxValues], this function produces a set
// of size "steps" isocontours to be added to the selection "sel"
function createOutlinePlot(minValue, maxValue, steps, sel)
{
  let contourScale = d3.scaleLinear().domain([1, steps]).range([minValue, maxValue]);
  for (let i=1; i<=steps; ++i) {
    currentContour = contourScale(i);
   
    sel.filter(includesOutlineContour).append("path")
      .attr("transform", "translate(0, 10) scale(1, -1)") // ensures that positive y points up
      .attr("d", generateOutlineContour)
      .attr("fill", "none")
      .attr("stroke", "black");
  }
}

// d3 function to compute filled isocontours for all cells that span
// given a range of values, [minValue,maxValues], this function produces
// a set of size "steps" isocontours to be added to the selection "sel".
// colorScale is used to assign their fill color.
function createFilledPlot(minValue, maxValue, steps, sel, colorScale)
{
  let contourScale = d3.scaleLinear().domain([1, steps]).range([minValue, maxValue]);
  for (let i=steps; i>=1; --i) {
    currentContour = contourScale(i);
    sel.filter(includesFilledContour).append("path")
      .attr("transform", "translate(0, 10) scale(1, -1)") // ensures that positive y points up
      .attr("d", generateFilledContour)
      .attr("fill", function(d) { return colorScale(currentContour); });
    
  }
}

// Compute the isocontour plots
let plot1T = d3.select("#plot1-temperature")
    .callReturn(createSvg)
    .callReturn(createGroups(temperatureCells));
let plot1P = d3.select("#plot1-pressure")
    .callReturn(createSvg)
    .callReturn(createGroups(pressureCells));

createOutlinePlot(-70, -60, 10, plot1T);
createOutlinePlot(-500, 200, 10, plot1P);


// Compute the filled isocontour plots
let plot2T = d3.select("#plot2-temperature")
    .callReturn(createSvg)
    .callReturn(createGroups(temperatureCells));
let plot2P = d3.select("#plot2-pressure")
    .callReturn(createSvg)
    .callReturn(createGroups(pressureCells));

createFilledPlot(-70, -60, 10, plot2T, 
              d3.scaleLinear()
                .domain([-70, -60])
                .range(["blue", "red"]));
createFilledPlot(-500, 200, 10, plot2P, 
              d3.scaleLinear()
                .domain([-500, 0, 500])
                .range(["#ca0020", "#f7f7f7", "#0571b0"]));

               
               
//This is the additional part, in this part I will
//add two buttons. The number of circles in the image 
//will be reduced or increased according to the description 
//on the button. Let each place have a more detailed 
//distribution area.
              //Number of turns
                var contour=10;
                var buttonList = [
                    {
                        id: "button-1",
                        text: "will be "+contour+"-1"+" min:3",
                        click: function() { 
                          //if button then decrease the contour
                          //then remove exist svg create new
                          if(contour>3){contour=contour-1
                            let text1="will be "+contour+"+1"+" max:20";
                            let text2="will be "+contour+"-1"+" min:3";
                          d3.select("#plot1-temperature").selectAll("path").remove();
                          d3.select("#plot1-pressure").selectAll("path").remove();
                          d3.select("#plot2-temperature").selectAll("path").remove();
                          d3.select("#plot2-pressure").selectAll("path").remove();
                          createOutlinePlot(-70, -60, contour, plot1T);
                          createOutlinePlot(-500, 200, contour, plot1P);
                          createFilledPlot(-70, -60, contour, plot2T, 
                              d3.scaleLinear()
                                .domain([-70, -60])
                                .range(["blue", "red"]));
                          createFilledPlot(-500, 200, contour, plot2P, 
                              d3.scaleLinear()
                                .domain([-500, 0, 500])
                                .range(["#ca0020", "#f7f7f7", "#0571b0"]));
                                d3.select("#button-2").text(text1);
                                d3.select("#button-1").text(text2);
                         }}
                    },
                    {
                   
                        id: "button-2",
                        text: "will be "+contour+"+1"+" max:20",
                        click: function() { 
                        //if button then add the contour
                          //then remove exist svg create new
                          if(contour<20){contour=contour+1
                            let text1="will be "+contour+"+1"+" max:20";
                            let text2="will be "+contour+"-1"+" min:3";
                          d3.select("#plot1-temperature").selectAll("path").remove();
                          d3.select("#plot1-pressure").selectAll("path").remove();
                          d3.select("#plot2-temperature").selectAll("path").remove();
                          d3.select("#plot2-pressure").selectAll("path").remove();
                          createOutlinePlot(-70, -60, contour, plot1T);
                          createOutlinePlot(-500, 200, contour, plot1P);
                          createFilledPlot(-70, -60, contour, plot2T, 
                              d3.scaleLinear()
                                .domain([-70, -60])
                                .range(["blue", "red"]));
                          createFilledPlot(-500, 200, contour, plot2P, 
                              d3.scaleLinear()
                                .domain([-500, 0, 500])
                                .range(["#ca0020", "#f7f7f7", "#0571b0"]));
                            
                          d3.select("#button-2").text(text1);
                          d3.select("#button-1").text(text2);
                         }}
                    },]

                // add two button
                d3.select("#controls")
                    .selectAll("button")
                    .data(buttonList)
                    .enter()
                    .append("button")
                    .attr("id", function(d) { return d.id; })
                    .text(function(d) { return d.text; })
                    .on("click", function(event, d) {
                        // Since the button is bound to the objects from buttonList,
                        // the expression below calls the click function from either
                        // of the two button specifications in the list.
                        return d.click();
                    });