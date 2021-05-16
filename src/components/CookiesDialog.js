import '../App.css';
import React from "react";
import { withStyles } from '@material-ui/core/styles';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Checkbox,
  FormControlLabel,
  FormGroup
} from '@material-ui/core/';

/**
 * Lawsuits are no fun. Let's try to prevent one.
 */
export default class CookiesDialog extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {

    const handleClose = (event) => {
      if (this.props.onAction != null) {
        this.props.onAction(true);
      }
    }

    //User indicated preference change for a certain cookie
    const handleCheckbox = (event) => {
      if (this.props.onCookieToggle != null && event.target.name != null) {
        this.props.onCookieToggle(event.target.name, !this.props.cookiePrefs[event.target.name]);
      }
    }


    //Allow all cookies
    const allowAllCookies = () => {
      for (var cookieItem in this.props.cookieItems) {
        if (cookieItem != "disclaimerAgreement" && cookieItem != "cookieAcknowledgement") {
          this.props.onCookieToggle(cookieItem, true);
        }
      }
    }


    //Deny all cookies except strictly necessary ones
    const allowEssentialCookies = () => {
      for (var cookieItem in this.props.cookieItems) {
        if (cookieItem != "disclaimerAgreement" && cookieItem != "cookieAcknowledgement") {
          this.props.onCookieToggle(cookieItem, false);
        }
      }
    }

    //Make a checkbox for every cookie item specified by cookieItems property
    var checkboxItems = [];
    for (var cookieItem in this.props.cookieItems) {
      checkboxItems.push(
        <FormControlLabel
          disabled={(cookieItem == "disclaimerAgreement" || cookieItem == "cookieAcknowledgement")}
          control={<Checkbox onChange={handleCheckbox} checked={this.props.cookiePrefs[cookieItem] == true}
          name={cookieItem}/>}
          label={this.props.cookieItems[cookieItem]}/>
      );
    }

    return (
      <Dialog
        open={this.props.open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{"Cookies"}</DialogTitle>

        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Choose which cookies to accept or deny.
          </DialogContentText>
          <DialogActions>
            <div style={{flex: "1 0 0"}}></div>
            <Button value={true} onClick={allowAllCookies} color={this.props.accentColor}>Allow All</Button>
            <Button value={true} onClick={allowEssentialCookies} color={this.props.accentColor}>Essentials Only</Button>
            <div style={{flex: "1 0 0"}}></div>
          </DialogActions>
          <FormGroup>
            {checkboxItems}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button value={true} onClick={handleClose} color={this.props.accentColor}>Done</Button>
        </DialogActions>
      </Dialog>
    );
  }
}
