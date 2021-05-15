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
  Switch,
} from '@material-ui/core/';

/**
 * Lawsuits are no fun. Let's try to prevent one.
 */
export default class SettingsDialog extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {

    var appState = this.props.appState;

    const handleClose = (event) => {
      if (this.props.onClose != null) {
        this.props.onClose(this.props.appState);
      }
    }

    const handleStateChange = (state) => {
      if (this.props.handleStateChange != null) {
        this.props.handleStateChange(this.props.appState);
      }
    }

    const darkModeSwitchChanged = (event) => {
      if (appState.theme.darkMode == true) {
        appState.theme.darkMode = false;
      } else {
        appState.theme.darkMode = true;
      }
      handleStateChange(appState);
    }

    return (
      <Dialog
        open={this.props.open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{"Settings"}</DialogTitle>
        <DialogContent>
          <div style={{display: "flex", overflowY: "scroll", flexFlow: "column"}}>
            <div style={{display: "flex"}}>
              <p style={{flex: "1 0 0", width: 256, margin: 0, marginTop: 12, lineHeight: "100%"}}>Dark Mode</p>
              <Switch onChange={darkModeSwitchChanged} checked={this.props.appState.theme.darkMode} value="darkModeSwitch" inputProps={{ 'aria-label': 'Dark Mode' }} />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button value={true} onClick={handleClose} color={this.props.accentColor}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
