import React, { Component } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  TextInput,
  View,
  Image,
  ActivityIndicator
} from "react-native";
import IconFa from "react-native-vector-icons/FontAwesome";
import IconEv from "react-native-vector-icons/EvilIcons";
import PropTypes from "prop-types";
import { NavigationActions } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Button from "../../components/Button";
import { createQuote, clearCart } from "../cart/Actions";
import { cancelOrder, setPaymentSuccess } from "../checkout/Actions";
import AppText from "../../components/AppText";
import AppStyles from "../../constants/styles";
import HeaderText from "../../components/HeaderText";
import PaymentCancelButton from "../../components/PaymentCancelButton";
import Spinner from "react-native-loading-spinner-overlay";
import crypto from "crypto-js";

const { width, height } = Dimensions.get("window");
const equalWidth = width / 2 - 2;

const paymentStartUrl =
  "https://bringmeapp.lk/frimi/payment/start";
//const paymentStartUrl = 'http://';
const paymentStatusCheckUrl =
  "https://bringmeapp.lk/frimi/payment/start";
//const paymentStatusCheckUrl = '';

class FriMiPaymentView extends Component {
  static displayName = "FriMiPayment";
  drawer = {};
  static navigationOptions = ({ navigation, screenProps }) => {
    const { params = {} } = navigation.state;
    return {
      title: <HeaderText>Payment using FriMi</HeaderText>,
      headerTitleStyle: {
        width: "100%",
        color: "#fff"
      },
      headerLeft: <View />,
      headerRight: <PaymentCancelButton />,
      headerStyle: {
        backgroundColor: "#FEBC11",
        elevation: 0
      }
    };
  };

  paymentStates = {
    enterDetails: "Enter Details",
    waitForRequest: "Starting Payment",
    waitForConfirm: "Wating for Confirmation",
    paymentFinished: "Payment Finished"
  };

  checkHandle = null;

  constructor(props) {
    super(props);
    this.state = {
      paymentState: this.paymentStates.enterDetails,
      paymentSuccess: false,
      frimiId: "",
      frimiMobile: "",
      error: ""
    };
  }

  static propTypes = {
    navigate: PropTypes.func.isRequired
  };

  componentDidUpdate(prevProps, prevState) {
    let { paymentState } = this.state;
    if (
      paymentState === this.paymentStates.waitForConfirm &&
      prevState.paymentState !== this.paymentStates.waitForConfirm
    ) {
      this.checkHandle = setInterval(() => {
        this.checkPayment();
      }, 5000);
    } else if (paymentState !== this.paymentStates.waitForConfirm) {
      clearInterval(this.checkHandle);
    }
  }

  onFrimiIdChange = val => {
    this.setState({ frimiId: val, error: "" });
  };

  onFrimiMobileChange = val => {
    this.setState({ frimiMobile: val, frimiId: val, error: "" });
  };

  tryAgain = () => {
    this.setState({ paymentState: this.paymentStates.enterDetails });
  };

  goToOrders = () => {
    this.props.clearCart();
  };

  componentDidMount() {
    goBack = this.goBack;
    this.props.setPaymentSuccess(false);
  }

  onPaymentSuccess = () => {
    this.props.setPaymentSuccess(true);
    this.setState({
      paymentSuccess: true,
      paymentState: this.paymentStates.paymentFinished
    });
  };

  onPaymentFailed = () => {
    this.props.setPaymentSuccess(false);
    this.setState({
      paymentSuccess: false,
      paymentState: this.paymentStates.paymentFinished
    });
  };

  frimiCheckPayment = async ({
    frimiId,
    frimiMobile,
    orderId,
    requestType
  }) => {
    const body = {
      frimiId,
      frimiMobile,
      orderId,
      requestType
    };

    try {
      let response = await fetch(paymentStatusCheckUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      console.log(response);
      return { error: "", response: await response.json() };
    } catch (e) {
      return { error: e.message };
    }
  };

  checkPayment = async () => {
    const { frimiId, frimiMobile } = this.state;
    const { orderId } = this.props;
    let responseObj = await this.frimiCheckPayment({
      frimiId,
      frimiMobile,
      orderId,
      requestType: "check"
    });
    try {
      let words = crypto.enc.Base64.parse(responseObj.response.data.body);
      let textString = crypto.enc.Utf8.stringify(words);
      let frimiResponseBody = JSON.parse(textString);

      console.log(frimiResponseBody);
      if (frimiResponseBody.txn_code === "00") {
        this.onPaymentSuccess();
      } else {
        if (frimiResponseBody.txn_code === "-1") {
          this.onPaymentFailed();
        } else {
        }
      }
    } catch (e) {
      console.log(e)
      // this.setState({
      //   paymentState: this.paymentStates.enterDetails,
      //   error: "Error occured. Please try again."
      // });
    }
  };

  frimiStartPayment = async ({ frimiId, frimiMobile, orderId }) => {
    const body = {
      frimiId,
      frimiMobile,
      orderId
    };
    try {
      let response = await fetch(paymentStartUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      console.log(response);
      return { error: "", response: await response.json() };
    } catch (e) {
      return { error: e.message };
    }
  };

  startPayment = async () => {
    let sriLankaPattern = /^\d{9}$/;
    let sriLankaPattern2 = /^\d{10}$/;
    let { frimiId, frimiMobile } = this.state;
    let { orderId } = this.props;
    if (!frimiId || !frimiMobile) {
      this.setState({
        error: "Please enter both numbers."
      });
      return;
    } else {
      if (
        !frimiMobile.match(sriLankaPattern) &&
        !frimiMobile.match(sriLankaPattern2)
      ) {
        this.setState({
          error: "Invalid mobile number."
        });
        return;
      }
    }
    this.setState({ paymentState: this.paymentStates.waitForRequest });
    this.props.setPaymentSuccess(true);
    let responseObj = await this.frimiStartPayment({
      frimiId,
      frimiMobile,
      orderId
    });
    console.log(responseObj);
    try {
      let words = crypto.enc.Base64.parse(responseObj.response.data.body);
      let textString = crypto.enc.Utf8.stringify(words);
      let frimiResponseBody = JSON.parse(textString);

      console.log(frimiResponseBody);
      if (frimiResponseBody.txn_code === "01") {
        this.setState({ paymentState: this.paymentStates.waitForConfirm });
      } else {
        if (
          frimiResponseBody.description ===
          "Rejected - request_id already exist"
        ) {
          this.setState({ paymentState: this.paymentStates.waitForConfirm });
        } else {
          this.setState({
            paymentState: this.paymentStates.enterDetails,
            error: frimiResponseBody.description
          });
        }
      }
    } catch (e) {
      this.setState({
        paymentState: this.paymentStates.enterDetails,
        error: "Error occured. Please try again."
      });
    }
  };

  cancel = () => {
    const { cancelOrder, orderId } = this.props;
    cancelOrder(orderId, true);
  }

  render() {
    let { grandTotal, orderId, address, personalInfo } = this.props;
    let { error } = this.state;
    let innerLayout = null;

    if (
      this.state.paymentState === this.paymentStates.enterDetails ||
      this.state.paymentState == this.paymentStates.waitForRequest
    ) {
      innerLayout = (
        <View style={{ width: "100%", alignItems: "center" }}>
          <HeaderText style={{ marginTop: 30, fontSize: 16 }}>Enter FriMi ID or Mobile Number</HeaderText>
          <TextInput
            placeholder="FriMi ID or Mobile Number"
            style={styles.textInput}
            onChangeText={this.onFrimiMobileChange}
            disabled={
              this.state.paymentState == this.paymentStates.waitForRequest
            }
          />
          {!!error && (
            <AppText style={{ color: "red", fontSize: 14, marginTop: 10 }}>
              {error}
            </AppText>
          )}
          <Button
            style={{ width: "80%", marginTop: 40, marginBottom: 15 }}
            onPress={this.startPayment}
            disabled={
              this.state.paymentState == this.paymentStates.waitForRequest
            }
          >
            <View style={styles.secondaryButton}>
              <AppText
                style={{
                  color: "white"
                }}
              >
                Proceed
              </AppText>
            </View>
          </Button>
          {this.state.paymentState == this.paymentStates.waitForRequest && (
            <Spinner
              visible={
                this.state.paymentState == this.paymentStates.waitForRequest
              }
              textStyle={{ color: "#FFF" }}
            />
          )}
        </View>
      );
    } else if (this.state.paymentState === this.paymentStates.waitForConfirm) {
      innerLayout = (
        <View style={{ alignItems: "center" }}>
          <ActivityIndicator
            size="large"
            animating={true}
            color="green"
            style={{ marginVertical: 20 }}
          />
          <HeaderText>Waiting for Confirmation</HeaderText>
          <Image
            source={{ uri: "https://www.frimi.lk/api/img_mobile.png" }}
            style={{ width: width - 60, height: 300, marginVertical: 20 }}
            resizeMode="contain"
          />
        </View>
      );
    } else if (this.state.paymentState === this.paymentStates.paymentFinished) {
      innerLayout = (
        <View>
          {!!this.state.paymentSuccess && (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <AppText
                style={{
                  color: "black",
                  backgroundColor: "transparent",
                  textAlign: "center",
                  marginTop: "20%",
                  fontSize: 20
                }}
              >
                Payment Successful!
              </AppText>
              <AppText
                style={{
                  color: "black",
                  backgroundColor: "transparent",
                  textAlign: "center",
                  marginTop: 10,
                  fontSize: 20
                }}
              >
                Order Placed
              </AppText>
              <IconEv
                name="check"
                style={{
                  color: "orange",
                  backgroundColor: "transparent",
                  fontSize: 100,
                  textAlign: "center",
                  marginTop: 25,
                  marginBottom: 20
                }}
              />
              <Button onPress={this.goToOrders} style={{ width: "80%" }}>
                <View style={styles.button}>
                  <AppText
                    style={{
                      color: "white"
                    }}
                  >
                    View Orders
                  </AppText>
                </View>
              </Button>
            </View>
          )}
          {!this.state.paymentSuccess && (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <AppText
                style={{
                  color: "black",
                  backgroundColor: "transparent",
                  textAlign: "center",
                  marginTop: "20%",
                  fontSize: 20
                }}
              >
                Payment Failed!
              </AppText>
              <IconEv
                name="close-o"
                style={{
                  color: "red",
                  backgroundColor: "transparent",
                  fontSize: 100,
                  textAlign: "center",
                  marginTop: 25
                }}
              />
              <Button
                onPress={this.cancel}
                style={{ width: "80%", marginTop: 20 }}
              >
                <View style={styles.secondaryButton}>
                  <AppText
                    style={{
                      color: "white"
                    }}
                  >
                    Back to Cart
                  </AppText>
                </View>
              </Button>
            </View>
          )}
        </View>
      );
    } else {
      innerLayout = <View />;
    }

    return (
      <View style={{ flexDirection: "row", marginTop: 10, padding: 20 }}>
        <View
          style={{
            flexDirection: "column",
            padding: 20,
            backgroundColor: "white",
            flex: 1,
            alignItems: "center"
          }}
        >
          <Image
            source={{ uri: "https://www.frimi.lk/Images/frimi_logo.png" }}
            style={{ width: 100, height: 50 }}
          />
          {innerLayout}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  successTitle: {
    fontSize: 19,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 30,
    color: "black"
  },
  button: {
    height: 40,
    padding: 10,
    backgroundColor: "#58B44B",
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center"
  },
  secondaryButton: {
    height: 40,
    padding: 10,
    backgroundColor: AppStyles.color.secondary,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center"
  },
  textInput: {
    marginTop: 20,
    borderColor: AppStyles.color.background,
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 3,
    padding: 10,
    width: "100%",
    fontSize: 18
  }
});

export default connect(
  state => ({
    items: state.getIn(["cart", "items"]),
    address: state.getIn(["checkout", "address"]),
    personalInfo: state.getIn(["checkout", "personalInfo"]),
    orderId: state.getIn(["checkout", "orderId"]),
    grandTotal: state.getIn(["checkout", "grandTotal"])
  }),
  dispatch => {
    return {
      navigate: bindActionCreators(NavigationActions.navigate, dispatch),
      createQuote: bindActionCreators(createQuote, dispatch),
      clearCart: bindActionCreators(clearCart, dispatch),
      cancelOrder: bindActionCreators(cancelOrder, dispatch),
      setPaymentSuccess: bindActionCreators(setPaymentSuccess, dispatch)
    };
  }
)(FriMiPaymentView);
