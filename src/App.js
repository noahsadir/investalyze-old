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
import { convertToMoneyValue, time } from './lib/Formats';
import React from "react";

import MainToolbar from "./components/MainToolbar";
import MainContent from "./components/MainContent";

import SingleOption from './lib/SingleOption';
import OptionsChain from './lib/OptionsChain';
import HistoricalStockData from './lib/HistoricalStockData';

import JSON_RETRIEVE from './lib/Requests';

const BACKGROUND_COLOR = "#111115";
const ACCENT_COLOR = "#593d99";

var apiKeys = require('./keys.json');

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: {
        optionsChain: null,
        underlyingPrice: null,
        underlyingHistorical: null,
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
      setSubState(this, "toolbar", "showProgress", true);
      retrieveDataForSymbol(adjustedSymbol, this.state, isTest, (newState) => {
        this.setState({state: newState});
      });
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

function retrieveDataForSymbol(adjustedSymbol, state, isTest, callback) {
  //Load options chain
  makeAPIRequest("API_OPTIONS_CHAIN", {symbol: adjustedSymbol}, (ocID, ocSuccess, ocData) => {
    //If successful, save returned options chain
    if (ocSuccess) {
      var optionsChain = new OptionsChain(ocData);
      state.data.optionsChain = optionsChain;
    }

    //Regardless of outcome for options chain, get basic data of underlying
    makeAPIRequest("API_STOCK_PRICE", {symbol: adjustedSymbol}, (spID, spSuccess, spData) => {

      //If successful, save data in relevant areas.
      if (spSuccess) {
        state.data.underlyingPrice = spData.price;
        state.toolbar.title = spData.company;
        state.toolbar.priceInfo = convertToMoneyValue(spData.price) + " (" + spData.percent_change + "%)";
      }

      makeAPIRequest("API_STOCK_HISTORICAL", {symbol: adjustedSymbol, avKey: apiKeys.alpha_vantage}, (shID, shSuccess, shData) => {
        if (shSuccess) {
          var historicalStockData = new HistoricalStockData(shData);
          console.log(historicalStockData);
          state.data.underlyingHistorical = historicalStockData;
        }

        //Regardless of outcome, hide progress and initiate callback
        state.toolbar.showProgress = false;
        callback(state);
      }, isTest);
    }, isTest);
  }, isTest);
}

function makeAPIRequest(jobID, args, callback, testMode) {
  if (testMode){
    //Retrieve sample data if API is not available
    callback(jobID,true,require('../api/test/' + jobID + '.json'));
  }else{
    //Make request to API for JSON
    var urlValue = "";
    var fetchDetails = {};

    //Converts API job ID to fetch-able URL
    var urlBindings = {
      API_OPTIONS_CHAIN: ("../../api/options_chain.php?symbol=" + args.symbol),
      API_STOCK_PRICE: ("../../api/stock_price.php?symbol=" + args.symbol),
      API_STOCK_HISTORICAL: ("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=" + args.symbol + "&interval=1y&outputsize=full&apikey=" + args.avKey)
    };

    //Ensure job ID exists, otherwise initiate callback indicating failure.
    if (urlBindings[jobID] != null) {
      urlValue = urlBindings[jobID];
    } else {
      callback(jobID, false, {});
    }

    //Attempt to fetch JSON data from URL and callback with the result
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
