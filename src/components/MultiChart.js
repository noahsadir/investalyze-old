import '../App.css';
import React from "react";
import { withStyles } from '@material-ui/core/styles';
import { Line, Bar } from 'react-chartjs-2';
//import Plot from 'react-plotly.js';
import Plotly from 'plotly.js-gl3d-dist';
import createPlotlyComponent from "react-plotly.js/factory";

var Formats = require('../libraries/Formats');

/**
 * Streamlined implementation of several chart libraries.
 */
export default class MultiChart extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {

    /*
    DATA FORMAT:
    --------
    [
      {
        label: "Label",
        color: "#FF0000",
        data: [[x,y],[x,y],[x,y],...],
      },
      ...
    ]
    */

    const Plot = createPlotlyComponent(Plotly);
    var chartJSData = null;
    var plotlyData = null;

    //Set up data in a format which can be more easily processed
    //NOTE: Each {label:..., data:...} object represents a single series
    if (this.props.type == "surface") {
      plotlyData = formatDataForPlotlySurface(this.props.data, this.props.scale, this.props.colorInterval);
    } else {
      chartJSData = formatDataForChartJS(this.props.data, this.props.scale, this.props.stacked, this.props.colorInterval);
    }

    //Note: the y-axis and z-axis are flipped for compatibility with 2D charts
    var plotlyLayout = {
      scene: {
        xaxis: {title: this.props.xAxisLabel},
        yaxis: {title: this.props.zAxisLabel},
        zaxis: {title: this.props.yAxisLabel},
      },
      font: {
        color: this.props.theme.textColor,
      },
      plot_bgcolor: (this.props.theme.backgroundColor != null ? this.props.theme.backgroundColor : "#FFFFFF"),
      paper_bgcolor: (this.props.theme.backgroundColor != null ? this.props.theme.backgroundColor : "#FFFFFF"),
      autosize: true,
      margin: {
        l: 0,
        r: 0,
        t: 0,
        b: 0,
        pad: 0,
      }
    }

    //A lot of the settings here don't work (like xAxes). May be a version or syntax issue.
    const chartJSOptions = {
      legend: {
        labels: {
          fontColor: 'orange',
        },
        display: true,
      },
      responsive: true,
      maintainAspectRatio: false,
      animations: null,
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: false,
            },
          },
        ],
        xAxes: [
          {
            type: 'linear',
            position: 'top',
          },
        ],
      },
    };

    //Create type chart based on type specified by user
    var chartObject = null;
    if (this.props.type == "line") {
      chartObject = (<Line data={chartJSData} options={chartJSOptions} />);
    } else if (this.props.type == "bar") {
      chartObject = (<Bar data={chartJSData} options={chartJSOptions} />);
    } else if (this.props.type == "surface") {
      chartObject = (<Plot data={plotlyData} layout={plotlyLayout} style={{margin: 0, width: "100%", height: "100%"}}/>);
    }

    //This chart does NOT like to be resized.
    //The following containers attempt to "squeeze" the chart within proper bounds
    return (
      <div style={{overflow: "hidden", display: "flex", flexFlow: "row", flex: "1 0 0"}}>
        <div style={{flex: "1 0 0", display: "flex", flexFlow: "column"}}>
          <div style={{flex: "1 0 0"}}/>
          <p style={{display: (this.props.type == "surface" ? "none" : "block"), writingMode: "vertical-rl",textAlign:"center",margin:0,padding:0,paddingBottom:24}}>{this.props.yAxisLabel}</p>
          <div style={{flex: "1 0 0"}}/>
        </div>
        <div style={{overflow: "hidden", display: "flex", flexFlow: "column", flex: "100 0 0"}}>
          <div style={{flex: "1 0 0"}}/>
          <div style={{flex: "100 0 0", overflow: "hidden", borderRadius: 8}}>
            {chartObject}
          </div>
          <p style={{display: (this.props.type == "surface" ? "none" : "block"), margin:0,padding:0,textAlign:"center",height:24,lineHeight:"24px"}}>{this.props.xAxisLabel}</p>
          <div style={{flex: "1 0 0"}}/>
        </div>
        <div style={{flex: "1 0 0"}}/>
      </div>
    );
  }
}

/**
 * Format series data in a way which can be interpreted by ChartJS.
 *
 * @param {number[][]} inputData the data for each series
 * @param {string} scale the scale for the chart (e.g. "time" or "linear")
 * @param {boolean} stacked a boolean indicating whether the series should be stacked on top of each other
 * @returns {Object} the data in the ChartJS format
 */
function formatDataForChartJS(inputData, scale, stacked, colorInterval) {

  var chartData = [];
  var xValues = [];

  //Process data in each series
  for (var key in inputData) {

    var dataForSet = [];
    var color = '#7953d2'; //Line color of chart
    if (inputData[key].color != null) {
      color = inputData[key].color;
    }

    //Set up data in form accepted by ChartJS
    var dataSet = {
      label: inputData[key].label,
      data: dataForSet,
      pointRadius: 2,
      fill: false,
      backgroundColor: color,
      borderColor: color,
    };

    if (stacked == true) {
      dataSet.stack = 1;
    }

    //Convert 2D array of points into JSON object
    for (var index in inputData[key].data) {
      if (inputData[key].data[index][0] != null && inputData[key].data[index][1] != null) {
        var unformattedXValue = inputData[key].data[index][0];
        if (scale == "time_scaled" || scale == "time") {
          inputData[key].data[index][0] = Formats.time(inputData[key].data[index][0] / 1000);
          dataForSet.push({x: inputData[key].data[index][0], y: inputData[key].data[index][1]});
        } else {
          dataForSet.push({x: inputData[key].data[index][0], y: inputData[key].data[index][1]});
        }

        if (!xValues.includes(unformattedXValue)) {
          xValues.push(unformattedXValue);
        }

      }
    }

    chartData.push(dataSet);
  }

  xValues.sort(function(a,b) { return a - b;});

  if (scale == "time_scaled") {
    var beginning = xValues[0];
    var end = xValues[xValues.length - 1];
    xValues = [];
    while (end > beginning) {
      xValues.push(beginning);
      beginning += 86400000;
    }
    for (var index in xValues) {
      xValues[index] = Formats.time(xValues[index] / 1000);
    }
  } else if (scale == "time"){
    for (var index in xValues) {
      xValues[index] = Formats.time(xValues[index] / 1000);
    }
  }

  const data = {
    datasets: chartData,
    labels: xValues,
  };

  return data;
}

/**
 * Format series data in a way which can be interpreted by Plotly.
 * NOTE: Multiple series needed in order for chart to display, with
 *       label attribute being the value for the third axis.
 *
 * @param {number[][]} inputData the data for each series (Plotly y-axis)
 * @param {string} scale the scale for the chart (e.g. "time" or "linear")
 * @returns {Object} the data in Plotly format
 */
function formatDataForPlotlySurface(inputData, scale, colorInterval) {
  var maxHeight = 10;
  var intensity = [0, 0.5, 1];
  var plotlyData = [{
    x: [],
    y: [],
    z: [],
    type: 'mesh3d',
    colorscale: (colorInterval == null ? 'Viridis' : colorInterval)
  }];

  for (var key in inputData) {
    for (var index in inputData[key].data) {
      if (inputData[key].data[index][0] != null && inputData[key].data[index][1] != null) {
        if (scale == "time") {
          inputData[key].data[index][0] = Formats.time(inputData[key].data[index][0] / 1000);
        }

        if (inputData[key].data[index][1] > maxHeight) {
          maxHeight = inputData[key].data[index][1];
        }

        plotlyData[0].x.push(inputData[key].data[index][0]);
        plotlyData[0].z.push(inputData[key].data[index][1]);
        plotlyData[0].y.push(inputData[key].label);
      }
    }
  }

  plotlyData[0].intensity = plotlyData[0].z;

  return plotlyData;
}
