import { get, post, put } from "../utils/api";

export async function estimateShippingCost(address) {
  const body = { address };
  try {
    let response = await post(
      "carts/mine/estimate-shipping-methods",
      body,
      true
    );
    return { error: "", response: response };
  } catch (e) {
    return { error: e.message };
  }
}

export async function setShippingInfo(shippingInfo) {
  const body = {
    addressInformation: shippingInfo
  };
  try {
    let response = await post("carts/mine/shipping-information", body, true);
    return { error: "", response: response };
  } catch (e) {
    return { error: e.message };
  }
}

export async function createOrder(paymentInfo) {
  try {
    let response = await post(
      "orders/savePaymentInfoAndCreateOrder",
      paymentInfo,
      true
    );
    console.log(response);
    return { error: "", orderId: response };
  } catch (e) {
    console.log(e);
    return { error: e.message };
  }
}

export async function cancelOrder(orderId, isFailedPayment) {
  try {
    let response = await get("orders/cancel?id=" + orderId, true);
    console.log(response);
    return { error: "", success: response, isFailedPayment };
  } catch (e) {
    console.log(e);
    return { error: e.message, isFailedPayment };
  }
}

export async function getOrders() {
  try {
    let response = await get("orders/me?searchCriteria=", true);
    console.log(response);
    let items = response.items.sort(function(a, b) {
      return b.entity_id - a.entity_id;
    });
    return { error: "", data: items };
  } catch (e) {
    console.log(e);
    return { error: e.message };
  }
}

export async function getTimeSlots() {
  try {
    let response = await get("orders/timeIntervals", true);
    console.log(response);
    return { error: "", data: response[0] };
  } catch (e) {
    console.log(e);
    return { error: e.message };
  }
}

export async function setCouponCode(couponCode) {
  try {
    let response = await put("carts/mine/coupons/" + couponCode, {}, true);
    console.log(response);
    return { error: "", data: response };
  } catch (e) {
    console.log(e);
    return { error: e.message };
  }
}

export function getDayName(dateStr, locale = "en-US") {
  var date = new Date(dateStr);
  return date.toLocaleDateString(locale, { weekday: "long" });
}
