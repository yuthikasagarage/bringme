import React, {Component} from "react";
import {Dimensions, Image, StyleSheet, Text, View, ActivityIndicator, Platform} from "react-native";
import IconFa from "react-native-vector-icons/FontAwesome";
import PropTypes from "prop-types";
import {SceneMap, TabBar, TabViewAnimated} from "react-native-tab-view";
import ProductViewTab from "../../components/ProductViewTab";
import {NavigationActions} from "react-navigation";
import CartCounter from "../../components/CartCounter";
import Button from "../../components/Button";
import AppText from "../../components/AppText";
import WishListButton from "../../components/WishListButton";
import HeaderText from "../../components/HeaderText";
import CachedImage from '../../components/CachedImage'
import AppStyles from '../../constants/styles'

import DeviceInfo from 'react-native-device-info';
class ProductView extends Component {
  static displayName = "product";
  drawer = {};
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      title: <HeaderText>{params.product.name}</HeaderText>,
      headerLeft: <IconFa name="chevron-left" onPress={() => goBack()} style={{color: "white", padding: 10, marginLeft: 10, fontSize: 20}}/>,
      headerTitleStyle: {
        width: "100%",
        color: "#fff"
      },
      headerStyle: {
        backgroundColor: "#FEBC11",
        elevation: 0
      }
    };
  };

  static goBack;

  static navigationProps = {
    header: ({state}) => {
      return {
        title: <AppText>{state.product.name}</AppText>
      };
    }
  };

  static propTypes = {
    navigate: PropTypes.func.isRequired,
    changeQty: PropTypes.func.isRequired,
    cartItems: PropTypes.object.isRequired,
    wishlist: PropTypes.object.isRequired,
    toggleToWishList: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      hasTabs: false,
      thisProduct: {},
      tabsSet: false,
      routes: []
    };
  }

  _goBack = () => {
    this.props.navigation.dispatch(NavigationActions.back());
  }

  componentWillMount() {
    goBack = this._goBack;
    let product = this.props.navigation.state.params.product;

    let scenes = {};
    if (product.configurable_options.length > 0) {
      product.configurable_options.map(function (item) {
        scenes["s" + item.id] = () => <ProductViewTab item={item}/>;
      });

      let routes = product.configurable_options.map(function (item) {
        return {key: "s" + item.id, title: item.serving};
      });

      this._renderScene = SceneMap(scenes);
      this.setState({routes});
    }

    this.setState({thisProduct: product, tabsSet: true});
  }

  _handleIndexChange = index => this.setState({index});

  _renderHeader = props => <TabBar {...props} style={{backgroundColor: "#FEBC11"}} indicatorStyle={{backgroundColor: "white"}}/>;

  _renderScene = SceneMap({});

  _addtoWishlist = () => {
    this.props.onAddToWishList(this.props.item, this.props.inWishlist);
  };

  _tabControl(thisProduct) {
    if (thisProduct.configurable_options.length > 0) {
      return (
          <TabViewAnimated
              onRequestChangeTab={index => {
                this.setState({index});
              }}
              style={styles.container}
              navigationState={this.state}
              renderScene={this._renderScene}
              renderHeader={this._renderHeader}
              onIndexChange={this._handleIndexChange}
              initialLayout={initialLayout}
          />
      );
    } else {
      return <ProductViewTab style={{flex: 0.5}} item={thisProduct}/>;
    }
  }

  render() {
    const {tabsSet, thisProduct, index} = this.state;


    if (!tabsSet) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={AppStyles.color.secondary} />
        </View>
      );
    }

    let imageUrl,
        price = "";
    let item = {};

    if (thisProduct.configurable_options.length > 0) {
      imageUrl = thisProduct.configurable_options[index].image_url;
      price = thisProduct.configurable_options[index].price;
      final_price = thisProduct.configurable_options[index].final_price;
      item = thisProduct.configurable_options[index];
    } else {
      imageUrl = thisProduct.image_url;
      price = thisProduct.price;
      final_price = thisProduct.final_price;
      item = thisProduct;
    }

    if (this.props.cartItems.get(item.id.toString())) {
      item.qty = this.props.cartItems.get(item.id.toString()).toJS().qty;
    } else {
      item.qty = 0;
    }

    return (
        <View style={{flex: 1, flexDirection: "column"}}>
          <View style={{flex: 1, flexDirection: "column"}}>
            <View style={{flex: 0.5, backgroundColor: "white"}}>
              <CachedImage style={{width: "100%", height: "100%"}} resizeMode="contain" source={{uri: imageUrl}}/>
            </View>
            {this._tabControl(thisProduct)}
          </View>
          <View style={{flexDirection: "row", height: 45, backgroundColor: "#FEBC11", alignItems: "center", justifyContent: "space-between"}}>

            <View style={{flexDirection: "row"}}>
              <AppText style={{color: "white", fontWeight: "500", marginLeft: 15, fontSize: DeviceInfo.isTablet() ? 20 : 16}}>Rs. </AppText>
              <AppText style={{textDecorationLine: final_price !== price ? 'line-through' : 'none', color: "white", fontWeight: "500", fontSize: DeviceInfo.isTablet() ? 20 : 16}}>{price}</AppText>
              {final_price !== price && <AppText style={{color: "white", fontWeight: "500", fontSize: DeviceInfo.isTablet() ? 20 : 16}}> {final_price}</AppText>}
            </View>

            <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
              <View
                  style={{
                    flexDirection: "row",
                    width: 50,
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: 10,
                    paddingTop: 7,
                    paddingRight:0,
                    paddingLeft: 10,
                    height: 45,
                    backgroundColor: "rgba(255, 255, 255, .9)"
                  }}>
                <WishListButton item={item}/>
              </View>
              <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingLeft: 15,
                    paddingRight: 15,
                    height: 45,
                    backgroundColor: "rgba(255, 255, 255, .9)"
                  }}>
                <CartCounter style={{marginLeft: 10}} item={item}/>
              </View>

            </View>
          </View>
        </View>
    );
  }
}
const initialLayout = {
  height: 0,
  width: Dimensions.get("window").width
};

const styles = StyleSheet.create({
  container: {
    flex: 0.5,
    backgroundColor: 'white'
  }
});

export default ProductView;
