import '../App.css';
import React from "react";
import { withStyles } from '@material-ui/core/styles';

import {
  Select,
  InputBase,
  MenuItem
} from "@material-ui/core/";

import SingleOption from '../lib/SingleOption';



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

    const StyledInputBase = withStyles((theme) => ({
      root: {
        width: "100%",
      'label + &': {
        marginTop: theme.spacing(3),

      }
    },
    input: {
      borderRadius: 4,
      position: 'relative',
      border: '1px solid ' + this.props.theme.borderColor,
      fontSize: 14,
      height: 16,
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
        input={<StyledInputBase/>}>
        {optionNameItems}
      </Select>
    );
  }
}
