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
} from '@material-ui/core/';

/**
 * Prompts user to acknowledge limitations of application and accept terms of use.
 */
export default class DisclaimerDialog extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {

    const handleClose = (event) => {
      if (this.props.onAction != null) {
        this.props.onAction(true);
      }
    }

    return (
      <Dialog
        open={this.props.open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{"Disclaimer"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            The content of this website is intended to be used for informational purposes only, and is not
            intended as a substitute for professional financial advice or individual research.
          </DialogContentText>
          <DialogContentText id="alert-dialog-description">
            Under no circumstances should the information on this site be taken as a recommendation
            for a particular investment or strategy. This website makes no guarantee of a particular return,
            nor does it guarantee that the information presented is accurate or reflective of market conditions.
          </DialogContentText>
          <DialogContentText id="alert-dialog-description">
            By clicking "I Agree", you acknowledge that neither the website, nor its operator(s), are responsible for
            any financial losses or other damages that result from misuse of this website, or any of the services provided.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button value={true} onClick={handleClose} color={this.props.accentColor}>
            I Agree
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
