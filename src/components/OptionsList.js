import '../App.css';
import React from "react";
import { withStyles } from '@material-ui/core/styles';

import {
  List,
  ListItem
} from "@material-ui/core/";

import SplitPane from 'react-split-pane';
import SingleOption from '../objects/SingleOption';
import OptionsChain from '../objects/OptionsChain';

/**
 * List of options contracts which meet specified criteria.
 */
export default class OptionsList extends React.Component {
  constructor(props) {
    super(props);
  }


  render() {
    var listItems = [];

    //Filter options chain (if it exists) by values specified in preferences,
    //then form SingleOption objects into list items.
    if (this.props.preferences.selectedComparisonValue != null && this.props.optionsChain != null) {
        var singleOptions = this.props.optionsChain.filter(this.props.preferences.comparisonType, this.props.preferences.selectedComparisonValue, this.props.preferences.optionType);
        for (var index in singleOptions) {
          listItems.push(
            <ListItemLink style={{margin:0,padding:0}}>
              <OptionListItem
                theme={this.props.theme}
                singleOption={singleOptions[index]}
                rowConfiguration={this.props.preferences.rowConfiguration}
                premiumType={this.props.preferences.premiumType}
                comparisonType={this.props.preferences.comparisonType}
                accentColor={this.props.accentColor}
                stickySelected={this.props.stickySelected}
                onClick={this.props.onClick}/>
            </ListItemLink>
          );
        }
    }

    return (
      <List style={{overflowY: "scroll", flex: "1 0 0"}}>
        {listItems}
      </List>
    );
  }
}

/**
 * Displays data for a single options contract.
 */
class OptionListItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    //check if sticky selected value equals this item's option ID.
    //make isStickySelected true if equal, false otherwise
    var isStickySelected = false;
    for (var index in this.props.stickySelected) {
      if (isStickySelected == false && this.props.stickySelected[index] == this.props.singleOption.get("id")) {
        isStickySelected = true;
      }
    }

    //calls parent onClick function (if one exists) when item is clicked
    const handleItemClick = (event) => {
      if (this.props.onClick != null) {
        this.props.onClick(this.props.singleOption);
      }
    }

    return (
      <div onClick={handleItemClick} style={{padding: 0,width:"100%"}}>
        <div class="option_item" style={{backgroundColor: (isStickySelected  ? this.props.theme.accentColor : this.props.theme.backgroundColor)}}>
          {generateItemsToRender(this.props.singleOption, this.props.rowConfiguration, this.props.premiumType)}
        </div>
      </div>
    );
  }
}

/**
 * Generate ListItem with material ripple effect
 *
 * @param props the properties of the ListItem
 * @returns a ListItem object
 */
function ListItemLink(props) {
  return <ListItem button component="a" {...props} />;
}

/**
 * Generate the content of the list item with the given SingleOption and row configuration
 *
 * @param {SingleOption} singleOption the option to get data from
 * @param {string[]} rowConfiguration the current configuration of the row
 * @returns the columns of an options list item
 */
function generateItemsToRender(singleOption, rowConfiguration) {
  var itemsToRender = [];

  //Go through row configuration value
  for (var index = 0; index < rowConfiguration.length; index++){

    //Modify style if this column is the first or last one
    var classValue = "column";
    if (index === 0){
      classValue = "left_column";
    }else if (index === rowConfiguration.length - 1){
      classValue = "right_column";
    }

    //Add column container with desired value from option
    itemsToRender.push(<div class={classValue}><p class="option_value">{singleOption.formatted(rowConfiguration[index])}</p></div>);
  }

  return itemsToRender;
}
