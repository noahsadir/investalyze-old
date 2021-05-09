import '../App.css';
import React from "react";
import { withStyles } from '@material-ui/core/styles';

import {
  Select,
  InputBase,
  MenuItem,
  Paper,
  IconButton,
  Icon,
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
    var seriesData = [];
    if (this.props.optionsChain != null) {

      var selectedOptionType = this.props.preferences.optionType;
      var unselectedOptionType = this.props.preferences.optionType == "calls" ? "puts" : "calls";

      //Get chains for both calls and puts in case user wants to compare them.
      var singleOptions = this.props.optionsChain.filter(this.props.preferences.comparisonType, this.props.preferences.selectedComparisonValue, selectedOptionType);
      var singleOppositeOptions = this.props.optionsChain.filter(this.props.preferences.comparisonType, this.props.preferences.selectedComparisonValue, unselectedOptionType);

      //If user wants to compare calls and puts, only allow for one metric. Otherwise, allow three.
      var keys = [this.props.analytics.dataPaneConfig.metric_1,this.props.analytics.dataPaneConfig.metric_2,this.props.analytics.dataPaneConfig.metric_3];
      if (this.props.analytics.dataPaneConfig.showBothTypes == true) {
        keys = [this.props.analytics.dataPaneConfig.metric_1];
      }

      //Colors for different series
      var colors = ['#b085f5','#6ff9ff','#ffd95b'];
      var opposingColors = ['#80e27e','#ff7961','#be9c91'];

      //Go through each metric item selected by user
      for (var keyIndex in keys) {
        var desiredKey = keys[keyIndex];
        if (desiredKey != null) {
          var dataPoints = [];
          var opposingPoints = [];

          //Get points for every option type to plot on chart
          for (var index in singleOptions) {
            if (this.props.preferences.comparisonType == "strike") {
              dataPoints.push([singleOptions[index].get("date"), singleOptions[index].get(desiredKey)]);
              opposingPoints.push([singleOppositeOptions[index].get("date"), singleOppositeOptions[index].get(desiredKey)]);
            } else if (this.props.preferences.comparisonType == "date") {
              dataPoints.push([singleOptions[index].get("strike"), singleOptions[index].get(desiredKey)]);
              opposingPoints.push([singleOppositeOptions[index].get("strike"), singleOppositeOptions[index].get(desiredKey)]);
            }
          }

          //Add series for selected option type to chart
          seriesData.push({label: desiredKey + " (" + selectedOptionType + ")", color: colors[keyIndex], data: dataPoints});

          //If user desires, add series for unselectd option type for comparison
          if (this.props.analytics.dataPaneConfig.showBothTypes == true) {
            seriesData.push({label: desiredKey + " (" + unselectedOptionType + ")", color: opposingColors[keyIndex], data: opposingPoints});
          }

        }
      }
    }

    return (
      <div style={{height: "100%", display: (this.props.analytics.selectedPane == "data" ? "flex" : "none"), flexFlow: "column"}}>
        <PaneConfiguration
          analytics={this.props.analytics}
          preferences={this.props.preferences}
          optionNames={(this.props.optionsChain == null) ? null : this.props.optionsChain.names}
          onDataAnalyticsConfigChange={this.props.onDataAnalyticsConfigChange}/>
        <div style={{display: (this.props.analytics.dataPaneConfig.display == "chart" ? "flex" : "none"), flex: "1 1 auto"}}>
          <LineChart type={this.props.analytics.dataPaneConfig.chartType} data={seriesData}/>
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
    var additionalDropdowns = null;

    optionNameItems.push(<MenuItem value={null}>{"None"}</MenuItem>);
    for (var key in this.props.optionNames) {
      optionNameItems.push(<MenuItem value={key}>{this.props.optionNames[key]}</MenuItem>);
    }

    //Change metric config and propogate entire data pane configuration object with updated value
    const handleMetricTypeChange = (event) => {
      if (this.props.onDataAnalyticsConfigChange != null) {
        var configuration = this.props.analytics.dataPaneConfig;
        configuration[event.target.name] = event.target.value;
        console.log(event);
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

    //Toggle chart type config (bar, line) and propogate entire data pane config object w/ updated value
    const handleChartTypeChange = () => {
      if (this.props.onDataAnalyticsConfigChange != null) {
        var configuration = this.props.analytics.dataPaneConfig;
        if (configuration.chartType == "line") {
          configuration.chartType = "bar";
        } else if (configuration.chartType == "bar") {
          configuration.chartType = "line";
        }
        this.props.onDataAnalyticsConfigChange(configuration);
      }
    }

    //If user only wants to see data for the selected option type, add two additional dropdowns
    if (this.props.analytics.dataPaneConfig.showBothTypes == false) {
      additionalDropdowns = [
        (<Select
          value={this.props.analytics.dataPaneConfig.metric_2}
          variant='outlined'
          name={"metric_2"}
          style={{margin: 0, marginRight: 8, flex: "1 0 0", overflowX: "hidden"}}
          onChange={handleMetricTypeChange}
          input={<StyledInputBase/>}>
          {optionNameItems}
        </Select>),
        (<Select
          value={this.props.analytics.dataPaneConfig.metric_3}
          variant='outlined'
          name={"metric_3"}
          style={{margin: 0, flex: "1 0 0", overflowX: "hidden"}}
          onChange={handleMetricTypeChange}
          input={<StyledInputBase/>}>
          {optionNameItems}
        </Select>)
      ];
    }

    return (
      <Paper style={{padding: 8, margin: 8, marginTop: 0, backgroundColor: "#222226", display: "flex", flex: "0 1 auto", height: 64}}>
        <IconButton onClick={handleChartTypeChange}>
          <Icon style={{fontSize: 24}}>{this.props.analytics.dataPaneConfig.chartType == "line" ? "bar_chart" : "show_chart"}</Icon>
        </IconButton>
        <Select
          value={this.props.analytics.dataPaneConfig.showBothTypes}
          variant='outlined'
          name={"showBothTypes"}
          style={{margin: 0, marginLeft: 8, flex: "1 0 0", overflowX: "hidden"}}
          onChange={handleMetricTypeChange}
          input={<StyledInputBase/>}>
          <MenuItem value={false}>{((this.props.preferences.optionType == "calls") ?  "Calls " : "Puts ") + " only"}</MenuItem>
          <MenuItem value={true}>{"Calls & Puts"}</MenuItem>
        </Select>
        <Select
          value={this.props.analytics.dataPaneConfig.metric_1}
          variant='outlined'
          name={"metric_1"}
          style={{margin: 0, marginLeft: 8, marginRight: 8, flex: "1 0 0", overflowX: "hidden"}}
          onChange={handleMetricTypeChange}
          input={<StyledInputBase/>}>
          {optionNameItems}
        </Select>
        {additionalDropdowns}
      </Paper>
    );
  }
}
