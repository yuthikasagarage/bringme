import {Text, View,InteractionManager, Platform} from "react-native";
import React from "react";
import {Button} from "./Button";
import AppText from "./AppText";
import AppStyles from "../constants/styles";
import IconSLI from "react-native-vector-icons/SimpleLineIcons";
import { connect } from "react-redux";
import { changeQty } from "../modules/cart/Actions";
import { bindActionCreators } from "redux";
import {fromJS} from "immutable";
import DeviceInfo from 'react-native-device-info';

class CartCounter extends React.Component{

  shouldComponentUpdate(nextProps, nextState){
    return this.props.item.id !== nextProps.item.id || (nextProps.cartItem && this.props.cartItem && nextProps.cartItem.qty !== this.props.cartItem.qty);
  }

  constructor(props) {
    super(props);
  }

  _decrease = () => {
    const {changeQty, item, cartItem, type} = this.props;
    if (cartItem && cartItem.qty && cartItem.qty > 0) {
      changeQty(cartItem, -1, type === 'wishList' ? type : null);
    }
  }

  _increase = () => {
    const {qty, changeQty, item, cartItem, type} = this.props;
    this.props.changeQty(cartItem && cartItem.id ? cartItem : item, 1, type === 'wishList' ? type : null);
  }

  render() {
    const {cartItem, item} = this.props;

    if(item.show_out_of_stock && Number(item.warehouse_stock_qty) < 1){
      return (<Button>
          <Text style={{color: AppStyles.color.danger}}>Out of Stock</Text>
        </Button>)
    }

    return (
        <View style={{flexDirection: 'row'}}>
          <Button onPress={this._decrease} hitSlop={{top: 12, bottom: 12, left: 15, right: 15}}>
            <View>
              <IconSLI name={'minus'} style={{fontWeight: '100', color:'grey', fontSize: DeviceInfo.isTablet() ? 32 : 23, textAlign: 'center'}} />
            </View>
          </Button>
          <AppText style={{marginTop: 4, fontSize: DeviceInfo.isTablet() ? 20 : 15, width: 30, textAlign: 'center', color: '#AAA', marginLeft: 10, marginRight: 10}}>{!!cartItem ? cartItem.qty || 0 : 0}</AppText>
          <Button onPress={this._increase} hitSlop={{top: 12, bottom: 12, left: 15, right: 15}}>
            <View>
              <IconSLI name={'plus'} style={{fontWeight: '100', color:'grey', fontSize: DeviceInfo.isTablet() ? 32 : 23, textAlign: 'center'}} />
            </View>
        </Button>
        </View>
    );
  }
}

export default connect(
  (state, props) => {
    let cartItem = props.type === 'wishList' ? state.getIn(["cart", "wishlist", props.item.id.toString()]) : state.getIn(["cart", "items", props.item.id.toString()]);
    if(!cartItem){
      cartItem = {}
    }else{
      cartItem = cartItem.toJS();
    }
    return ({
      cartItem: ( props.item &&  props.item.id) ? cartItem : {}
    })
  },
  dispatch => {
    return {
      changeQty: bindActionCreators(changeQty, dispatch),
    }
  }
)(CartCounter);
