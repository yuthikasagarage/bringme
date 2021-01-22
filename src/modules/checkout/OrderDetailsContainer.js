import React, {Component} from "react";
import {Dimensions, FlatList, StyleSheet, Text, View, ScrollView, PixelRatio} from "react-native";
import IconFa from "react-native-vector-icons/FontAwesome";
import PropTypes from "prop-types";
import {NavigationActions} from "react-navigation";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Spinner from "react-native-loading-spinner-overlay";
import Button from "../../components/Button"
import {cancelOrder} from "./Actions";
import {transferReOrderToCart} from "../cart/Actions";
import AppText from "../../components/AppText";
import HeaderText from "../../components/HeaderText";
import moment from 'moment-timezone';
const isSmallScreen = Dimensions.get("window").width * PixelRatio.get() <= 640
import AppStyles from "../../constants/styles";
import {Map,fromJS} from "immutable";
import {getProductsBySkus} from '../../services/productService'

class OrderDetailsView extends Component {
    static displayName = 'orderdetails';
    drawer = {};
    static navigationOptions = ({navigation}) => {
        const {params = {}} = navigation.state;
        return {
            title: (<HeaderText>Order Details - {params.order.increment_id}</HeaderText>),
            headerLeft: (<IconFa name='chevron-left' onPress={() => navigation.goBack()} style={{color: 'white', padding: 10, marginLeft: 10, fontSize: 20}}/>),
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
    };

    constructor(props) {
        super(props);
        state = {
          order: {}
        }
    }

    goBack = () => {
       this.props.navigation.dispatch(NavigationActions.back())
    }

    componentWillMount() {
      goBack = this.goBack;
      let order = this.props.navigation.state.params.order;
      this.setState({order});
    };

    cancelOrder = (order) => {
      let orderId = order.entity_id;
      this.props.cancelOrder(orderId);
    }

    reOrder = async (order) => {
      let reOrderItems = [];
      let items = order.items;
      let {products, transferReOrderToCart} = this.props;

      let productsCategories = products.toJS();
      Object.keys(productsCategories).forEach((key) => {
        productsCategories[key] && productsCategories[key].forEach(product => {
          hasSku = false;
          items.forEach(item => {
            if(item.sku == product.sku){
              let newProduct = Object.assign({}, product);
              newProduct.qty = item.qty_ordered;
              reOrderItems.push(newProduct);
              item.hasSku = true;
            }
          })
        })
      })

      let skuArray = items.filter(item => !item.hasSku).map(item => item.sku);
      if(skuArray && skuArray.length > 0){
        let response = await getProductsBySkus(skuArray);
        if(response.error){
          alert('Error - ' + response.error)
          transferReOrderToCart(reOrderItems);
        }else{
          let loadedProducts = response.data;
          loadedProducts.forEach(loadedProduct => {
            items.forEach(item => {
              if(item.sku == loadedProduct.sku){
                loadedProduct.qty = item.qty_ordered
              }
            })
          })
          let finalReOrderList = reOrderItems.concat(loadedProducts)
          transferReOrderToCart(finalReOrderList);
        }
      }else{
        transferReOrderToCart(reOrderItems);
      }
      
    }

    render() {
        let {order} = this.state;
        let dateCreated = moment.tz(order.created_at, 'Etc/UTC').local();

        let color = ['#7b7b7b', '#7b7b7b', '#7b7b7b', '#7b7b7b'];

        switch (order.status) {
            case  'pending':
                color[0] = '#37ee4a';
                break;
            case  'processing':
            case  'holded' :
                color[0] = '#37ee4a';
                color[1] = '#37ee4a';
                break;
            case  'complete':
                color[0] = '#37ee4a';
                color[1] = '#37ee4a';
                color[2] = '#37ee4a';
                break;
            case  'delivered':
                color[0] = '#37ee4a';
                color[1] = '#37ee4a';
                color[2] = '#37ee4a';
                color[3] = '#37ee4a';
                break;
            case  'canceled':
                color[0] = '#EE2312';
                color[1] = '#EE2312';
                break;
        }

        //const textColor = this.props.selected ? "red" : "black";
        return (
          <ScrollView style={{flexDirection: 'column'}}>
                <Spinner visible={this.props.cancelingOrder} textStyle={{color: '#FFF'}}/>
                <View style={{flexDirection: 'column', backgroundColor: 'white', borderBottomColor: '#EEE', borderBottomWidth: 1, padding: 8, margin: 7, marginBottom:0}}>
                    <View style={{flexDirection: 'row'}}>
                        <View style={{flex: 1, flexDirection: 'column'}}>
                            <AppText style={{color: '#7b7b7b'}}>Order ID</AppText>
                            <AppText style={{color: '#000'}}>{order.increment_id}</AppText>
                        </View>
                        <View style={{flex: 1, flexDirection: 'column'}}>
                            <AppText style={{color: '#7b7b7b', textAlign: 'left'}}>Order Date/Time</AppText>
                            <AppText style={{color: '#000', textAlign: 'left'}}>{dateCreated.format('YYYY-MM-DD hh:mm a')}</AppText>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', marginTop: 10}}>
                        <View style={{flex: 1, flexDirection: 'column'}}>
                            <AppText style={{color: '#7b7b7b'}}>Delivery Date</AppText>
                            <AppText style={{color: '#000'}}>{order.delivery_date}</AppText>
                        </View>
                        <View style={{flex: 1, flexDirection: 'column'}}>
                            <AppText style={{color: '#7b7b7b', textAlign: 'left'}}>Delivery Time</AppText>
                            <AppText style={{color: '#000', textAlign: 'left'}}>{order.delivery_time}</AppText>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', marginTop: 15, borderTopColor: '#eeeeee', borderTopWidth: 1, paddingTop: 10, paddingBottom: 10}}>
                      <View style={{flex: 1, flexDirection: 'column'}}>
                          <AppText style={{color: '#7b7b7b', textAlign: 'left'}}>Total</AppText>
                      </View>
                      <View style={{flex: 1, flexDirection: 'column'}}>
                          <AppText style={{color: '#7b7b7b', textAlign: 'right'}}>Rs. {order.subtotal_incl_tax}</AppText>
                      </View>
                    </View>
                    <View style={{flexDirection: 'row', paddingBottom: 10}}>
                      <View style={{flex: 1, flexDirection: 'column'}}>
                          <AppText style={{color: '#7b7b7b', textAlign: 'left'}}>Delivery Fee</AppText>
                      </View>
                      <View style={{flex: 1, flexDirection: 'column'}}>
                          <AppText style={{color: '#7b7b7b', textAlign: 'right'}}>{!!order.shipping_amount ? 'Rs. ' + order.shipping_amount : 'Free'}</AppText>
                      </View>
                    </View>
                    <View style={{flexDirection: 'row', paddingBottom: 10}}>
                      <View style={{flex: 1, flexDirection: 'column'}}>
                          <AppText style={{color: '#7b7b7b', textAlign: 'left'}}>Total Payable</AppText>
                      </View>
                      <View style={{flex: 1, flexDirection: 'column'}}>
                          <AppText style={{color: '#7b7b7b', textAlign: 'right'}}>Rs. {order.grand_total}</AppText>
                      </View>
                    </View>
                    <View style={{flexDirection: 'row', marginTop: 5, borderTopColor: '#eeeeee', borderTopWidth: 1, paddingTop: 10, paddingBottom: 10}}>
                        <View style={{flex: 1, flexDirection: 'column', margin: 1}}>
                            <AppText style={{color: '#7b7b7b', alignSelf: 'center', marginBottom: 4, fontSize: isSmallScreen ? 12 : 14}} >Accepted</AppText>
                            <View style={{height: 12, backgroundColor: color[0], borderBottomLeftRadius: 7, borderTopLeftRadius: 7}}/>
                        </View>
                        <View style={{flex: 1, flexDirection: 'column', margin: 1}}>
                            <AppText style={{color: '#7b7b7b', alignSelf: 'center', marginBottom: 4, fontSize: isSmallScreen ? 12 : 14}}>{order.status === 'canceled' ? 'Canceled' : 'Processing'}</AppText>
                            <View style={{height: 12, backgroundColor: color[1]}}/>
                        </View>
                        <View style={{flex: 1, flexDirection: 'column', margin: 1}}>
                            <AppText style={{color: '#7b7b7b', alignSelf: 'center', marginBottom: 4, fontSize: isSmallScreen ? 12 : 14}}>{order.status !== 'canceled' ? 'Dispatched' : ' '}</AppText>
                            <View style={{height: 12, backgroundColor: color[2]}}/>
                        </View>
                        <View style={{flex: 1, flexDirection: 'column', margin: 1}}>
                            <AppText style={{color: '#7b7b7b', alignSelf: 'center', marginBottom: 4, fontSize: isSmallScreen ? 12 : 14}}>{order.status !== 'canceled' ? 'Delivered' : ' '}</AppText>
                            <View style={{height: 12, backgroundColor: color[3], borderTopRightRadius: 7, borderBottomRightRadius: 7}}/>
                        </View>
                    </View>

                </View>
                { (order.status == 'pending' || order.status == 'pending_payment') &&
                <Button onPress={()=> {this.cancelOrder(order)}}style={{padding: 5, marginBottom: 0}}>
                    <View style={{flexDirection: 'row', height: 45, margin: 7, backgroundColor: '#FEBC11', alignItems: 'center', justifyContent: 'center'}}>
                      <AppText style={{color: 'white', fontWeight: '800', fontSize: 16, flex: 1, textAlign: 'center'}}>Cancel</AppText>
                    </View>
                </Button>}
                <Button onPress={()=> {this.reOrder(order)}}style={{padding: 5, marginTop: 0}}>
                    <View style={{flexDirection: 'row', height: 45, margin: 7, backgroundColor: AppStyles.color.secondary, alignItems: 'center', justifyContent: 'center'}}>
                      <AppText style={{color: 'white', fontWeight: '800', fontSize: 16, flex: 1, textAlign: 'center'}}>Re-Order</AppText>
                    </View>
                </Button>
                <View style={{backgroundColor: 'white', borderBottomColor: '#EEE', borderBottomWidth: 1, margin: 7, marginTop: 0, paddingBottom: 0, paddingTop: 0}}>
                  <FlatList
                    data={order.items}
                    numColumns={1}
                    keyExtractor={(item) => item.item_id.toString()}
                    renderItem={this.renderOrderItem}
                    >
                  </FlatList>
                </View>
              </ScrollView>
        );
    }

    renderOrderItem = ({item}) => {
      return (
        <View style={{borderBottomWidth: 1, borderBottomColor: '#EEE', padding: 5, paddingLeft: 8, paddingRight: 8}}>
          <View style={{flexDirection: 'row', marginBottom: 5}}>
            <AppText style={{flex: 0.7, flexDirection: 'column'}}>{item.name} {!!item.serving ? ' - ' + item.serving: ''}</AppText>
            <AppText style={{flex: 0.3, flexDirection: 'column', textAlign: 'right'}}></AppText>
          </View>
          <View style={{flexDirection: 'row'}}>
            <AppText style={{flex: 0.7, flexDirection: 'column'}}>{item.qty_ordered} x Rs. {item.price}</AppText>
            <AppText style={{flex: 0.3, flexDirection: 'column', textAlign: 'right'}}>Rs. {item.row_total}</AppText>
          </View>
        </View>
      )
    }
}

export default connect(
    state => ({
      cancelingOrder: state.getIn(['checkout', 'cancelingOrder']),
      products: state.getIn(['subCategories', 'products'])
    }),
    dispatch => {
        return {
            cancelOrder: bindActionCreators(cancelOrder, dispatch),
            navigate: bindActionCreators(NavigationActions.navigate, dispatch),
            transferReOrderToCart: bindActionCreators(transferReOrderToCart, dispatch),
        };
    }
)(OrderDetailsView);
