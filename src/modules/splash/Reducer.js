// Initial state
import {Map} from "immutable";
export const SPLASH_EXPIRE = 'SplashState/SPLASHEXPIRED';

const initialState = Map({
  splashExpired: false
});

// Reducer
export default function SplashStateReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SPLASH_EXPIRE:
      return state.set('splashExpired', true);
    default:
      return state;
  }
}

export function expireSplash() {
  return {
    type: SPLASH_EXPIRE
  };
}
