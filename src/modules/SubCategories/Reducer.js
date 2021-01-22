import {Map, fromJS} from "immutable";
import {Effects, loop} from "redux-loop-symbol-ponyfill";

import {GET_CATEGORIES, GOT_CATEGORIES, SET_TAB_INDEX, CLEAR_PRODUCTS} from "./Constants";
import {getProductListForCategory} from "./Actions";

// Initial state
const initialState = Map({
  selectedCategory: {},
  products: Map({}),
  loading: false,
  productsLoading: Map({}),
  productsError: Map({}),
  currentTab: 0,
});

// Reducer
export default function SubCategoriesStateReducer(state = initialState, action = {}) {
  switch (action.type) {
    case GET_CATEGORIES:
      return loop(
        state.setIn('productsLoading', action.payload, true),
        Effects.promise(getProductListForCategory, action.payload)
      );

    case SET_TAB_INDEX:
      return state.set('currentTab',  action.payload);

    case GOT_CATEGORIES:
      let error = action.payload.error;
      if(error){
        return state.setIn(['productsLoading', action.payload.id.toString()], false)
          .setIn(['productsError', action.payload.id.toString()], error)
          .setIn(['products', action.payload.id.toString()], fromJS(action.payload.data));
      }
      return state.setIn(['productsLoading', action.payload.id.toString()], false)
        .setIn(['productsError', action.payload.id.toString()], false)
        .setIn(['products', action.payload.id.toString()], fromJS(action.payload.data));

    case CLEAR_PRODUCTS:
      return state.set('products', Map({})).set('')

    default:
      return state;
  }
}
