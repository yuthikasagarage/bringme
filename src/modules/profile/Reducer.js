import {Map} from "immutable";
import {SAVE_PROFILE, SET_LOCAL_MOBILE_NUMBER} from "./Constants";

// Initial state
const initialState = Map({
  personalInfo: {},
  saved: false,
});

// Reducer
export default function ProfileStateReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SAVE_PROFILE:
      return state.set('personalInfo', action.payload).set('saved', true);
    case SET_LOCAL_MOBILE_NUMBER:
      let personalInfo = state.get('personalInfo');
      if(personalInfo.toJS){
        personalInfo = personalInfo.toJS();
      }
      return state.set('personalInfo', {...personalInfo, localMobileNumber: action.payload});
    default:
      return state;
  }
}
