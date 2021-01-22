import {Platform, TouchableHighlight, TouchableNativeFeedback, TouchableWithoutFeedback, View} from "react-native";
import React from "react";
import debounce from 'lodash.debounce';

export class Button extends React.PureComponent {

  render() {
    const {children, underlayColor, useForeground, background, ...buttonProps} = this.props;
    let TouchableElement = TouchableHighlight;
    let underlayColorInternal = underlayColor;
    if(!underlayColorInternal){
      underlayColorInternal = 'transparent';
    }
    let uiProps = {underlayColor: underlayColorInternal};
    if (Platform.OS === 'android') {
      TouchableElement = TouchableWithoutFeedback;
      uiProps = {useForeground, background};
    }
    return (
        <TouchableElement {...buttonProps} {...uiProps} >
          {children || <View/>}
        </TouchableElement>
    );
  }
}

const withPreventDoubleClick = (WrappedComponent) => {

  class PreventDoubleClick extends React.PureComponent {

    debouncedOnPress = () => {
      this.props.onPress && this.props.onPress();
    };

    onPress = debounce(this.debouncedOnPress, 1000, { leading: true, trailing: false });

    render() {
      return <WrappedComponent {...this.props} onPress={this.onPress} />;
    }
  }

  PreventDoubleClick.displayName = `withPreventDoubleClick(${WrappedComponent.displayName ||WrappedComponent.name})`
  return PreventDoubleClick;
};

export default withPreventDoubleClick(Button);
