import {Map} from "immutable";
import {CREATE_ORDER, GET_ORDERS, GOT_ORDERS, ORDER_CREATED, PERSIST_SHIPPING_INFO, SET_PERSONAL_INFO, SHIPPING_INFO_PERSISTED, LOAD_DELIVERY_TIME_SLOTS, LOADED_DELIVERY_TIME_SLOTS, CANCEL_ORDER, CANCELED_ORDER, RESET_MEAT_ON_POYA, PAYMENT_SUCCESS, RESET_PAYMENT_SUCCESS, APPLY_COUPON_CODE, APPLIED_COUPON_CODE} from "./Constants";
import {Effects, loop} from "redux-loop-symbol-ponyfill";
import {setShippingInfo, createOrderInServer, getOrdersInServer, setShippingInfoInServer, loadDeliveryTimeSlotsInServer, cancelOrderInServer, applyCouponCodeInServer} from "./Actions";
import {clearCart} from "../cart/Actions";
import {NavigationActions} from "react-navigation";
import {getOrders} from "../../services/checkoutService";

// Initial state
const initialState = Map({
    personalInfo: {},
    address: {},
    saved: false,
    persistingShippingInfo: false,
    persistingOrder: false,
    deliveryFee: 0,
    subTotal: 0,
    discount: 0,
    grandTotal: 0,
    ordersLoading: true,
    orderList: [],
    timeSlotsLoading: true,
    timeSlots: {},
    orderId: 0,
    paymentOption: {},
    cancelingOrder: false,
    meatOnPoya: false,
    paymentSuccess: false,
    couponCode: '',
    isCouponValid: false,
    couponCodeLoading: false,
    shippingMethodCode: 'flatrate'
});

// Reducer
export default function CheckoutStateReducer(state = initialState, action = {}) {
    switch (action.type) {
        case SET_PERSONAL_INFO:
          return state.set('personalInfo', action.payload);
        case PERSIST_SHIPPING_INFO: {
          let address = action.payload;
          let profile = state.get('personalInfo');
          let addressInfo = {
            street: [address.building, address.street, address.landmark, address.district, 'latlon = ' + address.coordinates.latitude + ',' +address.coordinates.longitude],
            country_id: 'LK',
            firstname: profile.firstName,
            lastname: profile.lastName,
            email: profile.email,
            telephone: profile.localMobileNumber,
            city: address.city,
            postcode: address.postcode,
          };
          return loop(
            state.set('persistingShippingInfo', true).set('address', address),
            Effects.promise(setShippingInfoInServer, {
              shipping_address: addressInfo,
              shipping_carrier_code: 'flatrate',
              shipping_method_code: 'flatrate',
              extension_attributes: {coordinates: address.coordinates.latitude + ',' +address.coordinates.longitude}
            }));
        }
        case SHIPPING_INFO_PERSISTED:
          if(action.payload.error){
            setTimeout(()=>{
              let errorMessage = action.payload.error;
              if(errorMessage === 'Network request failed'){
                errorMessage = 'Internet connection interrupted. Please try again';
              }
              alert(errorMessage)
            }, 500)
            return state.set('persistingShippingInfo', false)
          }
          const response = action.payload.response;
          return loop(
              state.set('persistingShippingInfo', false)
                  .set('deliveryFee', response.totals.shipping_amount)
                  .set('subTotal', response.totals.subtotal)
                  .set('discount', response.totals.discount_amount)
                  .set('grandTotal', response.totals.grand_total)
                  .set('shippingMethodCode', response.extension_attributes.shipping),
              Effects.call(NavigationActions.navigate, {routeName: 'Checkout'})
          );
        case CREATE_ORDER: {
          let address = state.get('address');
          let profile = state.get('personalInfo');
          let addressInfo = {
            street: [address.building, address.street, address.landmark, address.district, 'latlon = ' + address.coordinates.latitude + ',' +address.coordinates.longitude],
            country_id: 'LK',
            firstname: profile.firstName,
            lastname: profile.lastName,
            email: profile.email,
            telephone: profile.localMobileNumber,
            city: address.city,
            postcode: address.postcode
          };
          return loop(
              state.set('persistingOrder', true).set('paymentOption', action.payload.paymentOption),
              Effects.promise(createOrderInServer, {timeIntervalId: action.payload.deliveryOption.id, dateString: action.payload.deliveryDate, paymentMethod: {method: action.payload.paymentOption.value}, billing_address: addressInfo})
          );
        }
        case ORDER_CREATED:
          if(action.payload.error){
            setTimeout(()=>{
              let errorMessage = action.payload.error;
              if(errorMessage === 'Network request failed'){
                errorMessage = 'Internet connection interrupted. Please try again';
              }
              alert(errorMessage)
            }, 500)
            return state.set('persistingOrder', false)
          }
          if(Number(action.payload.orderId) === -1){
            return state.set('persistingOrder', false).set('meatOnPoya', true);
          }
          if(state.get('paymentOption').value === 'payhere'){
            return loop(
              state.set('persistingOrder', false).set('orderId', action.payload.orderId)
                .set('couponCode', '').set('isCouponValid', false),
              Effects.call(NavigationActions.reset, {
                index: 0,
                key: null,
                actions: [
                    NavigationActions.navigate({ routeName: 'OnlinePayment'}),
                ]
              })
            );
          }
          if(state.get('paymentOption').value === 'frimi'){
            return loop(
              state.set('persistingOrder', false).set('orderId', action.payload.orderId)
                .set('couponCode', '').set('isCouponValid', false),
              Effects.call(NavigationActions.reset, {
                index: 0,
                key: null,
                actions: [
                    NavigationActions.navigate({ routeName: 'FriMiPayment'}),
                ]
              })
            );
          }
          if(state.get('paymentOption').value === 'upay'){
            return loop(
              state.set('persistingOrder', false).set('orderId', action.payload.orderId)
                .set('couponCode', '').set('isCouponValid', false),
              Effects.call(NavigationActions.reset, {
                index: 0,
                key: null,
                actions: [
                    NavigationActions.navigate({ routeName: 'UPayPayment'}),
                ]
              })
            );
          }
          return loop(
            state.set('persistingOrder', false).set('orderId', action.payload.orderId)
              .set('couponCode', '').set('isCouponValid', false),
            Effects.promise(clearCart)
          );

        case GET_ORDERS:
          return loop(
            state.set('ordersLoading', true),
            Effects.promise(getOrdersInServer, action.payload)
          );

        case GOT_ORDERS:
          if(action.payload.error){
            return state.set('ordersLoading', false)
          }
          return state.set('ordersLoading', false)
            .set('orderList', action.payload.data);

        case APPLY_COUPON_CODE:
          return loop(
            state.set('couponCodeLoading', true)
            .set('couponCode', action.payload)
            .set('isCouponValid', false),
            Effects.promise(applyCouponCodeInServer, action.payload)
          );

        case APPLIED_COUPON_CODE:
          if(action.payload.error){
            return state.set('couponCodeLoading', false).set('isCouponValid', false)
          }
          return loop(
            state.set('couponCodeLoading', false).set('isCouponValid', true),
            Effects.promise(setShippingInfo, state.get('address'))
          );

        case LOAD_DELIVERY_TIME_SLOTS:
          return loop(
            state.set('timeSlotsLoading', true),
            Effects.promise(loadDeliveryTimeSlotsInServer, action.payload)
          );

        case LOADED_DELIVERY_TIME_SLOTS:
          if(action.payload.error){
            return state.set('timeSlotsLoading', false)
          }
          return state.set('timeSlotsLoading', false)
            .set('timeSlots', action.payload.data);
        case CANCEL_ORDER:
          return loop(
            state.set('cancelingOrder', true),
            Effects.promise(cancelOrderInServer, action.payload)
          );
        case CANCELED_ORDER:
          if(action.payload.error){
            return state.set('cancelingOrder', false).set('couponCode', '').set('isCouponValid', false)
          }

          let effect = Effects.call(NavigationActions.reset, {
            index: 1,
            key: null,
            actions: [
                NavigationActions.navigate({ routeName: 'Home'}),
                NavigationActions.navigate({ routeName: 'OrderList'}),
            ]
          });

          if(action.payload.isFailedPayment){
            effect = Effects.call(NavigationActions.reset, {
             index: 1,
             key: null,
             actions: [
                 NavigationActions.navigate({ routeName: 'Home'}),
                 NavigationActions.navigate({ routeName: 'Cart'}),
             ]
           });
          }

          return loop(
            state.set('cancelingOrder', false),
            effect
          );
        case RESET_MEAT_ON_POYA:
          return state.set('meatOnPoya', false);
        case PAYMENT_SUCCESS:
          return state.set('paymentSuccess', true);
        case RESET_PAYMENT_SUCCESS:
          return state.set('paymentSuccess', false);
        default:
          return state;
    }
}
