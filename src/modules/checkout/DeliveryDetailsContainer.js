import React, {Component} from "react";
import {InteractionManager, KeyboardAvoidingView, Platform, StyleSheet, Text, View} from "react-native";
import IconFa from "react-native-vector-icons/FontAwesome";
import PropTypes from "prop-types";
import {NavigationActions} from "react-navigation";
import {Field, reduxForm} from "redux-form/immutable";
import FormInput from "../../components/FormInput";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {setPersonalInfo, setShippingInfo} from "./Actions";
import {saveProfile} from "../profile/Actions";
import {setSelectedAddress} from "../address/Actions";
import Button from "../../components/Button";
import Spinner from "react-native-loading-spinner-overlay";
import {validateEmail} from "../../services/userService";
import {fromJS} from 'immutable'
import AppText from "../../components/AppText";
import HeaderText from "../../components/HeaderText";
import AppStyles from "../../constants/styles";

class DeliveryDetailsView extends Component {
  static displayName = 'deliveryDetails';
  drawer = {};
  static navigationOptions = ({navigation, screenProps}) => {
    const {params = {}} = navigation.state;
    return {
      title: (<HeaderText>Delivery Details</HeaderText>),
      headerLeft: (<IconFa name='chevron-left' onPress={() => {
        goBack()
      }} style={{color: 'white', padding: 10, marginLeft: 10, fontSize: 20}}/>),
      headerTitleStyle: {
        width: '100%',
        color: '#fff',
      },
      headerStyle: {
        backgroundColor: '#FEBC11',
        elevation: 0
      },
      headerRight: (
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginRight: 10}}>
            <IconFa name='circle-thin' style={{color: '#fff', marginLeft: 5, fontSize: 8, fontWeight: '600'}}/>
            <IconFa name='circle' style={{color: '#fff', marginLeft: 5, fontSize: 8, fontWeight: '600'}}/>
            <IconFa name='circle-thin' style={{color: '#fff', marginLeft: 5, fontSize: 8, fontWeight: '600'}}/>
          </View>
      ),
    };
  };

  static goBack;

  static propTypes = {
    navigate: PropTypes.func.isRequired,
    address: PropTypes.object,
    iniitalValues: PropTypes.object
  };

  _goBack = () => {
    this.props.navigation.dispatch(NavigationActions.back())
  }

  componentDidMount() {
    goBack = this._goBack;
    if(!(this.props.selectedAddress && this.props.selectedAddress.toJS && this.props.selectedAddress.toJS().title)){
      let defaultAddresses = this.props.addresses.filter((address)=>{return address.toJS().isDefaultAddress}).toJS();
      this.props.setSelectedAddress(fromJS(defaultAddresses[Object.keys(defaultAddresses)[0]]))
    }
  }


  render() {
    const {handleSubmit, pristine, mobileNumber, checkoutData, persistingShippingInfo, selectedAddress} = this.props;
    let checkoutAddress = selectedAddress && selectedAddress.toJS && selectedAddress.toJS().title ? selectedAddress.toJS() : null;
    return (
        <View style={{flex: 1, flexDirection: 'column'}}>
          <Spinner visible={persistingShippingInfo} textStyle={{color: '#FFF'}}/>
          <KeyboardAvoidingView behavior="padding" style={{flex: 1, flexDirection: 'column', paddingHorizontal: 5}}>

            {/*Delivery Details */}
            <View style={{flexDirection: 'row', width: '100%', alignItems: 'center'}}>
              <AppText style={[styles.checkoutDetailSubTitle, {flex: 1}]}>Delivery Address</AppText>
              {checkoutAddress &&
              <Button style={{margin: 5, marginRight: 0}} onPress={ () => {
                this.props.navigate({routeName: 'AddressList', params: {selectMode: true}});
              }}>
                <View style={{height: 25, padding: 5, backgroundColor: AppStyles.color.secondary, alignItems: 'center', justifyContent: 'center'}}>
                  <AppText style={{fontSize: 12, fontWeight: '500', width: 100, color: 'white', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>Change Address</AppText>
                </View>
              </Button>}
            </View>

            <View style={styles.checkoutDetailTextRow}>
              {!!checkoutAddress ?
                  (<View>
                    <AppText multiline={true} style={{color: 'black', fontWeight: '400', padding: 3, paddingLeft: 7, paddingTop: 10}}>
                    {checkoutAddress.title}
                    </AppText>
                    <AppText multiline={true} style={{color: 'black', fontWeight: '100', padding: 3, paddingLeft: 7}}>
                      {checkoutAddress.street}
                    </AppText>
                    <AppText multiline={true} style={{color: 'black', fontWeight: '100', padding: 3, paddingLeft: 7, paddingBottom: 10}}>
                      {checkoutAddress.landmark }
                    </AppText>
                  </View>) :
                <Button style={[{margin: Platform.OS === 'ios' ? 10 : 0}, Platform.OS === 'android' ? {width : '100%'} : {}]} onPress={ () => {
                  this.props.navigate({routeName: 'NewAddress', params: {isInCheckoutFlow: true}});
                }}>
                  <View style={{margin: Platform.OS === 'android' ? 10 : 0, padding: 10, backgroundColor: AppStyles.color.secondary, alignItems: 'center', justifyContent: 'center'}}>
                    <AppText style={{fontSize: 14, fontWeight: '500', color: 'white', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>Add New Address</AppText>
                  </View>
                </Button>
              }
            </View>
            {/*Contact Details */}
            <View >
              <AppText style={styles.checkoutDetailSubTitle}>Contact Details</AppText>
            </View>
            <View style={styles.checkoutDetailTextRow}>
              <View style={{flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderColor: '#d0d0d0'}}>
                <AppText style={styles.formLabel}>First Name *</AppText>
                <Field name={'firstName'} component={FormInput} style={styles.formInput} autoCorrect={false} underlineColorAndroid='rgba(0,0,0,0.0)'/>
              </View>

              <View style={{flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderColor: '#d0d0d0'}}>
                <AppText style={styles.formLabel}>Last Name *</AppText>
                <Field name={'lastName'} component={FormInput} style={styles.formInput} autoCorrect={false} underlineColorAndroid='rgba(0,0,0,0.0)'/>
              </View>

              <View style={{flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderColor: '#d0d0d0'}}>
                <AppText style={styles.formLabel}>E-Mail *</AppText>
                <Field name={'email'} component={FormInput} style={styles.formInput} underlineColorAndroid='rgba(0,0,0,0.0)'
                       keyboardType={'email-address'} autoCapitalize={'none'} autoCorrect={false}/>
              </View>

              <View style={{flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center'}}>
                <AppText style={styles.formLabel}>SL Phone *</AppText>
                <Field name={'localMobileNumber'} component={FormInput} style={styles.formInput} underlineColorAndroid='rgba(0,0,0,0.0)'
                       keyboardType={'email-address'} autoCapitalize={'none'} autoCorrect={false}/>
              </View>
            </View>

          </KeyboardAvoidingView>
          <Button onPress={() => {
            handleSubmit(this.submit)();
          }} style={{backgroundColor:'white', padding: 10}}>
              <View style={{flexDirection: 'row', height: 45, backgroundColor: '#FEBC11', alignItems: 'center', justifyContent: 'center'}}>
                <AppText style={{color: 'white', fontWeight: '800', fontSize: 16, flex: 1, textAlign: 'center'}}>Proceed</AppText>
              </View>
          </Button>
        </View>
    );
  }

  submit = values => {

    if(!this.props.selectedAddress){
      alert("Please add or select an address");
      return;
    }

    let address =  this.props.selectedAddress.toJS();
    let email = values.get('email');
    let localMobileNumber = values.get('localMobileNumber');

    if (values.get('firstName') && values.get('lastName') && email && localMobileNumber && address.title) {
      if(validateEmail(email.toString())){
        this.props.setPersonalInfo({...values.toJS()});
        if(!this.props.initialValues.toJS().email){
          this.props.setProfileInfo({...values.toJS()})
        }
        this.props.setShippingInfo(address);
      }else{
        alert('Email is invalid')
      }
    }
    else {
      alert("You cannot leave any fields empty!");
    }
  }
}


const styles = StyleSheet.create({
  formInput: {
    flex: 1,
    borderRadius: 3,
    paddingLeft: 10,
    paddingRight: 5,
    fontSize: 14,
    borderWidth: 0,
    borderColor: '#DAE3E3',
    color: 'black',
  },
  formLabel: {
    height: '100%',
    fontSize: 14,
    lineHeight: 14,
    color: '#111',
    backgroundColor: '#DDD',
    width: 110,
    paddingLeft: 7,
    paddingRight: 10,
    paddingVertical: Platform.OS === 'android' ? 3 : 7,
    textAlignVertical: 'center'
  },
  button: {
    width: 150,
    height: 40,
    backgroundColor: '#006ecb',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'center'
  },
  checkoutDetailSubTitle: {
    marginTop: 12,
    color: 'grey',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 12,
    marginBottom: 5
  },
  checkoutDetailTextRow: {
    backgroundColor: 'white',
    paddingRight: 7,
    width: '100%',
  },
});

const deliveryDetailsView = reduxForm({form: 'deliveryDetails'})(DeliveryDetailsView);

export default connect(
    state => ({
      initialValues: state.getIn(['profile', 'personalInfo']),
      mobileNumber: state.getIn(['session', 'mobileNumber']),
      selectedAddress: state.getIn(['address', 'selectedAddress']),
      addresses: state.getIn(['address', 'addresses']),
      persistingShippingInfo: state.getIn(['checkout', 'persistingShippingInfo']),
    }),
    dispatch => {
      return {
        navigate: bindActionCreators(NavigationActions.navigate, dispatch),
        setPersonalInfo: bindActionCreators(setPersonalInfo, dispatch),
        setProfileInfo: bindActionCreators(saveProfile, dispatch),
        setShippingInfo: bindActionCreators(setShippingInfo, dispatch),
        setSelectedAddress: bindActionCreators(setSelectedAddress, dispatch)
      }
    }
)(deliveryDetailsView);
