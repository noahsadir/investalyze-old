import '../App.css';
import React from "react";
import { withStyles } from '@material-ui/core/styles';

export default class ProjectionAnalyticsPane extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{height: "100%", display: (this.props.analytics.selectedPane == "projection" ? "block" : "none")}}>

      </div>
    );
  }
}
