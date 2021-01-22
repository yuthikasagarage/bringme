import {Map} from "immutable";
import {Effects, loop} from "redux-loop-symbol-ponyfill";

import {GET_CATEGORIES, GOT_CATEGORIES} from "./Constants";
import {getProductListForCategory} from "./Actions";

// Initial state
const initialState = Map({
  loading: false,
});

// Reducer
export default function ProductViewStateReducer(state = initialState, action = {}) {
  switch (action.type) {

    default:
      return state;
  }
}