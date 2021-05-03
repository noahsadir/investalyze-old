import React from "react";
import { Chart } from 'react-charts';
import * as d3 from 'd3';

class InvestalyzeChart extends React.Component {
  constructor(props){
    super(props);
    this.state = ({
      didInitialize: false,
      data: [],
    });
    this.memo = ({
      series: { curve: this.props.curve },
    });
  }

  render(){
    /**/
    if (this.state.data != this.props.data){
      if (this.props.debug == true){
        console.log("data doesn't match!");
      }

      if (this.state.didInitialize){
        this.setState({data: this.props.data});
      }else{
        this.setState({didInitialize: true});
      }
    }else{
      if (this.props.debug == true){
        console.log(this.props.data);
      }

    }

    //Return empty div if chart data is invalid
    if (this.props.data.length == 0 || this.props.axes.length < 2){
      return (<div style={this.props.style}></div>);
    }

    return(
      <div style={this.props.style}>
        <p style={{margin:0,padding:0,textAlign:"center",height:24,lineHeight:"24px"}}>{this.props.title}</p>
        <div style={{display:"flex",height:"calc(100% - 48px)",marginRight:8}}>
          <div style={{flex: "0 0 0px",width:32,display:"flex"}}>
            <p style={{writingMode:"vertical-rl",textAlign:"center",margin:0,padding:0,paddingBottom:24}}>{this.props.yAxisLabel}</p>
          </div>
          <div style={{flex:"1 0 0px", width: 0}}>
            <Chart series={{ curve: this.props.curve }} style={{color:"#ffffff"}} data={this.state.data} axes={this.props.axes} tooltip={{formatSecondary: (d) => d.toFixed(2)}} dark/>
          </div>
        </div>
        <p style={{margin:0,padding:0,textAlign:"center",height:24,lineHeight:"24px"}}>{this.props.xAxisLabel}</p>
      </div>
    );
  }
}

export default InvestalyzeChart;
