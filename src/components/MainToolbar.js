import '../App.css';
import React from "react";
import { withStyles } from '@material-ui/core/styles';
import { convertToMoneyValue, time } from '../lib/Formats';

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
  border: '1px solid rgba(255, 255, 255, 0.12)',
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
    borderColor: '#80bdff',
    boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
  },
},
}))(InputBase);

/**
 * Main toolbar for Investalyze.
 *
 * @param title the title for the toolbar
 * @param priceInfo the subtitle containing price information
 * @param expandToggled a boolean indicating whether the toolbar should expand
 * @param chartToggled a boolean indicating whether the chart view is currently toggled
 * @param preferences an object representing the current state of filter preferences
 * @param isBuilder a boolean representing whether or not builder mode is activated
 * @param open a boolean indicating whether this object should be visible or not
 * @param backgroundColor the background color
 * @param accentColor the accent color
 * @param showProgress a boolean indicating whether the progress indicator should be shown
 *
 * @param onExpandToggle a function which accepts a boolean that is called when the expand toggle button is selected
 * @param onChartToggle a funciton which accepts a boolean that is called when the chart toggle button is selected
 * @param onSettingsButtonClick a function that is called when the settings button is clicked
 * @param onSymbolEnter a function that is called when a new symbol is entered
 * @param onOptionTypeChange a function which accepts a string that is activated when option type changes; the string returned is either "calls" or "puts"
 * @param onStepperChange a function which accepts a string that is activated when the stepper is clicked; the string returned is either "increment" or "decrement"
 * @param onComparisonTypeChange a function which accepts a string that is activated when comparison type changes; the string returned is either "date" or "strike"
 * @param onComparisonValueChange a function which accepts a number that is activated when the comparison value changes; the number returned is the comparison value
 */
export default class MainToolbar extends React.Component {

  constructor(props) {
    super(props);
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

    //Call parent function for symbol handler if one exists
    const handleKeyPress = (event) => {
      if(event.key === 'Enter' && this.props.onSymbolEnter != null){
        event.target.value = event.target.value.trim().toUpperCase();
        this.props.onSymbolEnter(event.target.value);
      }
    }

    return (
      <AppBar style={{backgroundColor: this.props.backgroundColor}} class="topToolbar" position="fixed">
        <div id="header_container" style={{float:"left",height:64}}>
          <p id="investalyze_title" style={{fontWeight:600,textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{this.props.title}</p>
          <p id="name_label" tyle={{textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{this.props.priceInfo}</p>
        </div>
        <div id="searchbox_container" style={{display:"flex"}}>
          <IconButton onClick={handleExpandButtonClick} id="settings_button" aria-label="settings">
            <Icon style={{fontSize: 24}}>{this.props.expandToggled ? "expand_less" : "expand_more"}</Icon>
          </IconButton>
          <IconButton onClick={handleSettingsButtonClick} id="chart_button" aria-label="settings">
            <Icon style={{fontSize: 24}}>tune</Icon>
          </IconButton>
          <IconButton style={{color: (this.props.chartToggled ? this.props.accentColor : "#FFFFFF")}} onClick={handleChartButtonClick} id="chart_button" aria-label="chart">
            <Icon style={{fontSize: 24}}>leaderboard</Icon>
          </IconButton>
          <input class="searchbox" onKeyDown={handleKeyPress}></input>
        </div>
        <ExpandedConfiguration
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
      </AppBar>
    );
  }
}

/**
 * Handles specific configs to filter options data.
 *
 * @param preferences an object representing the current state of filter preferences
 * @param isBuilder a boolean representing whether or not builder mode is activated
 * @param open a boolean indicating whether this object should be visible or not
 * @param backgroundColor the background color
 * @param accentColor the accent color
 *
 * @param onOptionTypeChange a function which accepts a string that is activated when option type changes; the string returned is either "calls" or "puts"
 * @param onStepperChange a function which accepts a string that is activated when the stepper is clicked; the string returned is either "increment" or "decrement"
 * @param onComparisonTypeChange a function which accepts a string that is activated when comparison type changes; the string returned is either "date" or "strike"
 * @param onComparisonValueChange a function which accepts a number that is activated when the comparison value changes; the number returned is the comparison value
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

    return (
      <Paper class="mainListToolbarPadding" style={{backgroundColor: this.props.isBuilder ? this.props.accentColor : this.props.backgroundColor, display: (this.props.open ? "block" : "none")}} >
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
