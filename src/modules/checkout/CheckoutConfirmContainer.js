import React, {Component} from "react";
import {Alert, Platform, StyleSheet, Text, View, Dimensions, FlatList, PixelRatio, ScrollView} from "react-native";
import IconFa from "react-native-vector-icons/FontAwesome";
import PropTypes from "prop-types";
import {NavigationActions} from "react-navigation";
import {Field, reduxForm} from "redux-form/immutable";
import FormInput from "../../components/FormInput";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {createOrder, loadDeliveryTimeSlots, resetMeatOnPoya, applyCouponCode} from "./Actions";
import Button from "../../components/Button";
import RadioButton from "../../components/RadioButton";
import { RadioButtons } from 'react-native-radio-buttons'
import Modal from 'react-native-modalbox';
import {SceneMap, TabBar, TabViewAnimated} from "react-native-tab-view";
import Spinner from "react-native-loading-spinner-overlay";
import moment from 'moment';
import AppText from "../../components/AppText";
import AppStyles from "../../constants/styles";
import HeaderText from "../../components/HeaderText";
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const isShortScreen = windowHeight * PixelRatio.get() <= 1200

class CheckoutConfirmView extends Component {
  static displayName = 'chekoutConfirm';
  drawer = {};
  static navigationOptions = ({navigation, screenProps}) => {
    const {params = {}} = navigation.state;
    return {
      title: (<HeaderText>Checkout</HeaderText>),
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
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginRight:10}}>
            <IconFa name='circle-thin' style={{color: '#fff',   marginLeft: 5, fontSize: 8, fontWeight: '600'}}/>
            <IconFa name='circle-thin' style={{color: '#fff',   marginLeft: 5, fontSize: 8, fontWeight: '600'}}/>
            <IconFa name='circle' style={{color: '#fff',   marginLeft: 5, fontSize: 8, fontWeight: '600'}}/>
          </View>
      ),
    };
  };

  static goBack;

  constructor(props){
    super(props);
    this.state = {
      index: 0,
      routes: [
        { key: 'today', title: 'Today' },
        { key: 'tomorrow', title: 'Tomorrow' },
      ],
      paymentOption: {value: 'cashondelivery', label: 'Cash on Delivery'},
      deliveryOption: null,
    };
  }

  static propTypes = {
    navigate: PropTypes.func.isRequired,
  };

  _handleIndexChange = index => {
    this.setState({ index });
  };

  _renderHeader = props => <TabBar {...props} style={{backgroundColor: '#FEBC11'}} />;

  renderDeliveryTimeSlotTab = (deliveryOptions) => {

    if(this.props.timeSlotsLoading){
      return(
        <View style={{flex: 1, flexDirection: 'column'}}>
          <Spinner visible={this.props.timeSlotsLoading} textStyle={{color: '#FFF'}}/>
        </View>
      )
    }

    return (<View style={{padding: 15, flexDirection:'column', flex: 1}}>
      <RadioButtons
        options={deliveryOptions}
        onSelection={ (deliveryOption)=>{this.setState({deliveryOption})} }
        testOptionEqual={(selectedOption, option) => selectedOption ? selectedOption.id === option.id : false}
        selectedOption={this.state.deliveryOption}
        renderOption={ (option, selected, onSelect, index)=>
          {
            let maxDateTimeString = option.timeLabel.substr(0, 8);
            let maxHours = maxDateTimeString.split(':')[0];
            let minutesAndEve = maxDateTimeString.split(':')[1];
            let maxMinutes = minutesAndEve.split(' ')[0];
            let eve = minutesAndEve.split(' ')[1];
            let maxDateTime = moment();
            maxDateTime = maxDateTime.format('dddd') === option.day ? maxDateTime : maxDateTime.add(1, 'days');
            maxDateTime.set({hour: (eve === 'PM' && maxHours != 12) ? ((parseInt(maxHours)) + 12) : (parseInt(maxHours)) , minutes: maxMinutes - this.props.minutesBeforeTimeSlotDeactivation});

            const style = selected ? { fontWeight: 'bold'} : {};
            return (<RadioButton style={{ borderBottomWidth: 1, borderBottomColor:'#EEE', paddingBottom:7, paddingTop:7}} onPress={onSelect} selected={selected} disabled={maxDateTime.isBefore(moment()) || parseInt(option.order_count) >= parseInt(option.quota)} key={option.timeLabel + option.day} text={option.timeLabel}></RadioButton>)
          }
        }
        renderContainer={ (optionNodes)=>(
          <FlatList style={{flex:1, backgroundColor: '#FFF'}}
            data={deliveryOptions}
            keyExtractor={item => item.id}
            renderItem={({item, index}) =>
              {
                  return optionNodes[index];
              }
            }
            ListFooterComponent={()=>{
              return (<View>{optionNodes.every((option)=> option.props.disabled) && <View style={{backgroundColor: AppStyles.color.secondary, marginTop: 5}}>
                  <AppText style={{textAlign: 'center', padding: 12, fontSize: 16, color: 'white'}}>Please Select another day</AppText>
                  {deliveryOptions.every((option)=> parseInt(option.order_count) >= parseInt(option.quota)) && <AppText style={{textAlign: 'center', padding: 12, paddingTop: 0, fontSize: 16, color: 'white'}}>Daily Quota is Full</AppText>}
                </View>}</View>)
            }}
          />
        )}
      />
    </View>
    )
  }

  _renderScene = ({ route }) => {
    let today = moment();
    let tomorrow = moment().add(1,'days');;
    switch (route.key) {
    case 'today':
      return this.renderDeliveryTimeSlotTab(this.props.timeSlots[today.format('dddd')]);
    case 'tomorrow':
      return this.renderDeliveryTimeSlotTab(this.props.timeSlots[tomorrow.format('dddd')])
    default:
      return null;
    }
  }

  _goBack = () => {
    this.props.navigation.dispatch(NavigationActions.back())
  }

  componentDidMount() {
    goBack = this._goBack;
  }

  createOrder = () => {
    if(this.state.deliveryOption){
      let today = moment();
      let tomorrow = moment().add(1, 'days');
      this.props.createOrder({paymentOption: this.state.paymentOption, deliveryOption: this.state.deliveryOption, deliveryDate: this.state.deliveryOption.day === moment().format('dddd') ? today.format('YYYY-MM-DD') : tomorrow.format('YYYY-MM-DD')})
    }else{
      alert('Please select a delivery time.')
    }
  }

  render() {
    let subTotal = this.props.subTotal.toFixed(2);
    let deliveryFee = this.props.deliveryFee.toFixed(2);
    let totalPayable = this.props.grandTotal.toFixed(2);
    let discount = this.props.discount.toFixed(2);
    const {couponCodeLoading, handleSubmit, pristine, mobileNumber, createOrder, persistingOrder, meatOnPoya, resetMeatOnPoya, couponCode, isCouponValid, shippingMethodCode} = this.props;

    if (!this.alertPresent && meatOnPoya) {
      setTimeout(()=>{
        Alert.alert('Delivery Date is a Poya', 'Meat Products are not allowed to be delivered on poya days.', [{
          text: 'Cart',
          onPress: () => {
            resetMeatOnPoya();
            setTimeout(()=>{
              this.alertPresent = false;
            }, 500);
            this.props.navigation.dispatch(NavigationActions.reset({
              index: 1,
              key: null,
              actions: [
                  NavigationActions.navigate({ routeName: 'Home'}),
                  NavigationActions.navigate({ routeName: 'Cart'}),
              ]
            }))
          }
        },
        {
          text: 'Change Date',
          onPress: () => {
            resetMeatOnPoya();
            setTimeout(()=>{
              this.alertPresent = false;
            }, 500)
          }
        }]);
        this.alertPresent = true;
      }, 100);
    }

    if (!this.alertPresent && couponCode && !couponCodeLoading && !isCouponValid) {
      setTimeout(()=>{
        Alert.alert('Coupon code is invalid', '', [{
          text: 'OK',
          onPress: () => {
            setTimeout(()=>{
              this.alertPresent = false;
              this.props.applyCouponCode('');
            }, 500);
          }
        }]);
      }, 100);
      this.alertPresent = true;
    }

    return (
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between'}}>
          <ScrollView>
            {!!persistingOrder && <Spinner visible={persistingOrder} textStyle={{color: '#FFF'}}/>}
            {!!couponCodeLoading && <Spinner visible={couponCodeLoading} textStyle={{color: '#FFF'}}/>}
            <View style={{flex: 1, flexDirection: 'column'}}>
              <View style={{flexDirection: 'row', width: '100%', alignItems: 'center'}}>
                <AppText style={[styles.checkoutDetailSubTitle, {flex: 1}]}>Amount Payable</AppText>
                <Button style={{margin: 5, marginBottom: 10, marginTop: 10}} onPress={ () => {
                  this.openCouponCodeDialog();
                }}>
                  <View style={{
                  height: 25,
                  padding: 5,
                    marginRight: 5,
                  backgroundColor: AppStyles.color.secondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 5,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.8,
                  shadowRadius: 2}}>
                    {!!couponCode && isCouponValid && <AppText style={{fontSize: 12, fontWeight: '500', width: '100%', color: 'white', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>Coupon Code : {couponCode}</AppText>}
                    {(!couponCode || !isCouponValid) && <AppText style={{fontSize: 12, fontWeight: '500', width: '100%', color: 'white', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>Enter Coupon Code</AppText>}
                  </View>
                </Button>
              </View>
              <View style={styles.checkoutDetailTextRow}>
                <AppText style={[styles.checkoutDetailStrongText]}>Total</AppText>
                <AppText style={styles.checkoutDetailStrongTextAmount}>Rs. {subTotal}</AppText>
              </View>
              <View style={styles.checkoutDetailTextRow}>
                <AppText style={[styles.checkoutDetailStrongText]}>Delivery Fee</AppText>
                <AppText style={styles.checkoutDetailStrongTextAmount}>{deliveryFee === 0 ? 'Free' : ('Rs. ' + deliveryFee)}</AppText>
              </View>
              <View style={styles.checkoutDetailTextRow}>
                <AppText style={[styles.checkoutDetailStrongText]}>Discount</AppText>
                <AppText style={styles.checkoutDetailStrongTextAmount}>Rs. {discount}</AppText>
              </View>
              <View style={styles.checkoutDetailTextRow}>
                <AppText style={[styles.checkoutDetailStrongText]}>Payable</AppText>
                <AppText style={styles.checkoutDetailStrongTextAmount}>Rs. {totalPayable}</AppText>
              </View>
              {(deliveryFee != 0 && shippingMethodCode !== 'tieredshipping') && <View style={{backgroundColor: '#58B44B', margin: 7}}>
                <AppText style={{color: 'white',padding: 10, textAlign: 'center'}}>
                Free delivery for orders over Rs. 1,500
                </AppText>
              </View>}
              <AppText style={styles.checkoutDetailSubTitle}>Delivery Time</AppText>
              <View style={styles.checkoutDetailButtonRow}>
                <Button style={styles.deliveryTimeButtonWrapper} onPress={() => {
                  this.openDeliveryTimeDialog();
                }}>
                  <View style={styles.deliveryTimeButtonView}>
                    {this.state.deliveryOption ?
                      <View style={{alignItems:'center', justifyContent: 'center'}}>
                        <AppText style={{color: 'white', fontSize: 14}}>{this.state.deliveryOption.day === moment().format('dddd') ? 'TODAY' : 'TOMORROW'}</AppText>
                        <AppText style={{color: 'white', fontSize: 14}}>{this.state.deliveryOption.timeLabel}</AppText>
                      </View>
                        :
                      <AppText style={styles.deliveryTimeButtonText}>Choose a delivery time</AppText>
                    }
                  </View>
                </Button>
              </View>
              <AppText style={styles.checkoutDetailSubTitle}>Payment Option</AppText>
              <View style={[styles.checkoutDetailButtonRow]}>
                <RadioButtons
                  options={[
                    {value: 'cashondelivery', label: 'Cash On Delivery'},
                    {value: 'cardondelivery', label: 'Card On Delivery'},
                    {value: 'payhere', label: 'Online Payment'},
                    {value: 'frimi', label: 'FriMi'},
                    {value: 'upay', label: 'UPay'}
                  ]}
                  onSelection={ (paymentOption)=>{
                    this.setState({paymentOption})
                    if(paymentOption.value === 'cardondelivery' && isShortScreen){
                      alert("Only Master and VISA cards are accepted on 'Card on Delivery'");
                    }
                  }}
                  selectedOption={this.state.paymentOption }
                  testOptionEqual={(selectedOption, option) => selectedOption.value === option.value}
                  renderOption={ (option, selected, onSelect, index)=>
                    {
                      const style = selected ? { fontWeight: 'bold'} : {};
                      return (<RadioButton style={{paddingTop: 7, paddingBottom: 7, width: '50%'}} onPress={onSelect} selected={selected} key={option.value} text={option.label}></RadioButton>)
                    }
                  }
                  renderContainer={ (optionNodes)=>(<View style={{flexDirection: 'row', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between'}}>{optionNodes}</View>) }
                />
              {!isShortScreen && this.state.paymentOption.value == 'cardondelivery' && <View style={{backgroundColor: '#58B44B', margin: 7}}>
                  <AppText style={{color: 'white',padding: 5, textAlign: 'center'}}>
                    Only Master and VISA cards are accepted on 'Card on Delivery'
                  </AppText>
                </View>}
              </View>
            </View>
          </ScrollView>
          <Button style={styles.placeOrderButtonWrapper} onPress={this.createOrder}>
            <View style={styles.placeOrderButtonView}>
              <AppText style={styles.placeOrderButtonText}>Place Order</AppText>
            </View>
          </Button>
          <Modal position={'center'} ref={'deliveryTimeModal'} style={{width:'90%',height:'75%'}}>
            <View style={{flex: 1, paddingTop: 15}}>
              <View style={{flex: 1}}>
                <AppText style={{fontSize: 18, fontWeight: '500', textAlign: 'center'}}>Select Time Slot</AppText>
                <View style={{height: 1, width: '100%', backgroundColor: 'grey', marginTop: 10}}></View>
                <TabViewAnimated
                        style={{flex:1}}
                        navigationState={this.state}
                        renderScene={this._renderScene}
                        renderHeader={this._renderHeader}
                        onIndexChange={this._handleIndexChange}
                        initialLayout={this.initialLayout}
                      />
              </View>

              <Button onPress={this.closeDeliveryTimeDialog}>
                <View style={styles.placeOrderButtonView}>
                  <AppText style={styles.placeOrderButtonText}>Confirm</AppText>
                </View>
              </Button>
            </View>
          </Modal>
          <Modal position={'center'} ref={'couponCodeModal'} style={{width:'90%', height: 150}}>
          <View style={{flex: 1, paddingTop: 15}}>
            <View style={{flex: 1}}>
              <AppText style={{fontSize: 18, fontWeight: '500', textAlign: 'center', marginBottom: 5}}>Enter Coupon Code</AppText>
              <Field name={'couponCode'} style={styles.formInput} component={FormInput} autoCorrect={false} underlineColorAndroid='rgba(0,0,0,0.0)'/>
            </View>
            <Button onPress={this.applyCartCouponCode}>
              <View style={styles.placeOrderButtonView}>
                <AppText style={styles.placeOrderButtonText}>Apply</AppText>
              </View>
            </Button>
          </View>
        </Modal>
        </View>
    );
  }

  initialLayout = {
    height: 0,
    width: windowWidth,
  };

  selectPaymentType = (paymentType) => {

  }

  selectDeliveryTime = () => {

  }

  closeDeliveryTimeDialog = () => {
    this.refs.deliveryTimeModal.close();
  }

  openDeliveryTimeDialog = () => {
    this.props.loadDeliveryTimeSlots();
    this.refs.deliveryTimeModal.open();
  }

  openCouponCodeDialog = () => {
    this.refs.couponCodeModal.open();
  }

  applyCartCouponCode = () => {
    this.refs.couponCodeModal.close();
    setTimeout(()=>{
      this.props.handleSubmit(this.submitCouponCode)()
    }, 500)
  }

  submitCouponCode = (values) => {
    this.props.applyCouponCode(values.get('couponCode'));
  }

  placeOrder = () => {

  }

}


const styles = StyleSheet.create({
  radioButton: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems:'center'
  },
  formInput: {
    margin: 10,
    textAlign: 'center',
    borderRadius: 3,
    paddingLeft: 5,
    paddingRight: 5,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DAE3E3',
    color: 'black',
    paddingVertical: Platform.OS === 'android' ? 3 : 7
  },
  radioButtonText: {
    color: 'grey',
    marginLeft: 5
  },
  button: {
    width: 200,
    height: 40,
    backgroundColor: '#006ecb',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  placeOrderButton: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'center'
  },
  checkoutDetailTextRow: {
    backgroundColor: 'white',
    marginLeft: 5,
    marginRight: 5,
    padding: 7,
    paddingRight: 20,
    flexDirection: 'row'
  },
  checkoutDetailButtonRow: {
    backgroundColor: 'white',
    marginLeft: 5,
    marginRight: 5,
    padding: 7,
  },
  checkoutDetailText: {
    fontSize: 16,
    fontWeight: '100',
    color: 'grey',
    width: '50%'
  },
  checkoutDetailStrongText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'grey',
    width: '50%'
  },
  checkoutDetailStrongTextAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: 'grey',
    width: '50%',
    textAlign: 'right'
  },
  checkoutDetailSubTitle: {
    marginTop: 12,
    color: 'grey',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 12,
    marginBottom: 5
  },
  placeOrderButtonWrapper: {
    backgroundColor:'white',
    padding: 10,
    marginTop: 5
  },
  placeOrderButtonView: {
    flexDirection: 'row',
    height: 45,
    backgroundColor: AppStyles.color.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeOrderButtonText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 16,
    flex: 1,
    textAlign: 'center'
  },
  deliveryTimeButtonWrapper: {
    backgroundColor:'white',
    padding: 7,
    paddingLeft: 30,
    paddingRight: 30,
  },
  deliveryTimeButtonView: {
    flexDirection: 'row',
    height: 45,
    backgroundColor: AppStyles.color.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  deliveryTimeButtonText: {
    color: AppStyles.color.textAccent,
    fontSize: 14,
    textAlign: 'center'
  }
});

const checkoutConfirmView = reduxForm({form: 'checkoutConfirm'})(CheckoutConfirmView);

export default connect(
    state => ({
      grandTotal: state.getIn(['checkout', 'grandTotal']),
      shippingMethodCode: state.getIn(['checkout', 'shippingMethodCode']),
      subTotal: state.getIn(['checkout', 'subTotal']),
      discount: state.getIn(['checkout', 'discount']),
      deliveryFee: state.getIn(['checkout', 'deliveryFee']),
      persistingOrder: state.getIn(['checkout', 'persistingOrder']),
      timeSlotsLoading: state.getIn(['checkout', 'timeSlotsLoading']),
      couponCodeLoading: state.getIn(['checkout', 'couponCodeLoading']),
      timeSlots: state.getIn(['checkout', 'timeSlots']),
      couponCode: state.getIn(['checkout', 'couponCode']),
      isCouponValid: state.getIn(['checkout', 'isCouponValid']),
      meatOnPoya: state.getIn(['checkout', 'meatOnPoya']),
      minutesBeforeTimeSlotDeactivation: state.getIn(['home', 'minutesBeforeTimeSlotDeactivation']),
    }),
    dispatch => {
      return {
        createOrder: bindActionCreators(createOrder, dispatch),
        applyCouponCode: bindActionCreators(applyCouponCode, dispatch),
        resetMeatOnPoya: bindActionCreators(resetMeatOnPoya, dispatch),
        loadDeliveryTimeSlots: bindActionCreators(loadDeliveryTimeSlots, dispatch),
        navigate: bindActionCreators(NavigationActions.navigate, dispatch)
      }
    }
)(checkoutConfirmView);
