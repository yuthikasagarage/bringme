import React from "react";
import {
  Platform,
  View,
  Text
}
from "react-native";
import Button from './Button';
import AppText from "./AppText";

export default class RadioButton extends React.PureComponent {

  render() {
    let {onPress, disabled} = this.props;
    if(disabled){
       onPress = ()=>{}
    }
    return (
      <Button onPress={onPress} style={Platform.OS === 'ios' ? this.props.style : {}}>
        <View style={[{flexDirection: 'row', alignItems:'center'}, Platform.OS === 'android' ? this.props.style : {}]} >
          <View style={
            {
              height: 24,
              width: 24,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: disabled ? '#DDD' :'#FEBC11',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
            {this.props.selected ?
              <View style={{
                  height: 12,
                  width: 12,
                  borderRadius: 6,
                  backgroundColor: '#FEBC11'
                }}>
              </View>
            : null }
          </View>
          <AppText style={{marginLeft: 5, fontSize: 16, fontWeight:'100', color: disabled ? '#DDD' : '#111'}}>{this.props.text}</AppText>
        </View>
      </Button>
    );
  }
}
