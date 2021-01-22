import {REQUEST_PRIMARY_CATEGORIES, RESPONSE_PRIMARY_CATEGORIES, INCREMENT_VERSION, SET_MINUTES_BEFORE_TIME_SLOT_DEACTIVATION, SET_TIME_SLOT_FULL_NOTIFICATION_DISABLE_TIME} from "./Constants";
import {getAllPrimaryCategories} from "../../services/categoryService";


export async function getAllCategories(shouldRefreshProducts) {
  return {
    type: RESPONSE_PRIMARY_CATEGORIES,
    payload: await getAllPrimaryCategories(shouldRefreshProducts)
  };
}

export async function fetchCategories(shouldRefreshProducts) {
  return {
    type: REQUEST_PRIMARY_CATEGORIES,
    payload: {shouldRefreshProducts}
  };
}

export function incrementVersion() {
  return {
    type: INCREMENT_VERSION
  };
}

export function setMinutesBeforeTimeSlotDeactivation(minutes) {
  return {
    type: SET_MINUTES_BEFORE_TIME_SLOT_DEACTIVATION,
    payload: {minutes}
  };
}

export function setTimeSlotFullNotificationDisableTime(time) {
  return {
    type: SET_TIME_SLOT_FULL_NOTIFICATION_DISABLE_TIME,
    payload: {time}
  };
}
