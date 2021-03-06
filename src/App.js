/*-------------------------------- *
* App.js                           *
* -------------------------------- *
* Created by Noah Sadir            *
*         on December 11, 2020     *
*  rewritten April 29, 2021        *
* -------------------------------- */

/*
   _________ __________   ________    ____    __   __   __    _________   ____
  /  ______/ \__    __/  /  ___   \  /    \  |  \ |  | /  /  /  ______/  \    /
 |  |______     |  |    |  |   |  | |  |\  \ |  | |  |/  /  |  |______    \  /
 \______   \    |  |    |  |   |  | |  | \  \|  | |     |   \______   \    \/
  ______|  |    |  |    |  |___|  | |  |  \  |  | |  |\  \   ______|  |    __
 \________/     |__|    \________/  \__/   \___/  \__| \__\ \________/    |__|
*/

import './App.css';
import { ThemeProvider, withStyles, createMuiTheme } from '@material-ui/core/styles';
import { convertToMoneyValue, time } from './libraries/Formats';
import { formatSingleExpirationChain } from './libraries/Tradier';
import 'fontsource-open-sans';
import 'fontsource-open-sans/600.css';
import 'fontsource-open-sans/300.css';
import CssBaseline from '@material-ui/core/CssBaseline';
import React from "react";
import {
  Snackbar
} from '@material-ui/core';
import {
  Alert
} from '@material-ui/lab';


import MainToolbar from "./components/MainToolbar";
import MainContent from "./components/MainContent";
import DisclaimerDialog from "./components/DisclaimerDialog";
import CookiesDialog from "./components/CookiesDialog";
import SettingsDialog from "./components/SettingsDialog";
import StrategyDialog from "./components/StrategyDialog";
import DownloadDataDialog from "./components/DownloadDataDialog";

import SingleOption from './objects/SingleOption';
import OptionsChain from './objects/OptionsChain';
import OptionsStrategy from './objects/OptionsStrategy';
import HistoricalStockData from './objects/HistoricalStockData';

import JSON_RETRIEVE from './libraries/Requests';
var Cookies = require('./libraries/Cookies');

const BACKGROUND_COLOR = "#111115";
const ACCENT_COLOR = "#593d99";

var apiKeys = Cookies.get("apiKeys", {"tradier": ""});

var internalAPIUrl = "https://investalyze.noahsadir.io/api/";

/**
 * Main entry point of application.
 */
export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      theme: Cookies.get("theme", {
        darkMode: true,
        backgroundColor: "#000004",
        foregroundColor: "#111115",
        altForegroundColor: "#222226",
        elevationColor: "#222226",
        borderColor: "#ffffff22",
        accentColor: "#593d99",
        textColor: "#ffffff",
      }),
      cookies: {
        disclaimerAgreement: "Disclaimer Agreement",
        cookieAcknowledgement: "Cookie Preferences",
        rowConfiguration: "Options Chain Columns",
        expandToggled: "Toolbar Configuration",
        apiKeys: "API Keys",
        theme: "Theme",
      },
      apiKeys: Cookies.get("apiKeys", {"tradier": ""}),
      dialogs: {
        cookieAcknowledgementVisible: false,
        settingsDialogVisible: false,
        strategyDialogVisible: false,
        downloadDataDialogVisible: false,
        mainSnackbarVisible: false,
        mainSnackbarSeverity: "error",
        mainSnackbarMessage: "An error has occurred",
      },
      data: {
        optionsChain: null,
        underlyingPrice: null,
        underlyingHistorical: null,
        companyQuote: null,
        strategy: null,
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
      analytics: {
        selectedPane: "data",
        dataPaneConfig: {
          metric_1: "mark",
          metric_2: null,
          metric_3: null,
          display: "chart",
          chartType: "bar",
          showBothTypes: "selected_only",
        },
        projectionPaneConfig: {
          chartType: "chart",
          dataType: "implied_move_local",
        },
        builderPaneConfig: {
          strategy: new OptionsStrategy(),
          viewType: "config",
        }
      },
      list: {
        selectedItem: [],
      }
    }
  }

  componentWillMount() {
    //Automatically agree to all cookies if preference not specified by user
    for (var cookieName in this.state.cookies) {
      if (Cookies.getPref(cookieName) == null) {
        Cookies.setPref(cookieName, true);
        //setSubState(this, "dialogs", "cookieAcknowledgementVisible", true);
      }
    }
  }

  render() {

    apiKeys = this.state.apiKeys;

    const theme = createMuiTheme({
      typography: {
        fontFamily: "Open Sans, sans-serif",
        fontWeight: 600,
      },
      palette: {
        type: (this.state.theme.darkMode ? "dark" : "light"),
        background: {
          default: "#000004",
        },
        primary: {
          light: "#111115",
          main: "#111115",
          dark: "#111115",
        },
        secondary: {
          light: "#7953d2",
          dark: "#7953d2",
          main: "#7953d2"
        }
      }
    });

    //Configure available comparison values
    if (this.state.data.optionsChain != null) {
      if (this.state.preferences.comparisonType == "date") {
        this.state.preferences.availableComparisonValues = this.state.data.optionsChain.getDates(this.state.preferences.optionType);
      } else if (this.state.preferences.comparisonType == "strike") {
        this.state.preferences.availableComparisonValues = this.state.data.optionsChain.getStrikes(this.state.preferences.optionType);
      }
    }

    //Update list of selected option items
    this.state.list.selectedItem = [];
    for (var index in this.state.analytics.builderPaneConfig.strategy.singleOptions) {
      this.state.list.selectedItem.push(this.state.analytics.builderPaneConfig.strategy.singleOptions[index].option.get("id"));
    }

    //toolbar settings clicked
    const toolbarSettingsButtonClicked = () => {
      //setSubState(this, "dialogs", "settingsDialogVisible", true);
    }

    const settingsDialogClose = () => {
      //setSubState(this, "dialogs", "settingsDialogVisible", false);
    }

    const settingsStateChanged = (newState) => {
      //this.setState({state: newState});
    }

    const darkModeToggled = (toggled) => {
      var newTheme = this.state.theme;
      newTheme.darkMode = toggled;

      if (newTheme.darkMode == false) {
        newTheme.backgroundColor = "#ffffff";
        newTheme.foregroundColor = "#e0e0e6";
        newTheme.altForegroundColor = "#ccccd6";
        newTheme.elevationColor = "#e0e0e6";
        newTheme.borderColor = "#00000033";
        newTheme.accentColor = "#c7a4ff";
        newTheme.textColor = "#000000";
      } else {
        newTheme.backgroundColor = "#000004";
        newTheme.foregroundColor = "#111115";
        newTheme.altForegroundColor = "#222226";
        newTheme.elevationColor = "#222226";
        newTheme.borderColor = "#ffffff33";
        newTheme.accentColor = "#593d99";
        newTheme.textColor = "#ffffff";
      }

      Cookies.set("theme", newTheme);
      setSubState(this, "theme", "darkMode", toggled)
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
        },
        (errorID) => {
          var newDialogsState = this.state.dialogs;
          if (errorID == "ERR_OPTIONS_DATA_FETCH") {
            newDialogsState.mainSnackbarSeverity = "error";
            newDialogsState.mainSnackbarMessage = "Error fetching data. Please check your connection and/or API Key.";
          } else if (errorID == "ERR_HISTORICAL_FETCH") {
            newDialogsState.mainSnackbarSeverity = "warning";
            newDialogsState.mainSnackbarMessage = "Unable to fetch historical data.";
          } else {
            newDialogsState.mainSnackbarSeverity = "error";
            newDialogsState.mainSnackbarMessage = "An unknown error occurred";
          }
          newDialogsState.mainSnackbarVisible = true;

          this.setState({dialogs: newDialogsState});
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

    const handleMainSnackbarClose = (event, reason) => {
      setSubState(this, "dialogs", "mainSnackbarVisible", false);
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

    //Close cookies dialog
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
      if (this.state.analytics.selectedPane == "builder") {
        var optionsStrategy = new OptionsStrategy();
        if (this.state.analytics.builderPaneConfig.strategy != null) {
          optionsStrategy = this.state.analytics.builderPaneConfig.strategy;
        }

        if (optionsStrategy.indexOf(singleOption) == null) {
          optionsStrategy.add(singleOption, 1);
        } else {
          optionsStrategy.remove(singleOption);
        }

        this.state.analytics.builderPaneConfig.strategy = optionsStrategy;

        this.setState({state: this.state});
      } else {
        var optionsStrategy = new OptionsStrategy();
        optionsStrategy.add(singleOption, 1);
        viewStrategyButtonClicked(optionsStrategy);
      }

    }

    const viewStrategyButtonClicked = (strategy) => {
      setSubState(this, "data", "strategy", strategy);
      setSubState(this, "dialogs", "strategyDialogVisible", true);
    }

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
      <div style={{display: "flex", flexFlow: "column", height:"100%", backgroundColor: this.state.theme.backgroundColor, color: this.state.theme.textColor}}>

          <MainToolbar
            theme={this.state.theme}
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
            apiKeys={this.state.apiKeys}
            isBuilder={this.state.analytics.selectedPane == "builder"}
            onCookieSettingsClick={() => setSubState(this, "dialogs", "cookieAcknowledgementVisible", true)}
            onDownloadDataButtonClick={() => setSubState(this, "dialogs", "downloadDataDialogVisible", true)}
            onDarkModeToggle={darkModeToggled}
            onExpandToggle={(toggled) => {Cookies.set("expandToggled", toggled); setSubState(this, "toolbar", "expandToggled", toggled)}}
            onAPIKeyChange={(keys) => {Cookies.set("apiKeys", keys); this.setState({apiKeys: keys})}}
            onChartToggle={(toggled) => setSubState(this, "toolbar", "chartToggled", toggled)}
            onOptionTypeChange={(type) => setSubState(this, "preferences", "optionType", type)}
            onComparisonTypeChange={(type) => setSubState(this, "preferences", "comparisonType", type)}
            onComparisonValueChange={(value) => setSubState(this, "preferences", "selectedComparisonValue", value)}
            onSettingsButtonClick={toolbarSettingsButtonClicked}
            onSymbolEnter={toolbarSymbolEntered}
            onStepperClick={toolbarStepperClicked}/>
          <MainContent
            theme={this.state.theme}
            backgroundColor={this.state.theme.backgroundColor}
            accentColor={this.state.theme.accentColor}
            analytics={this.state.analytics}
            optionsChain={this.state.data.optionsChain}
            underlyingHistorical={this.state.data.underlyingHistorical}
            preferences={this.state.preferences}
            chartToggled={this.state.toolbar.chartToggled}
            stickySelected={this.state.list.selectedItem}
            underlyingPrice={this.state.data.underlyingPrice}
            onOptionsListClick={optionsListItemClicked}
            onViewStrategyButtonClick={viewStrategyButtonClicked}
            onAnalyticsPaneChange={(pane) => setSubState(this, "analytics", "selectedPane", pane)}
            onDataAnalyticsConfigChange={(config) => setSubState(this, "analytics", "dataPaneConfig", config)}
            onProjectionAnalyticsConfigChange={(config) => setSubState(this, "analytics", "projectionPaneConfig", config)}
            onBuilderAnalyticsConfigChange={(config) => setSubState(this, "analytics", "builderPaneConfig", config)}
            onRowConfigurationChange={(config) => {Cookies.set("rowConfiguration", config);setSubState(this, "preferences", "rowConfiguration", config)}}/>
          <div style={{flex: "0 0 auto"}}></div>
          <DisclaimerDialog
            open={Cookies.get("disclaimerAgreement", false) != true}
            accentColor={ACCENT_COLOR}
            onAction={disclaimerDialogAction}/>
          <CookiesDialog
            open={this.state.dialogs.cookieAcknowledgementVisible}
            accentColor={ACCENT_COLOR}
            cookiePrefs={Cookies.raw().preferences}
            cookieItems={this.state.cookies}
            onAction={cookieDialogAction}
            onCookieToggle={cookieToggleAction}/>
          <StrategyDialog
            currentTime={(new Date()).getTime()}
            open={this.state.dialogs.strategyDialogVisible}
            theme={this.state.theme}
            apiKeys={this.state.apiKeys}
            underlyingPrice={this.state.data.underlyingPrice}
            underlyingHistorical={this.state.data.underlyingHistorical}
            optionsChain={this.state.data.optionsChain}
            strategy={this.state.data.strategy}
            onClose={() => setSubState(this, "dialogs", "strategyDialogVisible", false)}/>
          <DownloadDataDialog
            open={this.state.dialogs.downloadDataDialogVisible}
            theme={this.state.theme}
            data={this.state.data}
            onClose={() => setSubState(this, "dialogs", "downloadDataDialogVisible", false)}/>
            <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={this.state.dialogs.mainSnackbarVisible} autoHideDuration={6000} onClose={handleMainSnackbarClose}>
              <Alert onClose={handleMainSnackbarClose} severity={this.state.dialogs.mainSnackbarSeverity} sx={{ width: '100%' }}>
                {this.state.dialogs.mainSnackbarMessage}
              </Alert>
            </Snackbar>
      </div>
      </ThemeProvider>

    );
  }
}

/**
 * Retrieve all the data needed for analysis.
 *
 * @param {string} adjustedSymbol the cleaned-up symbol specified by the user
 * @param {Object} state the app's state
 * @param {boolean} isTest boolean indicating whether test mode is activated
 * @param {function} callback the function to call when all data has been loaded.
 *                            Should accept single parameter (Object) representing updated app state.
 * @param {function} progressCallback the function to call when there is an update to the progress of the request.
 *                                    Accepts a single parameter (number) representing the percentage loaded.
 * @param {function} errorCallback the function to call when there is an error making the request.
 *                                 Accepts a single parameter (string) representing the error ID.
 */
function retrieveDataForSymbol(adjustedSymbol, state, isTest, callback, progressCallback, errorCallback) {

  //Regardless of outcome for options chain, get basic data of underlying
  makeAPIRequest("API_TRADIER_QUOTE", {symbol: adjustedSymbol, tradierKey: apiKeys.tradier}, (spID, spSuccess, spData) => {

    //If successful, save data in relevant areas.
    if (spSuccess && spData.quotes != null && spData.quotes.quote != null) {
      state.data.companyQuote = spData;
      state.data.underlyingPrice = spData.quotes.quote.last;
      state.toolbar.title = spData.quotes.quote.description + " (" + spData.quotes.quote.symbol + ")";
      state.toolbar.priceInfo = convertToMoneyValue(spData.quotes.quote.last) + " (" + (spData.quotes.quote.change_percentage > 0 ? "+" : "") + spData.quotes.quote.change_percentage + "%)";
    }

    //Load options chain
    retrieveOptionsChain(adjustedSymbol, isTest, (ocSuccess, ocData) => {
      //If successful, save returned options chain
      if (ocSuccess) {
        var optionsChain = new OptionsChain(ocData, state.data.underlyingPrice);
        state.data.optionsChain = optionsChain;

        //Get date from 3 years ago in yyyy-mm-dd format
        var startDate = (new Date((new Date()).getTime() - 94608000000)).toISOString().split("T")[0];

        makeAPIRequest("API_STOCK_HISTORICAL", {symbol: adjustedSymbol, tradierKey: apiKeys.tradier, start: startDate}, (shID, shSuccess, shData) => {
          if (shSuccess) {
            var historicalStockData = new HistoricalStockData(shData);
            state.data.underlyingHistorical = historicalStockData;
          } else {
            errorCallback("ERR_HISTORICAL_FETCH");
            console.log("Error Fetching Tradier Historical Data");
          }

          //Regardless of outcome, hide progress and initiate callback
          state.toolbar.showProgress = false;
          callback(state);
        }, isTest);
      } else {
        errorCallback("ERR_OPTIONS_DATA_FETCH")
        console.log("Error Fetching Tradier Data");
      }
    }, progressCallback);
  }, isTest);
}

/**
 * Retrieve options chain using Tradier API.
 *
 * @param {string} adjustedSymbol the cleaned-up symbol specified by the user
 * @param {boolean} isTest indicates whether test mode is activated
 * @param {function} callback the function to call when options chain has loaded.
 *                            Should accept two parameters:
 *                            1) A boolean indicating whether the operation was successful.
 *                            2) A JSON object representing the options chain JSON.
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
 * @param {Object} data the currently loaded state of the options chain
 * @param {string} adjustedSymbol the cleaned-up symbol specified by the user
 * @param {boolean} isTest indicates whether test mode is activated
 * @param {string[]} expirations the array of expirations
 * @param {number} expIndex the index of the expirations array to load.
 * @param {function} callback the function to call when data for all expirations has loaded.
 *           Should accept single parameter for options chain JSON.
 */
function recursiveTradierChainRequest(data, adjustedSymbol, isTest, expirations, expIndex, callback, progressCallback) {
  var chainData = data;
  makeAPIRequest("API_TRADIER_CHAIN", {symbol: adjustedSymbol, expiration: expirations[expIndex], tradierKey: apiKeys.tradier}, (tcID, tcSuccess, tcData) => {
    //If request was successful, convert the data into a processable format and save to chainData
    if (tcSuccess) {
      var dateMillis = parseInt(Date.parse(expirations[expIndex]) / 1000).toString();
      var singleExpData = formatSingleExpirationChain(tcData, dateMillis);
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

/**
 * Perform a preset GET request to a RESTful API.
 *
 * @param {string} jobID the preset request to make
 * @param {Object} args the arguments accepted by the API, expressed as a JSON object
 * @param {function} the function to call when the request is finished; accepts three params {@code (jobID (string), success (bool), data (json))}
 * @param {boolean} testMode a boolean indicating whether to make an actual request or just fetch sample data
 */
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
      API_TRADIER_EXPIRATIONS: ("../../api/tradier.php?calltype=expirations&symbol=" + args.symbol + "&apikey=" + args.tradierKey),
      API_TRADIER_CHAIN: ("../../api/tradier.php?calltype=options_chain&symbol=" + args.symbol + "&expiration=" + args.expiration + "&apikey=" + args.tradierKey),
      API_TRADIER_QUOTE: ("../../api/tradier.php?calltype=company_quote&symbol=" + args.symbol + "&apikey=" + args.tradierKey),
      API_STOCK_HISTORICAL: ("../../api/tradier.php?&calltype=historical&symbol=" + args.symbol + "&apikey=" + args.tradierKey + "&start=" + args.start)
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

/**
 * Update a child of an object in a state
 * component.state = {
 *   parentKey: {
 *     childKey: (oldValue --> value),
 *     ...
 *  },
 *  ...
 * };
 *
 * @param {Object} component the object to update
 * @param {string} parentKey the key of the parent property
 * @param {string} childKey the child key
 * @param {*} value the value to set for the child property
 */
function setSubState(component, parentKey, childKey, value) {
  var obj = component.state[parentKey]; //Make copy of target state object
  obj[childKey] = value; //Set the target child with the desired value
  var container = {};
  container[parentKey] = obj;
  component.setState(obj); //update the state with the modified object
}
