import '../App.css';
import React from "react";
import { withStyles } from '@material-ui/core/styles';
import OptionsStrategy from '../lib/OptionsStrategy';

import {
  Select,
  InputBase,
  Button,
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
  TextField,
  List,
  ListItem,
  InputAdornment,
} from "@material-ui/core/";

import {
  ToggleButton,
  ToggleButtonGroup
} from "@material-ui/lab";

var Formats = require('../lib/Formats');
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

const StyledToggleButtonGroup = withStyles((theme) => ({
  root: {
    width: "calc(50% - 4px)",
  },
  grouped: {
    width: "50%",
  },
}))(ToggleButtonGroup);


export default class BuilderAnalyticsPane extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const onStrategyUpdate = (strategy) => {
      var config = this.props.analytics.builderPaneConfig;
      config.strategy = strategy;
      if (this.props.onBuilderAnalyticsConfigChange != null) {
        this.props.onBuilderAnalyticsConfigChange(config);
      }
    }

    return (
      <div style={{height: "100%", display: (this.props.analytics.selectedPane == "builder" ? "flex" : "none"), flexFlow: "column"}}>
        <PaneConfiguration
          theme={this.props.theme}
          analytics={this.props.analytics}
          preferences={this.props.preferences}
          underlyingPrice={this.props.underlyingPrice}
          onViewStrategyButtonClick={this.props.onViewStrategyButtonClick}
          onBuilderAnalyticsConfigChange={this.props.onBuilderAnalyticsConfigChange}/>
        <StrategyList
          strategy={this.props.analytics.builderPaneConfig.strategy}
          onStrategyUpdate={onStrategyUpdate}/>
      </div>
    );
  }
}

class StrategyList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    var strategy = this.props.strategy;
    var singleOptions = strategy.singleOptions;
    var listItems = [];


    const handleBuySellToggle = (index, value) => {
      strategy.modifySingleOptionQuantity(singleOptions[index].option, Math.abs(singleOptions[index].quantity) * value);
      if (this.props.onStrategyUpdate != null) {
        this.props.onStrategyUpdate(strategy);
      }
    }

    const handleRemoveButtonClick = (index) => {
      strategy.remove(singleOptions[index].option);
      if (this.props.onStrategyUpdate != null) {
        this.props.onStrategyUpdate(strategy);
      }
    }

    const handlePremiumChange = (index, value) => {
      strategy.modifySingleOptionProperty(singleOptions[index].option, "mark", value);
      if (this.props.onStrategyUpdate != null) {
        this.props.onStrategyUpdate(strategy);
      }
    }

    for (var index in singleOptions) {
      var indexVal = index;
      var singleOption = singleOptions[index].option;
      listItems.push(
        <StrategyListItem
          strategy={this.props.strategy}
          index={index}
          onBuySellToggle={handleBuySellToggle}
          onRemoveButtonClick={handleRemoveButtonClick}
          onPremiumChange={handlePremiumChange}/>
      );
    }

    return (
      <List style={{overflowY: "scroll", flex: "1 0 0", padding: 8}}>
        {listItems}
      </List>
    );
  }
}

class StrategyListItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      premiumValue: "",
    }
  }

  render() {

    var strategy = this.props.strategy;
    var index = this.props.index;
    var singleOptions = strategy.singleOptions;
    var singleOption = singleOptions[index].option;

    const handleBuySellToggle = (event, newAlignment) => {
      if (this.props.onBuySellToggle != null && newAlignment != null) {
        this.props.onBuySellToggle(index, newAlignment);
      }
    }

    const removeOptionFromStrategy = () => {
      if (this.props.onRemoveButtonClick != null) {
        this.setState({premiumValue: ""});
        this.props.onRemoveButtonClick(index);
      }
    }

    const handlePremiumChange = (event) => {
      if (!isNaN(parseFloat(event.target.value)) && this.props.onPremiumChange != null) {
        this.props.onPremiumChange(index, parseFloat(event.target.value));
      }
      this.setState({premiumValue: event.target.value});
    }

    return (
      <div style={{width: "100%", display: "flex", marginTop: 8}}>
        <div style={{flex:"2 0 0px"}}>
          <StyledToggleButtonGroup onChange={handleBuySellToggle} id={index} style={{width: "100%", root:{width: "100%"}}} value={singleOptions[index].quantity < 0 ? -1 : 1} exclusive>
            <ToggleButton value={1} aria-label="left aligned">Buy</ToggleButton>
            <ToggleButton value={-1} aria-label="right aligned">Sell</ToggleButton>
          </StyledToggleButtonGroup>
        </div>
        <div style={{flex:"2 0 0px",paddingLeft: 8}}>
          <p style={{fontSize: 18,margin:0,lineHeight:"30px"}}>{"$" + singleOption.get("strike") + " " + singleOption.get("type")}</p>
          <p style={{fontSize: 12,margin:0,lineHeight:"18px"}}>{"Expires " + Formats.time(singleOption.get("expiration") / 1000)}</p>
        </div>
        <div style={{flex:"1 0 0px",minWidth:80}}>
          <TextField onChange={handlePremiumChange} inputProps={{style:{padding:'14.5px 14px'},startAdornment: <InputAdornment position="start">$</InputAdornment>,}} id={index} variant="outlined" placeholder={singleOption.get("mark").toFixed(2)} style={{width:"calc(100%)",margin:0}} value={this.state.premiumValue}></TextField>
        </div>
        <div style={{flex:"1 0 0px",marginLeft:8,maxWidth:48}}>
          <IconButton onClick={removeOptionFromStrategy} style={{marginLeft:0}} id={index} edge="start" color="#FFAAAA">
            <Icon id={index} style={{fontSize: 24,color:"#FFAAAA"}}>close</Icon>
          </IconButton>
        </div>
      </div>
    );
  }
}

class PaneConfiguration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      underlyingPriceValue: "",
      underlyingQuantityValue: "",
    }
  }

  render() {

    //Make list of menu items containing each option metric
    var optionNameItems = [];
    var additionalDropdowns = null;

    var config = this.props.analytics.builderPaneConfig;
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

    const handleUnderlyingPriceChange = (event) => {
      if (!isNaN(parseFloat(event.target.value)) && this.props.onBuilderAnalyticsConfigChange != null) {
        var configuration = this.props.analytics.builderPaneConfig;
        var value = parseFloat(event.target.value);
        configuration.strategy.underlyingPrice = value;
        this.props.onBuilderAnalyticsConfigChange(configuration);
      } else if (event.target.value == null || event.target.value == "") {
        var configuration = this.props.analytics.builderPaneConfig;
        var value = (this.props.underlyingPrice != null ? this.props.underlyingPrice : 0);
        configuration.strategy.underlyingShareCount = value;
        this.props.onBuilderAnalyticsConfigChange(configuration);
      }

      this.setState({underlyingPriceValue: event.target.value});
    }

    const handleUnderlyingQuantityChange = (event) => {
      if (!isNaN(parseFloat(event.target.value)) && this.props.onBuilderAnalyticsConfigChange != null) {
        var configuration = this.props.analytics.builderPaneConfig;
        var value = parseFloat(event.target.value);
        configuration.strategy.underlyingShareCount = value;
        this.props.onBuilderAnalyticsConfigChange(configuration);
      } else if (event.target.value == null || event.target.value == "") {
        var configuration = this.props.analytics.builderPaneConfig;
        var value = 0;
        configuration.strategy.underlyingShareCount = value;
        this.props.onBuilderAnalyticsConfigChange(configuration);
      }
      this.setState({underlyingQuantityValue: event.target.value});
    }

    const handleViewStrategyButtonClick = (event) => {
      if (this.props.onViewStrategyButtonClick != null) {
        this.props.onViewStrategyButtonClick(config.strategy);
      }
    }

    const handleViewToggleButton = () => {
      if (this.props.onBuilderAnalyticsConfigChange != null) {
        var configuration = this.props.analytics.builderPaneConfig;
        if (configuration.viewType == "config") {
          configuration.viewType = "greeks";
        } else if (configuration.viewType == "greeks"){
          configuration.viewType = "config";
        }
        this.props.onBuilderAnalyticsConfigChange(configuration);
      }

    }

    var deltaValue = parseFloat(config.strategy.getAdjustedTotal("delta") + config.strategy.underlyingShareCount);
    var gammaValue = config.strategy.getAdjustedTotal("gamma");
    var thetaValue = config.strategy.getAdjustedTotal("theta");
    var vegaValue = config.strategy.getAdjustedTotal("vega");
    var rhoValue = config.strategy.getAdjustedTotal("rho");

    var deltaDirection = getDirection(deltaValue, 5);
    var gammaDirection = getDirection(gammaValue, 0);
    var thetaDirection = getDirection(thetaValue, 1);
    var vegaDirection = getDirection(vegaValue, 5);
    var rhoDirection = getDirection(rhoValue, 0);


    return (
      <Paper style={{height: 200, padding: 8, margin: 8, marginTop: 0, overflow: "hidden", backgroundColor: this.props.theme.elevationColor, display: "flex", flexFlow: "column", flex: "0 1 auto"}}>
        <div style={{display: "flex", height: 32}}>
          <p style={{flex: "1 0 0", color: this.props.theme.textColor, fontSize: 24, height: 32, margin: 0, textOverflow: "ellipsis", overflowX: "clip", whiteSpace: "nowrap"}}>{this.props.analytics.builderPaneConfig.strategy != null ? this.props.analytics.builderPaneConfig.strategy.identify() : "No Position"}</p>
          <IconButton onClick={handleViewToggleButton} style={{height: 32, padding: 4}} edge="start">
            <Icon style={{fontSize: 24}}>{this.props.analytics.builderPaneConfig.viewType == "config" ? "functions" : "tune"}</Icon>
          </IconButton>
        </div>
        <div style={{display: (this.props.analytics.builderPaneConfig.viewType == "config" ? "flex" : "none"), flexFlow: "column"}}>
          <p style={{color: this.props.theme.textColor, fontSize: 14, fontWeight: 600, margin: 0, paddingTop: 16, textOverflow: "ellipsis", overflowX: "clip", whiteSpace: "nowrap"}}>UNDERLYING POSITION</p>
          <div style={{display: "flex", paddingTop: 8}}>
            <TextField variant="outlined" color="secondary" label="Cost Basis" placeholder={this.props.underlyingPrice != null ? this.props.underlyingPrice.toFixed(2) : "0"} disabled={this.props.didContinueToGenerate} onChange={handleUnderlyingPriceChange} style={{color:"#ffffff", width:"100%", marginRight: 8}} value={this.state.underlyingPriceValue}></TextField>
            <TextField variant="outlined" color="secondary" label="Shares" placeholder={"0"} disabled={this.props.didContinueToGenerate} onChange={handleUnderlyingQuantityChange} style={{color:"#ffffff",width:"100%"}} value={this.state.underlyingQuantityValue}></TextField>
          </div>
          <div style={{display: "flex", paddingTop: 16}}>
            <p style={{color: this.props.theme.textColor, fontSize: 18, margin: 0, flex: "1 0 0"}}>{"Net " + ((this.props.analytics.builderPaneConfig.strategy != null && this.props.analytics.builderPaneConfig.strategy.markDebitCredit() <= 0) ? "Debit" : "Credit") + ": $" + (this.props.analytics.builderPaneConfig.strategy != null ? Math.abs(this.props.analytics.builderPaneConfig.strategy.markDebitCredit()).toFixed(2) : "0.00")}</p>
            <Button onClick={handleViewStrategyButtonClick} style={{width: 128}} color={"secondary"} variant="contained">View</Button>
          </div>
        </div>
        <div style={{flex: "1 0 0", display: (this.props.analytics.builderPaneConfig.viewType == "greeks" ? "flex" : "none"), flexFlow: "column"}}>
          <div style={{display: "flex", flex: "1 0 0"}}>
            <div style={{flex: "1 0 0", display: "flex", flexFlow: "column"}}>
              <div style={{flex: "1 0 0"}}/>
              <p style={{flex: "0 0 0", fontSize: 12, margin: 0}}>DELTA <span>{deltaDirection}</span></p>
              <p style={{flex: "0 0 0", fontSize: 16, margin: 0}}>{deltaValue.toFixed(4)}</p>
              <div style={{flex: "1 0 0"}}/>
            </div>
            <div style={{flex: "1 0 0", display: "flex", flexFlow: "column"}}>
              <div style={{flex: "1 0 0"}}/>
              <p style={{flex: "0 0 0", fontSize: 12, margin: 0}}>GAMMA <span>{gammaDirection}</span></p>
              <p style={{flex: "0 0 0", fontSize: 16, margin: 0}}>{gammaValue.toFixed(4)}</p>
              <div style={{flex: "1 0 0"}}/>
            </div>
          </div>
          <div style={{display: "flex", flex: "1 0 0"}}>
            <div style={{flex: "1 0 0", display: "flex", flexFlow: "column"}}>
              <div style={{flex: "1 0 0"}}/>
              <p style={{flex: "0 0 0", fontSize: 12, margin: 0}}>THETA <span>{thetaDirection}</span></p>
              <p style={{flex: "0 0 0", fontSize: 16, margin: 0}}>{thetaValue.toFixed(4)}</p>
              <div style={{flex: "1 0 0"}}/>
            </div>
            <div style={{flex: "1 0 0", display: "flex", flexFlow: "column"}}>
              <div style={{flex: "1 0 0"}}/>
              <p style={{flex: "0 0 0", fontSize: 12, margin: 0}}>VEGA <span>{vegaDirection}</span></p>
              <p style={{flex: "0 0 0", fontSize: 16, margin: 0}}>{vegaValue.toFixed(4)}</p>
              <div style={{flex: "1 0 0"}}/>
            </div>
          </div>
          <div style={{display: "flex", flex: "1 0 0"}}>
            <div style={{flex: "1 0 0", display: "flex", flexFlow: "column"}}>
              <div style={{flex: "1 0 0"}}/>
              <p style={{flex: "0 0 0", fontSize: 12, margin: 0}}>{"NET " + ((this.props.analytics.builderPaneConfig.strategy != null && this.props.analytics.builderPaneConfig.strategy.markDebitCredit() <= 0) ? "DEBIT" : "CREDIT")}</p>
              <p style={{flex: "0 0 0", fontSize: 16, margin: 0}}>{"$" + (this.props.analytics.builderPaneConfig.strategy != null ? Math.abs(this.props.analytics.builderPaneConfig.strategy.markDebitCredit()).toFixed(2) : "0.00")}</p>
              <div style={{flex: "1 0 0"}}/>
            </div>
            <div style={{flex: "1 0 0", display: "flex", flexFlow: "column"}}>
              <div style={{flex: "1 0 0"}}/>
              <p style={{flex: "0 0 0", fontSize: 12, margin: 0}}>RHO <span>{rhoDirection}</span></p>
              <p style={{flex: "0 0 0", fontSize: 16, margin: 0}}>{rhoValue.toFixed(4)}</p>
              <div style={{flex: "1 0 0"}}/>
            </div>
          </div>
        </div>

      </Paper>
    );
  }
}

/**
 * Create a human-readable description of the greek status of the options strategy.
 *
 * @param {number} value the value to inspect
 * @param {number} tolerance the amount before greek is determined to have a definite direction
 * @returns {string} the human-readable description
 */
function getDirection(value, tolerance) {
  if (value > 0) {
    if (value > tolerance) {
      return "POSITIVE";
    } else {
      return "NEUTRAL-POSITIVE";
    }
  } else if (value < 0) {
    if (value < tolerance * -1) {
      return "NEGATIVE";
    } else {
      return "NEUTRAL-NEGATIVE";
    }
  }
  return "NEUTRAL";
}
