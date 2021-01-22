import {Map} from "immutable";
import {Effects, loop} from "redux-loop-symbol-ponyfill";
import {getAllCategories, incrementVersion} from "./Actions";
import {fetchProductListForCategory} from "../subCategories/Actions";
import {REQUEST_PRIMARY_CATEGORIES, RESPONSE_PRIMARY_CATEGORIES, INCREMENT_VERSION, SET_TIME_SLOT_FULL_NOTIFICATION_DISABLE_TIME, SET_MINUTES_BEFORE_TIME_SLOT_DEACTIVATION} from "./Constants";

// Initial state
const initialState = Map({
  version: 0,
  loading: false,
  categories: [],
  bannerCategory: {},
  error: '',
  categoryListUpdatedDate: new Date(),
  timeSlotFullNotificationDisableTime: '14:00',
  minutesBeforeTimeSlotDeactivation: 60,
});

// Reducer
export default function HomeStateReducer(state = initialState, action = {}) {
  switch (action.type) {
    case REQUEST_PRIMARY_CATEGORIES:
      return loop(
          state.set('loading', true),
          Effects.promise(getAllCategories, action.payload.shouldRefreshProducts)
      );

    case INCREMENT_VERSION:
      return state.set('version', state.get('version') + 1)

    case SET_TIME_SLOT_FULL_NOTIFICATION_DISABLE_TIME:
      return state.set('timeSlotFullNotificationDisableTime', action.payload.time)

    case SET_MINUTES_BEFORE_TIME_SLOT_DEACTIVATION:
      return state.set('minutesBeforeTimeSlotDeactivation', action.payload.minutes)

    case RESPONSE_PRIMARY_CATEGORIES:

      let subCategoryPromiseList = [];

      let primaryCategories = action.payload.data;
      let shouldRefreshProducts = action.payload.shouldRefreshProducts;

      primaryCategories.forEach((category)=>{

        if(shouldRefreshProducts){
          category.children_data.forEach((subCategory) => {
            subCategoryPromiseList.push(Effects.promise(fetchProductListForCategory, subCategory.id));
          })
        }else{
          if(category.children_data.length > 1){
            let subCategory = category.children_data[0];
            subCategoryPromiseList.push(Effects.promise(fetchProductListForCategory, subCategory.id));
          }
        }

      });

      subCategoryPromiseList.push(Effects.call(incrementVersion))

      return loop(
        state
          .set('loading', false)
          .set('categoryListUpdatedDate', shouldRefreshProducts ? new Date() : state.get('categoryListUpdatedDate'))
          .set('categories', action.payload.data)
          .set('bannerCategory', action.payload.homeBannerCategory)
          .set('error', action.payload.error),
        Effects.batch(subCategoryPromiseList)

      );

    default:
      return state;
  }
}
