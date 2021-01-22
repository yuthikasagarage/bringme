import {Map,fromJS} from "immutable";
import {Effects, loop} from "redux-loop-symbol-ponyfill";

import {TRANSFER_WISHLIST_TO_CART, CHANGE_ITEM_QTY_WISHLIST, CHANGE_ITEM_QTY, TOGGLE_ITEM_WISHLIST, SET_QUOTE_CREATED, SET_QUOTE_DELETED, CREATE_QUOTE, CLEAR_CART, REFRESH_CART, CLEAR_ERROR, PRODUCTS_UPDATED, TRANSFER_RE_ORDER_TO_CART} from "./Constants";
import {createQuoteInServer, refreshCart, createQuote} from "./Actions";
import {NavigationActions} from "react-navigation";

// Initial state
const initialState = Map({
  loading: false,
  items: Map({}),
  wishlist: Map({}),
  quoteCreated: false,
  quoteCreating: false,
  error: '',
  errorCode: 0,
  lastModifiedDate: new Date()
});

// Reducer
export default function CartStateReducer(state = initialState, action = {}) {
  switch (action.type) {

    case CREATE_QUOTE:
      return loop(
          state.set('quoteCreating', true),
          Effects.promise(createQuoteInServer, action.payload)
      );

    case SET_QUOTE_DELETED:
      return state.set('quoteCreated', false);

    case CLEAR_ERROR:
      return state.set('error', '').set('errorCode', 0);

    case SET_QUOTE_CREATED:
      if(action.payload.error){
        return state.set('quoteCreated', false).set('quoteCreating', false).set('error', action.payload.error).set('errorCode', action.payload.errorCode);
      }
      return loop(
        state.set('quoteCreated', true).set('quoteCreating', false).set('error', action.payload.errorCode).set('errorCode', action.payload.errorCode),
        Effects.call(NavigationActions.navigate, {routeName: 'Delivery'})
      );

    case TRANSFER_WISHLIST_TO_CART:

      let wishListQuoteItems = state.get('wishlist').filter((wishListItem)=>{
        let wishListItemJs = wishListItem.toJS()
        return wishListItemJs.lit && wishListItemJs.qty > 0 && (!wishListItemJs.show_out_of_stock || (wishListItemJs.warehouse_stock_qty > 0));
      })

      return loop(
        state.set('items', state.get('items').merge(fromJS(wishListQuoteItems))),
        Effects.call(NavigationActions.navigate, {routeName: 'Cart'})
      );

    case TRANSFER_RE_ORDER_TO_CART:

      let itemsObject = {};
      let processedItems = action.payload.items.filter(item => 
        (!item.show_out_of_stock || (item.warehouse_stock_qty > 0))
      )
      .forEach(item => {
        itemsObject[item.id] = fromJS(item)
      })

      processedOrderItems = fromJS(itemsObject);

      return loop(
        state.set('items', state.get('items').merge(processedOrderItems)).set('lastModifiedDate', new Date()),
        Effects.call(NavigationActions.navigate, {routeName: 'Cart'})
      );

    case CHANGE_ITEM_QTY:
      if(action.payload.qty === 0){
        return state.deleteIn(['items', action.payload.id.toString()]).set('lastModifiedDate', new Date());
      }
      return state.setIn(['items', action.payload.id.toString()],  fromJS(action.payload)).set('lastModifiedDate', new Date());

    case CHANGE_ITEM_QTY_WISHLIST:
      return state.setIn(['wishlist', action.payload.id.toString()], fromJS(action.payload));

    case REFRESH_CART:
      return state.set('items', Map({}));

    case PRODUCTS_UPDATED:
      let products = action.payload.products;
      let productsLoading = action.payload.productsLoading;
      let productsError = action.payload.productsError;
      let cartItemsNew = [];
      let wishListItemsNew = [];

      cartItems = state.get('items').toArray();

      cartItems.forEach((cartItem)=>{
        let cartItemJs = cartItem.toJS();
        let product = products.filter((product)=>{return product.get('id') == cartItemJs.id})[0];
        if(product){
          let productJs = product.toJS();
          if(productJs.status == 2){
            return;
          }
          cartItemJs.final_price = productJs.final_price;
          cartItemJs.price = productJs.price;
          cartItemsNew.push(cartItemJs);
        }else{
          productCategory = cartItemJs.categoryId;
          if(productCategory){
            if(productsLoading.get(productCategory.toString()) === true || productsError.get(productCategory.toString())){
              cartItemsNew.push(cartItemJs);
            }
          }else{
            cartItemsNew.push(cartItemJs);
          }
        }

      })

      wishListItems = state.get('wishlist').toArray();

      wishListItems.forEach((wishListItem)=>{
        let wishListItemJs = wishListItem.toJS();
        let product = products.filter((product)=>{return product.get('sku') == wishListItemJs.sku})[0];
        if(product){
          let productJs = product.toJS();
          if(productJs.status == 2){
            return;
          }
          wishListItemJs.final_price = productJs.final_price;
          wishListItemJs.price = productJs.price;
          wishListItemsNew.push(wishListItemJs);
        }else{
          productCategory = wishListItemJs.categoryId;
          if(productCategory){
            if(productsLoading.get(productCategory.toString()) == undefined || productsLoading.get(productCategory.toString()) === true || productsError.get(productCategory.toString())){
              wishListItemsNew.push(wishListItemJs);
            }
          }else{
            wishListItemsNew.push(wishListItemJs);
          }
        }

      })

      let cartItemsMap = Map(cartItemsNew.map(
        (item, index) => ([ item.id.toString(), fromJS(item) ])));

      let wishListItemsMap = Map(wishListItemsNew.map(
          (item, index) => ([ item.id.toString(), fromJS(item) ])));

      return state.set('items', cartItemsMap).set('wishlist', wishListItemsMap)

    case CLEAR_CART:
      return loop(
        state.set('items', Map({})),
        Effects.call(NavigationActions.reset, {
          index: 1,
          key: null,
          actions: [
              NavigationActions.navigate({ routeName: 'Home'}),
              NavigationActions.navigate({ routeName: 'OrderList'}),
          ]
        })
      );

    case TOGGLE_ITEM_WISHLIST:
      let item = fromJS(action.payload);
      let itemJS = item.toJS();
      itemJS.qty = 0;
      return state.setIn(['wishlist', action.payload.id.toString()], fromJS(itemJS));

    default:
      return state;
  }
}
