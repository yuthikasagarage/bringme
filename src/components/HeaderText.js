import React, {Component} from 'react';
import {
  Text,
} from 'react-native';
import AppText from './AppText'

export default class HeaderText extends Component {
  constructor(props) {
    super(props)
    // Put your default font styles here.
    this.style = [{fontSize: 18}];
    if( props.style ) {
      if( Array.isArray(props.style) ) {
        this.style = this.style.concat(props.style)
      } else {
        this.style.push(props.style)
      }
    }
  }

  render() { return (
    <AppText {...this.props} style={this.style}>
      {this.props.children}
    </AppText>
  )}
}
