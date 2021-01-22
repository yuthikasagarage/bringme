import React, {Component} from "react";
import {Dimensions, FlatList, StyleSheet, Text, View, ActivityIndicator} from "react-native";
import IconFa from "react-native-vector-icons/FontAwesome";
import PropTypes from "prop-types";
import {NavigationActions} from "react-navigation";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {changeQty, fetchOrders, toggleToWishList} from "./Actions";
import OrderListItem from "../../components/OrderListItem";
import AppText from "../../components/AppText";
import HeaderText from "../../components/HeaderText";

const {width, height} = Dimensions.get('window');
const textWidth = (width   ) - 20;

class OrderListView extends Component {
    static displayName = 'orderlist';
    drawer = {};
    static navigationOptions = ({navigation}) => {
        const {params = {}} = navigation.state;
        return {
            title: (<HeaderText>My Orders</HeaderText>),
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
        orderList: PropTypes.array.isRequired,
        fetchOrders: PropTypes.func.isRequired,
        ordersLoading: PropTypes.bool.isRequired,
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
      this.props.fetchOrders();
    };

    onRefreshList = () => {
        this.props.loadCategories();
    };

    _onItemCartIncrease(item) {
        this.props.changeQty(item, 1);
    };

    _onItemCartDecrease(item) {
        this.props.changeQty(item, -1);
    };

    _onAddToWishList(item, inWishlist) {
        item.lit = !inWishlist || false;
        this.props.toggleToWishList(item);
    };

    _renderItem = ({item}) => {

        return (
            <OrderListItem item={item} onPressItem={this.onItemPress}/>
        );
    };

    _keyExtractor = (item, index) => item.entity_id.toString();

    onItemPress = (item) => {
        this.props.navigate({routeName: 'OrderDetails', params: {order: item}});
    }

    render() {
        // const {loading, wishlist} = this.props;
        //  let filteredArray = [];
        // dataArray.map((item, index) => {
        //     if (item.toJS().lit)
        //         filteredArray.push(item)
        // });
        //
        // if (!dataArray || dataArray.length === 0) {
        //     return (
        //         <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        //             <AppText style={{fontSize: 20, textAlign: 'center'}}> Your wish list is empty! Add something and come back later.</AppText>
        //         </View>
        //     )
        // }
        if (this.props.ordersLoading) {
            return (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                  <ActivityIndicator size="large" color={AppStyles.color.secondary} />
              </View>
            )
        }else{
            if(!this.props.orderList || this.props.orderList.length==0){
              return (
                  <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                      <AppText>No orders placed!</AppText>
                  </View>
              )
            }
        }

        return (
            <View style={{flex: 1, flexDirection: 'column'}}>
                <FlatList
                    data={this.props.orderList}
                    numColumns={1}
                    keyExtractor={this._keyExtractor}
                    renderItem={this._renderItem}
                >
                </FlatList>

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
        orderList: state.getIn(['checkout', 'orderList']),
        ordersLoading: state.getIn(['checkout', 'ordersLoading']),
        backScreenKey: state.getIn(['home', 'screenKey']),
    }),
    dispatch => {
        return {
            navigate: bindActionCreators(NavigationActions.navigate, dispatch),
            fetchOrders: bindActionCreators(fetchOrders, dispatch),
        };
    }
)(OrderListView);
