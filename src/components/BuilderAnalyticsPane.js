import '../App.css';
import React from "react";
import { withStyles } from '@material-ui/core/styles';

export default class BuilderAnalyticsPane extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{height: "100%", display: (this.props.analytics.selectedPane == "builder" ? "block" : "none")}}>

      </div>
    );
  }
}
