import {TextInput} from "react-native";
import React, {Component} from "react";
import {debounce} from "lodash";
import PropTypes from "prop-types";

export default  class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    };
    this.changed = debounce(this.props.changed, 1250)
  }

  static propTypes = {
    changed: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired
  };

  handleChange = e => {
    const val = e.target.value;
    this.setState({value: val}, () => {
      this.changed(val)
    })
  };

  render() {
    return (
        <TextInput style={{width: '100%', color: 'white'}}
                   onChange={this.handleChange}
        />
    )
  }
}
