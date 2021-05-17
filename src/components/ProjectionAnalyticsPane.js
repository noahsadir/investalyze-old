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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core/";

import MultiChart from "./MultiChart";
var Formats = require('../lib/Formats');
var ExpandingInputBase = require('./ExpandingInputBase');

export default class ProjectionAnalyticsPane extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    /*
    var data = {
      1642304923: {
        calls: 0,
        puts: 0,
        total: 0,
      },
      ...
    }*/

    var data = {};

    if (this.props.optionsChain != null && this.props.analytics.selectedPane == "projection") {
      var dates = this.props.optionsChain.getDates("calls");
      var calculationType = this.props.analytics.projectionPaneConfig.dataType;

      data.all = {
        total: chainCalculation(this.props.optionsChain, calculationType, null, null),
        calls: chainCalculation(this.props.optionsChain, calculationType, null, "calls"),
        puts: chainCalculation(this.props.optionsChain, calculationType, null, "puts"),
      };

      for (var dateIndex in dates) {
        var currentDate = dates[dateIndex];
        data[currentDate] = {
          total: chainCalculation(this.props.optionsChain, calculationType, currentDate, null),
          calls: chainCalculation(this.props.optionsChain, calculationType, currentDate, "calls"),
          puts: chainCalculation(this.props.optionsChain, calculationType, currentDate, "puts"),
        };
      }
    }

    return (
      <div style={{height: "100%", display: (this.props.analytics.selectedPane == "projection" ? "flex" : "none"), flexFlow: "column"}}>
        <PaneConfiguration
          theme={this.props.theme}
          analytics={this.props.analytics}
          preferences={this.props.preferences}
          onProjectionAnalyticsConfigChange={this.props.onProjectionAnalyticsConfigChange}/>
        <div style={{display: (this.props.analytics.projectionPaneConfig.chartType == "chart" ? "flex" : "none"), flex: "1 1 auto"}}>
          <MultiChart
            theme={this.props.theme}
            xAxisLabel={"X-Axis"}
            yAxisLabel={"Y-Axis"}
            zAxisLabel={"Z-Axis"}
            scale={this.props.preferences.comparisonType == "strike" ? "time" : "linear"}
            type={"line"}
            stacked={false}
            data={null}/>
        </div>
        <div style={{padding: 8, display: (this.props.analytics.projectionPaneConfig.chartType == "table" ? "flex" : "none"), flex: "1 1 auto", flexFlow: "column"}}>
          <ProjectionTable
            theme={this.props.theme}
            underlyingPrice={this.props.underlyingPrice}
            dataType={this.props.analytics.projectionPaneConfig.dataType}
            data={data}/>
          <div style={{flex: "0 0 0"}}></div>
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
      chart: "table_chart",
      table: "show_chart",
    }

    //Change metric config and propogate entire data pane configuration object with updated value
    const handleMetricTypeChange = (event) => {
      if (this.props.onProjectionAnalyticsConfigChange != null) {
        var configuration = this.props.analytics.projectionPaneConfig;
        configuration[event.target.name] = event.target.value;
        console.log(event);
        this.props.onProjectionAnalyticsConfigChange(configuration);
      }
    }

    //Toggle chart type config (bar, line) and propogate entire data pane config object w/ updated value
    const handleChartTypeChange = () => {
      if (this.props.onProjectionAnalyticsConfigChange != null) {
        var configuration = this.props.analytics.projectionPaneConfig;
        if (configuration.chartType == "chart") {
          configuration.chartType = "table";
        } else if (configuration.chartType == "table") {
          configuration.chartType = "chart";
        }
        this.props.onProjectionAnalyticsConfigChange(configuration);
      }
    }

    return (
      <Paper style={{padding: 8, margin: 8, marginTop: 0, overflow: "hidden", backgroundColor: this.props.theme.elevationColor, display: "flex", flex: "0 1 auto", height: 64}}>
        <IconButton onClick={handleChartTypeChange}>
          <Icon style={{fontSize: 24}}>{chartTypeIcons[this.props.analytics.projectionPaneConfig.chartType]}</Icon>
        </IconButton>
        <Select
          value={this.props.analytics.projectionPaneConfig.dataType}
          variant='outlined'
          name={"dataType"}
          style={{margin: 0, marginLeft: 8, flex: "1 0 0", overflowX: "hidden"}}
          onChange={handleMetricTypeChange}
          input={ExpandingInputBase.get(this.props.theme.borderColor)}>
          <MenuItem value={"implied_move_local"}>{"Implied Move (Local)"}</MenuItem>
          <MenuItem value={"implied_move_general"}>{"Implied Move (General)"}</MenuItem>
          <MenuItem value={"implied_volatility"}>{"Implied Volatility (NTM)"}</MenuItem>
          <MenuItem value={"open_interest"}>{"Open Interest"}</MenuItem>
          <MenuItem value={"open_interest_value"}>{"Open Interest Value"}</MenuItem>
          <MenuItem value={"open_interest_intrinsic"}>{"Open Interest Intrinsic"}</MenuItem>
          <MenuItem value={"open_interest_extrinsic"}>{"Open Interest Extrinsic"}</MenuItem>
          <MenuItem value={"volume"}>{"Volume"}</MenuItem>
        </Select>
        {additionalDropdowns}
      </Paper>

    );
  }
}

class ProjectionTable extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {
    var tableRows = [];
    var tableHeader = (<TableRow></TableRow>);

    //Header configuration
    if (this.props.dataType == "implied_volatility") {
      tableHeader = (
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell align="right" style={{position: 'sticky',backgroundColor:'#000004'}}>Calls</TableCell>
          <TableCell align="right" style={{position: 'sticky',backgroundColor:'#000004'}}>Puts</TableCell>
          <TableCell align="right" style={{position: 'sticky',backgroundColor:'#000004'}}>Total</TableCell>
        </TableRow>
      );
    } else if (this.props.dataType == "open_interest" || this.props.dataType == "volume") {
      tableHeader = (
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell align="right">Calls</TableCell>
          <TableCell align="right">Puts</TableCell>
          <TableCell align="right">Total</TableCell>
          <TableCell align="right">P/C Ratio</TableCell>
        </TableRow>
      );
    } else if (this.props.dataType == "implied_move_general" || this.props.dataType == "implied_move_local") {
      tableHeader = (
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell align="right">Low</TableCell>
          <TableCell align="right">High</TableCell>
          <TableCell align="right">Change ($)</TableCell>
          <TableCell align="right">Change (%)</TableCell>
        </TableRow>
      );
    } else if (this.props.dataType == "open_interest_value" || this.props.dataType == "open_interest_intrinsic" || this.props.dataType == "open_interest_extrinsic") {
      tableHeader = (
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell align="right">Calls</TableCell>
          <TableCell align="right">Puts</TableCell>
          <TableCell align="right">Total</TableCell>
        </TableRow>
      );
    }

    //Body Configuration
    for (var dateKey in this.props.data){
      var rowItem = null;
      if (this.props.dataType == "implied_volatility") {
        rowItem = (
          <TableRow key={dateKey}>
            <TableCell component="th" scope="row">{dateKey == "all" ? "All" : Formats.time(dateKey)}</TableCell>
            <TableCell align="right">{(this.props.data[dateKey].calls).toFixed(2) + "%"}</TableCell>
            <TableCell align="right">{(this.props.data[dateKey].puts).toFixed(2) + "%"}</TableCell>
            <TableCell align="right">{(this.props.data[dateKey].total).toFixed(2) + "%"}</TableCell>
          </TableRow>
        );

      } else if (this.props.dataType == "open_interest" || this.props.dataType == "volume") {
        rowItem = (
          <TableRow key={dateKey}>
            <TableCell component="th" scope="row">{dateKey == "all" ? "All" : Formats.time(dateKey)}</TableCell>
            <TableCell align="right">{this.props.data[dateKey].calls}</TableCell>
            <TableCell align="right">{this.props.data[dateKey].puts}</TableCell>
            <TableCell align="right">{this.props.data[dateKey].total}</TableCell>
            <TableCell align="right">{(this.props.data[dateKey].puts / this.props.data[dateKey].calls).toFixed(4)}</TableCell>
          </TableRow>
        );

      } else if (this.props.dataType == "implied_move_general" || this.props.dataType == "implied_move_local") {
        var impliedMove = this.props.data[dateKey].total;
        var currentStockPrice = this.props.underlyingPrice;
        if (dateKey != "all") {
          rowItem = (
            <TableRow key={dateKey}>
              <TableCell component="th" scope="row">{dateKey == "all" ? "All" : Formats.time(dateKey)}</TableCell>
              <TableCell align="right">{"$" + (currentStockPrice - impliedMove).toFixed(2)}</TableCell>
              <TableCell align="right">{"$" + (currentStockPrice + impliedMove).toFixed(2)}</TableCell>
              <TableCell align="right">{"+/- $" + impliedMove.toFixed(2)}</TableCell>
              <TableCell align="right">{"+/- " + ((impliedMove / currentStockPrice) * 100).toFixed(2) + "%"}</TableCell>
            </TableRow>
          );
        }
      } else if (this.props.dataType == "open_interest_value" || this.props.dataType == "open_interest_intrinsic" || this.props.dataType == "open_interest_extrinsic") {
        var impliedMove = this.props.data[dateKey].total;
        var currentStockPrice = this.props.underlyingPrice;
        rowItem = (
          <TableRow key={dateKey}>
            <TableCell component="th" scope="row">{dateKey == "all" ? "All" : Formats.time(dateKey)}</TableCell>
            <TableCell align="right">{Formats.convertToTruncatedMoneyValue(this.props.data[dateKey].calls, false)}</TableCell>
            <TableCell align="right">{Formats.convertToTruncatedMoneyValue(this.props.data[dateKey].puts, false)}</TableCell>
            <TableCell align="right">{Formats.convertToTruncatedMoneyValue(this.props.data[dateKey].total, false)}</TableCell>
          </TableRow>
        );
      }

      if (dateKey == "all" && rowItem != null) {
        tableRows.unshift(rowItem);
      } else if (rowItem != null){
        tableRows.push(rowItem);
      }
    }


    return (
      <TableContainer component={Paper} style={{flex: "1 0 0"}}>
        <Table stickyHeader aria-label="simple table">
          <TableHead>
            {tableHeader}
          </TableHead>
          <TableBody>
            {tableRows}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}

function chainCalculation(optionsChain, calcType, date, optionType) {
  if (calcType == "implied_volatility") {
    return optionsChain.impliedVolatility(date, optionType);
  } else if (calcType == "implied_move_local") {
    return optionsChain.impliedMove(date);
  } else if (calcType == "implied_move_general") {
    var iv = optionsChain.impliedVolatility();
    return optionsChain.impliedMove(date, iv);
  } else if (calcType == "open_interest") {
    return optionsChain.getTotal("open_interest", date, optionType);
  } else if (calcType == "volume") {
    return optionsChain.getTotal("volume", date, optionType);
  } else if (calcType == "open_interest_value") {
    return optionsChain.getTotal("open_interest_value", date, optionType);
  } else if (calcType == "open_interest_intrinsic") {
    return optionsChain.getTotal("open_interest_intrinsic", date, optionType);
  } else if (calcType == "open_interest_extrinsic") {
    return optionsChain.getTotal("open_interest_extrinsic", date, optionType);
  }
  return null;
}
