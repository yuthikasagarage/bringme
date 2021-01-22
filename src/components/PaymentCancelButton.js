import {Text, View,InteractionManager, Platform} from "react-native";
import React from "react";
import {Button} from "./Button";
import AppText from "./AppText";
import AppStyles from "../constants/styles";
import IconFa from "react-native-vector-icons/FontAwesome";
import { connect } from "react-redux";
import { cancelOrder, setPaymentSuccess } from "../modules/checkout/Actions";
import { bindActionCreators } from "redux";
import DeviceInfo from 'react-native-device-info';
import Spinner from "react-native-loading-spinner-overlay";

class PaymentCancelButton extends React.Component{

  constructor(props) {
    super(props);
  }

  cancel = () => {
    this.props.cancelOrder(this.props.orderId, true)
  }

  render() {
    const {paymentSuccess, cancelingOrder} = this.props;

    return !paymentSuccess ? (
      <View>
        <Button onPress={()=>{
          this.cancel();
        }}>
          <AppText style={{marginRight: 10, color: 'white'}}>Cancel</AppText>
        </Button>
        {cancelingOrder && <Spinner visible={cancelingOrder} textStyle={{ color: "#FFF" }}/>}
      </View>) :
      (<View></View>)
  }
}

export default connect(
  (state, props) => {
    return ({
      orderId: state.getIn(['checkout', 'orderId']),
      paymentSuccess: state.getIn(['checkout', 'paymentSuccess']),
      cancelingOrder: state.getIn(['checkout', 'cancelingOrder'])
    })
  },
  dispatch => {
    return {
      cancelOrder: bindActionCreators(cancelOrder, dispatch),
      setPaymentSuccess: bindActionCreators(setPaymentSuccess, dispatch),
    }
  }
)(PaymentCancelButton);
