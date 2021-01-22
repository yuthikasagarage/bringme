import {post} from "../utils/api";

export async function createQuote(cartItems) {
  const body = {
    "cartItems": cartItems
  };
  try {
    let response = await post("carts/mine/itemsBulk", body, true);
    return {error: '', response: response, errorCode: 0};
  } catch (e) {
    console.log(e)
    return {error: e.message, response: '', errorCode: e.code};
  }
}

export async function registerQuote(num) {
  try {
    let response = await post("carts/mine", {}, true);
    if (typeof  response === 'string')
      return {quoteId: response, error: ''};
    else
      return {quoteId: '', error: ''};
  } catch (e) {
    return {quoteId: '', error: e.message};
  }
}
