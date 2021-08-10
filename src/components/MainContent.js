import '../App.css';
import React from "react";
import { withStyles } from '@material-ui/core/styles';

import SplitPane from 'react-split-pane';

import {
  ToggleButtonGroup,
  ToggleButton
} from '@material-ui/lab/';

import {
  Icon
} from "@material-ui/core/";

import OptionsList from "./OptionsList";
import OptionsListHeader from "./OptionsListHeader";

import DataAnalyticsPane from "./DataAnalyticsPane";
import ProjectionAnalyticsPane from "./ProjectionAnalyticsPane";
import BuilderAnalyticsPane from "./BuilderAnalyticsPane";

const StyledChartToggle = withStyles((theme) => ({
  root: {
    width: "100%",
    display: "flex",
  },
  grouped:{
    height: 45,
    flex: "1 0 0px",
  }
}))(ToggleButtonGroup);

/**
 * The main content of the application.
 *
 * @class
 * @alias MainContent
 * @extends React.Component
 *
 * @param {Object} props the properties of the component.
 * @param {Object} props.theme the theme of the application
 * @param {Object} props.analytics the analytics object of the app's state
 * @param {Object} props.preferences the preferences object of the app's state
 * @param {boolean} props.chartToggled indicates whether the analytics view is toggled; primarily for small screens
 * @param {SingleOption[]} props.stickySelected an array of SingleOption objects that are currently selected
 * @param {OptionsChain} props.optionsChain the options chain
 * @param {HistoricalStockData} props.underlyingHistorical the historical data of the underlying
 * @param {function(SingleOption)} props.onOptionsListClick the event handler for when an item in the options list is clicked. Returns the selected SingleOption.
 * @param {function(config)} props.onRowConfigurationChange the event handler for when a row configuration changes for the options list. Returns entire row configuration string array.
 * @param {function(string)} props.onAnalyticsPaneChange the event handler for when an analytics pane is changed. Returns the string representing the newly selected pane.
 * @param {function(Object)} props.onDataAnalyticsConfigChange the event handler for when the data analytics config changes. Returns entire config object, even if just one item changed.
 * @param {function(Object)} props.onProjectionAnalyticsConfigChange the event handler for when the projection analytics config changes. Returns entire config object, even if just one item changed.
 * @param {function(Object)} props.onBuilderAnalyticsConfigChange the event handler for when the builder analytics config changes. Returns entire config object, even if just one item changed.
 * @param {function(OptionsStrategy)} props.onViewStrategyButtonClick the event handler for when the "view" button of the options builder is clicked
 */
export default class MainContent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{flex: "1 0 0", height: 0, display: "flex"}} class={((this.props.chartToggled == true) ? "splitPaneListOnly" : "splitPaneChartOnly")}>
        <div style={{flex: "999 0 0", display: (this.props.optionsChain == null ? "flex" : "none"), padding: 8}}>
          <div style={{flex: "1 0 0", display: "flex", flexFlow: "column"}}>
            <div style={{flex: "1 0 0"}}></div>
            <div style={{display: "flex"}}>
              <div style={{flex: "1 0 0"}}></div>
              <Icon style={{fontSize: 48}}>search</Icon>
              <div style={{flex: "1 0 0"}}></div>
            </div>
            <p style={{textAlign: "center"}}>Enter the symbol of a valid stock to view its options chain.</p>
            <div style={{flex: "1 0 0"}}></div>
          </div>
        </div>
        <SplitPane split="vertical" defaultSize="50%" minSize={360} maxSize={-360} style={{flex: "999 0 0", position:"relative", display: (this.props.optionsChain != null ? "flex" : "none")}} >
          <OptionsListView
            theme={this.props.theme}
            optionsChain={this.props.optionsChain}
            preferences={this.props.preferences}
            accentColor={this.props.accentColor}
            stickySelected={this.props.stickySelected}
            onOptionsListClick={this.props.onOptionsListClick}
            onRowConfigurationChange={this.props.onRowConfigurationChange}/>
          <OptionsAnalyticsView
            theme={this.props.theme}
            optionsChain={this.props.optionsChain}
            underlyingPrice={this.props.underlyingPrice}
            underlyingHistorical={this.props.underlyingHistorical}
            preferences={this.props.preferences}
            analytics={this.props.analytics}
            accentColor={this.props.accentColor}
            backgroundColor={this.props.backgroundColor}
            onViewStrategyButtonClick={this.props.onViewStrategyButtonClick}
            onAnalyticsPaneChange={this.props.onAnalyticsPaneChange}
            onDataAnalyticsConfigChange={this.props.onDataAnalyticsConfigChange}
            onProjectionAnalyticsConfigChange={this.props.onProjectionAnalyticsConfigChange}
            onBuilderAnalyticsConfigChange={this.props.onBuilderAnalyticsConfigChange}/>
        </SplitPane>
        <div style={{flex: "1 0 0"}}></div>
      </div>
    );
  }
}

class OptionsListView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (

      <div style={{display: "flex", flexFlow: "column", height: "100%"}}>
        <OptionsListHeader
          theme={this.props.theme}
          rowConfiguration={this.props.preferences.rowConfiguration}
          optionNames={(this.props.optionsChain == null) ? null : this.props.optionsChain.names}
          onConfigurationChange={this.props.onRowConfigurationChange}/>
        <OptionsList
          theme={this.props.theme}
          optionsChain={this.props.optionsChain}
          preferences={this.props.preferences}
          accentColor={this.props.accentColor}
          stickySelected={this.props.stickySelected}
          onClick={this.props.onOptionsListClick}/>
        <div style={{flex: "0 0 0"}}></div>
      </div>
    );
  }
}

class OptionsAnalyticsView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    const handleAnalyticsPaneChange = (event, newAlignment) => {
      if (this.props.onAnalyticsPaneChange != null && newAlignment != null) {
        this.props.onAnalyticsPaneChange(newAlignment);
      }
    }


    return (
      <div style={{height: "100%", display: "flex", flexFlow: "column"}}>
        <div style={{height: 64, flex: "0 0 auto", padding: 8}}>
          <StyledChartToggle size="small" value={this.props.analytics.selectedPane} exclusive onChange={handleAnalyticsPaneChange}  aria-label="text alignment">
            <ToggleButton value="data" aria-label="left aligned">Values</ToggleButton>
            <ToggleButton value="projection" aria-label="right aligned">Metrics</ToggleButton>
            <ToggleButton value="builder" aria-label="right aligned">Builder</ToggleButton>
          </StyledChartToggle>
        </div>
        <div style={{overflowY: "none", flex: "1 0 0"}}>
          <DataAnalyticsPane
            theme={this.props.theme}
            preferences={this.props.preferences}
            optionsChain={this.props.optionsChain}
            analytics={this.props.analytics}
            accentColor={this.props.accentColor}
            backgroundColor={this.props.backgroundColor}
            onDataAnalyticsConfigChange={this.props.onDataAnalyticsConfigChange}/>
          <ProjectionAnalyticsPane
            theme={this.props.theme}
            preferences={this.props.preferences}
            optionsChain={this.props.optionsChain}
            underlyingPrice={this.props.underlyingPrice}
            underlyingHistorical={this.props.underlyingHistorical}
            analytics={this.props.analytics}
            accentColor={this.props.accentColor}
            backgroundColor={this.props.backgroundColor}
            onProjectionAnalyticsConfigChange={this.props.onProjectionAnalyticsConfigChange}/>
          <BuilderAnalyticsPane
            theme={this.props.theme}
            optionsChain={this.props.optionsChain}
            underlyingPrice={this.props.underlyingPrice}
            underlyingHistorical={this.props.underlyingHistorical}
            analytics={this.props.analytics}
            onViewStrategyButtonClick={this.props.onViewStrategyButtonClick}
            onBuilderAnalyticsConfigChange={this.props.onBuilderAnalyticsConfigChange}/>
        </div>
        <div style={{flex: "0 0 0"}}></div>
      </div>
    );
  }
}
