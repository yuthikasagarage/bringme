import React, {Component} from "react";
import PropTypes from "prop-types";
import {BackHandler, NetInfo, StatusBar, StyleSheet, View} from "react-native";
import NavigatorViewContainer from "./navigator/NavigatorViewContainer";
import * as snapshotUtil from "../utils/snapshot";
import * as SessionStateActions from "../modules/session/Actions";
import store from "../redux/store";
import DeveloperMenu from "../components/DeveloperMenu";
import {Map} from "immutable";
import {NavigationActions} from "react-navigation";
import SplashContainer from "../modules/splash/SplashContainer";
import LoginViewContainer from "../modules/login/LoginViewContainer";
import PushNotification from 'react-native-push-notification';

class AppView extends Component {

  static displayName = 'AppView';

  static propTypes = {
    isReady: PropTypes.bool.isRequired,
    splashExpired: PropTypes.bool.isRequired,
    mobileSet: PropTypes.bool.isRequired,
    token: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    setMobile: PropTypes.func.isRequired,
    doLogin: PropTypes.func.isRequired,
  };


  navigateBack() {
    const navigatorState = store.getState().get('navigatorState');

    const currentStackScreen = navigatorState.get('index');
    const currentTab = navigatorState.getIn(['routes', 0, 'routeName']);


    if (currentTab !== 'Home' || currentStackScreen !== 0) {
      store.dispatch(NavigationActions.back());
      return true;
    }

    // otherwise let OS handle the back button action
    return false;
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.navigateBack);
    NetInfo.addEventListener(
        'connectionChange',
        this.handleConnectivityChange
    );
  }

  handleConnectivityChange(connectionInfo) {
    if (this.connection !== connectionInfo.type && (connectionInfo.type === 'none' || connectionInfo.type === 'unknown')) {
      alert("Cannot connect to the internet!")
    }
    this.connection = connectionInfo.type;
  }

  componentDidMount() {
    snapshotUtil.resetSnapshot()
        .then(snapshot => {
          const {dispatch} = this.props;

          if (snapshot) {
            //filter snapshot state
            let newState = Map({
              session: snapshot.get('session'),
              profile: snapshot.get('profile'),
              address: snapshot.get('address'),
              cart: snapshot.get('cart')
            });
            dispatch(SessionStateActions.resetSessionStateFromSnapshot(newState));
          } else {
            dispatch(SessionStateActions.initializeSessionState());
          }

          store.subscribe(() => {
            snapshotUtil.saveSnapshot();
          });
        });

    PushNotification.configure({

      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function(token) {
        console.log( 'TOKEN:', token );
      },

      // (required) Called when a remote or local notification is opened or received
      onNotification: function(notification) {
        console.log( 'NOTIFICATION:', notification );
      },

      // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
      senderID: "379128478314",

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       */
      requestPermissions: true,
    });




  }

  _onLoginVerified(number) {
    this.props.setMobile(number);
  }

  componentDidUpdate() {
    if (this.props.mobileSet && this.props.token === '') {
      this.props.doLogin(this.props.mobileNumber);
    } else {
      // ToastAndroid.show(this.props.token + '', ToastAndroid.SHORT);
    }
  }

  render() {

    if (!this.props.isReady && !this.props.splashExpired || !this.props.splashExpired) {
      return (
          <View style={{flex: 1}}>
            <SplashContainer />
          </View>
      );
    }

    //after everything is loaded
    //check for mobile number
    if (!this.props.mobileSet) {
      return (
          <View style={{flex: 1}}>
            <LoginViewContainer onVerified={(number) => this._onLoginVerified(number)}/>
          </View>
      );
    }

    return (
        <View style={{flex: 1}}>
          <StatusBar backgroundColor='#FEBC11' barStyle='light-content'/>
          <NavigatorViewContainer />
          {__DEV__ && <DeveloperMenu />}
        </View>
    );
  }
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignSelf: 'center'
  }
});

export default AppView;
