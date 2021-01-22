import {Map} from "immutable";
import {RESPONSE_REGISTER, VERIFY, RESET_LOGIN} from "./Constants";

// Initial state
const initialState = Map({
  otp_code: 0,
  sms_otp_code: 0,
  error_message: '',
  verified: false,
});

// Reducer
export default function LoginStateReducer(state = initialState, action = {}) {
  switch (action.type) {

    case RESPONSE_REGISTER:
      return state
          .set('otp_code', action.payload.otp_code)
          .set('error_message', action.payload.error);

    case VERIFY:
      if (state.get('otp_code') === action.payload) {

        return state
            .set('sms_otp_code', action.payload)
            .set('verified', true);


      } else {
        alert('Wrong verification code! Please try again.')
        return state
            .set('sms_otp_code', action.payload);
      }
    case RESET_LOGIN:
      return state
        .set('sms_otp_code', 0)
        .set('otp_code', 0)
        .set('verified', false);
    default:
      return state;
  }
}
