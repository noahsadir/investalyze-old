import '../App.css';
import React from "react";
import { withStyles } from '@material-ui/core/styles';

import SplitPane from 'react-split-pane';

import OptionsList from "./OptionsList";
import OptionsListHeader from "./OptionsListHeader";

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
      <SplitPane split="vertical" defaultSize="50%" minSize={360} maxSize={-360} style={{position:"relative", display: "flex"}}>
        <OptionsListView
          optionsChain={this.props.optionsChain}
          preferences={this.props.preferences}
          accentColor={this.props.accentColor}
          stickySelected={this.props.stickySelected}
          onOptionsListClick={this.props.onOptionsListClick}
          onRowConfigurationChange={this.props.onRowConfigurationChange}/>
        <OptionsAnalyticsView/>
      </SplitPane>
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
      <div style={{height: "100%"}}>
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
      </div>
    );
  }
}

class OptionsAnalyticsView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{height: "100%"}}>

      </div>
    );
  }
}
