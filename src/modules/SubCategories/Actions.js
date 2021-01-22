import {GET_CATEGORIES, GOT_CATEGORIES, SET_SELECTED_CATEGORY, SET_TAB_INDEX, CLEAR_PRODUCTS} from "./Constants";
import {getProductsInCategory} from "../../services/productService";


export async function setSelectedCategory(category) {
  return {
    type: SET_SELECTED_CATEGORY,
    payload: category
  };
}

export async function getProductListForCategory(category) {
  return {
    type: GOT_CATEGORIES,
    payload: await getProductsInCategory(category)
  };
}

export async function fetchProductListForCategory(category) {
  return {
    type: GET_CATEGORIES,
    payload: category
  };
}

export async function setTabIndex(index) {
  return {
    type: SET_TAB_INDEX,
    payload: index
  };
}

export async function clearProducts() {
  return {
    type: CLEAR_PRODUCTS
  };
}
