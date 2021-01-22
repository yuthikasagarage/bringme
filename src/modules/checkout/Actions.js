import {SET_PERSONAL_INFO, PERSIST_SHIPPING_INFO, SHIPPING_INFO_PERSISTED, ORDER_CREATED, CREATE_ORDER, GET_ORDERS, GOT_ORDERS, LOAD_DELIVERY_TIME_SLOTS, LOADED_DELIVERY_TIME_SLOTS, CANCEL_ORDER, CANCELED_ORDER, RESET_MEAT_ON_POYA, PAYMENT_SUCCESS, RESET_PAYMENT_SUCCESS, APPLY_COUPON_CODE, APPLIED_COUPON_CODE} from "./Constants";
import {setShippingInfo as persistShippingInfoInServer, createOrder as persistOrderInServer, getOrders, getTimeSlots, cancelOrder as cancelMyOrder, setCouponCode}  from "../../services/checkoutService";

export async function setPersonalInfo(data) {
  return {
    type: SET_PERSONAL_INFO,
    payload: data
  };
}

export async function setShippingInfoInServer(shippingInfo) {
  return {
    type: SHIPPING_INFO_PERSISTED,
    payload: await persistShippingInfoInServer(shippingInfo)
  };
}

export async function setShippingInfo(address) {
  return {
    type: PERSIST_SHIPPING_INFO,
    payload: address
  };
}

export async function createOrderInServer(paymentInfo) {
  return {
    type: ORDER_CREATED,
    payload: await persistOrderInServer(paymentInfo)
  };
}

export async function createOrder(checkoutInfo) {
  return {
    type: CREATE_ORDER,
    payload: checkoutInfo
  };
}

export async function fetchOrders() {
    return {
        type: GET_ORDERS
    };
}

export async function cancelOrder(orderId, isFailedPayment) {
    return {
        type: CANCEL_ORDER,
        payload: {orderId, isFailedPayment}
    };
}

export async function getOrdersInServer(category) {
    return {
        type: GOT_ORDERS,
        payload: await getOrders(category)
    };
}

export async function cancelOrderInServer(payload) {
    return {
        type: CANCELED_ORDER,
        payload: await cancelMyOrder(payload.orderId, payload.isFailedPayment)
    };
}


export async function loadDeliveryTimeSlots() {
    return {
        type: LOAD_DELIVERY_TIME_SLOTS
    };
}

export async function loadDeliveryTimeSlotsInServer() {
    return {
        type: LOADED_DELIVERY_TIME_SLOTS,
        payload: await getTimeSlots()
    };
}

export async function applyCouponCode(couponCode) {
    return {
        type: APPLY_COUPON_CODE,
        payload: couponCode
    };
}

export async function applyCouponCodeInServer(couponCode) {
    return {
        type: APPLIED_COUPON_CODE,
        payload: await setCouponCode(couponCode)
    };
}

export async function resetMeatOnPoya() {
    return {
        type: RESET_MEAT_ON_POYA
    };
}

export async function setPaymentSuccess(isSucessful) {
  if(isSucessful){
    return {
        type: PAYMENT_SUCCESS
    };
  }else{
    return {
        type: RESET_PAYMENT_SUCCESS
    };
  }
}
