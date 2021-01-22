import {INITIALIZE_STATE, RESET_STATE, SET_MOBILE_NUMBER, SET_TOKEN, LOGOUT, SET_HAS_LAUNCHED, SET_ONBOARDING_SHOWN} from "./Constants";
import {loginUser} from "../../services/userService";

export function resetSessionStateFromSnapshot(state) {
  return {
    type: RESET_STATE,
    payload: state
  };
}

export function initializeSessionState() {
  return {
    type: INITIALIZE_STATE
  };
}

export async function doLogin(mNum) {
  return {
    type: SET_TOKEN,
    payload: await loginUser(mNum)
  };
}

export function setMobileNumber(mNumber) {
  return {
    type: SET_MOBILE_NUMBER,
    payload: mNumber
  };
}

export function setHasLaunched() {
  return {
    type: SET_HAS_LAUNCHED
  };
}

export function setOnboardingShown() {
  return {
    type: SET_ONBOARDING_SHOWN
  };
}

export function logout() {
  return {
    type: LOGOUT,
    payload: null
  }
}
