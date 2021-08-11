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
var Formats = require('../libraries/Formats');
var ExpandingInputBase = require('./ExpandingInputBase');

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
    var chartData = [];

    //Get data for calls and puts at different dates, along with data for all dates combnined
    if (this.props.optionsChain != null && this.props.analytics.selectedPane == "projection") {
      var dates = this.props.optionsChain.getDates("calls");
      var calculationType = this.props.analytics.projectionPaneConfig.dataType;

      //Data for all calls, puts, and both
      data.all = {
        total: chainCalculation(this.props.optionsChain, calculationType, null, null),
        calls: chainCalculation(this.props.optionsChain, calculationType, null, "calls"),
        puts: chainCalculation(this.props.optionsChain, calculationType, null, "puts"),
      };

      //Data for calls, puts, and total for each date
      for (var dateIndex in dates) {
        var currentDate = dates[dateIndex];
        data[currentDate] = {
          total: chainCalculation(this.props.optionsChain, calculationType, currentDate, null),
          calls: chainCalculation(this.props.optionsChain, calculationType, currentDate, "calls"),
          puts: chainCalculation(this.props.optionsChain, calculationType, currentDate, "puts"),
        };
      }

      //Only load chart data if visible (time consuming process)
      if (this.props.analytics.projectionPaneConfig.chartType == "chart") {
        chartData = createChartData(data, this.props.analytics.projectionPaneConfig.dataType, this.props.underlyingHistorical, this.props.underlyingPrice);
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
            xAxisLabel={"Date"}
            yAxisLabel={null}
            zAxisLabel={null}
            scale={(this.props.analytics.projectionPaneConfig.dataType == "implied_move_local" || this.props.analytics.projectionPaneConfig.dataType == "implied_move_general") ? "time_scaled" : "time"}
            type={(this.props.analytics.projectionPaneConfig.dataType == "implied_move_local" || this.props.analytics.projectionPaneConfig.dataType == "implied_move_general" || this.props.analytics.projectionPaneConfig.dataType == "implied_volatility" || this.props.analytics.projectionPaneConfig.dataType == "max_pain") ? "line" : "bar"}
            stacked={false}
            data={chartData}/>
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
          <MenuItem value={"max_pain"}>{"Max Pain"}</MenuItem>
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

    var headerStyle = {position: 'sticky',backgroundColor: this.props.theme.foregroundColor };
    //Header configuration
    if (this.props.dataType == "implied_volatility") {
      tableHeader = (
        <TableRow>
          <TableCell style={headerStyle}>Date</TableCell>
          <TableCell align="right" style={headerStyle}>Calls</TableCell>
          <TableCell align="right" style={headerStyle}>Puts</TableCell>
          <TableCell align="right" style={headerStyle}>Total</TableCell>
        </TableRow>
      );
    } else if (this.props.dataType == "open_interest" || this.props.dataType == "volume") {
      tableHeader = (
        <TableRow>
          <TableCell style={headerStyle}>Date</TableCell>
          <TableCell align="right" style={headerStyle}>Calls</TableCell>
          <TableCell align="right" style={headerStyle}>Puts</TableCell>
          <TableCell align="right" style={headerStyle}>Total</TableCell>
          <TableCell align="right" style={headerStyle}>P/C Ratio</TableCell>
        </TableRow>
      );
    } else if (this.props.dataType == "implied_move_general" || this.props.dataType == "implied_move_local") {
      tableHeader = (
        <TableRow>
          <TableCell style={headerStyle}>Date</TableCell>
          <TableCell align="right" style={headerStyle}>Low</TableCell>
          <TableCell align="right" style={headerStyle}>High</TableCell>
          <TableCell align="right" style={headerStyle}>Change ($)</TableCell>
          <TableCell align="right" style={headerStyle}>Change (%)</TableCell>
        </TableRow>
      );
    } else if (this.props.dataType == "open_interest_value" || this.props.dataType == "open_interest_intrinsic" || this.props.dataType == "open_interest_extrinsic") {
      tableHeader = (
        <TableRow>
          <TableCell style={headerStyle}>Date</TableCell>
          <TableCell align="right" style={headerStyle}>Calls</TableCell>
          <TableCell align="right" style={headerStyle}>Puts</TableCell>
          <TableCell align="right" style={headerStyle}>Total</TableCell>
        </TableRow>
      );
    } else if (this.props.dataType == "max_pain") {
      tableHeader = (
        <TableRow>
          <TableCell style={headerStyle}>Date</TableCell>
          <TableCell align="right" style={headerStyle}>Max Pain</TableCell>
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
      } else if (this.props.dataType == "max_pain") {
        var impliedMove = this.props.data[dateKey].total;
        if (dateKey != "all") {
          rowItem = (
            <TableRow key={dateKey}>
              <TableCell component="th" scope="row">{dateKey == "all" ? "All" : Formats.time(dateKey)}</TableCell>
              <TableCell align="right">{"$" + parseFloat(this.props.data[dateKey].total).toFixed(2)}</TableCell>
            </TableRow>
          );
        }
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

/**
 * Convert data to valid format recognized by MultiChart
 *
 * @param {Object} data the calculated options data
 * @param {string} calcType the type of calculation done
 * @param {HistoricalStockData} underlyingHistorical the historical data for the underlying
 * @param {number} underlyingPrice the current price of the underlying
 * @returns {Object[]} an array of objects formatted for MultiChart
 *         Example: [{label:..., color:..., data:[[x,y],[x,y],...]},...]
 */
function createChartData(data, calcType, underlyingHistorical, underlyingPrice) {
  var chartData = [];
  var currentTime = (new Date()).getTime();
  if (calcType == "implied_volatility" || calcType == "open_interest" || calcType == "open_interest_value" || calcType == "open_interest_extrinsic" || calcType == "open_interest_intrinsic" || calcType == "volume") {
    //Chart separated by calls and puts without historical data
    var callSeries = {label: "Calls", color: '#666ad1', data: []};
    var putSeries = {label: "Puts", color: '#48a999', data: []};
    var totalSeries = {label: "Total", color: '#fff263', data: []};
    for (var dataKey in data) {
      if (dataKey != "all") {
        var dateVal = parseInt(dataKey) * 1000;

        callSeries.data.push([dateVal, data[dataKey].calls]);
        putSeries.data.push([dateVal, data[dataKey].puts]);
        totalSeries.data.push([dateVal, data[dataKey].total]);
      }
    }
    chartData = [callSeries, putSeries, totalSeries];
  } else if (calcType == "max_pain") {
    //Chart separated by calls and puts without historical data
    var totalSeries = {label: "Max Pain", color: '#fff263', data: []};
    for (var dataKey in data) {
      if (dataKey != "all") {
        var dateVal = parseInt(dataKey) * 1000;
        totalSeries.data.push([dateVal, data[dataKey].total]);
      }
    }
    chartData = [totalSeries];
  } else if (calcType == "implied_move_local" || calcType == "implied_move_general") {

    //Line chart with historical data and total calculated data only
    var historicalSeries = {label: "Historical", color: '#666ad1', data: []};
    var projectionSeries = {label: "Projection", color: '#666ad1', data: []};
    var latestExpiration = 0;
    var fullHistoricalData = underlyingHistorical != null ? underlyingHistorical.closingPrices : [];
    var historicalData = [];

    //Only include approximately 100 data points
    for (var index in fullHistoricalData) {
      if (index % Math.ceil(fullHistoricalData.length / 100) == 0) {
        historicalData.push(fullHistoricalData[index]);
      }
    }

    if (historicalData.length > 2){
      //Red if stock is down, green if up
      historicalSeries.color = (historicalData[0][1] > historicalData[historicalData.length - 1][1]) ? '#48a999' : '#ff5f52';
    }

    for (var dataKey in data) {
      if (dataKey != "all") {
        var high = underlyingPrice + data[dataKey].total;
        var low = (underlyingPrice > data[dataKey].total) ? underlyingPrice - data[dataKey].total : 0;
        projectionSeries.data.unshift([parseInt(dataKey) * 1000, high]);
        projectionSeries.data.push([parseInt(dataKey) * 1000, low]);
        if ((parseInt(dataKey) * 1000) > latestExpiration) {
          latestExpiration = parseInt(dataKey) * 1000;
        }
      }
    }

    var earliestHistorical = currentTime - (latestExpiration - currentTime);
    for (var index in historicalData) {
      if (historicalData[index][0] >= earliestHistorical) {
        historicalSeries.data.push([historicalData[index][0],historicalData[index][1]]);
      }
    }

    chartData = [historicalSeries, projectionSeries];
  }

  return chartData;
}

/**
 * Perform a calculation requested by user.
 *
 * @param {OptionsChain} optionsChain a valid OptionsChain object
 * @param {string} calcType the type of calculation to perform
 * @param {number} date the expiration date to perform the calculation.
 *             Will calculate for all dates if {@code null}.
 * @param {string} optionType the option type to perform the calculation ("calls" or "puts").
 *                   Will calculate for both types if {@code null}.
 * @returns {number} a value calculated based on the given parameters
 */
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
  } else if (calcType == "max_pain") {
    if (optionType == null) {
      return optionsChain.maxPain(date);
    }
  }
  return null;
}
