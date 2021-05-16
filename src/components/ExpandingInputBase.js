import '../App.css';
import React from "react";
import { withStyles } from '@material-ui/core/styles';
import {
  InputBase,
} from "@material-ui/core/";

export function get(color) {

  const ExpandingInputBase = withStyles((theme) => ({
    root: {
      width: "100%",
      'label + &': {
        marginTop: theme.spacing(3),
      }
    },
    input: {
      borderRadius: 4,
      position: 'relative',
      border: '1px solid ' + color,
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
        borderColor: color,
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
      },
    },
  }))(InputBase);

  return (<ExpandingInputBase/>);
}
