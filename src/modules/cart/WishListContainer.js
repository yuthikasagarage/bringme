import React, {Component} from "react";
import {Dimensions, FlatList, StyleSheet, Text, View, Platform} from "react-native";
import IconFa from "react-native-vector-icons/FontAwesome";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import PropTypes from "prop-types";
import {NavigationActions} from "react-navigation";
import {debounce} from "lodash";
import ProductListItem from "../../components/ProductListItem";
import Button from "../../components/Button";
import AppText from "../../components/AppText";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {changeQty, toggleToWishList, transferWishListToCart} from "./Actions";
import {getCartTotal} from "../../services/productService";
import HeaderText from "../../components/HeaderText";
import DeviceInfo from 'react-native-device-info';

const {width, height} = Dimensions.get('window');
const textWidth = (width   ) - 20;

class WishListView extends Component {
  static displayName = 'product';
  drawer = {};
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      title: (<HeaderText>WishList</HeaderText>),
      headerLeft: (<IconFa name='chevron-left' onPress={() => goBack()} style={{color: 'white', padding: 10, marginLeft: 10, fontSize: 20}}/>),
      headerTitleStyle: {
        width: '100%',
        color: '#fff',
      },
      headerStyle: {
        backgroundColor: '#FEBC11',
        elevation: 0
      }
    };
  };

  static goBack;

  static propTypes = {
    navigate: PropTypes.func.isRequired,
    items: PropTypes.object.isRequired,
    wishlist: PropTypes.object.isRequired,
    toggleToWishList: PropTypes.func.isRequired,
    changeQty: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      hasTabs: false,
      thisProduct: {},
      tabsSet: false,
      routes: [],
    };
  }

  _goBack = () => {
    this.props.navigation.dispatch(NavigationActions.back())
  }

  componentWillMount() {
    goBack = this._goBack;
  };

  _onItemWishListIncrease = (item) => {
    this.props.changeQty(item, 1, true);
  };

  _onItemWishListDecrease = (item) => {
    this.props.changeQty(item, -1, true);
  };

  _renderItem = ({item, index}) => {
    const itemjs = item.toJS();

    return (
        <ProductListItem id={item.toJS().id} type={'wishList'} />
    );
  };

  _keyExtractor = (item, index) => item.toJS().id.toString();

  _onItemPress = (item) => {
    this.props.navigate({routeName: 'Product', params: {product: item}});
  }

  createCartFromWishList = () => {
    this.props.transferWishListToCart()
  }

  render() {
    const {loading, wishlist, items} = this.props;
    let dataArray = wishlist.toIndexedSeq().toArray();
    let filteredArray = [];
    dataArray.map((item, index) => {
      if (item.toJS().lit)
        filteredArray.push(item)
    });

    if (!filteredArray || filteredArray.length === 0) {
      return (
          <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white'}}>
            <AppText style={{fontSize: 20, textAlign: 'center', marginHorizontal: 5}}> Your wish list is empty!</AppText>
            <AppText style={{fontSize: 20, textAlign: 'center', marginTop: 5, marginHorizontal: 5}}> Add to wish list using <IconFa name={'heart'} style={{fontSize: 20, alignSelf: 'center', color: '#FEBC11'}}/> icon</AppText>
          </View>
      )
    }

    let cartTotal = getCartTotal(wishlist, true);

    return (
        <View style={{flex: 1, flexDirection: 'column'}}>
          <FlatList
              data={filteredArray}
              numColumns={1}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}
          >
          </FlatList>

          <Button onPress={this.createCartFromWishList}>
            <View style={{flexDirection: 'row', height: 45, backgroundColor: '#FEBC11', alignItems: 'center', justifyContent: 'space-between'}}>
              <AppText style={{color: 'white', fontWeight: '700', fontSize: DeviceInfo.isTablet() ? 18 : 16, marginLeft: 15}}>Add to Cart</AppText>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <AppText style={{color: 'white', fontSize: DeviceInfo.isTablet() ? 18 : 14, fontWeight: '700', marginLeft: 15}}>Rs. {cartTotal} </AppText>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 10, height: 45, backgroundColor: 'rgba(0, 0, 0, 0.4)'}}>
                  <EvilIcons name="chevron-right" size={50} color="#fff"/>
                </View>
              </View>
            </View>
          </Button>

        </View>
    );
  }
}

const initialLayout = {
  height: 0,
  width: Dimensions.get('window').width,
};

const styles = StyleSheet.create({
  container: {
    flex: 0.5,
  },
});

export default connect(
    state => ({
      items: state.getIn(['cart', 'items']),
      wishlist: state.getIn(['cart', 'wishlist']),

    }),
    dispatch => {
      return {
        navigate: bindActionCreators(NavigationActions.navigate, dispatch),
        changeQty: bindActionCreators(changeQty, dispatch),
        transferWishListToCart: bindActionCreators(transferWishListToCart, dispatch),
        toggleToWishList: bindActionCreators(toggleToWishList, dispatch),
      };
    }
)(WishListView);
