// Initial state
import {Map} from "immutable";
import {INITIALIZE_STATE, RESET_STATE, SET_MOBILE_NUMBER, SET_TOKEN, LOGOUT, SET_HAS_LAUNCHED, SET_ONBOARDING_SHOWN} from "./Constants";
import {setLocalMobileNumber} from "../profile/Actions";
import {Effects, loop} from "redux-loop-symbol-ponyfill";
const initialState = Map({
  isReady: false,
  mobileSet: false,
  mobileNumber: "0",
  token: '',
  loginError: '',
  hasLaunched: false,
  isLocal: true,
  onboardingShown: false
});
// Reducer
export default function SessionStateReducer(state = initialState, action = {}) {
  switch (action.type) {
    case INITIALIZE_STATE:
    case RESET_STATE:
      return state.set('isReady', true);
    case SET_MOBILE_NUMBER:
      let mobileNumber = action.payload;
      let isLocal = true;
      let localMobileNumber = '';
      if(mobileNumber.includes('+')){
        isLocal = false;
      }
      if(isLocal){
        localMobileNumber = mobileNumber;
      }
      return loop(
        state
          .set('mobileNumber', mobileNumber)
          .set('isLocal', isLocal)
          .set('mobileSet', true),
        Effects.call(setLocalMobileNumber, localMobileNumber)
      );


    case SET_TOKEN:
      return state
          .set('token', action.payload.token)
          .set('loginError', action.payload.error);
    case SET_HAS_LAUNCHED:
      return state
          .set('hasLaunched', true);
    case SET_ONBOARDING_SHOWN:
      return state
          .set('onboardingShown', true);
    case LOGOUT:
      return state
          .set('token', '')
          .set('loginError', '')
          .set('mobileSet', false)
          .set('mobileNumber', '0');
    default:
      return state;
  }
}
