import {Text, View} from "react-native";
import React from "react";
import Button from "./Button";
import AppText from "./AppText";
import IconFa from "react-native-vector-icons/FontAwesome";
import IconSLI from "react-native-vector-icons/SimpleLineIcons";
import IconMci from "react-native-vector-icons/MaterialCommunityIcons";
import { connectActionSheet } from '@expo/react-native-action-sheet';

@connectActionSheet
export default class AddressListItem extends React.PureComponent {

  _onPress = () => {
    this.props.onPressItem(this.props.item);
  };

  _onPressEdit = () => {

    if(this.props.item.isDefaultAddress){

      this.props.onPressEditItem(this.props.item);

    }else{

      let options = ['Cancel', 'Delete', 'Edit'];
      let cancelButtonIndex = 0;
      let destructiveButtonIndex = 1;
      let editButtonIndex = 2;
      this.props.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex
        },
        buttonIndex => {
          if(buttonIndex == destructiveButtonIndex){
            this.props.onPressDeleteItem(this.props.item);
          }else if(buttonIndex == editButtonIndex){
            this.props.onPressEditItem(this.props.item);
          }
        }
      );
    }

  };

  onPressDefaultAddress = () => {
    this.props.onSetDefaultAddressItem(this.props.item);
  }


  render() {
    const {item, title, street, building, city, district, postcode, isDefaultAddress} = this.props;
    //const textColor = this.props.selected ? "red" : "black";
    return (
        <View style={{flex: 1, flexDirection: 'row', marginBottom: 1, paddingTop:15, paddingBottom:10, backgroundColor:'white', borderBottomWidth:1, borderColor:'#e6e6e6'}}>
          <Button onPress={this._onPress} style={{flex: 1, flexDirection: 'row', marginBottom: 1}}>
            <View style={{flex: 1, flexDirection: 'row', marginBottom: 1, paddingLeft: 15, alignItems:'center'}}>
              {item.isDefaultAddress && <IconMci name="map-marker" style={{fontSize: 40,width: 40,marginRight:15,color: 'orange' }}/>}
              {!item.isDefaultAddress && <IconMci name="map-marker-outline" onPress={this.onPressDefaultAddress} style={{fontSize: 40,width: 40,marginRight:15,color: 'orange' }}/>}
              <View style={{flex: 1, flexDirection: 'column', marginLeft: 0, justifyContent: 'center'}}>
                <AppText style={{flex: 1, fontWeight: '500', fontSize: 16}}>{title}</AppText>
                <AppText style={{flex: 1, fontWeight: '400', fontSize: 14, marginTop: 5}}>{street}</AppText>
              </View>
            </View>
          </Button>
          <View style={{  flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <Button onPress={this._onPressEdit} style={{flex: 1, flexDirection: 'row', marginBottom: 1, paddingLeft: 5}}>
              <View style={{flex: 1, flexDirection: 'row', marginBottom: 1, paddingLeft: 5, marginRight:25, alignItems: 'center', justifyContent: 'center'}}>
                <IconSLI name="pencil" style={{ width: 30, fontSize: 25}}/>
              </View>
            </Button>
          </View>
        </View>);
  }
}
