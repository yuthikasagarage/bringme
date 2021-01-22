import {Dimensions, ImageBackground, Text, View, Platform, Image} from "react-native";
import React from "react";
import Button from "./Button";
import CachedImage from "./CachedImage";
import AppText from "./AppText";
import DeviceInfo from 'react-native-device-info';

const {width, height, logicalWidth } = Dimensions.get('window');
const equalWidth = DeviceInfo.isTablet() ? ((width - 32) / 3 ) : ((width - 24) / 2 );

export  default class CategoryItem extends React.PureComponent {

  _onPress = () => {
    this.props.onPressItem(this.props.item);
  };

  render() {
    const {index} = this.props;
    //const textColor = this.props.selected ? "red" : "black";

    let gridStyles = DeviceInfo.isTablet() ?
    {
      marginTop: (index === 0 || index === 1 || index === 2) ? 8 : 4,
      marginBottom : 4,
      marginLeft: index % 3 === 0 ? 8 : 4,
      marginRight: index % 3 === 0 ? 4 : (index % 3 === 1 ? 4 : 8)
    }
    :
    {
      marginTop: (index === 0 || index === 1) ? 8 : 4,
      marginBottom : 4,
      marginLeft: index % 2 === 0 ? 8 : 4,
      marginRight: index % 2 === 0 ? 4 : 8
    }

    return (
        <Button style={[
            {height: equalWidth, width: Platform.OS === 'android' ? equalWidth : 'auto', borderRadius: 5},
            Platform.OS === 'ios' ? gridStyles: {}]} onPress={this._onPress}>
          <View style={[{borderRadius: 5, height: equalWidth, width: equalWidth }, Platform.OS === 'android' ? gridStyles: {}]}>
            <CachedImage borderRadius={5} style={{borderRadius: 5, height: equalWidth, width: '100%', backgroundColor: '#FFF'}} source={{uri: this.props.imageUrl}} resizeMode='cover'/>
            <View style={{flexDirection: 'column', position: 'absolute', height: DeviceInfo.isTablet() ? 60 : 50, bottom: 0, padding: 6, width: '100%'}}>
              <AppText style={{alignSelf: 'center', textAlign: 'center', color: '#5BBA47', fontWeight: '800', fontSize: DeviceInfo.isTablet() ? 18 : 14, width: '100%'}}>{this.props.title}</AppText>
              <AppText style={{alignSelf: 'center', textAlign: 'center', color: '#5BBA47', fontSize: DeviceInfo.isTablet() ? 16 :12, width: '100%'}}>{this.props.description}</AppText>
            </View>
          </View>
        </Button>
    );
  }
}
