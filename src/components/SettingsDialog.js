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

    const handleStateChange = () => {

    }

    const darkModeSwitchChanged = (event) => {
      if (this.props.onDarkModeToggle != null) {
        this.props.onDarkModeToggle(this.props.theme.darkMode != true);
      }
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
              <Switch onChange={darkModeSwitchChanged} checked={this.props.theme != null ? this.props.theme.darkMode : false} value="darkModeSwitch" inputProps={{ 'aria-label': 'Dark Mode' }} />
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
