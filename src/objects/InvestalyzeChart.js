import React from "react";
import { Line } from 'react-chartjs-2'
//import { Chart } from 'react-charts';
import * as d3 from 'd3';

class InvestalyzeChart extends React.Component {
  constructor(props){
    super(props);
    this.state = ({
      didInitialize: false,
      xVal: (this.props.xScale == null) ? 'linear' : this.props.xScale,
    });
    /*
    this.memo = ({
      series: { curve: this.props.curve },
    });*/
  }

  render(){



    var chartData = [];

    for (var key in this.props.data) {
      var dataForSet = [];
      var color = '#7953d2';
      if (this.props.data[key].color != null) {
        color = this.props.data[key].color;
      }
      var dataSet = {label: this.props.data[key].label, data: dataForSet, pointRadius: 1.5, fill: false, backgroundColor: color,borderColor: (color)};
      for (var index in this.props.data[key].data) {


        if (this.state.xVal == 'time') {
          dataForSet.push({x: parseInt(this.props.data[key].data[index][0]), y: this.props.data[key].data[index][1]});
        } else {
          dataForSet.push({x: this.props.data[key].data[index][0], y: this.props.data[key].data[index][1]});
        }

      }


      chartData.push(dataSet);

    }

    if (this.state.xVal == 'time') {
      console.log("DATA (" + this.props.title + "):");
      console.log(chartData);
    }


    //console.log(this.props.data);
    //console.log(chartData);
    /*
    const data = {
      datasets: [
        {
          label: '# of Votes',
          data: chartData,
          fill: false,
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgba(255, 99, 132, 0.2)',
        },
      ],
    };*/


    const data = {
      datasets: chartData,
      labels: ["a","b","c"]
    };

    //console.log(chartData);

    const options = {
      legend: {
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
            type: this.state.xVal,
            position: 'bottom'
          }
        ],
      },
      animation: {
        easing: this.props.disableAnimation ? null : 'easeOutQuart',
        duration: this.props.disableAnimation ? 0 : 1000,
      },
    };



    return(
      <div style={this.props.style}>
        <p style={{margin:0,padding:0,textAlign:"center",height:24,lineHeight:"24px"}}>{this.props.title}</p>
        <div style={{display:"flex",height:"calc(100% - 48px)",marginRight:8}}>
          <div style={{flex: "0 0 0px",width:32,display:"flex"}}>
            <p style={{writingMode:"vertical-rl",textAlign:"center",margin:0,padding:0,paddingBottom:24}}>{this.props.yAxisLabel}</p>
          </div>
          <div style={{flex:"1 0 0px", width: 1, display: "flex"}}>
            <Line height={null} width={null} data={data} options={options} />
          </div>
        </div>
        <p style={{margin:0,padding:0,textAlign:"center",height:24,lineHeight:"24px"}}>{this.props.xAxisLabel}</p>
      </div>
    );
  }
}

export default InvestalyzeChart;
