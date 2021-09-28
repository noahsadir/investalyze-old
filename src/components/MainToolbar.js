import '../App.css';
import React from "react";
import { withStyles } from '@material-ui/core/styles';
import { convertToMoneyValue, time } from '../libraries/Formats';

import {
  AppBar,
  Icon,
  IconButton,
  Paper,
  InputBase,
  Select,
  MenuItem,
  CircularProgress
} from "@material-ui/core/";

import SettingsDialog from "./SettingsDialog";

import {
  ToggleButton,
  ToggleButtonGroup
} from "@material-ui/lab/";

const StyledToggleButtonGroup = withStyles((theme) => ({
  root: {
    width: "calc(50% - 4px)",
  },
  grouped: {
    width: "50%",
  },
}))(ToggleButtonGroup);

const StyledStepperToggle = withStyles((theme) => ({
  root: {
    width: "128px",
    float: "right",
  },
  grouped: {
    width: "100%",
    height: 48,
  },
}))(ToggleButtonGroup);

/**
 * Responsible for handling search queries and filtering data.
 */
export default class MainToolbar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      settingsDialogVisible: false,
    }
  }

  render() {

    //Expand button handler
    const handleExpandButtonClick = () => {
      if (this.props.expandToggled) {
        this.props.onExpandToggle(false);
      } else {
        this.props.onExpandToggle(true);
      }
    }

    //Call parent function for settings button handler if one exists
    const handleSettingsButtonClick = () => {
      if (this.props.onSettingsButtonClick != null) {
        this.props.onSettingsButtonClick();
      }
      this.setState({settingsDialogVisible: true});
    }

    //Call parent function for chart toggle handler if one exists
    const handleChartButtonClick = () => {
      if (this.props.onChartToggle != null) {
        if (this.props.chartToggled) {
          this.props.onChartToggle(false);
        } else {
          this.props.onChartToggle(true);
        }
      }
    }

    const settingsDialogClose = () => {
      this.setState({settingsDialogVisible: false});
      //setSubState(this, "dialogs", "settingsDialogVisible", false);
    }

    const settingsStateChanged = (newState) => {
      if (this.props.onSettingsChange != null) {
        this.props.onSettingsChange(newState);
      }
    }

    //Call parent function for symbol handler if one exists
    const handleKeyPress = (event) => {
      if(event.key === 'Enter' && this.props.onSymbolEnter != null){
        event.target.value = event.target.value.trim().toUpperCase();
        this.props.onSymbolEnter(event.target.value);
        event.target.blur();
      }
    }

    return (
      <AppBar style={{backgroundColor: this.props.theme.foregroundColor}} class="topToolbar" position="fixed">
        <div id="header_container" style={{float:"left",height:64}}>
          <p id="investalyze_title" style={{fontWeight:600,textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{this.props.title}</p>
          <p id="name_label" tyle={{textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{this.props.priceInfo}</p>
        </div>
        <div id="searchbox_container" style={{display:"flex"}}>
          <IconButton style={{color: this.props.theme.textColor}} onClick={handleExpandButtonClick} id="settings_button" aria-label="settings">
            <Icon style={{fontSize: 24}}>{this.props.expandToggled ? "expand_less" : "expand_more"}</Icon>
          </IconButton>
          <IconButton style={{color: this.props.theme.textColor}} onClick={handleSettingsButtonClick} id="settings_button" aria-label="settings">
            <Icon style={{fontSize: 24}}>tune</Icon>
          </IconButton>
          <IconButton style={{color: (this.props.chartToggled ? this.props.theme.accentColor : this.props.theme.textColor)}} onClick={handleChartButtonClick} id="chart_button" aria-label="chart">
            <Icon style={{fontSize: 24}}>leaderboard</Icon>
          </IconButton>
          <input class="searchbox" style={{backgroundColor: this.props.theme.altForegroundColor, color: this.props.theme.textColor}} onKeyDown={handleKeyPress}></input>
        </div>
        <ExpandedConfiguration
          theme={this.props.theme}
          optionsChain={this.props.optionsChain}
          onOptionTypeChange={this.props.onOptionTypeChange}
          onStepperClick={this.props.onStepperClick}
          onComparisonTypeChange={this.props.onComparisonTypeChange}
          onComparisonValueChange={this.props.onComparisonValueChange}
          preferences={this.props.preferences}
          isBuilder={this.props.isBuilder}
          open={this.props.expandToggled}
          backgroundColor={this.props.backgroundColor}
          accentColor={this.props.accentColor}/>
        <CircularProgress style={{display: (this.props.showProgress ? "block" : "none")}} variant="determinate" value={this.props.progress} class="progressCircle" color="accent"/>
        <SettingsDialog
          onDarkModeToggle={this.props.onDarkModeToggle}
          onCookieSettingsClick={this.props.onCookieSettingsClick}
          onDownloadDataButtonClick={this.props.onDownloadDataButtonClick}
          onAPIKeyChange={this.props.onAPIKeyChange}
          apiKeys={this.props.apiKeys}
          open={this.state.settingsDialogVisible}
          theme={this.props.theme}
          onClose={settingsDialogClose}/>
      </AppBar>
    );
  }
}

/**
 * Contains filters for options chain
 */
class ExpandedConfiguration extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    //console.log(this.props.preferences.availableComparisonValues);

    var comparisonValueMenuItems = [];

    //Make sure selected value exists, otherwise default to first item (if possible)
    if (this.props.preferences.availableComparisonValues != null && this.props.preferences.availableComparisonValues.length > 0) {
      if (!this.props.preferences.availableComparisonValues.includes(this.props.preferences.selectedComparisonValue)) {
        this.props.onComparisonValueChange(this.props.preferences.availableComparisonValues[0]);
      }
    }

    for (var index in this.props.preferences.availableComparisonValues) {
      var comparisonValue = this.props.preferences.availableComparisonValues[index];
      var formattedValue = comparisonValue;

      if (this.props.preferences.comparisonType == "date") {
        formattedValue = time(comparisonValue) + " (" + this.props.optionsChain.forDate(comparisonValue, this.props.preferences.optionType).length + ")"; //from Formats import
      } else if (this.props.preferences.comparisonType == "strike") {
        formattedValue = "$" + comparisonValue + " (" + this.props.optionsChain.forStrike(comparisonValue, this.props.preferences.optionType).length + ")"; //from Formats import
      }

      comparisonValueMenuItems.push(<MenuItem key={comparisonValue} value={comparisonValue}>{formattedValue}</MenuItem>);
    }

    const handleOptionTypeToggleChange = (event, newAlignment) => {
      if (newAlignment != null && this.props.onOptionTypeChange != null){
        this.props.onOptionTypeChange(newAlignment);
      }
    }

    const handleComparisonTypeToggleChange = (event, newAlignment) => {
      if (newAlignment != null && this.props.onComparisonTypeChange != null){
        this.props.onComparisonTypeChange(newAlignment);
      }
    }

    const handleStepperToggleChange = (event, newAlignment) => {
      if (this.props.onStepperClick != null) {
        this.props.onStepperClick(newAlignment);
      }
    }

    const handleComparisonChange = (event) => {
      if (this.props.onComparisonValueChange != null) {
        this.props.onComparisonValueChange(event.target.value);
      }
    };

    const StyledInputBase = withStyles((theme) => ({
      root: {
        width: "calc(100% - 136px)",
      'label + &': {
        marginTop: theme.spacing(3),
      },
    },
    input: {
      borderRadius: 4,
      position: 'relative',
      border: '1px solid ' + this.props.theme.borderColor,
      fontSize: 16,
      height: 20,
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
        borderColor: this.props.theme.borderColor,
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
      },
    },
    }))(InputBase);

    return (
      <Paper class="mainListToolbarPadding" style={{margin: "0px 8px 8px 8px", padding: 8, backgroundColor: this.props.isBuilder ? this.props.theme.accentColor : this.props.theme.foregroundColor, display: (this.props.open ? "block" : "none")}} >
        <div id="toggleContainer">
          <StyledToggleButtonGroup value={this.props.preferences.optionType} exclusive onChange={handleOptionTypeToggleChange}  aria-label="text alignment">
            <ToggleButton value="calls" aria-label="left aligned">Calls</ToggleButton>
            <ToggleButton value="puts" aria-label="right aligned">Puts</ToggleButton>
          </StyledToggleButtonGroup>
          <div class="toggleSeparator"></div>
          <StyledToggleButtonGroup value={this.props.preferences.comparisonType} exclusive onChange={handleComparisonTypeToggleChange} aria-label="text alignment">
            <ToggleButton value="date" aria-label="left aligned">Date</ToggleButton>
            <ToggleButton value="strike" aria-label="right aligned">Strike</ToggleButton>
          </StyledToggleButtonGroup>
        </div>
        <div id="topRowSeparator" class="toggleSeparator"></div>
        <div id="dropdownContainer">
          <Select
            labelId="demo-simple-select-outlined-label"
            id="demo-simple-select-outlined"
            value={this.props.preferences.selectedComparisonValue} //Setting it to a global variable ensures selected params match data presented
            variant='outlined'
            onChange={handleComparisonChange}
            label="Comparison Type"
            input={<StyledInputBase/>}>
            {comparisonValueMenuItems}
          </Select>
          <div class="toggleSeparator"></div>
          <StyledStepperToggle exclusive onChange={handleStepperToggleChange} aria-label="text alignment">
            <ToggleButton value="decrement" aria-label="left aligned">
              <Icon style={{fontSize: 18}}>remove</Icon>
            </ToggleButton>
            <ToggleButton value="increment" aria-label="right aligned">
              <Icon style={{fontSize: 18}}>add</Icon>
            </ToggleButton>
          </StyledStepperToggle>
        </div>
      </Paper>
    );
  }
}
