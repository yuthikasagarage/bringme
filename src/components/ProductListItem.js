import {Image, Text, View, Platform} from "react-native";
import React from "react";
import Button from "./Button";
import CachedImage from "./CachedImage";
import CartCounter from "./CartCounter";
import WishListButton from "./WishListButton";
import IconFa from "react-native-vector-icons/FontAwesome";
import AppText from "./AppText";
import AppStyles from '../constants/styles'
import { toggleToWishList } from "../modules/cart/Actions";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { NavigationActions } from "react-navigation";

import DeviceInfo from 'react-native-device-info';

class ProductListItem extends React.Component {

  shouldComponentUpdate(nextProps, nextState){
    return nextProps.item.id !== this.props.item.id || this.props.index !== nextProps.index || (!!this.props.hideWishList && this.props.item.qty !== nextProps.item.qty);
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.item && this.props.item.image_url !== nextProps.item.image_url){
      this.props.item.image_url = null;
    }
  }

  _onPress = () => {
    this.props.navigate({routeName: 'Product', params: {product: this.props.item}});
  };



  render() {
    const {item, wishListItem} = this.props;



    let {price, weight, serving, configurable_options, qty, final_price, image_url, name} = item;

    product = item;

    if (configurable_options && configurable_options.length > 0) {
      price = item.configurable_options[0].price;
      final_price = item.configurable_options[0].final_price;
      serving = item.configurable_options[0].serving;
      name = item.configurable_options[0].name;
      image_url = item.image_url ? item.image_url : item.configurable_options[0].image_url
      product = item.configurable_options[0];
    }

    let wishListButton = this.props.hideWishList ? <Text style={{marginBottom: 10, fontSize: DeviceInfo.isTablet() ? 20 : 12, color: 'grey'}}>Rs. {+(Number(qty * (final_price ? final_price : price))).toFixed(2)}/=</Text> : <WishListButton isCopilot={this.props.isCopilot} item={product} />;
    let cartCounter = this.props.hideCartCounter ? <View/> : (
        <CartCounter type={this.props.type} style={{marginRight: 20, alignSelf: 'center', alignItems: 'center', justifyContent: 'center'}} item={product}/>
    );
    let controls = this.props.hideControls ? (<View/>) : (
        <View style={{flex: 0.29, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingLeft: 15, paddingTop: 5, paddingRight: 13, paddingBottom: DeviceInfo.isTablet() ? 16 : 6, position:'absolute', bottom:0, right:0}}>
          {wishListButton}
          {cartCounter}

        </View>);
    //const textColor = this.props.selected ? "red" : "black";
    return (
        <View style={{flex: 1, flexDirection: 'row', marginVertical: 1, backgroundColor: 'white', borderBottomColor: '#EEE', borderBottomWidth:1, paddingBottom:1, paddingTop:1  }}>
          <Button onPress={this._onPress} style={{flex: 1, flexDirection: 'row', backgroundColor: 'white'}}>
            <View style={{flex: 1, flexDirection: 'row',paddingLeft: 5, paddingRight: 10,backgroundColor: 'white'}}>
              <CachedImage style={{height: DeviceInfo.isTablet() ? 135 : 90, width: DeviceInfo.isTablet() ? 135 : 75}} source={{uri: image_url}} resizeMode='contain'/>
              <View style={{flex: 1, flexDirection: 'column', marginVertical:5, marginLeft: 10, justifyContent: !DeviceInfo.isTablet() ? 'space-between' : 'space-around'}}>
                <AppText style={{fontWeight: '100', fontSize: DeviceInfo.isTablet() ? 20 : 14}}>{name}</AppText>
                <View style={{flexDirection:'row'}}>
                  <AppText style={{fontWeight: '400', fontSize: DeviceInfo.isTablet() ? 20 : 14, color: 'grey', marginRight: 10}}>{serving}</AppText>
                  {item.configurable_options && item.configurable_options.length > 1 ?
                    (<View style={{backgroundColor: '#EEE', borderRadius: 3, marginBottom: 5}}>
                      <AppText style={{color: 'grey', padding: 1, paddingHorizontal: 5, overflow: 'hidden'}}>
                        More
                      </AppText>
                    </View>)
                    :
                  <AppText></AppText>}
                </View>
                <View style={{flexDirection:'row'}}>
                  <AppText style={{fontWeight: '100', fontSize: DeviceInfo.isTablet() ? 20 : 14}}>Rs. </AppText>
                  {final_price === price && <View style={{flexDirection: 'row'}}>
                    <AppText style={{fontWeight: '100', fontSize: DeviceInfo.isTablet() ? 20 : 14}}>
                      {price}
                    </AppText>
                  </View>}
                  {final_price !== price && <View style={{flexDirection: 'row'}}>
                    <AppText style={{textDecorationLine: 'line-through', fontWeight: '100', fontSize: DeviceInfo.isTablet() ? 20 : 14}}>
                      {price}
                    </AppText>
                    <AppText style={{fontWeight: '100', fontSize: DeviceInfo.isTablet() ? 20 : 14, marginRight:7, color: AppStyles.color.secondary}}>
                      {' ' + final_price}
                    </AppText>
                  </View>}

                </View>

              </View>
            </View>
          </Button>
          {controls}
        </View>);
  }
}

export default connect(
  (state, props) => {
    let item = {};
    if(props.type === 'wishList'){
      item = state.getIn(["cart", "wishlist", props.id.toString()]).toJS()
    }else if(props.type === 'cart'){
      item = state.getIn(["cart", "items", props.id.toString()]).toJS()
    }else if(props.type === 'search'){
      item = state.getIn(["search", "results"])[props.index]
    }else{
      item = state.getIn(["subCategories", "products", props.categoryId.toString(), props.index]).toJS()
    }

    return ({
      item
    })
  },
  dispatch => {
    return {
      navigate: bindActionCreators(NavigationActions.navigate, dispatch),
    }
  }
)(ProductListItem);
