import React, { Component } from "react";
import { Dimensions, FlatList, StyleSheet, View, Text, Platform, ActivityIndicator, TouchableOpacity} from "react-native";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { NavigationActions } from "react-navigation";
import { fetchProductListForCategory } from "./Actions";
import ProductListItem from "../../components/ProductListItem";
import NoInternetNotice from '../../components/NoInternetNotice'
import Button from '../../components/Button'
import AppText from "../../components/AppText";
import AppStyles from "../../constants/styles";
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";
import debounce from 'lodash.debounce';
import { copilot, walkthroughable, CopilotStep } from '@okgrow/react-native-copilot';
import {setOnboardingShown} from "../session/Actions"

import DeviceInfo from 'react-native-device-info';
let { width } = Dimensions.get("window");

class ProductsList extends Component {
  selectedItem = {};

  static propTypes = {
    loading: PropTypes.object.isRequired,
    navigate: PropTypes.func.isRequired,
    categoryId: PropTypes.number.isRequired,
    fetchProductListForCategory: PropTypes.func.isRequired,
    products: PropTypes.array,
    currentTab: PropTypes.number.isRequired,
    listTabIndex: PropTypes.number.isRequired,
  };

  _onItemCartIncrease = (item) => {
    if (item.configurable_options && item.configurable_options[0]) {
      item.configurable_options[0].qty = item.qty;
      this.props.changeQty(item.configurable_options[0], 1);
    } else {
      this.props.changeQty(item, 1);
    }
    setTimeout(()=>{
      this.setState({quantityChangeCounter: this.state.quantityChangeCounter + 1})
    })
  };

  _onItemCartDecrease = (item) => {
    if (item.configurable_options && item.configurable_options[0]) {
      item.configurable_options[0].qty = item.qty;
      this.props.changeQty(item.configurable_options[0], -1);
    } else {
      this.props.changeQty(item, -1);
    }
    setTimeout(()=>{
      this.setState({quantityChangeCounter: this.state.quantityChangeCounter + 1})
    })
  };

  _onAddToWishList = (item, inWishlist) => {
    if (item.configurable_options && item.configurable_options[0]) {
      item.configurable_options[0].lit = !inWishlist || false;
      this.props.toggleToWishList(item.configurable_options[0]);
    } else {
      item.lit = !inWishlist || false;
      this.props.toggleToWishList(item);
    }
    setTimeout(()=>{
      this.setState({quantityChangeCounter: this.state.quantityChangeCounter + 1})
    })
  };

  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      tabsSet: false,
      routes: [],
      quantityChangeCounter: 0
    };

  }

  componentDidMount() {
    if(this.props.listTabIndex === 0 && !this.props.onboardingShown){
      this.props.start();
      this.props.setOnboardingShown();
    }
  }

  componentWillMount(){

    let catId = this.props.categoryId;
    if(catId && (!this.props.products || this.props.products && this.props.products.length < 1)) {
      this.props.fetchProductListForCategory(catId);
    }
  }

  onRefreshList = () => {
    //this.props.loadCategories();
  };

  _onItemPress = (item) => {
    this.props.onItemPress(item);
  }

  _renderItem = (arg1, arg2, arg3) => {
    let item = {};
    let index = 0;
    if(Platform.OS === 'android' || Platform.OS === 'ios'){
      item = arg2;
      index = arg3;
    }else{
      item = arg1.item;
      index = arg1.index;
    }

    let itemJs = item.toJS();

    if(index == 0){

      return (
        <ProductListItem categoryId={this.props.categoryId} id={itemJs.id} index={index} isCopilot={true}/>
      );

    }else{
      return (<ProductListItem categoryId={this.props.categoryId} id={itemJs.id} index={index}/>)
    }

  };

  _keyExtractor = (item, index) => item.toString();

  shouldComponentUpdate(nextProps, nextState){
    //onLoading = this.props.loading.get(nextProps.categoryId.toString()) !== nextProps.loading.get(nextProps.categoryId.toString());
    onCategoryChange = this.props.categoryId !== nextProps.categoryId;
    onProductsChange = !this.props.products && nextProps.products;
    currentTabChange = this.props.currentTab !== nextProps.currentTab;
    productsArray = this.props.products;
    if(productsArray && nextProps.products) {
      onProductsChange = productsArray.length < nextProps.products.length;
    }
    let shouldUpdate = onCategoryChange || onProductsChange || currentTabChange;
    return shouldUpdate;
  }

  debouncedFetchProductListForCategory = debounce(function(){
    this.props.fetchProductListForCategory(this.props.categoryId)
  }, 500);

  render() {
    const { loading, products, categoryId } = this.props;
    catId = categoryId + "";
    let _loading = loading.get(catId);
    // let _loading = false;
    // let _products = [];

    if (_loading || _loading === undefined) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={AppStyles.color.secondary} />
        </View>
      );
    }

    if(products == null){
      this.debouncedFetchProductListForCategory();
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={AppStyles.color.secondary} />
        </View>
      );
    }

    if (!products || products.length < 1) {
      return(
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
          <AppText style={{fontSize: 16, textAlign: 'center'}}>No items found.</AppText>
        </View>
      )
    }



    if(Platform.OS === 'android' || Platform.OS === 'ios') {
      return (
        <RecyclerListView layoutProvider={this.layoutProvider} dataProvider={this.dataProvider.cloneWithRows(products)}
                          rowRenderer={this._renderItem}/>
      );
    }else {
      return (
        <FlatList
          data={products}
          numColumns={1}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderItem}
          initialNumToRender={10}
          onRefresh={this.onRefreshList}
          refreshing={_loading}
          extraData={this.state}
        />
      );
    }
  }

  dataProvider = new DataProvider((r1, r2) => {
    return r1 !== r2;
  });

  layoutProvider = new LayoutProvider(
    index => {
      return 1;
    },
    (type, dim) => {
          dim.width = width;
          dim.height = DeviceInfo.isTablet() ? 145 : 95;
    }
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default copilot({
  overlay: Platform.OS === 'android' ? 'svg' : 'view',
  animated: Platform.OS === 'android',
  androidStatusBarVisible: false,
  stepNumberComponent: () => (<View/>),
})(connect(
  (state, props) => ({
    loading: state.getIn(["subCategories", "productsLoading"]),
    products: state.getIn(["subCategories", "products", props.categoryId.toString()]) ? state.getIn(["subCategories", "products", props.categoryId.toString()]).toArray() : null,
    currentTab: state.getIn(["subCategories", "currentTab"]),
    onboardingShown: state.getIn(["session", "onboardingShown"])
  }),
  dispatch => {
    return {
      navigate: bindActionCreators(NavigationActions.navigate, dispatch),
      fetchProductListForCategory: bindActionCreators(fetchProductListForCategory, dispatch),
      setOnboardingShown: bindActionCreators(setOnboardingShown, dispatch),
    };
  }
)(ProductsList));
