import {Map} from "immutable";
import {SET_NEW_ADDRESS, SAVE_ADDRESS, SET_SELECTED_ADDRESS, DELETE_ADDRESS} from "./Constants";

// Initial state
const initialState = Map({
  addresses: Map({}),
  newAddress: {},
  selectedAddress: {}
});

// Reducer
export default function AddressStateReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SAVE_ADDRESS:
      let address = action.payload.data;
      if(address.toJS().isDefaultAddress){
        return state.set('addresses', state.get('addresses').map((existingAddress)=>{
          return existingAddress.set('isDefaultAddress', false)
        }))
        .setIn(['addresses', address.get('title')], address);
      }else{
        return state.setIn(['addresses', address.get('title')], address);
      }
    case SET_NEW_ADDRESS:
      return state.set('newAddress', action.payload);
    case DELETE_ADDRESS:
      {
        let address = action.payload
        return state.deleteIn(['addresses', address.get('title')]);
      }
    case SET_SELECTED_ADDRESS:
      return state.set('selectedAddress', action.payload);
    default:
      return state;
  }
}
