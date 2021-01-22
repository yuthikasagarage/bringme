import {TextInput, Text, View} from "react-native";
import React, {Component} from "react";
import {debounce} from "lodash";
import PropTypes from "prop-types";
import Button from "./Button";
import AppText from "./AppText";
import IconEv from "react-native-vector-icons/EvilIcons";
import {getCartCount} from "../services/productService";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {NavigationActions} from "react-navigation";
import IconFa from "react-native-vector-icons/FontAwesome";
import {BringMeIcon} from "../utils/bring-me-icons"

class CartButtonView extends Component {

  showCart = () => {
    this.props.navigate({routeName: 'Cart'});
  };

  render() {
    let {cartItems} = this.props;
    return (
      <View>
      <Button onPress={() => this.showCart()} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <View style={{padding: 10,}}>
          <BringMeIcon name='bringme-cart' style={{color: '#fff', fontSize: 25, fontWeight: '400'}}/>
          {!!getCartCount(cartItems) &&
            <View style={{position: 'absolute', right: 2}}>
          <IconFa name='circle' onPress={() => this.showCart()} style={{color: '#F26522', position: 'absolute', top: 0, right: 0, width: 20, height: 20, fontSize: 20, fontWeight: '600'}}/>
          <AppText style={{fontSize: 10, position: 'absolute', top: 3, right: 2, width: 20, height: 20, color: '#fff', textAlign: 'center'}}>{getCartCount(cartItems)}</AppText>
          </View>}
        </View>
      </Button>
      </View>
    )
  }
}

export default connect(
    state => ({
      cartItems: state.getIn(["cart", "items"]),
    }),
    dispatch => {
      return {
        navigate: bindActionCreators(NavigationActions.navigate, dispatch),
      };
    }
)(CartButtonView);
