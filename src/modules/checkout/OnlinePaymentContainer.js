import React, {Component} from "react";
import {Dimensions, FlatList, StyleSheet, Text, View, WebView, Platform} from "react-native";
import IconFa from "react-native-vector-icons/FontAwesome";
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

const {width, height} = Dimensions.get('window');
const equalWidth = (width / 2 ) - 2;

const returnUrl = 'https://bringmeapp.lk/appstatic/payment/success';
const cancelUrl = 'https://bringmeapp.lk/appstatic/payment/failed';
const notifyUrl = 'https://bringmeapp.lk/payhere/payment/response';
const checkoutUrl = 'https://www.payhere.lk/pay/checkout';
//const checkoutUrl = 'https://sandbox.payhere.lk/pay/checkout';
const merchantId = '211617';
//const merchantId = '1210685';

class OnlinePaymentView extends Component {
  static displayName = 'onlinepayment';
  drawer = {};
  static navigationOptions = ({navigation, screenProps}) => {
    const {params = {}} = navigation.state;
    return {
      title: (<HeaderText>Online Payment</HeaderText>),
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
      paymentFlowCompleted: false
    };
  }

  static propTypes = {
    navigate: PropTypes.func.isRequired,
  };

  tryAgain = () => {
    this.setState({paymentFlowCompleted : false});
  }

  goToOrders = () => {
    this.props.clearCart();
  }

  componentDidMount() {
    goBack = this.goBack;
    this.props.setPaymentSuccess(false);
  }

  onPaymentSuccess = () => {
    this.props.setPaymentSuccess(true);
    this.setState({paymentSuccess: true, paymentFlowCompleted: true});
  }

  onPaymentFailed = () => {
    this.props.setPaymentSuccess(false);
    this.setState({paymentSuccess: false, paymentFlowCompleted: true});
  }

  onCheckoutNavigationEvent = (url) => {
    if(url.startsWith('http')) {
      if (url.includes(returnUrl)) {
        this.onPaymentSuccess()
      } else if (url.includes(cancelUrl)) {
        this.onPaymentFailed()
      }
    }
  }

  render() {

    let {grandTotal, orderId, address, personalInfo} = this.props;

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

    let checkoutHtml =`
      <body>
        <form name="payherecheckoutform" method="post" action="${checkoutUrl}">
        	<input type="hidden" name="order_id" value="${orderId}">
            <input type="hidden" name="amount" value="${grandTotal}">
            <input type="hidden" name="merchant_id" value="${merchantId}">
            <input type="hidden" name="return_url" value="${returnUrl}">
            <input type="hidden" name="cancel_url" value="${cancelUrl}">
            <input type="hidden" name="notify_url" value="${notifyUrl}">
            <input type="hidden" name="first_name" value="${personalInfo.firstName}">
            <input type="hidden" name="last_name" value="${personalInfo.lastName}">
            <input type="hidden" name="email" value="${personalInfo.email}">
            <input type="hidden" name="phone" value="${personalInfo.mobileNumber}">
            <input type="hidden" name="address" value="${address.street[1]}">
            <input type="hidden" name="city" value="${address.city}">
            <input type="hidden" name="country" value="Sri Lanka">
            <input type="hidden" name="items" value="BringMe Order">
            <input type="hidden" name="currency" value="LKR">
            <?php echo $optional_params; ?>
        </form>
        <script type="text/javascript">
          document.payherecheckoutform.submit();
        </script>
      </body>`

    return (
        <View style={{flex: 1, flexDirection: 'column', backgroundColor: 'white', paddingHorizontal:2}}>
           <WebView source={{html: checkoutHtml}} scalesPageToFit={false}
             onNavigationStateChange={(navEvent)=> this.onCheckoutNavigationEvent(navEvent.url)}
             />
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
)(OnlinePaymentView);
