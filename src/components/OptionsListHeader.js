import '../App.css';
import React from "react";
import { withStyles } from '@material-ui/core/styles';

import {
  Select,
  InputBase,
  MenuItem
} from "@material-ui/core/";

import SingleOption from '../objects/SingleOption';
var ExpandingInputBase = require('./ExpandingInputBase');

export default class OptionsListHeader extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var optionsListSelectItems = [];

    const handleListSelectChange = (value, index) => {
      if (this.props.onConfigurationChange != null) {
        var newRowConfig = this.props.rowConfiguration;
        newRowConfig[index] = value;
        this.props.onConfigurationChange(newRowConfig);
      }
    }

    for (var index in this.props.rowConfiguration) {
      optionsListSelectItems.push(<OptionsListSelect theme={this.props.theme} index={index} selectedValue={this.props.rowConfiguration[index]} optionNames={this.props.optionNames} onChange={handleListSelectChange}/>);
    }

    return (
      <div style={{display: "flex", flexFlow: "row", flex: "0 0 0", paddingRight: 8}}>
        {optionsListSelectItems}
      </div>
    );
  }
}

class OptionsListSelect extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    var optionNameItems = [];

    for (var key in this.props.optionNames) {
      optionNameItems.push(<MenuItem value={key}>{this.props.optionNames[key]}</MenuItem>);
    }

    const handleChange = (event) => {
      if (this.props.onChange != null) {
        this.props.onChange(event.target.value, this.props.index);
      }
    }

    return (
      <Select
        labelId="demo-simple-select-outlined-label"
        id="demo-simple-select-outlined"
        value={this.props.selectedValue} //Setting it to a global variable ensures selected params match data presented
        variant='outlined'
        style={{margin: 8, marginRight: 0, overflowX: "hidden"}}
        onChange={handleChange}
        label="Comparison Type"
        input={ExpandingInputBase.get(this.props.theme.borderColor)}>
        {optionNameItems}
      </Select>
    );
  }
}
