import '../App.css';
import React from "react";
import { withStyles } from '@material-ui/core/styles';

import {
  Select,
  InputBase,
  MenuItem,
  Paper
} from "@material-ui/core/";

import LineChart from "./LineChart";


const StyledInputBase = withStyles((theme) => ({
  root: {
    width: "100%",
  'label + &': {
    marginTop: theme.spacing(3),

  }
},
input: {
  borderRadius: 4,
  position: 'relative',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  fontSize: 14,
  height: 16,
  padding: '13px 26px 13px 12px',
  transition: theme.transitions.create(['border-color', 'box-shadow']),
  // Use the system font instead of the default Roboto font.
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  '&:focus': {
    borderRadius: 4,
    borderColor: '#80bdff',
    boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
  },
},
}))(InputBase);

export default class DataAnalyticsPane extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var dataPoints = [];
    if (this.props.optionsChain != null) {
      var singleOptions = this.props.optionsChain.filter(this.props.preferences.comparisonType, this.props.preferences.selectedComparisonValue, this.props.preferences.optionType);
      var desiredKey = this.props.analytics.dataPaneConfig.metric_1;
      for (var index in singleOptions) {
        if (this.props.preferences.comparisonType == "strike") {
          dataPoints.push([singleOptions[index].get("date"), singleOptions[index].get(desiredKey)]);
        } else if (this.props.preferences.comparisonType == "date") {
          dataPoints.push([singleOptions[index].get("strike"), singleOptions[index].get(desiredKey)]);
        }
      }
    }

    return (
      <div style={{height: "100%", display: (this.props.analytics.selectedPane == "data" ? "flex" : "none"), flexFlow: "column"}}>
        <PaneConfiguration
          analytics={this.props.analytics}
          optionNames={(this.props.optionsChain == null) ? null : this.props.optionsChain.names}
          onDataAnalyticsConfigChange={this.props.onDataAnalyticsConfigChange}/>
        <div style={{display: (this.props.analytics.dataPaneConfig.display == "chart" ? "flex" : "none"), flex: "1 1 auto"}}>
          <LineChart data={[{label: "Metric", color: this.props.accentColor, data: dataPoints}]}/>
        </div>
      </div>
    );
  }
}

class PaneConfiguration extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    //Make list of menu items containing each option metric
    var optionNameItems = [];
    for (var key in this.props.optionNames) {
      optionNameItems.push(<MenuItem value={key}>{this.props.optionNames[key]}</MenuItem>);
    }

    //Change metric config and propogate entire data pane configuration object with updated value
    const handleMetricTypeChange = (event) => {
      if (this.props.onDataAnalyticsConfigChange != null) {
        var configuration = this.props.analytics.dataPaneConfig;
        configuration.metric_1 = event.target.value;
        this.props.onDataAnalyticsConfigChange(configuration);
      }
    }

    //Change display config and propogate entire data pane configuration object with updated value
    const handleDisplayTypeChange = (event) => {
      if (this.props.onDataAnalyticsConfigChange != null) {
        var configuration = this.props.analytics.dataPaneConfig;
        configuration.display = event.target.value;
        this.props.onDataAnalyticsConfigChange(configuration);
      }
    }

    return (
      <Paper style={{padding: 8, margin: 8, marginTop: 0, backgroundColor: "#222226", display: "flex", flex: "0 1 auto", height: 64}}>
        <Select
          value={this.props.analytics.dataPaneConfig.metric_1}
          variant='outlined'
          style={{margin: 0, marginRight: 8, flex: "1 0 0", overflowX: "hidden"}}
          onChange={handleMetricTypeChange}
          input={<StyledInputBase/>}>
          {optionNameItems}
        </Select>
        <Select
          value={this.props.analytics.dataPaneConfig.display}
          variant='outlined'
          style={{margin: 0, flex: "1 0 0", overflowX: "hidden"}}
          onChange={handleDisplayTypeChange}
          input={<StyledInputBase/>}>
          <MenuItem value={"table"}>{"Table"}</MenuItem>
          <MenuItem value={"chart"}>{"Chart"}</MenuItem>
        </Select>
      </Paper>
    );
  }
}
