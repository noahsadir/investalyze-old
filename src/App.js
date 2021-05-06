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
import { formatSingleExpirationChain } from './lib/Tradier';
import React from "react";


import MainToolbar from "./components/MainToolbar";
import MainContent from "./components/MainContent";
import DisclaimerDialog from "./components/DisclaimerDialog";
import CookiesDialog from "./components/CookiesDialog";

import SingleOption from './lib/SingleOption';
import OptionsChain from './lib/OptionsChain';
import HistoricalStockData from './lib/HistoricalStockData';

import JSON_RETRIEVE from './lib/Requests';

const BACKGROUND_COLOR = "#111115";
const ACCENT_COLOR = "#593d99";

var apiKeys = require('./keys.json');
var Cookies = require('./lib/Cookies');

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      cookies: {
        "disclaimerAgreement": "Disclaimer Agreement",
        "cookieAcknowledgement": "Cookie Preferences",
        "rowConfiguration": "Options Chain Columns",
        "expandToggled": "Toolbar Configuration",
        "apiKeys": "API Keys"
      },
      dialogs: {
        cookieAcknowledgementVisible: false,
      },
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
        rowConfiguration: Cookies.get("rowConfiguration", ["strike", "volume", "open_interest", "bid"]),
      },
      toolbar: {
        title: "Investalyze",
        priceInfo: "by Noah Sadir",
        expandToggled: Cookies.get("expandToggled", true),
        chartToggled: false,
        showProgress: false,
        progress: 0,
      },
      chart: {
        selectedPane: null,
      },
      list: {
        selectedItem: null,
      }
    }
  }

  componentWillMount() {
    //Automatically agree to all cookies if preference not specified by user
    for (var cookieName in this.state.cookies) {
      if (Cookies.getPref(cookieName) == null) {
        Cookies.setPref(cookieName, true);
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
      retrieveDataForSymbol(adjustedSymbol, this.state, isTest,
        (newState) => {
          this.setState({state: newState});
        },
        (progress) => {
          setSubState(this, "toolbar", "progress", progress);
        }
      );
    }

    //toolbar incremeter selected
    const toolbarStepperClicked = (value) => {
      if (value === "increment"){
        //Create deep copy of row config
        var newRowConfig = this.state.preferences.rowConfiguration.slice();

        //Insert new column right before last column & update state
        newRowConfig.splice(this.state.preferences.rowConfiguration.length - 1, 0, "ask");
        Cookies.set("rowConfiguration", newRowConfig);
        setSubState(this, "preferences", "rowConfiguration", newRowConfig);
      }else if (value === "decrement"){
        //Ensure number of columns is greater than two (otherwise, ignore decrement request)
        if (this.state.preferences.rowConfiguration.length > 2){
          //Create deep copy of row config
          var newRowConfig = this.state.preferences.rowConfiguration.slice();

          //Remove the second to last column & update state
          newRowConfig.splice(this.state.preferences.rowConfiguration.length - 2, 1);
          Cookies.set("rowConfiguration", newRowConfig);
          setSubState(this, "preferences", "rowConfiguration", newRowConfig);
        }
      }
    }

    //User clicked agree on disclaimer dialog
    const disclaimerDialogAction = (didAgree) => {
      if (didAgree) {
        //Save acknowledgements so that dialogs won't pop up every state/page refresh
        Cookies.set("disclaimerAgreement", true);
        Cookies.set("cookieAcknowledgement", true);
        setSubState(this, "dialogs", "cookieAcknowledgementVisible", true);
      }
    }

    const cookieDialogAction = (didAgree) => {
      if (didAgree) {
        setSubState(this, "dialogs", "cookieAcknowledgementVisible", false);
      }
    }

    //Preference toggled for a particular cookie
    const cookieToggleAction = (cookieName, cookiePref) => {
      Cookies.setPref(cookieName, cookiePref);
      this.setState({state: this.state});
    }
    
    const optionsListItemClicked = (singleOption) => {
      console.log(singleOption.get("id") + " clicked!");
    }

    return (
      <div style={{display: "flex", flexFlow: "column", height:"100%"}}>
        <MainToolbar
          backgroundColor={BACKGROUND_COLOR}
          accentColor={ACCENT_COLOR}
          optionsChain={this.state.data.optionsChain}
          chartToggled={this.state.toolbar.chartToggled}
          expandToggled={this.state.toolbar.expandToggled}
          title={this.state.toolbar.title}
          priceInfo={this.state.toolbar.priceInfo}
          showProgress={this.state.toolbar.showProgress}
          progress={this.state.toolbar.progress}
          preferences={this.state.preferences}
          isBuilder={this.state.chart.selectedPane == "builder"}
          onExpandToggle={(toggled) => {Cookies.set("expandToggled", toggled); setSubState(this, "toolbar", "expandToggled", toggled)}}
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
          chartToggled={this.state.toolbar.chartToggled}
          stickySelected={this.state.list.selectedItem}
          onOptionsListClick={optionsListItemClicked}
          onRowConfigurationChange={(config) => setSubState(this, "preferences", "rowConfiguration", config)}/>
        <div style={{flex: "0 0 auto"}}></div>
        <DisclaimerDialog open={Cookies.get("disclaimerAgreement", false) != true} accentColor={ACCENT_COLOR} onAction={disclaimerDialogAction}/>
        <CookiesDialog
          open={this.state.dialogs.cookieAcknowledgementVisible}
          accentColor={ACCENT_COLOR}
          cookiePrefs={Cookies.raw().preferences}
          cookieItems={this.state.cookies}
          onAction={cookieDialogAction}
          onCookieToggle={cookieToggleAction}/>
      </div>
    );
  }
}

/**
 * Retrieve all the data needed for analysis.
 *
 * @param adjustedSymbol the cleaned-up symbol specified by the user
 * @param state the app's state
 * @param isTest boolean indicating whether test mode is activated
 * @param callback the function to call when all data has been loaded.
 *                 Should accept single parameter representing updated app state.
 */
function retrieveDataForSymbol(adjustedSymbol, state, isTest, callback, progressCallback) {
  //Load options chain
  retrieveOptionsChain(adjustedSymbol, isTest, (ocSuccess, ocData) => {
    //If successful, save returned options chain
    if (ocSuccess) {
      var optionsChain = new OptionsChain(ocData);
      state.data.optionsChain = optionsChain;
    }

    //Regardless of outcome for options chain, get basic data of underlying
    makeAPIRequest("API_TRADIER_QUOTE", {symbol: adjustedSymbol, tradierKey: apiKeys.tradier}, (spID, spSuccess, spData) => {

      //If successful, save data in relevant areas.
      if (spSuccess && spData.quotes != null && spData.quotes.quote != null) {
        state.data.underlyingPrice = spData.quotes.quote.last;
        state.toolbar.title = spData.quotes.quote.description + " (" + spData.quotes.quote.symbol + ")";
        state.toolbar.priceInfo = convertToMoneyValue(spData.quotes.quote.last) + " (" + spData.quotes.quote.change + "%)";
      }

      makeAPIRequest("API_STOCK_HISTORICAL", {symbol: adjustedSymbol, avKey: apiKeys.alpha_vantage}, (shID, shSuccess, shData) => {
        if (shSuccess) {
          var historicalStockData = new HistoricalStockData(shData);
          state.data.underlyingHistorical = historicalStockData;
        }

        //Regardless of outcome, hide progress and initiate callback
        state.toolbar.showProgress = false;
        callback(state);
      }, isTest);
    }, isTest);
  }, progressCallback);
}

/**
 * Retrieve options chain using Tradier API.
 *
 * @param adjustedSymbol the cleaned-up symbol specified by the user
 * @param isTest boolean indicating whether test mode is activated
 * @param callback the function to call when options chain has loaded.
 *                 Should accept two parameters:
 *                 1) A boolean indicating whether the operation was successful.
 *                 2) A JSON object representing the options chain JSON.
 */
function retrieveOptionsChain(adjustedSymbol, isTest, callback, progressCallback) {
  makeAPIRequest("API_TRADIER_EXPIRATIONS", {symbol: adjustedSymbol, tradierKey: apiKeys.tradier}, (teID, teSuccess, teData) => {
    if (teSuccess) {
      var expirations = [];
      var chainData = {};

      //If returned data is valid, make an array of all the expirations
      if (teData.expirations != null && teData.expirations.expiration != null) {
        for (var index in teData.expirations.expiration) {
          expirations.push(teData.expirations.expiration[index].date);
        }
      }

      var callsToMake = expirations.length;
      var callsMade = 0;

      //Tentatively indicate that all chains are fetched, unless there are none
      var couldFetchAllChains = (expirations.length > 0) ? true : false;

      if (isTest) {
        //API doesn't actually exist, but bypasses recursive request system in production
        makeAPIRequest("API_TRADIER_CHAIN_FULL", {}, (tcfID, tcfSuccess, tcfData) => {
          if (tcfData) {
            callback(true, tcfData);
          }
        }, true);
      } else {
        recursiveTradierChainRequest(chainData, adjustedSymbol, isTest, expirations, 0, (data) => {
          console.log(data);
          callback(couldFetchAllChains, data);
        }, progressCallback);
      }


    } else {
      callback(false, {});
    }
  }, isTest);
}

/**
 * Synchronously load Tradier options chains for each expiration specified by {@code expirations}.
 * If {@code expIndex} is the last one in {@code expirations}, {@code callback} will be initiated.
 * Otherwise, the function will call itself but increment {@code expIndex} by 1
 * until last index of {@code expirations} is reached (base case).
 *
 * @param data the currently loaded state of the options chain
 * @param adjustedSymbol the cleaned-up symbol specified by the user
 * @param isTest indicates whether test mode is activated
 * @param expirations the array of expirations
 * @param expIndex the index of the {@code expirations} array to load.
 * @param callback the function to call when data for all expirations has loaded.
 *                 Should accept single parameter for options chain JSON.
 */
function recursiveTradierChainRequest(data, adjustedSymbol, isTest, expirations, expIndex, callback, progressCallback) {
  var chainData = data;
  makeAPIRequest("API_TRADIER_CHAIN", {symbol: adjustedSymbol, expiration: expirations[expIndex], tradierKey: apiKeys.tradier}, (tcID, tcSuccess, tcData) => {
    //If request was successful, convert the data into a processable format and save to chainData
    if (tcSuccess) {
      var dateMillis = parseInt(Date.parse(expirations[expIndex]) / 1000).toString();
      var singleExpData = formatSingleExpirationChain(tcData);
      if (chainData[dateMillis] == null) {
        chainData[dateMillis] = singleExpData;
      }
    }

    //Increment calls made until all of them have been made, then initiate the callback with the data
    if (expIndex < expirations.length - 1) {
      progressCallback(((expIndex + 1) / expirations.length) * 100);
      recursiveTradierChainRequest(chainData, adjustedSymbol, isTest, expirations, expIndex + 1, callback, progressCallback);
    } else {
      callback(chainData);
    }
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
      API_TRADIER_EXPIRATIONS: ("../../api/tradier_expirations.php?symbol=" + args.symbol + "&apikey=" + args.tradierKey),
      API_TRADIER_CHAIN: ("../../api/tradier_chain.php?symbol=" + args.symbol + "&expiration=" + args.expiration + "&apikey=" + args.tradierKey),
      API_TRADIER_QUOTE: ("../../api/tradier_quote.php?symbol=" + args.symbol + "&apikey=" + args.tradierKey),
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
