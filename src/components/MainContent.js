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
 * Represents the main content for the app.
 *
 * @param singleOptions an array of SingleOption objects
 * @param preferences the current preferences
 * @param accentColor the accent color
 * @param stickySelected the SingleOption object that is selected
 * @param onOptionsListClick a function that is called when the item is clicked which accepts a SingleOption object
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
            optionsChain={this.props.optionsChain}
            preferences={this.props.preferences}
            accentColor={this.props.accentColor}
            stickySelected={this.props.stickySelected}
            onOptionsListClick={this.props.onOptionsListClick}
            onRowConfigurationChange={this.props.onRowConfigurationChange}/>
          <OptionsAnalyticsView
            optionsChain={this.props.optionsChain}
            preferences={this.props.preferences}
            analytics={this.props.analytics}
            accentColor={this.props.accentColor}
            onAnalyticsPaneChange={this.props.onAnalyticsPaneChange}
            onDataAnalyticsConfigChange={this.props.onDataAnalyticsConfigChange}/>
        </SplitPane>
        <div style={{flex: "1 0 0"}}></div>
      </div>
    );
  }
}

/*
<div style={{display: "flex", width:"100%"}} class="topToolbarBottomExpandContainer">
  <div id="optionsListHeaderContainer" class="topToolbar">
    <OptionsListHeader parent={this} value={genericOptionItem}/>
  </div>
  <div id="optionsListContainer" style={{height:0,overflow:'scroll'}} class="bottomExpand">
    <OptionsList id="optionsList"/>
  </div>
</div>
<div style={{display: "flex"}} class="topToolbarBottomExpandContainer" style={{padding:"0px 16px 0px 16px"}}>
  <div class="topToolbar" style={{padding:"8px 0px 8px 0px"}}>
    <StyledChartToggle parent={this} value={this.state.chartType} exclusive onChange={handleChartTypeChange} aria-label="text alignment">
      <ToggleButton style={{overflow:"auto"}} parent={this} value="data" aria-label="left aligned"><span style={{overflow:"auto"}}>Data</span></ToggleButton>
      <ToggleButton style={{overflow:"auto"}} parent={this} value="metrics" aria-label="right aligned"><span style={{overflow:"auto"}}>Metrics</span></ToggleButton>
      <ToggleButton style={{overflow:"auto"}} parent={this} value="projection" aria-label="right aligned"><span style={{overflow:"auto"}}>Projection</span></ToggleButton>
      <ToggleButton style={{overflow:"auto"}} parent={this} value="builder" aria-label="right aligned"><span style={{overflow:"auto"}}>Builder</span></ToggleButton>
    </StyledChartToggle>
  </div>
  <DataPane visible={this.state.chartType === "data"}/>
  <MetricsPane visible={this.state.chartType === "metrics"}/>
  <ProjectionPane visible={this.state.chartType === "projection"}/>
  <BuilderPane visible={this.state.chartType === "builder"}/>
</div>
*/

class OptionsListView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (

      <div style={{display: "flex", flexFlow: "column", height: "100%"}}>
        <OptionsListHeader
          rowConfiguration={this.props.preferences.rowConfiguration}
          optionNames={(this.props.optionsChain == null) ? null : this.props.optionsChain.names}
          onConfigurationChange={this.props.onRowConfigurationChange}/>
        <OptionsList
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
            <ToggleButton value="data" aria-label="left aligned">Data</ToggleButton>
            <ToggleButton value="projection" aria-label="right aligned">Projection</ToggleButton>
            <ToggleButton value="builder" aria-label="right aligned">Builder</ToggleButton>
          </StyledChartToggle>
        </div>
        <div style={{overflowY: "none", flex: "1 0 0"}}>
          <DataAnalyticsPane
            preferences={this.props.preferences}
            optionsChain={this.props.optionsChain}
            analytics={this.props.analytics}
            accentColor={this.props.accentColor}
            onDataAnalyticsConfigChange={this.props.onDataAnalyticsConfigChange}/>
          <ProjectionAnalyticsPane optionsChain={this.props.optionsChain} analytics={this.props.analytics}/>
          <BuilderAnalyticsPane optionsChain={this.props.optionsChain} analytics={this.props.analytics}/>
        </div>
        <div style={{flex: "0 0 0"}}></div>
      </div>
    );
  }
}
