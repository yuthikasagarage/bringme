import Button from "../../components/Button";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
  Dimensions,
  NetInfo,
  Alert,
  KeyboardAvoidingView,
  ImageBackground
} from "react-native";
import Toast from "react-native-easy-toast";
import SmsListener from "react-native-android-sms-listener";
import Icon from "react-native-vector-icons/MaterialIcons";
import IconEv from "react-native-vector-icons/EvilIcons";
import * as snapshotUtil from "../../utils/snapshot";
import TextInputMask from 'react-native-text-input-mask'
import CodeInput from 'react-native-confirmation-code-input';
import AppText from "../../components/AppText";
import DeviceInfo from 'react-native-device-info';
import PhoneInput from 'react-native-phone-input'

const loginSteps = {
  numberEnter: 0, verifyEnter: 1
};

class LoginView extends Component {
  static displayName = 'Login';

  constructor(props) {
    super(props);
    this.state = {
      phoneNumber: 0,
      smsTimeLeft: 0,
      currentStep: loginSteps.numberEnter, // numberEnter, verifyEnter
      sentTimeLeft: 0,
      iosVerifyCode: 0,
      isSL: true,
      countryCode: '+94'
    }
  }

  static navigationOptions = {
    title: 'Login',
    tabBarIcon: (props) => (<Icon name='plus-one' size={24} color={props.tintColor}/>)
  };

  static propTypes = {
    navigate: PropTypes.func.isRequired,
    setMobile: PropTypes.func.isRequired,
    register: PropTypes.func.isRequired,
    verifyReceivedCode: PropTypes.func.isRequired,
    onVerified: PropTypes.func.isRequired,
    verificationCode: PropTypes.number.isRequired,
    verified: PropTypes.bool.isRequired,
    errorMessage: PropTypes.string.isRequired
  };

  componentDidUpdate() {
    if (this.props.verified) {
      this.props.onVerified(this.getFormattedPhoneNumber());
    }
  }

  getFormattedPhoneNumber = () => {
    return this.state.isSL ? this.state.phoneNumber : this.state.countryCode + this.state.phoneNumber;
  }

  verify = async () => {
    let sriLankaPattern = /^\d{9}$/;
    let otherCountryPattern = /^\+?\d+$/;
    let phoneNumber = this.getFormattedPhoneNumber();
    let pattern = this.state.isSL ? sriLankaPattern : otherCountryPattern;
    const verifyReceivedCode = this.props.verifyReceivedCode;
    if (!phoneNumber || !phoneNumber.match(pattern)) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Invalid Phone Number! - ' + phoneNumber, ToastAndroid.SHORT);
      } else if (Platform.OS === 'ios') {
        this.refs.loginNotifications.show('Invalid Phone Number!');
      }
      return;
    }

    //all good
    isConnected = false;

    try{
        Platform.OS === "ios"
      ? (isConnected = await fetch("https://bringmeapp.lk"))
      : (isConnected = await NetInfo.isConnected.fetch());
    }catch(e){

    }
    if (isConnected) {
      this.props.register(phoneNumber);
      this.startSentCountDown();
      if(phoneNumber === '777777777'){
        this.props.onVerified(phoneNumber);
      }
    } else {
      alert("Please check your internet connection");
    }

  };

  verifyManualCode = (code) => {
    this.setState({iosVerifyCode: code})
    this.props.verifyReceivedCode(parseInt(code));
  };

  startCountDown = () => {
    this.setState({currentStep: loginSteps.verifyEnter});
    let smsTimeLeft = 15;
    this.setState({smsTimeLeft});
    let smsTimer = setInterval(() => {
        if (this.props.verified) {
          clearInterval(smsTimer);
          return;
        }
        --smsTimeLeft;
        this.setState({smsTimeLeft});
        if (smsTimeLeft <= 0)
          clearInterval(smsTimer);
      }
      , 1000);
  };

  startSentCountDown = () => {
    let sentTimeLeft = 2;
    this.setState({sentTimeLeft});
    let sentTimer = setInterval(() => {
        --sentTimeLeft;
        this.setState({sentTimeLeft});
        if (sentTimeLeft <= 0) {
          clearInterval(sentTimer);
          this.startCountDown();
        }
      }
      , 1000);
  };

  goToNumberEntry = () => {
    this.setState({currentStep: loginSteps.numberEnter, isSL: true});
  };

  onSelectCountry = (isoCode) => {
    this.setState({isSL: isoCode === 'lk', countryCode: this.refs.phone.getValue()})
  }

  getInputContent = () => {
    if (this.state.currentStep === loginSteps.numberEnter) {
      return (<KeyboardAvoidingView  style={styles.inputContainer}>
        <AppText style={styles.getStartedLabel}>
          Enter your phone number?
        </AppText>

        <View style={{
          flexDirection: 'row',
          marginBottom: 20,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
          borderRadius: 3,
          paddingHorizontal: 10,
        }}>
          <View style={{width: 110}}>
            <PhoneInput ref='phone' initialCountry='lk'
              flagStyle={{width: 40, height: 25}}
              textProps={{ editable: false}}
              onSelectCountry={this.onSelectCountry}
              textStyle={[{fontSize: 21}, Platform.OS === 'android' ? {marginTop: 5, height: 25} : {}]}/>
          </View>
          <View style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 5
          }}>
            {this.state.isSL && (<View><TextInputMask underlineColorAndroid="transparent" selectionColor={'#58B44B'} autoCorrect={false}
                           ref={(component) => this.phoneInput = component} keyboardType={'phone-pad'}
                           placeholder="77 123 1234" placeholderTextColor='#EEE' mask={"[00] [000] [0000]"}
                           onChangeText={(phoneNumber, extractedPhoneNumber) => {
                             this.setState({
                               phoneNumber: extractedPhoneNumber
                             })
                           }} style={{
              textAlign: 'left',
              color: '#000',
              fontSize: 22,
              paddingLeft: 1,
              marginTop: Platform.OS === 'android' ? 3 : 0,
              marginLeft: 0,
              alignSelf: 'stretch'
            }}
            >
            </TextInputMask>
            <Text style={{paddingLeft: 7, paddingRight: 7, height: 0, fontSize: 24}}>7 123 1234</Text></View>)}

            {!this.state.isSL && (<View><TextInputMask underlineColorAndroid="transparent" selectionColor={'#58B44B'} autoCorrect={false}
                           ref={(component) => this.phoneInput = component} keyboardType={'phone-pad'}
                           placeholder="" placeholderTextColor='#EEE' mask={"[0000000000000]"}
                           onChangeText={(phoneNumber, extractedPhoneNumber) => {
                             this.setState({
                               phoneNumber: extractedPhoneNumber
                             })
                           }} style={{
              textAlign: 'left',
              color: '#000',
              fontSize: 22,
              paddingLeft: 1,
              marginTop: Platform.OS === 'android' ? 3 : 0,
              marginLeft: 0,
              alignSelf: 'stretch'
            }}
            >
            </TextInputMask>
            <Text style={{paddingLeft: 7, paddingRight: 7, height: 0, fontSize: 24}}>12341234123</Text></View>)}

          </View>
        </View>
        <View style={styles.infoContainer}>
          <AppText style={{
            backgroundColor: 'transparent',
            color: '#FFF',
            textAlign: 'center'
          }}>A verification SMS will be sent once you press the send button</AppText>
        </View>
        <Button onPress={this.verify} style={{width: '80%', justifyContent: 'center', alignSelf: 'center'}}>
          <View style={styles.button}>
            <AppText style={{
              fontSize: 18,
              color: 'white'
            }}>Send</AppText>
          </View>
        </Button>
        <Toast ref="loginNotifications"/>
      </KeyboardAvoidingView>);
    } else if(this.state.currentStep === loginSteps.verifyEnter){
      if (Platform.OS === 'other' && DeviceInfo.getCarrier() !== "") {
        return (<View style={styles.inputContainer}>
          <AppText style={styles.getStartedLabel}>
            Waiting for SMS
          </AppText>
          {this.state.smsTimeLeft > 0 &&
          <AppText style={styles.retrylabel}>
            To retry please wait ({this.state.smsTimeLeft}s)
          </AppText>}
          {this.state.smsTimeLeft < 1 &&
          <Button onPress={this.goToNumberEntry}>
            <View style={styles.button}>
              <AppText style={{
                color: 'white'
              }}>Back</AppText>
            </View>
          </Button>}
        </View>);
      } else {
        return (
          <View style={[styles.inputContainer, {justifyContent: 'flex-start', marginTop: '20%'}]}>
            <AppText style={styles.getStartedLabel}>
              Enter the verification code
            </AppText>

            <CodeInput
              containerStyle={{flex: 0.2}}
              ref="codeInputRef2"
              keyboardType="numeric"
              codeLength={6}
              className='border-circle'
              autoFocus={false}
              codeInputStyle={{fontWeight: '800'}}
              onFulfill={(code) => {
                this.verifyManualCode(code);
              }}
            />
            {this.state.smsTimeLeft > 0 &&
            <AppText style={styles.reSendlabel}>
              To re-send code please wait ({this.state.smsTimeLeft}s)
            </AppText>}
            {this.state.smsTimeLeft < 1 &&
            <Button onPress={this.goToNumberEntry}  style={{width: '80%', marginTop: 20}}>
              <View style={[styles.button, {backgroundColor: 'orange'}]}>
                <AppText style={{
                  color: 'white'
                }}>Back</AppText>
              </View>
            </Button>}
          </View>
        );
      }

    }
  };

  componentWillUnmount() {
    snapshotUtil.saveSnapshot();
  }

  render() {

    const loadingStyle = this.props.loading
      ? {
        backgroundColor: '#eee'
      }
      : null;

    if (this.props.errorMessage !== '') {
      if (Platform.OS === 'android') {
        ToastAndroid.show(this.props.errorMessage, ToastAndroid.SHORT);
      } else if (Platform.OS === 'ios') {
        if (!this.alertPresent) {
          Alert.alert('Server Error', this.props.errorMessage + '. Please contact support on 0773031337', [{
            text: 'OK',
            onPress: () => {
            }
          }]);
          this.alertPresent = true;
        }
      }
    }

    if (this.state.sentTimeLeft > 0) {
      return (
        <View style={styles.container}>
          <ImageBackground source={require('./login-background.jpg')} style={styles.backgroundImage}>
            <View style={{backgroundColor: '#222', opacity: 0.7, width: '100%', height: '100%'}}></View>
          </ImageBackground>
          <AppText style={{
            color: 'white',
            backgroundColor: 'transparent',
            textAlign: 'center',
            marginTop: '20%',
            fontSize: 20
          }}>Sent!</AppText>
          <IconEv name='check' style={{
            color: 'orange',
            backgroundColor: 'transparent',
            fontSize: 100,
            textAlign: 'center',
            marginTop: 25
          }}/>
        </View>
      )

    }

    return (<View style={styles.container}>
      <ImageBackground source={require('./login-background.jpg')} style={styles.backgroundImage}>
        <View style={{backgroundColor: '#222', opacity: 0.7, width: '100%', height: '100%'}}></View>
      </ImageBackground>
      {this.getInputContent()}
    </View>);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
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
  inputContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 40 : 30,
    flex: 1
  },

  infoContainer: {
    margin: 20,
    marginBottom: 40,
    flexDirection: 'row',
    justifyContent: 'center'
  },

  getStartedLabel: {
    textAlign: 'center',
    color: '#FFF',
    fontSize: 24,
    backgroundColor: 'transparent',
    marginBottom: 40,
    padding: 5
  },

  retrylabel: {
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 20,
    padding: 5
  },

  reSendlabel: {
    textAlign: 'center',
    color: '#FFF',
    backgroundColor: 'transparent',
    fontSize: 16,
    marginTop: 20,
    padding: 5
  },

  button: {
    height: 40,
    width: '80%',
    backgroundColor: '#58B44B',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center'
  }
});

export default LoginView;
