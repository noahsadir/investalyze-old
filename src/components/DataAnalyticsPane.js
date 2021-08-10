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

import MultiChart from "./MultiChart";

var colors = [
  '#666ad1',
  '#48a999',
  '#fff263',
  '#ff5f52',
  '#ae52d4',
  '#5eb8ff',
  '#99d066',
  '#ffad42',
  '#ff7d47',
  '#fa5788',
  '#8559da',
  '#63a4ff',
  '#56c8d8',
  '#6abf69',
  '#e4e65e',
  '#ffd149',
];

var Formats = require('../libraries/Formats');
var ExpandingInputBase = require('./ExpandingInputBase');

export default class DataAnalyticsPane extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var seriesData = [];
    var chartType = {
      line: "line",
      bar: "bar",
      bar_stacked: "bar",
      surface: "surface",
    }

    //Only run calculations if pane is visible and options chain is valid
    if (this.props.optionsChain != null && this.props.analytics.selectedPane == "data") {
      var optionsSets = [];
      var setLabels = [];

      //List of selected metrics
      var keys = [this.props.analytics.dataPaneConfig.metric_1,this.props.analytics.dataPaneConfig.metric_2,this.props.analytics.dataPaneConfig.metric_3];

      if (this.props.analytics.dataPaneConfig.showBothTypes == "selected_only") {
        //Create only one set with desired metrics for either calls or puts from the selected date/strike
        setLabels = keys;
        optionsSets.push(this.props.optionsChain.filter(this.props.preferences.comparisonType, this.props.preferences.selectedComparisonValue, this.props.preferences.optionType));
      } else if (this.props.analytics.dataPaneConfig.showBothTypes == "both_types") {
        //Create a set for calls and a set for puts, but only for the selected date/strike
        keys = [this.props.analytics.dataPaneConfig.metric_1]; //Only one metric should be allowed (otherwise chart would be a mess)
        setLabels = ["Calls", "Puts"];
        optionsSets.push(this.props.optionsChain.filter(this.props.preferences.comparisonType, this.props.preferences.selectedComparisonValue, "calls"));
        optionsSets.push(this.props.optionsChain.filter(this.props.preferences.comparisonType, this.props.preferences.selectedComparisonValue, "puts"));
      } else if (this.props.analytics.dataPaneConfig.showBothTypes == "all_for_type" || this.props.analytics.dataPaneConfig.showBothTypes == "all_options") {
        //Create a set for calls or puts (or both if desired) for each date separated by strike, or for each strike separated by date

        keys = [this.props.analytics.dataPaneConfig.metric_1]; //Only one metric should be allowed (otherwise chart would be a mess)

        //Go through each comparison value (strike or date) and create the appropriate set(s)
        for (var compIndex in this.props.preferences.availableComparisonValues) {

          //Generate series labels, applying the proper formatting for dates
          if (this.props.preferences.comparisonType == "date") {

            if (this.props.analytics.dataPaneConfig.showBothTypes == "all_options") {
              //Distinguish between calls and puts if data for both is desired
              setLabels.push(Formats.time(this.props.preferences.availableComparisonValues[compIndex]) + " (calls)");
              setLabels.push(Formats.time(this.props.preferences.availableComparisonValues[compIndex]) + " (puts)");
            } else {
              setLabels.push(Formats.time(this.props.preferences.availableComparisonValues[compIndex]));
            }
          } else {
            if (this.props.analytics.dataPaneConfig.showBothTypes == "all_options") {
              //Distinguish between calls and puts if data for both is desired
              setLabels.push("$" + this.props.preferences.availableComparisonValues[compIndex] + " (calls)");
              setLabels.push("$" + this.props.preferences.availableComparisonValues[compIndex] + " (puts)");
            } else {
              setLabels.push("$" + this.props.preferences.availableComparisonValues[compIndex]);
            }
          }

          //Create a set for calls or puts (or both if desired)
          if (this.props.analytics.dataPaneConfig.showBothTypes == "all_options" || this.props.preferences.optionType == "puts") {
            optionsSets.push(this.props.optionsChain.filter(this.props.preferences.comparisonType, this.props.preferences.availableComparisonValues[compIndex], "puts"));
          } else if (this.props.analytics.dataPaneConfig.showBothTypes == "all_options" || this.props.preferences.optionType == "calls") {
            optionsSets.push(this.props.optionsChain.filter(this.props.preferences.comparisonType, this.props.preferences.availableComparisonValues[compIndex], "calls"));
          }

        }
      }

      //With options data properly selected and filtered, create series data to send to MultiChart
      for (var keyIndex in keys) {

        //For each data set, create a unique series for each metric (if not null)
        var desiredKey = keys[keyIndex];
        if (desiredKey != null) {

          //Go through each set
          for (var setIndex in optionsSets) {
            var pointsForSet = [];

            //Get data from each SingleOption in filtered set and form a data point for each,
            //which can be displayed on a chart.
            for (var index in optionsSets[setIndex]) {
              //x-value should be the opposite of the currently selected comparison type
              var xAxisKey = (this.props.preferences.comparisonType == "strike" ? "expiration" : "strike");
              pointsForSet.push([optionsSets[setIndex][index].get(xAxisKey), optionsSets[setIndex][index].get(desiredKey)]);
            }

            //Cycle through list of colors to assign for a series,
            //then add to collection of formatted series data
            var colorIndex = (parseInt(setIndex) + parseInt(keyIndex)) % colors.length;
            seriesData.push({label: setLabels[(parseInt(setIndex) + parseInt(keyIndex)) % setLabels.length], color: colors[colorIndex], data: pointsForSet});
          }
        }
      }
    }

    return (
      <div style={{height: "100%", display: (this.props.analytics.selectedPane == "data" ? "flex" : "none"), flexFlow: "column"}}>
        <PaneConfiguration
          theme={this.props.theme}
          analytics={this.props.analytics}
          preferences={this.props.preferences}
          optionNames={(this.props.optionsChain == null) ? null : this.props.optionsChain.names}
          onDataAnalyticsConfigChange={this.props.onDataAnalyticsConfigChange}/>
        <div style={{display: (this.props.analytics.dataPaneConfig.display == "chart" ? "flex" : "none"), flex: "1 1 auto"}}>
          <MultiChart
            theme={this.props.theme}
            xAxisLabel={this.props.preferences.comparisonType == "date" ? "Strike" : "Date"}
            yAxisLabel={(this.props.optionsChain == null) ? null : this.props.optionsChain.names[this.props.analytics.dataPaneConfig.metric_1]}
            zAxisLabel={this.props.preferences.comparisonType == "date" ? "Date" : "Strike"}
            scale={this.props.preferences.comparisonType == "strike" ? "time" : "linear"}
            type={chartType[this.props.analytics.dataPaneConfig.chartType]}
            stacked={this.props.analytics.dataPaneConfig.chartType == "bar_stacked"}
            backgroundColor={this.props.backgroundColor}
            data={seriesData}/>
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
    var chartTypeIcons = {
      line: "bar_chart",
      bar: "stacked_bar_chart",
      bar_stacked: "view_in_ar",
      surface: "show_chart",
    }

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
          configuration.chartType = "bar_stacked";
        } else if (configuration.chartType == "bar_stacked") {
          configuration.chartType = "surface";
        } else if (configuration.chartType == "surface") {
          configuration.chartType = "line";
        }
        this.props.onDataAnalyticsConfigChange(configuration);
      }
    }

    //If user only wants to see data for the selected option type, add two additional dropdowns
    if (this.props.analytics.dataPaneConfig.showBothTypes == "selected_only") {
      additionalDropdowns = [
        (<Select
          value={this.props.analytics.dataPaneConfig.metric_2}
          variant='outlined'
          name={"metric_2"}
          style={{margin: 0, marginRight: 8, flex: "1 0 0", overflowX: "hidden"}}
          onChange={handleMetricTypeChange}
          input={ExpandingInputBase.get(this.props.theme.borderColor)}>
          {optionNameItems}
        </Select>),
        (<Select
          value={this.props.analytics.dataPaneConfig.metric_3}
          variant='outlined'
          name={"metric_3"}
          style={{margin: 0, flex: "1 0 0", overflowX: "hidden"}}
          onChange={handleMetricTypeChange}
          input={ExpandingInputBase.get(this.props.theme.borderColor)}>
          {optionNameItems}
        </Select>)
      ];
    }

    return (
      <Paper style={{padding: 8, margin: 8, marginTop: 0, overflow: "hidden", backgroundColor: this.props.theme.elevationColor, display: "flex", flex: "0 1 auto", height: 64}}>
        <IconButton onClick={handleChartTypeChange}>
          <Icon style={{fontSize: 24}}>{chartTypeIcons[this.props.analytics.dataPaneConfig.chartType]}</Icon>
        </IconButton>
        <Select
          value={this.props.analytics.dataPaneConfig.showBothTypes}
          variant='outlined'
          name={"showBothTypes"}
          style={{margin: 0, marginLeft: 8, flex: "1 0 0", overflowX: "hidden"}}
          onChange={handleMetricTypeChange}
          input={ExpandingInputBase.get(this.props.theme.borderColor)}>
          <MenuItem value={"selected_only"}>{"Selected " + ((this.props.preferences.optionType == "calls") ?  "Calls " : "Puts ") + " only"}</MenuItem>
          <MenuItem value={"both_types"}>{"Selected Calls & Puts"}</MenuItem>
          <MenuItem value={"all_for_type"}>{"All " + ((this.props.preferences.optionType == "calls") ?  "Calls " : "Puts ")}</MenuItem>
          <MenuItem value={"all_options"}>{"All Calls & Puts"}</MenuItem>
        </Select>
        <Select
          value={this.props.analytics.dataPaneConfig.metric_1}
          variant='outlined'
          name={"metric_1"}
          style={{margin: 0, marginLeft: 8, marginRight: 8, flex: "1 0 0", overflowX: "hidden"}}
          onChange={handleMetricTypeChange}
          input={ExpandingInputBase.get(this.props.theme.borderColor)}>
          {optionNameItems}
        </Select>
        {additionalDropdowns}
      </Paper>

    );
  }
}
