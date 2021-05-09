import '../App.css';
import React from "react";
import { withStyles } from '@material-ui/core/styles';
import { Line, Bar } from 'react-chartjs-2'

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

    var chartData = [];
    var xValues = [];
    var chartLabels

    //Set up data in a format which can be more easily processed
    //NOTE: Each {label:..., data:...} object represents a single series
    var inputData = this.props.data;

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
        borderColor: color
      };

      //Convert 2D array of points into JSON object
      for (var index in inputData[key].data) {
        if (inputData[key].data[index][0] != null && inputData[key].data[index][1] != null) {
          dataForSet.push({x: inputData[key].data[index][0], y: inputData[key].data[index][1]});

          if (!xValues.includes(inputData[key].data[index][0])) {
            xValues.push(inputData[key].data[index][0]);
          }

        }
      }

      chartData.push(dataSet);
    }

    xValues.sort((a,b)=>b+a);


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
        display: false,
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
            position: 'bottom'
          }
        ],
      },
      animation: {
        easing: this.props.disableAnimation ? null : 'easeOutQuart',
        duration: this.props.disableAnimation ? 0 : 1000,
      },
    };

    var chartObject = null;
    if (this.props.type == "line") {
      chartObject = (<Line data={data} options={options} />);
    } else if (this.props.type == "bar") {
      chartObject = (<Bar data={data} options={options} />);
    }

    //This chart does NOT like to be resized.
    //The following containers attempt to "squeeze" the chart within proper bounds
    return (
      <div style={{overflow: "hidden", display: "flex", flexFlow: "row", flex: "1 0 0"}}>
        <div style={{flex: "1 0 0"}}/>
        <div style={{overflow: "hidden", display: "flex", flexFlow: "column", flex: "100 0 0"}}>
          <div style={{flex: "1 0 0"}}/>
          <div style={{flex: "100 0 0", overflow: "hidden"}}>
            {chartObject}
          </div>
          <div style={{flex: "1 0 0"}}/>
        </div>
        <div style={{flex: "1 0 0"}}/>
      </div>
    );
  }
}