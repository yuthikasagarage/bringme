import {Text, View} from "react-native";
import React from "react";
import AppText from "./AppText";


export  default class ProductViewTab extends React.PureComponent {

  render() {
    const {item} = this.props;

    let weightCaption = '';
    const {weight, serving} = item;
    if (weight === 0 || true) {
      weightCaption = serving;
    } else {
      weightCaption = weight + 'g';
    }



    return (<View style={{flexDirection: 'column', padding: 12, backgroundColor: '#ffffff'}}>
      <AppText style={{fontWeight: '600', fontSize: 18}}>{item.name}</AppText>
      <AppText style={{fontWeight: '400', fontSize: 14}}>{weightCaption}</AppText>
    </View>);
  }
}
