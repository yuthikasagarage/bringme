import React, {Component} from "react";
import {Dimensions, FlatList, StyleSheet, Text, View, Alert, Platform} from "react-native";
import IconFa from "react-native-vector-icons/FontAwesome";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import PropTypes from "prop-types";
import {NavigationActions} from "react-navigation";
import ProductListItem from "../../components/ProductListItem";
import Button from "../../components/Button";
import {getCartTotal} from "../../services/productService";
import Spinner from "react-native-loading-spinner-overlay";
import AppText from "../../components/AppText";
import HeaderText from "../../components/HeaderText";
import DeviceInfo from 'react-native-device-info';

const {width, height} = Dimensions.get('window');
const textWidth = (width   ) - 20;

class CartView extends Component {
  static displayName = 'cart';
  drawer = {};
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      title: (<HeaderText>Cart</HeaderText>),
      headerLeft: (<IconFa name='chevron-left' onPress={() => goBack()} style={{color: 'white', padding: 10, marginLeft: 10, fontSize: 20}}/>),
      headerTitleStyle: {
        width: '100%',
        color: '#fff',
      },
      headerStyle: {
        backgroundColor: '#FEBC11',
        elevation: 0
      },
      headerRight: (
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginRight:10}}>
            <IconFa name='circle' style={{color: '#fff',   marginLeft: 5, fontSize: 8, fontWeight: '600'}}/>
            <IconFa name='circle-thin' style={{color: '#fff',   marginLeft: 5, fontSize: 8, fontWeight: '600'}}/>
            <IconFa name='circle-thin' style={{color: '#fff',   marginLeft: 5, fontSize: 8, fontWeight: '600'}}/>
          </View>
      ),
    };
  };

  static propTypes = {
    navigate: PropTypes.func.isRequired,
    items: PropTypes.object.isRequired,
    wishlist: PropTypes.object.isRequired,
    toggleToWishList: PropTypes.func.isRequired,
    setQuoteDeleted: PropTypes.func.isRequired,
  };

  static goBack;

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
    this.props.navigation.dispatch(NavigationActions.back())
  }

  componentWillMount() {
    this.props.setQuoteDeleted();
  };

  componentDidMount() {
    goBack = this._goBack;
  }

  onRefreshList = () => {
    this.props.loadCategories();
  };

  _onItemCartIncrease = (item) => {
    this.props.changeQty(item, 1);
  };

  _onItemCartDecrease = (item) => {
    this.props.changeQty(item, -1);
  };

  _onAddToWishList = (item, inWishlist) => {
    item.lit = !inWishlist || false;
    this.props.toggleToWishList(item);
  };


  _renderItem = ({item, index}) => {
    const itemjs = item.toJS();

    return (
        <ProductListItem id={itemjs.id} index={index} type={'cart'} hideWishList={true}/>
    );
  };

  _keyExtractor = (item, index) => item.toJS().id.toString();

  createQuote = () => {
    let cartItems = this.props.items.map((item)=>{
      let itemJs = item.toJS();
      return {sku: itemJs.sku, qty: itemJs.qty}
    }).toArray()
    this.props.createQuote(cartItems);
  }

  render() {
    const {items, quoteCreating, error, errorCode, clearError} = this.props;

    let dataArray = items.valueSeq().toArray();

    if (!quoteCreating && error && !this.alertShown) {

      let errorMessage = errorCode === 401 ? 'Unauthorized. Please log out and login agin' : error.toString();

      if(errorMessage === 'Network request failed'){
        errorMessage = 'Internet connection interrupted. Please try again';
      }

      setTimeout(()=>{
        Alert.alert('Error Occurred', errorMessage, [{text: 'Ok', onPress: ()=>{
          this.alertShown = false;
          clearError();
        }}])
      }, 600)
      this.alertShown = true;
    }

    if (!dataArray || dataArray.length  === 0) {
      return (
          <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
            <AppText style={{fontSize: 20, textAlign: 'center'}}> Your cart is empty!</AppText>
          </View>
      )
    }
    let cartTotal = getCartTotal(items);
    return (
        <View style={{flex: 1, flexDirection: 'column', backgroundColor: 'white'}}>
          <Spinner visible={quoteCreating} textStyle={{color: '#FFF'}}/>
          <FlatList
              data={dataArray}
              numColumns={1}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}
          >
          </FlatList>
          <Button onPress={this.createQuote}>
          <View style={{flexDirection: 'row', height: 45, backgroundColor: '#FEBC11', alignItems: 'center', justifyContent: 'space-between'}}>
            <AppText style={{color: 'white', fontWeight: '800', fontSize: DeviceInfo.isTablet() ? 18 : 16, marginLeft: 15}}>Checkout</AppText>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <AppText style={{color: 'white', fontSize: DeviceInfo.isTablet() ? 18 : 14, fontWeight: '800', marginLeft: 15}}>Rs. {cartTotal} </AppText>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 10,height: 45, backgroundColor: 'rgba(0, 0, 0, 0.4)'}}>
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

export default CartView;
