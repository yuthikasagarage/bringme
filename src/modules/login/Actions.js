import {RESPONSE_REGISTER, VERIFY, RESET_LOGIN} from "./Constants";
import {registerMobile} from "../../services/userService";


export async function register(mobileNumber) {
  return {
    type: RESPONSE_REGISTER,
    payload: await registerMobile(mobileNumber)
  };
}

export async function verifyReceivedCode(code) {
  return {
    type: VERIFY,
    payload: code
  };
}

export async function resetLogin() {
  return {
    type: RESET_LOGIN,
    payload: null
  };
}
