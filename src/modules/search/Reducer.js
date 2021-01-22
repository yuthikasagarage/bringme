import {Map} from "immutable";
import {Effects, loop} from "redux-loop-symbol-ponyfill";

import {CLEAR_SEARCH, DO_SEARCH, GOT_RESULTS} from "./Constants";
import {fetchResults} from "./Actions";

// Initial state
const initialState = Map({
  loading: false,
  results: [],
  error: '',
  currentQuery: {}
});

// Reducer
export default function SearchStateReducer(state = initialState, action = {}) {
  switch (action.type) {
    case DO_SEARCH:
      if(!action.payload.query){
        return state.set('loading', false)
            .set('results', [])
      }
      return loop(
          state.set('loading', true).set('currentQuery', action.payload),
          Effects.promise(fetchResults, action.payload)
      );

    case GOT_RESULTS:

      let rawQueryValue = action.payload.response.search_criteria.filter_groups[0].filters[0].value;
      rawQueryValue = rawQueryValue.replace(/%/g, "");
      if(rawQueryValue != state.get('currentQuery').query){
        return state
      }

      return state.set('loading', false)
          .set('results', action.payload.response.items)
          .set('error', action.payload.error);

    case CLEAR_SEARCH:
      return state.set('results', []);

    default:
      return state;
  }
}
