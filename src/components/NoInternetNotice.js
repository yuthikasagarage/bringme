import {Platform, View, Text, StyleSheet, ImageBackground} from "react-native";
import React from "react";
import Button from "./Button"
import AppText from "./AppText";
import AppStyles from '../constants/styles'

export  default class NoInternetNotice extends React.PureComponent {

  render() {
    const {onRefresh} = this.props;

    return (
      <View style={styles.container}>
        <ImageBackground source={require('../resources/images/no-internet-background.jpg')} style={styles.backgroundImage}>
          <View style={{backgroundColor: '#222', opacity: 0.7, width: '100%', height: '100%'}}></View>
        </ImageBackground>
      <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <AppText style={{fontSize: 20, textAlign: 'center', backgroundColor: 'transparent', color: 'white', marginBottom: 10}}>No internet connection.</AppText>
        <Button onPress={()=>{onRefresh()}}>
          <View style={{marginTop: 15, backgroundColor: AppStyles.color.secondary, padding:10, borderRadius: 3}}>
            <AppText style={{fontSize: 16, textAlign: 'center', color: 'white'}}>Try again</AppText>
          </View>
        </Button>
      </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white'
  },
  backgroundImage: {
    width: '100%',
    position: 'absolute',
    height: '100%',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
})
