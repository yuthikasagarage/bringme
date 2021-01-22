import React, {Component} from "react";
import PropTypes from "prop-types";
import {StatusBar, StyleSheet, View, NetInfo, Alert, PushNotificationIOS, Dimensions, Platform} from "react-native";
import NavigatorViewContainer from "./navigator/NavigatorViewContainer";
import * as snapshotUtil from "../utils/snapshot";
import * as SessionStateActions from "../modules/session/Actions";
import store from "../redux/store";
import SplashContainer from "./splash/SplashContainer";
import LoginViewContainer from "./login/LoginViewContainer";
import {Map} from "immutable";
import PushNotification from 'react-native-push-notification';
import firebase from 'react-native-firebase';
import AppStyles from "../constants/styles";

const dimen = Dimensions.get('window');
const isIphoneXorAbove = (
  Platform.OS === 'ios' &&
  !Platform.isPad &&
  !Platform.isTVOS &&
  ((dimen.height === 896 || dimen.width === 896))
);

class AppView extends Component {
  static displayName = 'AppView';

  static propTypes = {
    isReady: PropTypes.bool.isRequired,
    splashExpired: PropTypes.bool.isRequired,
    mobileSet: PropTypes.bool.isRequired,
    token: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    setMobile: PropTypes.func.isRequired,
    doLogin: PropTypes.func.isRequired
  };

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
          newState = newState.setIn(['cart', 'error'], '');
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
            notification.finish(PushNotificationIOS.FetchResult.NoData);
        },

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

    firebase.messaging().onTokenRefresh(fcmToken => {
      console.log(fcmToken);
    });

    firebase.notifications().onNotificationDisplayed((notification) => {
      console.log(notification);
    });

    firebase.notifications().onNotification((notification) => {
      const localNotification = new firebase.notifications.Notification()
      .setTitle(notification.title())
      .setBody(notification.body())
      firebase.notifications().displayNotification(localNotification);
    });

  }

  componentWillMount() {
    NetInfo.addEventListener(
      'connectionChange',
      this.handleConnectivityChange
    );
  }

  handleConnectivityChange(connectionInfo) {
    if ((connectionInfo.type === 'none')) {

    }
    this.connection = connectionInfo.type;
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
    if (!this.props.isReady || !this.props.splashExpired) {
      return (<View style={{
        flex: 1
      }}>
        <SplashContainer/>
      </View>);
    }
    //after everything is loaded
    //check for mobile number
    if (!this.props.mobileSet) {
      return (<View style={{
        flex: 1
      }}>
        <LoginViewContainer onVerified={(number) => this._onLoginVerified(number)}/>
      </View>);
    }

    return (<View style={{
      flex: 1, paddingTop: isIphoneXorAbove ? 15 : 0, backgroundColor: AppStyles.color.primary
    }}>
      <StatusBar backgroundColor='#455a64' barStyle='light-content'/>
      <NavigatorViewContainer/>
    </View>);
  }

}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignSelf: 'center'
  }
});

export default AppView;
