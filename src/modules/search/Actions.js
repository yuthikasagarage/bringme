import {CLEAR_SEARCH, DO_SEARCH, GOT_RESULTS} from "./Constants";
import {searchProduct} from "../../services/productService";


export async function doSearch(query) {
  return {
    type: DO_SEARCH,
    payload: query
  };
}

export async function clearSearch() {
    return {
        type: CLEAR_SEARCH,
    };
}

export async function fetchResults(query) {
  return {
    type: GOT_RESULTS,
    payload: await searchProduct(query)
  };
}
