import '../App.css';
import React from "react";
import { withStyles } from '@material-ui/core/styles';
import DownloadDataDialog from './DownloadDataDialog';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Switch,
  TextField,
} from '@material-ui/core/';

/**
 * Allows user to modify global configuration of application, such as API Key or theme.
 */
export default class SettingsDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tempTradierKey: this.props.apiKeys.tradier,
    }
  }

  render() {

    var appState = this.props.appState;

    const handleClose = (event) => {
      if (this.props.onAPIKeyChange != null) {
        this.props.onAPIKeyChange({"tradier": this.state.tempTradierKey});
      }
      if (this.props.onClose != null) {
        this.props.onClose(this.props.appState);
      }
    }

    const handleStateChange = () => {

    }

    const cookieSettingsClicked = () => {
      if (this.props.onCookieSettingsClick != null) {
        this.props.onCookieSettingsClick();
      }
    }

    const apiKeysButtonClicked = () => {
      if (this.props.onCookieSettingsClick != null) {
        this.props.onCookieSettingsClick();
      }
    }

    const downloadDataButtonClicked = () => {
      if (this.props.onDownloadDataButtonClick != null) {
        this.props.onDownloadDataButtonClick();
      }
    }

    const getTradierKeyButtonClicked = () => {
      if (this.props.onDownloadDataButtonClick != null) {
        window.open("https://documentation.tradier.com/brokerage-api", "_blank");
      }
    }

    const darkModeSwitchChanged = (event) => {
      if (this.props.onDarkModeToggle != null) {
        this.props.onDarkModeToggle(this.props.theme.darkMode != true);
      }
    }

    const handleAPIKeyTextFieldChange = (event) => {
      this.setState({tempTradierKey: event.target.value});
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
              <TextField size="small" style={{marginTop: 8, marginBottom: 8, flex: "1 0 0"}} color="secondary" onChange={handleAPIKeyTextFieldChange} variant="outlined" label={"Tradier API Key"} placeholder={"Tradier API Key"} value={this.state.tempTradierKey}></TextField>
              <Button style={{marginBottom: 8, marginTop: 8, marginLeft: 8, minWidth: 96, flex: "0 0 0"}} variant="outlined" onClick={getTradierKeyButtonClicked} color={this.props.accentColor}>Get Key</Button>
            </div>
            <div style={{display: "flex", marginBottom: 8, border: "1px solid " + this.props.theme.borderColor, borderRadius: 4}}>
              <p style={{flex: "1 0 0", width: 256, margin: 0, marginLeft: 16, marginTop: 12, lineHeight: "100%"}}>Dark Mode</p>
              <Switch onChange={darkModeSwitchChanged} checked={this.props.theme != null ? this.props.theme.darkMode : false} value="darkModeSwitch" inputProps={{ 'aria-label': 'Dark Mode' }} />
            </div>
            <Button style={{marginBottom: 8}} onClick={downloadDataButtonClicked} color={this.props.accentColor}>Download Data</Button>
            <Button style={{marginBottom: 8}} onClick={cookieSettingsClicked} color={this.props.accentColor}>Cookie Settings</Button>
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
