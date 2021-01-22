import {SAVE_PROFILE, SET_LOCAL_MOBILE_NUMBER} from "./Constants";

export async function saveProfile(profileInfo) {
  return {
    type: SAVE_PROFILE,
    payload: profileInfo
  };
}

export function setLocalMobileNumber(mobileNumber) {
  return {
    type: SET_LOCAL_MOBILE_NUMBER,
    payload: mobileNumber
  };
}
