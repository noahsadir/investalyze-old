import '../App.css';
import React from "react";
import { withStyles } from '@material-ui/core/styles';
import { Line, Bar } from 'react-chartjs-2';
//import Plot from 'react-plotly.js';
import Plotly from 'plotly.js-gl3d-dist';
import createPlotlyComponent from "react-plotly.js/factory";

export default class LineChart extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    /*
    FORMAT:
    --------
    [{
      label: "Label",
      color: "#FF0000",
      data: [[x,y],[x,y],[x,y],...],
    },...]
    */
    const Plot = createPlotlyComponent(Plotly);
    var chartData = [];
    var xValues = [];
    var plotlyData = [{
      x: [1, 2, 3, 4, 5, 2, 3, 4, 5, 6, 3, 4, 5, 6, 7],
      y: [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5],
      z: [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3],
      type: 'bar',
    }];

    var zValues = [];

    //Set up data in a format which can be more easily processed
    //NOTE: Each {label:..., data:...} object represents a single series
    var inputData = this.props.data;


    if (this.props.type == "surface") {

    } else {
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
          pointRadius: 1,
          fill: false,
          backgroundColor: color,
          borderColor: color,
        };

        if (this.props.stacked == true) {
          dataSet.stack = 1;
        }

        //Convert 2D array of points into JSON object
        for (var index in inputData[key].data) {
          if (inputData[key].data[index][0] != null && inputData[key].data[index][1] != null) {
            if (this.props.scale == "time") {
              inputData[key].data[index][0] = time(inputData[key].data[index][0]);
            }

            dataForSet.push({x: inputData[key].data[index][0], y: inputData[key].data[index][1]});

            if (!xValues.includes(inputData[key].data[index][0])) {
              xValues.push(inputData[key].data[index][0]);
            }

          }
        }

        chartData.push(dataSet);
      }

      xValues.sort(function(a,b) { return a - b;});
    }

    const data = {
      datasets: chartData,
      labels: xValues,
    };

    //console.log(chartData);


    const options = {
      legend: {
        labels: {
          fontColor: 'orange',
        },
        display: true,
      },
      responsive: true,
      maintainAspectRatio: false,
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
            type: 'time',
            position: 'top',
          },
        ],
      },
    };

    var chartObject = null;
    if (this.props.type == "line") {
      chartObject = (<Line data={data} options={options} />);
    } else if (this.props.type == "bar") {
      chartObject = (<Bar data={data} options={options} />);
    } else if (this.props.type == "surface") {
      chartObject = (<Plot data={plotlyData}/>);
    }

    //This chart does NOT like to be resized.
    //The following containers attempt to "squeeze" the chart within proper bounds
    return (
      <div style={{overflow: "hidden", display: "flex", flexFlow: "row", flex: "1 0 0"}}>
        <div style={{flex: "1 0 0", display: "flex", flexFlow: "column"}}>
          <div style={{flex: "1 0 0"}}/>
          <p style={{writingMode:"vertical-rl",textAlign:"center",margin:0,padding:0,paddingBottom:24}}>{this.props.yAxisLabel}</p>
          <div style={{flex: "1 0 0"}}/>
        </div>
        <div style={{overflow: "hidden", display: "flex", flexFlow: "column", flex: "100 0 0"}}>
          <div style={{flex: "1 0 0"}}/>
          <div style={{flex: "100 0 0", overflow: "hidden"}}>
            {chartObject}
          </div>
          <p style={{margin:0,padding:0,textAlign:"center",height:24,lineHeight:"24px"}}>{this.props.xAxisLabel}</p>
          <div style={{flex: "1 0 0"}}/>
        </div>
        <div style={{flex: "1 0 0"}}/>
      </div>
    );
  }
}

export function time(s) {
  const dtFormat = new Intl.DateTimeFormat('en-US', {timeZone: "UTC"});
  return dtFormat.format(new Date((s)));
}
