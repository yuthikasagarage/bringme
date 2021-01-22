import {TRANSFER_WISHLIST_TO_CART, CHANGE_ITEM_QTY_WISHLIST, CHANGE_ITEM_QTY, TOGGLE_ITEM_WISHLIST, SET_QUOTE_CREATED, SET_QUOTE_DELETED, CREATE_QUOTE, CLEAR_CART, REFRESH_CART, CLEAR_ERROR, PRODUCTS_UPDATED, TRANSFER_RE_ORDER_TO_CART} from "./Constants";
import {createQuote as persistQuote}  from "../../services/cartService";

export function changeQty(originalItem, deltaQty, isWishList) {

  let item = Object.assign({} , originalItem);

  if (item.qty ) {
    item.qty += deltaQty;
  } else {
    item.qty = deltaQty;
  }


  if(isWishList){
    return {
      type: CHANGE_ITEM_QTY_WISHLIST,
      payload: item
    };
  }else{
    return {
      type: CHANGE_ITEM_QTY,
      payload: item
    };
  }
}

export async function productsUpdated(products, productsLoading, productsError) {
  return {
    type: PRODUCTS_UPDATED,
    payload: {products, productsLoading, productsError}
  };
}

export async function clearCart() {
  return {
    type: CLEAR_CART,
    payload: await (()=>{return;})()
  };
}

export async function clearError() {
  return {
    type: CLEAR_ERROR
  };
}

export function toggleToWishList(item) {
  return {
    type: TOGGLE_ITEM_WISHLIST,
    payload: item
  };
}

export async function transferWishListToCart() {
  return {
    type: TRANSFER_WISHLIST_TO_CART
  };
}

export async function transferReOrderToCart(items){
  return {
    type: TRANSFER_RE_ORDER_TO_CART,
    payload: {items}
  }
}

export async function setQuoteDeleted() {
  return {
    type: SET_QUOTE_DELETED
  };
}

export async function createQuoteInServer(cartItems) {
  return {
    type: SET_QUOTE_CREATED,
    payload: await persistQuote(cartItems)
  };
}

export async function createQuote(cartItems) {
  return {
    type: CREATE_QUOTE,
    payload:cartItems
  };
}

export function refreshCart() {
  return {
    type: REFRESH_CART
  };
}
