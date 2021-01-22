import React, {Component} from "react";
import {Dimensions, FlatList, StyleSheet, Text, View, WebView, Platform} from "react-native";
import IconEv from "react-native-vector-icons/EvilIcons";
import PropTypes from "prop-types";
import {NavigationActions} from "react-navigation";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Button from '../../components/Button'
import {createQuote, clearCart} from "../cart/Actions";
import {cancelOrder, setPaymentSuccess} from "../checkout/Actions";
import AppText from "../../components/AppText";
import AppStyles from "../../constants/styles";
import HeaderText from "../../components/HeaderText";
import PaymentCancelButton from "../../components/PaymentCancelButton";
import Spinner from "react-native-loading-spinner-overlay";

const {width, height} = Dimensions.get('window');
const equalWidth = (width / 2 ) - 2;
import crypto from 'crypto-js';
import { get } from "../../utils/api";

const returnUrl = 'https://bringmeapp.lk/appstatic/payment/success';
const cancelUrl = 'https://bringmeapp.lk/appstatic/payment/failed';
const notifyUrl = 'https://bringmeapp.lk/upay/payment/response';
// const checkoutUrl = 'https://www.payhere.lk/pay/checkout';
const checkoutUrl = 'https://ipg.upay.lk/v1/make-payment';
// const merchantId = '211617';
const serviceCode = 'R0249-MS2-MPS1';
const merchantName = 'BringMe';
const secretKey = 'QnJpbmdtZUxpdmU=';

class UPayPaymentView extends Component {
  static displayName = 'FriMiPayment';
  drawer = {};
  static navigationOptions = ({navigation, screenProps}) => {
    const {params = {}} = navigation.state;
    return {
      title: (<HeaderText>Pay with UPay</HeaderText>),
      headerTitleStyle: {
        width: '100%',
        color: '#fff',
      },
      headerLeft: (<View></View>),
      headerRight: (<PaymentCancelButton />),
      headerStyle: {
        backgroundColor: '#FEBC11',
        elevation: 0
      },
    };
  };

  static cancel;

  constructor(props) {
    super(props);
    cancel = this.cancel;
    this.state = {
      paymentSuccess: false,
      paymentFlowCompleted: false,
      paymentSignatureHMAC: '',
      isLoading: false
    };
  }

  static propTypes = {
    navigate: PropTypes.func.isRequired,
  };

  tryAgain = () => {
    this.setState({paymentFlowCompleted : false, isLoading: false});
  }

  goToOrders = () => {
    this.props.clearCart();
  }

  componentDidMount() {
    let {grandTotal, orderId } = this.props;
    goBack = this.goBack;
    this.props.setPaymentSuccess(false);
    let paymentSignature = `${serviceCode}|​bringme${orderId}​|​${grandTotal}|​LKR|​${returnUrl}|​${notifyUrl}|​${cancelUrl}`;
    console.log(paymentSignature)
    this.setState({paymentSignatureHMAC: crypto.HmacSHA256(paymentSignature, secretKey).toString()});
    this.setState({isLoading: false, paymentSignatureHMAC: crypto.HmacSHA256(`${serviceCode}|${orderId}|${grandTotal * 100}|LKR|${returnUrl}|${notifyUrl}|${cancelUrl}`, secretKey).toString()});
  }

  onPaymentSuccess = () => {
    this.props.setPaymentSuccess(true);
    this.setState({paymentSuccess: true, paymentFlowCompleted: true, isLoading: false});
  }

  onPaymentFailed = () => {
    this.props.setPaymentSuccess(false);
    this.setState({paymentSuccess: false, paymentFlowCompleted: true, isLoading: false});
  }

  onCheckoutNavigationEvent = (url) => {
    if(url.startsWith('http')) {
      if (url.includes(returnUrl)) {
        this.onUPayComplete();
      } else if (url.includes(cancelUrl)){
        this.onPaymentFailed();
      }
    }
  }

  retries = 0;

  onUPayComplete = async () => {
    const {orderId} = this.props;
    this.retries++;
    this.setState({isLoading: true})
    try {
      let response = await get(`orders/${orderId}`,
        true
      );
      if ( response.status === 'pending') {
        this.onPaymentSuccess();
      } else if ( response.status === 'pending_payment' || response.status === 'canceled') {
        this.onPaymentFailed();
      } else {
        if (this.retries > 5) {
          this.onPaymentFailed();
        } else {
          this.onUPayComplete();
        }
      }
    } catch (e) {
      if (this.retries > 5) {
        this.onPaymentFailed();
      } else {
        this.onUPayComplete();
      }
      return { error: e.message };
    }
  }

  cancel = () => {
    this.props.cancelOrder(this.props.orderId, true)
  }

  render() {

    let {grandTotal, orderId } = this.props;
    let {isLoading } = this.state;

    if(this.state.paymentFlowCompleted){
      return(
        <View style={{flex: 1, flexDirection: 'column', backgroundColor: 'white', paddingHorizontal:2}}>
          {!!this.state.paymentSuccess &&
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <AppText style={{color: 'black', backgroundColor: 'transparent', textAlign: 'center', marginTop: '20%', fontSize: 20}}>Payment Successful!</AppText>
              <AppText style={{color: 'black', backgroundColor: 'transparent', textAlign: 'center', marginTop: 10, fontSize: 20}}>Order Placed</AppText>
              <IconEv name='check' style={{color:'orange', backgroundColor: 'transparent', fontSize: 100, textAlign: 'center', marginTop: 25, marginBottom: 20}}/>
              <Button onPress={this.goToOrders} style={{width: '80%'}}>
                <View style={styles.button}>
                  <AppText style={{
                    color: 'white'
                  }}>View Orders</AppText>
                </View>
              </Button>
            </View>
          }
          {!this.state.paymentSuccess &&
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <AppText style={{color: 'black', backgroundColor: 'transparent', textAlign: 'center', marginTop: '20%', fontSize: 20}}>Payment Failed!</AppText>
              <IconEv name='close-o' style={{color:'red', backgroundColor: 'transparent', fontSize: 100, textAlign: 'center', marginTop: 25}}/>
              <Button onPress={this.cancel} style={{width: '80%', marginTop:20}}>
                <View style={styles.secondaryButton}>
                  <AppText style={{
                    color: 'white'
                  }}>Back to Cart</AppText>
                </View>
              </Button>
            </View>
          }
        </View>
      )
    }

    if ( isLoading ) {
      return <Spinner visible={isLoading} textStyle={{ color: "#FFF" }}/>
    }

    let checkoutHtml =`
      <body>
        <form name="upaycheckoutform" method="post" action="${checkoutUrl}">
        	<input type="hidden" name="service_code" value="${serviceCode}">
            <input type="hidden" name="total_amount" value="${grandTotal * 100}">
            <input type="hidden" name="merchant_txn_ref_no" value="${orderId}">
            <input type="hidden" name="return_url" value="${returnUrl}">
            <input type="hidden" name="cancel_url" value="${cancelUrl}">
            <input type="hidden" name="notify_url" value="${notifyUrl}">
            <input type="hidden" name="signature" value="${this.state.paymentSignatureHMAC}">
            <input type="hidden" name="currency" value="LKR">
        </form>
        <script type="text/javascript">
          document.upaycheckoutform.submit();
        </script>
      </body>`
    console.log(this.state.paymentSignatureHMAC)
    return (
        <View style={{flex: 1, flexDirection: 'column', backgroundColor: 'white', paddingHorizontal:2}}>
           {this.state.paymentSignatureHMAC &&
              <WebView source={{html: checkoutHtml}} scalesPageToFit={false}
                onNavigationStateChange={(navEvent)=> this.onCheckoutNavigationEvent(navEvent.url)}
             />
           }
        </View>
    );
  }
}

const styles = StyleSheet.create({
  successTitle: {
    fontSize:19,
    fontWeight:'600',
    marginTop:20,
    marginBottom:30,
    color:'black'
  },
  button: {
    height: 40,
    padding: 10,
    backgroundColor: '#58B44B',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center'
  },
  secondaryButton: {
    height: 40,
    padding: 10,
    backgroundColor: AppStyles.color.secondary,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default connect(
    state => ({
      items: state.getIn(['cart', 'items']),
      address: state.getIn(['checkout', 'address']),
      personalInfo: state.getIn(['checkout', 'personalInfo']),
      orderId: state.getIn(['checkout', 'orderId']),
      grandTotal: state.getIn(['checkout', 'grandTotal']),
    }),
    dispatch => {
      return {
        navigate: bindActionCreators(NavigationActions.navigate, dispatch),
        createQuote: bindActionCreators(createQuote, dispatch),
        clearCart: bindActionCreators(clearCart, dispatch),
        cancelOrder: bindActionCreators(cancelOrder, dispatch),
        setPaymentSuccess: bindActionCreators(setPaymentSuccess, dispatch)
      }
    }
)(UPayPaymentView);
