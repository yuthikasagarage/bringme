import {fromJS, Map} from "immutable";
import {combineReducers, loop} from "redux-loop-symbol-ponyfill";
import NavigatorStateReducer from "../modules/navigator/NavigatorState";
import SessionStateReducer from "../modules/session/Reducer";
import SplashStateReducer from "../modules/splash/Reducer";
import LoginStateReducer from "../modules/login/Reducer";
import HomeStateReducer from "../modules/home/Reducer";
import ProductViewStateReducer from "../modules/product/Reducer";
import SearchStateReducer from "../modules/search/Reducer";
import SubCategoriesStateReducer from "../modules/subCategories/Reducer";
import CartStateReducer from "../modules/cart/Reducer";
import ProfileStateReducer from "../modules/profile/Reducer";
import CheckoutStateReducer from "../modules/checkout/Reducer";
import AddressStateReducer from "../modules/address/Reducer";
import {RESET_STATE} from "../modules/session/Constants";
import {reducer as form} from 'redux-form/immutable';
// ## Generator Reducer Imports

const reducers = {
  splash: SplashStateReducer,

  navigatorState: NavigatorStateReducer,

  session: SessionStateReducer,

  home: HomeStateReducer,

  login: LoginStateReducer,

  subCategories: SubCategoriesStateReducer,

  product: ProductViewStateReducer,

  search: SearchStateReducer,

  cart: CartStateReducer,

  profile: ProfileStateReducer,

  checkout: CheckoutStateReducer,

  address: AddressStateReducer,

  form,

};

// initial state, accessor and mutator for supporting root-level
// immutable data with redux-loop reducer combinator
const immutableStateContainer = Map();
const getImmutable = (child, key) => child ? child.get(key) : void 0;
const setImmutable = (child, key, value) => child.set(key, value);

const namespacedReducer = combineReducers(
    reducers,
    immutableStateContainer,
    getImmutable,
    setImmutable,
);

export default function mainReducer(state, action) {
  const [nextState, effects] = action.type === RESET_STATE
      ? namespacedReducer(action.payload, action)
      : namespacedReducer(state || void 0, action);

  // enforce the state is immutable
  return loop(fromJS(nextState), effects);
}
