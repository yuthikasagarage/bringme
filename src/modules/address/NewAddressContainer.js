import React, {Component} from "react";
import {InteractionManager, KeyboardAvoidingView, PermissionsAndroid, Platform, StyleSheet, Text, View, Alert, Switch, ScrollView, Dimensions} from "react-native";
import IconFa from "react-native-vector-icons/FontAwesome";
import PropTypes from "prop-types";
import {NavigationActions} from "react-navigation";
import FormInput from "../../components/FormInput";
import Button from "../../components/Button";
import {Field, change, reduxForm, formValueSelector} from "redux-form/immutable";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {saveAddress, setAddress, setSelectedAddress} from "./Actions";
import {fromJS} from "immutable";
import AppText from "../../components/AppText";
import HeaderText from "../../components/HeaderText";
import KeyboardHandler from "../../components/KeyboardHandler";

const {width, height} = Dimensions.get('window');

class NewAddressView extends Component {
  static displayName = 'newAddress';
  drawer = {};
  static navigationOptions = ({navigation, screenProps}) => {
    const {params = {}} = navigation.state;
    return {
      title: (<HeaderText>New Address</HeaderText>),
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
      }
    };
  };

  static goBack;

  constructor(props) {
    super(props);
    this.state = {
      selectedIcon: [true, false, false],
      isDefaultAddress: true,
      coordinates: null,
      city: '',
      district: '',
      postcode: '',
      isInCheckoutFlow: false
    }
  }

  static propTypes = {
    navigate: PropTypes.func.isRequired,
    saveAddress: PropTypes.func.isRequired,
    changeFieldValue: PropTypes.func.isRequired,
    selectedCoordinates: PropTypes.object,
  };

  _goBack = () => {
    this.props.navigation.dispatch(NavigationActions.back())
  }

  componentDidMount() {
    if (this.props.navigation.state.params) {

      if(this.props.navigation.state.params.isInCheckoutFlow){
        this.setState({isInCheckoutFlow: true});
      }

      let address = this.props.navigation.state.params.address;

      if (address) {
        this.props.changeFieldValue('street', address.street);
        this.props.changeFieldValue('building', address.building);
        this.props.changeFieldValue('landmark', address.landmark);
        this.props.changeFieldValue('title', address.title);
        this.setState({selectedIcon: [address.title === 'Home', address.title === 'Work', address.title !== 'Home' && address.title !== 'Work']});
        this.setState({isDefaultAddress: address.isDefaultAddress});
        this.setState({coordinates: address.coordinates, city: address.city, district: address.district, postcode: address.postcode});
      }else{
        this.props.setAddress({});
        this.setSelectedIcon();
      }
    }else{
      this.props.setAddress({});
      this.setSelectedIcon();
    }

    //this.setState({values: address});
    goBack = this._goBack;
  };

  setSelectedIcon = () => {
    this.setState({selectedIcon: [this.props.addresses.Home ? false : true, (this.props.addresses.Work || !this.props.addresses.Home) ? false : true, this.props.addresses.Home && this.props.addresses.Work ]})
  }

  requestMapPermission = async () => {
    if(Platform.OS === 'android'){
      if(Platform.Version < 23 ){
        return true;
      }
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
          'title': 'Permission to acccess to GPS',
          'message': 'This app needs permission to access your current location.'
        });

        return granted === PermissionsAndroid.RESULTS.GRANTED;

      } catch (err) {
        console.warn(err)
      }
      return false;
    }else if(Platform.OS === 'ios'){
      return true;
    }
  };

  _showMapPicker = () => {
    this.requestMapPermission().then((granted) => {
      if (granted) {
        this.props.navigate({routeName: 'MapPicker'});
      }
    });

  }

  getValueForSelectedIcon = () => {
    return this.state.selectedIcon[0] ? 'Home' : (this.state.selectedIcon[1] ? 'Work' : (this.state.selectedIcon[2] ? this.props.title : ''))
  }

  render() {
    const {handleSubmit, pristine, addresses, title} = this.props;
    const existingAddresses = Object.keys(addresses);
    return (
        <View style={{flex: 1, justifyContent: 'space-between'}}>
          <View style={{flex: 1}}>
          <KeyboardHandler ref='kh' offset={75} >

            {/*Address Details */}
            <View style={{flexDirection: 'row', width: '100%', alignItems: 'center', paddingLeft: 7, padding:3}}>
              <AppText style={styles.checkoutDetailSubTitle}>Address Details</AppText>
            </View>
            <View style={[styles.checkoutDetailTextRow, {flexDirection: 'column'}]}>

              <Button onPress={this._showMapPicker} style={{margin: 10}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <View style={{backgroundColor: 'orange', borderRadius:3, flexDirection: 'row', alignItems: 'center', alignSelf:'flex-start', padding: 10}}>
                    <AppText style={{color: 'white'}}>Pick Location on Map</AppText>
                    <IconFa name="map-marker" style={{marginLeft: 10, color: 'white', fontSize: 20}}/>
                  </View>
                  {!! (this.props.newAddress.coordinates || this.state.coordinates) && <IconFa name="check" style={{color: 'green', fontSize: 20, marginLeft: 10}}/>}
                </View>
              </Button>

              <View style={{flexDirection: 'column', width: '100%', justifyContent: 'center', marginTop: 5}}>
                <AppText style={styles.formLabel}>Address *</AppText>
                  <View>
                    <Field name={'street'} component={FormInput} style={styles.formInput} autoCorrect={false} underlineColorAndroid='rgba(0,0,0,0.2)'
                           placeholder="Street/Locality"/>
                  </View>
              </View>

              <View style={{flexDirection: 'column', width: '100%', justifyContent: 'center', marginVertical: 15}}>
                <AppText style={styles.formLabel}>Landmark</AppText>
                <Field name={'landmark'} component={FormInput} style={styles.formInput} autoCorrect={false} underlineColorAndroid='rgba(0,0,0,0.2)' placeholder="Landmark"/>
              </View>

              <View style={{flexDirection: 'row', padding: 5, marginBottom: 5, marginLeft: 5, alignItems: 'center'}}>
                <AppText style={{fontSize: 16, color: 'grey'}}>Default Address</AppText>
                <Switch
                  style={{marginLeft: 15}}
                  value={this.state.isDefaultAddress}
                  tintColor={'orange'}
                  onTintColor={'orange'}
                  disabled={existingAddresses.length <= 1 && existingAddresses.indexOf(this.getValueForSelectedIcon()) != -1}
                  onValueChange={(value)=>{this.setState({isDefaultAddress: value})}}
                />
              </View>
            </View>
            {/*Tag Details */}
            <View style={{flexDirection: 'column', alignSelf: 'stretch', height: 200}}>
              <View style={{flexDirection: 'row', width: '100%', alignItems: 'center', padding: 7}}>
                <AppText style={styles.checkoutDetailSubTitle}>Tag address as</AppText>
              </View>

              <View style={{
                flexDirection: 'row',
                width: '100%',
                alignItems: 'center',
                padding: 7,
                paddingLeft: 40,
                paddingRight: 40,
                paddingTop: 15,
                justifyContent: 'space-between',
                backgroundColor: 'white',
                borderBottomWidth: 1,
                borderBottomColor: 'gray'
              }}>
                <Button title="" onPress={() => {
                  this.setState({selectedIcon: [true, false, false]})
                }}>
                  <View style={{flexDirection: 'column', alignItems: 'center'}}>
                    <IconFa name="home" style={{color: (this.state.selectedIcon[0] ? 'orange' : 'gray'), fontSize: 30}}/>
                    <AppText style={{marginTop: 10}}>Home</AppText>
                  </View>
                </Button>
                <Button title="" onPress={() => {
                  this.setState({selectedIcon: [false, true, false]})
                }}>
                  <View style={{flexDirection: 'column', alignItems: 'center'}}>
                    <IconFa name="briefcase" style={{color: (this.state.selectedIcon[1] ? 'orange' : 'gray'), fontSize: 25}}/>
                    <AppText style={{marginTop: 10}}>Work</AppText>
                  </View>
                </Button>
                <Button title="" onPress={() => {
                  this.setState({selectedIcon: [false, false, true]})
                }}>
                  <View style={{flexDirection: 'column', alignItems: 'center'}}>
                    <IconFa name="map-marker" style={{color: (this.state.selectedIcon[2] ? 'orange' : 'gray'), fontSize: 30}}/>
                    <AppText style={{marginTop: 10}}>Other</AppText>
                  </View>
                </Button>
              </View>

              {this.state.selectedIcon[2] &&
              <View style={{flexDirection: 'column', width: '100%', justifyContent: 'center', paddingBottom: 15, paddingTop: 5, backgroundColor: 'white'}}>
                <AppText style={styles.formLabel}>Name *</AppText>
                <Field name={'title'} component={FormInput} ref='title' onFocus={()=>this.refs.kh.inputFocused(this,'title')} style={styles.formInput} autoCorrect={false} underlineColorAndroid='rgba(0,0,0,0.2)' placeholder="eg: Friend's Place"/>
              </View>}
            </View>
          </KeyboardHandler>
          </View>
          <Button style={{width: '100%', padding: 10, backgroundColor: 'white'}} disabled={this.props.submitting} onPress={() => {
            this.props.handleSubmit(this.submit)();
          }}>
              <View style={{flexDirection: 'row',   height: 45, backgroundColor: '#FEBC11', alignItems: 'center', justifyContent: 'center'}}>
                <AppText style={{color: 'white', fontWeight: '800', fontSize: 16, flex: 1, textAlign: 'center'}}>Save</AppText>
              </View>
          </Button>
        </View>
    )

  }

  submit = (values) => {
    let valuesjs = values.toJS();
    let {newAddress} = this.props;
    if (!valuesjs.street || (this.state.selectedIcon[2] && !valuesjs.title)) {
      Alert.alert(
          'Fill in all the required fields!',
          "Fields marked with '*' are required.",
          [
            {
              text: 'OK', onPress: async () => {
            }
            },
          ],
          {cancelable: false}
      )
    } else if(!(newAddress.coordinates || this.state.coordinates)) {
      Alert.alert(
          'Please select a location',
          "Press the 'Pick Location on Map' Button",
          [
            {
              text: 'OK', onPress: async () => {
            }
            },
          ],
          {cancelable: false}
      )
    }else {
      if (!this.state.selectedIcon[2]) {
        valuesjs.title = this.state.selectedIcon[0] ? 'Home' : this.state.selectedIcon[1] ? 'Work' : 'Other';
      }
      let addressItem = fromJS({...valuesjs, street: valuesjs.street, city: newAddress.city || this.state.city, district: newAddress.district || this.state.district, postcode: newAddress.postcode || this.state.postcode, coordinates: newAddress.coordinates || this.state.coordinates, isDefaultAddress: this.state.isDefaultAddress});
      this.props.saveAddress(addressItem);

      if(this.state.isInCheckoutFlow || true){
        this.props.setSelectedAddress(addressItem);
      }

      setTimeout(() => {
        this.props.navigation.dispatch(NavigationActions.back());
      }, 200)
    }
  }
}


const styles = StyleSheet.create({
  formInput: {
    borderRadius: 3,
    fontSize: 16,
    borderWidth: Platform.OS === 'ios' ? 1 : 0,
    borderColor: '#DAE3E3',
    color: 'black',
    padding: 5,
    marginRight: 10,
    marginLeft: 10
  },
  formLabel: {
    fontSize: 12,
    color: 'grey',
    width: '100%',
    paddingLeft: 10,
    paddingRight: 15,
    paddingBottom: 2
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
    padding: 7,
    width: '100%',
  },
});


const newAddressView = reduxForm({
  form: 'newAddress'
})(NewAddressView);

export default connect(
    state => ({
      newAddress: state.getIn(['address', 'newAddress']),
      addresses: state.getIn(['address', 'addresses']).toJS(),
      title: formValueSelector('newAddress')(state, 'title')
    }),
    dispatch => {
      return {
        navigate: bindActionCreators(NavigationActions.navigate, dispatch),
        saveAddress: bindActionCreators(saveAddress, dispatch),
        setAddress: bindActionCreators(setAddress, dispatch),
        setSelectedAddress: bindActionCreators(setSelectedAddress, dispatch),
        changeFieldValue: function (field, value) {
          dispatch(change('newAddress', field, value))
        }
      }
    }
)(newAddressView);
