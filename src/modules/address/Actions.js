import {SET_NEW_ADDRESS, SAVE_ADDRESS, SET_SELECTED_ADDRESS, DELETE_ADDRESS} from "./Constants";

export async function saveAddress( data ) {
  return {
    type: SAVE_ADDRESS,
    payload: { data}
  };
}

export async function deleteAddress( address ) {
  return {
    type: DELETE_ADDRESS,
    payload: address
  };
}

export async function setAddress( addressDetails ) {
  return {
    type: SET_NEW_ADDRESS,
    payload: addressDetails
  };
}

export function setSelectedAddress(data) {
  return {
    type: SET_SELECTED_ADDRESS,
    payload: data
  };
}
