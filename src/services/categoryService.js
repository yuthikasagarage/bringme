import {get} from "../utils/api";
const rootCategoryId = 50;
export async function getAllPrimaryCategories(shouldRefreshProducts) {
  try {
    let categories = await get("categories", true);
    let homeBannerCategory = await get("categories?rootCategoryId=" + rootCategoryId, true);
    return {data: categories.children_data, homeBannerCategory, error: '', shouldRefreshProducts};
  } catch (e) {
    return {data: [], error: e.message, shouldRefreshProducts};
  }
}
