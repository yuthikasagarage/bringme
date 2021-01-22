import React, {Component} from "react";
import PropTypes from "prop-types";
import {addNavigationHelpers, NavigationActions} from "react-navigation";
import Rate from 'react-native-rate'
import AppNavigator from "./Navigator";
import {View, StyleSheet, Image, Platform, ImageBackground} from 'react-native';
import Button from "../../components/Button";
import AppText from "../../components/AppText";
import IconM from "react-native-vector-icons/Ionicons";
import {BringMeIcon} from "../../utils/bring-me-icons"
import ScalingDrawer from '../../components/ScalingDrawer';
import AppStyles from "../../constants/styles";
import AppMeta from "../../constants/appMeta";

let defaultScalingDrawerConfig = {
  scalingFactor: 0.7,
  minimizeFactor: 0.5,
  swipeOffset: 0
};

class NavigatorView extends Component {
  static displayName = 'NavigationView';

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    navigatorState: PropTypes.shape({
      index: PropTypes.number.isRequired,
      routes: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        routeName: PropTypes.string.isRequired
      }))
    }).isRequired
  };

  openDrawer = () => {
    this._drawer.open();
  };

  closeDrawer = () => {
    if(this._drawer) {
      this._drawer.close();
    }
  };

  render() {

    const screenProps = {
      openDrawer: this.openDrawer
    };

    const menu = (

      <ImageBackground style={[styles.drawerContainer]} source={require('./drawer-background.jpg')}>
        <View style={{alignItems: 'flex-start', justifyContent: 'flex-start', width: '100%', marginLeft: 30}}>
          <Image source={require('./logo-header.png')} resizeMode={'contain'} style={{width: '40%'}}/>
        </View>
        <View style={{width: '100%'}}>
          <Button onPress={() => {
            this.closeDrawer();
          }}>
            <View style={{width: '100%', flexDirection: 'row', alignItems: 'center'}}>
              <BringMeIcon name='bringme-home' style={styles.menuItemIcon}/>
              <AppText style={styles.menuItemText}>Home</AppText>
            </View>
          </Button>

          <Button onPress={() => {
            this.props.dispatch(NavigationActions.navigate({routeName: 'Profile'}));
            this.closeDrawer();
          }}>
            <View style={{width: '100%', flexDirection: 'row', alignItems: 'center'}}>
              <BringMeIcon name='bringme-user' style={styles.menuItemIcon}/>
              <AppText style={styles.menuItemText}>My Profile</AppText>
            </View>
          </Button>

          <Button onPress={() => {
            this.props.dispatch(NavigationActions.navigate({routeName: 'AddressList'}));
            this.closeDrawer();
          }}>
            <View style={{width: '100%', flexDirection: 'row', alignItems: 'center'}}>
              <BringMeIcon name='bringme-location' style={styles.menuItemIcon}/>
              <AppText style={styles.menuItemText}>My Address</AppText>
            </View>
          </Button>

          <Button onPress={() => {
            this.props.dispatch(NavigationActions.navigate({routeName: 'OrderList'}));
            this.closeDrawer();
          }}>
            <View style={{width: '100%', flexDirection: 'row', alignItems: 'center'}}>
              <BringMeIcon name='bringme-cart-alt' style={styles.menuItemIcon}/>
              <AppText style={styles.menuItemText}>My Orders</AppText>
            </View>
          </Button>

          <Button onPress={() => {
            Rate.rate(AppMeta, (success)=>{
            });
            this.closeDrawer();
          }}>
            <View style={{width: '100%', flexDirection: 'row', alignItems: 'center'}}>
              <BringMeIcon name='bringme-star' style={styles.menuItemIcon}/>
              <AppText style={styles.menuItemText}>Rate Us</AppText>
            </View>
          </Button>

          <Button onPress={() => {
            this.props.dispatch(NavigationActions.navigate({routeName: 'Faqs'}));
            this.closeDrawer();
          }}>
            <View style={{width: '100%', flexDirection: 'row', alignItems: 'center'}}>
              <BringMeIcon name='bringme-chat' style={styles.menuItemIcon}/>
              <AppText style={styles.menuItemText}>Contact Us</AppText>
            </View>
          </Button>

          <Button onPress={() => {
            this.props.dispatch(NavigationActions.navigate({routeName: 'WishList'}));
            this.closeDrawer();
          }}>
            <View style={{width: '100%', flexDirection: 'row', alignItems: 'center'}}>
              <BringMeIcon name='bringme-file' style={styles.menuItemIcon}/>
              <AppText style={styles.menuItemText}>Wish List</AppText>
            </View>
          </Button>

          <Button onPress={async () => {
            await this.props.resetLogin();
            await this.props.logout();
            this.props.dispatch(NavigationActions.reset({
              index: 0,
              key: null,
              actions: [
                NavigationActions.navigate({routeName: 'Home'})
              ]
            }));
            this.closeDrawer();
          }}>
            <View style={{width: '100%', flexDirection: 'row', alignItems: 'center'}}>
              <BringMeIcon name='bringme-logout' style={styles.menuItemIcon}/>
              <AppText style={styles.menuItemText}>Logout</AppText>
            </View>
          </Button>

        </View>
      </ImageBackground>
    );

    if (Platform.OS === 'android') {

      return (
        <ScalingDrawer
          ref={ref => this._drawer = ref}
          content={menu}
          {...defaultScalingDrawerConfig}
          onClose={() => console.log('close')}
          onOpen={() => console.log('open')}
        >
          <AppNavigator screenProps={screenProps}
                        navigation={
                          addNavigationHelpers({
                            dispatch: this.props.dispatch,
                            state: this.props.navigatorState
                          })
                        }
          />
        </ScalingDrawer>
      );
    } else {

      return (
        <AppNavigator screenProps={screenProps}
                      navigation={
                        addNavigationHelpers({
                          dispatch: this.props.dispatch,
                          state: this.props.navigatorState
                        })
                      }
        />
      );
    }
  }
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a'
  },
  animatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e6e7e8'
  },
  drawerContainer: {
    flex: 1,
    alignItems: 'center'
  },
  menuItemText: {
    fontSize: 18,
    color: AppStyles.color.text
  },
  menuItemIcon: {
    width: 50,
    textAlign: 'center',
    color: AppStyles.color.text,
    padding: 10,
    marginLeft: 10,
    marginRight: 5,
    fontSize: 30,
    fontWeight: '600'
  }
});

export default NavigatorView;
