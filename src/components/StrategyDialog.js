import '../App.css';
import React from "react";
import { withStyles } from '@material-ui/core/styles';
import {
  Dialog,
  Slide,
  AppBar,
  Toolbar,
  IconButton,
  Icon,
  Typography,
  TextField,
  Paper,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core/';
import MultiChart from './MultiChart';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

var ExpandingInputBase = require('./ExpandingInputBase');
var Formats = require('../lib/Formats');

var stepValueDefault = 3;
var stepColumnsDefault = 30;

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

export default class StrategyDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      configuration: {
        stepCount: 5,
        stepValue: stepValueDefault,
        stepType: "percent_change",
        stepColumns: stepColumnsDefault,
        chartType: "table",
      }
    }
  }

  render() {
    const handleClose = () => {
      if (this.props.onClose != null) {
        this.props.onClose();
      }
    }

    return (
      <Dialog fullScreen open={this.props.open} onClose={handleClose} aria-labelledby="form-dialog-title" TransitionComponent={Transition}>
        <AppBar style={{position: 'relative', backgroundColor: this.props.theme.foregroundColor}}>
          <Toolbar>
            <IconButton edge="start" color={this.props.theme.textColor} onClick={handleClose} aria-label="close">
              <Icon>close</Icon>
            </IconButton>
            <Typography variant="h6" style={{marginLeft: 8,flex: "1 0 0", color: this.props.theme.textColor}}>
              {this.props.strategy != null ? this.props.strategy.identify() : "Unknown Strategy"}
            </Typography>
          </Toolbar>
        </AppBar>
        <div style={{margin: 0, padding: 8, display: "flex", background: this.props.theme.backgroundColor, width: "100%", flexFlow: "column", height: "100%"}}>
          <ConfigurationBar
            theme={this.props.theme}
            configuration={this.state.configuration}
            onstepCountChange={(value) => setSubState(this, "configuration", "stepCount", value)}
            onStepTypeChange={(value) => setSubState(this, "configuration", "stepType", value)}
            onStepValueChange={(value) => setSubState(this, "configuration", "stepValue", value)}
            onStepColumnChange={(value) => setSubState(this, "configuration", "stepColumns", value)}
            onChartTypeChange={(value) => setSubState(this, "configuration", "chartType", value)}/>
          <PriceCalculationTable
            currentTime={this.props.currentTime}
            theme={this.props.theme}
            configuration={this.state.configuration}
            strategy={this.props.strategy}
            underlyingPrice={this.props.underlyingPrice}/>
        </div>
      </Dialog>
    );
  }
}

class PriceCalculationTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    var strategy = this.props.strategy;
    var tableHeader;
    var tableHeaderColumns = [];
    var tableRows = [];
    var chartData = [];

    var daysUntilExpiration = Math.floor(Formats.timeBetween(this.props.currentTime, strategy.expiration()) / 86400000);
    var dteList = getTimeIncrements(this.props.currentTime, daysUntilExpiration, this.props.configuration.stepColumns);
    var spotList = getSpotPrices(this.props.underlyingPrice, this.props.configuration.stepType, this.props.configuration.stepValue, this.props.configuration.stepCount, this.props.strategy);
    var timeList = [];

    if (this.props.configuration.chartType == "table") {

      //Add rows for each potential spot price
      for (var spotIndex in spotList) {
        var rowColumns = [];

        //First column of row shows spot price and percent change from current spot
        var spotPercent = ((spotList[spotIndex] / this.props.underlyingPrice) - 1) * 100;
        rowColumns.push(
          <TableCell style={{position: '-webkit-sticky',position: 'sticky',backgroundColor: this.props.theme.foregroundColor, left: 0,zIndex: 5}}>
            <span>{"$" + spotList[spotIndex].toFixed(2)}</span>
            <br></br>
            <span style={{color: (spotPercent > 0 ? "#4caf50" : (spotPercent < 0 ? "#e91e63" : this.props.textColor))}}>{(spotPercent >= 0 ? "+" : "-") + Math.abs(spotPercent).toFixed(2) + "%"}</span>
          </TableCell>
        );

        //Add column for each desired date
        for (var dteIndex in dteList) {
          var predictedPrice = strategy.blackScholesPrice(dteList[dteIndex], spotList[spotIndex]);
          var percentChange = ((predictedPrice / strategy.getTotal("mark")) - 1) * 100;
          rowColumns.push(
            <TableCell>
              <span>{Formats.convertToMoneyValue(predictedPrice)}</span>
              <br></br>
              <span style={{color: (percentChange >= 0 ? "#4caf50" : (percentChange < 0 ? "#e91e63" : this.props.textColor))}}>{(percentChange >= 0 ? "+" : "-") + Math.abs(percentChange).toFixed(2) + "%"}</span>
            </TableCell>
          );
        }

        //Add newly formed row to table
        tableRows.push(<TableRow>{rowColumns}</TableRow>);
      }

      //Add header column for each desired date
      for (var index in dteList) {
        var timeSecsAtDTE = (this.props.currentTime / 1000) + ((daysUntilExpiration - dteList[index]) * 86400);
        tableHeaderColumns.push(<TableCell style={{backgroundColor: this.props.theme.foregroundColor}}>{Formats.time(timeSecsAtDTE)}</TableCell>);
      }

      tableHeader = (
        <TableRow>
          <TableCell style={{position: '-webkit-sticky',position: 'sticky', backgroundColor: this.props.theme.foregroundColor, left: 0,zIndex: 5}}>Spot</TableCell>
          {tableHeaderColumns}
        </TableRow>
      );
    } else if (this.props.configuration.chartType == "line_chart") {
      for (var dteIndex in dteList) {
        var timeSecsAtDTE = (this.props.currentTime / 1000) + ((daysUntilExpiration - dteList[dteIndex]) * 86400);
        var colorIndex = dteIndex % colors.length;
        var chartSeries = {label: Formats.time(timeSecsAtDTE), color: colors[colorIndex], data: []};
        for (var spotIndex in spotList) {
          var predictedPrice = strategy.blackScholesPrice(dteList[dteIndex], spotList[spotIndex]);
          chartSeries.data.push([spotList[spotIndex], predictedPrice]);
        }
        chartData.push(chartSeries);
      }

    }

    return (
      <div style={{flex: "1 0 0", display: "flex", flexFlow: "column"}}>
        <TableContainer component={Paper} style={{flex: "1 0 0", display: (this.props.configuration.chartType == "table" ? "flex" : "none")}}>
          <Table stickyHeader size="small" aria-label="simple table">
            <TableHead>
              {tableHeader}
            </TableHead>
            <TableBody>
              {tableRows}
            </TableBody>
          </Table>
        </TableContainer>
        <div style={{flex: "1 1 auto", display: (this.props.configuration.chartType == "line_chart" ? "flex" : "none")}}>
          <MultiChart
            theme={this.props.theme}
            xAxisLabel={"Spot Price"}
            yAxisLabel={"Price"}
            zAxisLabel={"Date"}
            scale={"linear"}
            type={"surface"}
            stacked={false}
            data={chartData}/>
        </div>
        <div style={{flex: "0 0 0"}}/>
      </div>

    )
  }
}

class ConfigurationBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stepValueText: stepValueDefault,
      stepColumnText: stepColumnsDefault,
    }
  }

  render() {

    const handleChartTypeChange = () => {
      if (this.props.onChartTypeChange != null) {
        if (this.props.configuration.chartType == "table") {
          this.props.onChartTypeChange("line_chart");
        } else if (this.props.configuration.chartType == "line_chart") {
          this.props.onChartTypeChange("table");
        }
      }
    }

    const handlestepCountChange = (event) => {
      if (this.props.onstepCountChange != null) {
        this.props.onstepCountChange(event.target.value);
      }
    }

    const handleStepTypeChange = (event) => {
      if (this.props.onStepTypeChange != null) {
        this.props.onStepTypeChange(event.target.value);
      }
    }

    const handleStepValueChange = (event) => {
      if (this.props.onStepValueChange != null) {
        if (!isNaN(parseFloat(event.target.value))) {
          this.props.onStepValueChange(parseFloat(event.target.value));
        } else if (event.target.value == "") {
          this.props.onStepValueChange(stepValueDefault);
        }
      }
      this.setState({stepValueText: event.target.value});
    }

    const handleStepColumnsChange = (event) => {
      if (this.props.onStepColumnChange != null) {
        if (!isNaN(parseFloat(event.target.value))) {
          this.props.onStepColumnChange(parseFloat(event.target.value));
        } else if (event.target.value == "") {
          this.props.onStepColumnChange(stepColumnsDefault);
        }
      }
      this.setState({stepColumnText: event.target.value});
    }

    return (
      <Paper style={{padding: 8, marginBottom: 8, overflow: "hidden", backgroundColor: this.props.theme.elevationColor, display: "flex", flex: "0 1 auto", height: 64, minHeight: 64}}>
        <IconButton onClick={handleChartTypeChange}>
          <Icon style={{fontSize: 24}}>{this.props.configuration.chartType == "table" ? "show_chart" : "table_chart"}</Icon>
        </IconButton>
        <Select
          value={this.props.configuration.stepCount}
          variant='outlined'
          name={"dataType"}
          style={{margin: 0, marginLeft: 8, flex: "1 0 0", overflowX: "hidden"}}
          onChange={handlestepCountChange}
          input={ExpandingInputBase.get(this.props.theme.borderColor)}>
          <MenuItem value={1}>{"1 Step"}</MenuItem>
          <MenuItem value={2}>{"2 Steps"}</MenuItem>
          <MenuItem value={3}>{"3 Steps"}</MenuItem>
          <MenuItem value={4}>{"4 Steps"}</MenuItem>
          <MenuItem value={5}>{"5 Steps"}</MenuItem>
          <MenuItem value={6}>{"6 Steps"}</MenuItem>
          <MenuItem value={7}>{"7 Steps"}</MenuItem>
          <MenuItem value={8}>{"8 Steps"}</MenuItem>
        </Select>
        <Select
          value={this.props.configuration.stepType}
          variant='outlined'
          name={"dataType"}
          style={{margin: 0, marginLeft: 8, flex: "1 0 0", overflowX: "hidden"}}
          onChange={handleStepTypeChange}
          input={ExpandingInputBase.get(this.props.theme.borderColor)}>
          <MenuItem value={"percent_change"}>{"% Change"}</MenuItem>
          <MenuItem value={"dollar_change"}>{"$ Change"}</MenuItem>
        </Select>
        <TextField
          variant="outlined"
          style={{flex: "1 0 0", marginLeft: 8, marginTop: 2}}
          label={"Increment"}
          color="secondary"
          inputProps={{style:{padding:'13px 14px'}}}
          onChange={handleStepValueChange}
          value={this.state.stepValueText}
          placeholder={stepValueDefault}/>
        <TextField
          variant="outlined"
          style={{flex: "1 0 0", marginLeft: 8, marginTop: 2}}
          label={"Columns"}
          color="secondary"
          inputProps={{style:{padding:'13px 14px'}}}
          onChange={handleStepColumnsChange}
          value={this.state.stepColumnText}
          placeholder={stepColumnsDefault}/>
      </Paper>
    );
  }
}

function getSpotPrices(currentSpot, stepType, stepValue, stepCount, strategy) {
  var spotList = strategy.getStrikes();
  spotList.push(currentSpot);

  for (var step = 1; step <= stepCount; step++) {
    var adjustedStepValue = 0;
    if (stepType == "percent_change") {
      adjustedStepValue = (((stepValue * step) / 100) * currentSpot);
    } else if (stepType == "dollar_change") {
      adjustedStepValue = stepValue * step;
    }

    spotList.unshift(parseFloat((currentSpot + adjustedStepValue).toFixed(2)));

    //Only add to list if spot price won't be negative,
    //otherwise add zero if not added already
    if (currentSpot > adjustedStepValue) {
      spotList.push(parseFloat((currentSpot - adjustedStepValue).toFixed(2)));
    } else if (spotList.includes(0)) {
      spotList.push(0);
    }
  }

  spotList.sort(function(a,b) { return a - b;});
  spotList.reverse();

  return spotList;
}

function getTimeIncrements(currentTime, daysUntilExpiration, maxIncrements) {
  var timeList = [];

  for (var daysFromNow = 0; daysFromNow <= daysUntilExpiration; daysFromNow += (daysUntilExpiration / maxIncrements)) {
    timeList.push(Math.ceil(daysFromNow));
  }

  if (!timeList.includes(daysUntilExpiration)) {
    timeList.push(daysUntilExpiration);
  }

  timeList.reverse();

  return timeList;
}

//Update a child of an object in a state
function setSubState(component, parentKey, childkey, value) {
  /*
  component.state = {
    parentKey: {
      childKey: (oldValue --> value),
      ...
    },
    ...
  };
  */
  var obj = component.state[parentKey]; //Make copy of target state object
  obj[childkey] = value; //Set the target child with the desired value
  var container = {};
  container[parentKey] = obj;
  component.setState(obj); //update the state with the modified object
}
