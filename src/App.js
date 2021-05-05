/*-------------------------------- *
* App.js                           *
* -------------------------------- *
* Created by Noah Sadir            *
*         on December 11, 2020     *
*  rewritten April 29, 2021        *
* -------------------------------- */

/*---------------------------------------------------------------------
    *****    *******    *****    *      *   *     *    *****    ******
   *            *      *     *   **     *   *   *     *         ******
   *            *      *     *   * *    *   * *       *          ****
    *****       *      *     *   *  *   *   **         *****     ****
         *      *      *     *   *   *  *   * *             *     **
         *      *      *     *   *    * *   *   *           *
    *****       *       *****    *     **   *     *    *****      **
----------------------------------------------------------------------*/

import './App.css';
import { withStyles } from '@material-ui/core/styles';
import React from "react";

import MainToolbar from "./objects/MainToolbar";
import MainContent from "./objects/MainContent";

import SingleOption from './lib/SingleOption';
import OptionsChain from './lib/OptionsChain';
import JSON_RETRIEVE from './lib/Requests';

const BACKGROUND_COLOR = "#111115";
const ACCENT_COLOR = "#593d99";

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: {
        optionsChain: null,
      },
      preferences: {
        optionType: "calls",
        comparisonType: "date",
        selectedComparisonValue: null,
        availableComparisonValues: null,
        rowConfiguration: ["strike", "volume", "open_interest", "bid"]
      },
      toolbar: {
        title: "Investalyze",
        priceInfo: "by Noah Sadir",
        expandToggled: false,
        chartToggled: false,
        showProgress: false,
      },
      chart: {
        selectedPane: null,
      },
      list: {
        selectedItem: null,
      }
    }
  }

  render() {

    //Configure available comparison values
    if (this.state.data.optionsChain != null) {
      if (this.state.preferences.comparisonType == "date") {
        this.state.preferences.availableComparisonValues = this.state.data.optionsChain.getDates(this.state.preferences.optionType);
      } else if (this.state.preferences.comparisonType == "strike") {
        this.state.preferences.availableComparisonValues = this.state.data.optionsChain.getStrikes(this.state.preferences.optionType);
      }
    }

    //toolbar settings clicked
    const toolbarSettingsButtonClicked = () => {
      console.log("toolbar settings clicked!");
    }

    //toolbar symbol clicked
    const toolbarSymbolEntered = (symbol) => {
      console.log("symbol entered: " + symbol);
      var adjustedSymbol = symbol.trim().toUpperCase();
      var isTest = (adjustedSymbol == "@TEST");

      makeAPIRequest("API_OPTIONS_CHAIN", {symbol: adjustedSymbol}, (id, success, data) => {
        if (success) {
          var optionsChain = new OptionsChain(data);
          setSubState(this, "data", "optionsChain", optionsChain);
        }
      }, isTest);
    }

    //toolbar incremeter selected
    const toolbarStepperClicked = (value) => {
      if (value === "increment"){
        //Create deep copy of row config
        var newRowConfig = this.state.preferences.rowConfiguration.slice();

        //Insert new column right before last column & update state
        newRowConfig.splice(this.state.preferences.rowConfiguration.length - 1, 0, "ask");
        setSubState(this, "preferences", "rowConfiguration", newRowConfig);
      }else if (value === "decrement"){
        //Ensure number of columns is greater than two (otherwise, ignore decrement request)
        if (this.state.preferences.rowConfiguration.length > 2){
          //Create deep copy of row config
          var newRowConfig = this.state.preferences.rowConfiguration.slice();

          //Remove the second to last column & update state
          newRowConfig.splice(this.state.preferences.rowConfiguration.length - 2, 1);
          setSubState(this, "preferences", "rowConfiguration", newRowConfig);
        }
      }
    }

    const optionsListItemClicked = (singleOption) => {
      console.log(singleOption.get("id") + " clicked!");
    }

    return (
      <div style={{display: "flex", flexFlow: "column", height:"100%"}}>
        <MainToolbar
          backgroundColor={BACKGROUND_COLOR}
          accentColor={ACCENT_COLOR}
          chartToggled={this.state.toolbar.chartToggled}
          expandToggled={this.state.toolbar.expandToggled}
          title={this.state.toolbar.title}
          priceInfo={this.state.toolbar.priceInfo}
          showProgress={this.state.toolbar.showProgress}
          preferences={this.state.preferences}
          isBuilder={this.state.chart.selectedPane == "builder"}
          onExpandToggle={(toggled) => setSubState(this, "toolbar", "expandToggled", toggled)}
          onChartToggle={(toggled) => setSubState(this, "toolbar", "chartToggled", toggled)}
          onOptionTypeChange={(type) => setSubState(this, "preferences", "optionType", type)}
          onComparisonTypeChange={(type) => setSubState(this, "preferences", "comparisonType", type)}
          onComparisonValueChange={(value) => setSubState(this, "preferences", "selectedComparisonValue", value)}
          onSettingsButtonClick={toolbarSettingsButtonClicked}
          onSymbolEnter={toolbarSymbolEntered}
          onStepperClick={toolbarStepperClicked}/>
        <MainContent
          backgroundColor={BACKGROUND_COLOR}
          accentColor={ACCENT_COLOR}
          optionsChain={this.state.data.optionsChain}
          preferences={this.state.preferences}
          stickySelected={this.state.list.selectedItem}
          onOptionsListClick={optionsListItemClicked}
          onRowConfigurationChange={(config) => setSubState(this, "preferences", "rowConfiguration", config)}/>
      </div>
    );
  }
}

function makeAPIRequest(jobID, args, callback, testMode) {
  if (testMode){
    callback(jobID,true,require('../api/test/' + jobID + '.json'));
    //Retrieve sample data if API is not available
  }else{
    //Make request to API for JSON
    var urlValue = "";
    var fetchDetails = {};

    //Determine URL to send request to and the data to send with it.
    if (jobID == "API_OPTIONS_CHAIN"){
      urlValue = "../../api/options_chain.php?symbol=" + args.symbol;
    } else {
      callback(jobID, false, {});
    }

    JSON_RETRIEVE(urlValue, (url, success, data) => {
      callback(jobID, success, data);
    });
  }
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
