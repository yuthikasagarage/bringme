import {Text, View,InteractionManager, Platform} from "react-native";
import React from "react";
import {Button} from "./Button";
import AppText from "./AppText";
import AppStyles from "../constants/styles";
import IconFa from "react-native-vector-icons/FontAwesome";
import { connect } from "react-redux";
import { toggleToWishList } from "../modules/cart/Actions";
import { bindActionCreators } from "redux";
import DeviceInfo from 'react-native-device-info';
import { copilot, walkthroughable, CopilotStep } from '@okgrow/react-native-copilot';

const CopilotView = walkthroughable(View);

class WishListButton extends React.Component{

  shouldComponentUpdate(nextProps, nextState){
    return this.props.item.id !== nextProps.item.id || (nextProps.wishListItem !== this.props.wishListItem);
  }

  constructor(props) {
    super(props);
  }

  addToWishList = () => {

    let newItem = this.props.item;

    if (newItem.configurable_options && newItem.configurable_options[0]) {
      newItem = newItem.configurable_options[0];
    }

    newItem.lit = !this.props.wishListItem.lit;
    this.props.toggleToWishList(newItem);
  };

  render() {
    const {wishListItem} = this.props;

    let realWishListItem = wishListItem;

    if (wishListItem.configurable_options && wishListItem.configurable_options[0]) {
      realWishListItem = wishListItem.configurable_options[0];
    }

    let heartColor = realWishListItem && realWishListItem.lit ? AppStyles.color.primary : 'gray';
    let heartIcon = realWishListItem && realWishListItem.lit ? 'heart' : 'heart-o';

    return (
      <View style={{flexDirection: 'row'}}>
        <Button style={{alignSelf: 'center', alignItems: 'center', justifyContent: 'center'}} onPress={this.addToWishList} hitSlop={{top: 5, bottom: 5, left: 5, right: 5}}>
          {this.props.isCopilot ?
            <View>
            <CopilotStep text="Use the 💛 to add this item to wishlist." order={1} name="wishlist">
              <CopilotView style={{flexDirection: 'row', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', width: 32, height: 32}}>
                <IconFa name={heartIcon} style={{fontSize: DeviceInfo.isTablet() ? 32 : 22, alignSelf: 'center', color: heartColor, marginBottom: DeviceInfo.isTablet() ? 12 : 7}}/>
              </CopilotView>
            </CopilotStep>
            </View>
            :
            <IconFa name={heartIcon} style={{fontSize: DeviceInfo.isTablet() ? 32 : 22, alignSelf: 'center', color: heartColor, marginBottom: DeviceInfo.isTablet() ? 12 : 7}}/>
          }
        </Button>
      </View>
    );
  }
}

export default connect(
  (state, props) => {
    let wishListItem = state.getIn(["cart", "wishlist", props.item.id.toString()]);
    if(!wishListItem){
      wishListItem = {}
    }else{
      wishListItem = wishListItem.toJS();
    }
    return ({
    wishListItem: wishListItem
    })
  },
  dispatch => {
    return {
      toggleToWishList: bindActionCreators(toggleToWishList, dispatch)
    }
  }
)(WishListButton);
