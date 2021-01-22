import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import HomeView from "./View";
import {NavigationActions} from "react-navigation";
import {fetchCategories, setScreenKey, setMinutesBeforeTimeSlotDeactivation, setTimeSlotFullNotificationDisableTime} from "./Actions";
import {setSelectedCategory} from "../subCategories/Actions";
import {resetLogin} from "../login/Actions";
import {setSelectedAddress} from "../address/Actions";
import {logout, initializeSessionState, setHasLaunched} from "../session/Actions";
import {refreshCart, productsUpdated} from "../cart/Actions";
import {loadDeliveryTimeSlots} from "../checkout/Actions";

export default connect(
    state => ({
      loading: state.getIn(['home', 'loading']),
      categories: state.getIn(['home', 'categories']),
      bannerCategory: state.getIn(['home', 'bannerCategory']),
      error: state.getIn(['home', 'error']),
      cartModifiedDate: state.getIn(['cart', 'lastModifiedDate']),
      categoryListUpdatedDate: state.getIn(['home', 'categoryListUpdatedDate']),
      version: state.getIn(['home', 'version']),
      products: state.getIn(['subCategories', 'products']),
      productsLoading: state.getIn(['subCategories', 'productsLoading']),
      productsError: state.getIn(['subCategories', 'productsError']),
      hasLaunched: state.getIn(['session', 'hasLaunched']),
      timeSlots: state.getIn(['checkout', 'timeSlots']),
      minutesBeforeTimeSlotDeactivation: state.getIn(['home', 'minutesBeforeTimeSlotDeactivation']),
      timeSlotFullNotificationDisableTime: state.getIn(['home', 'timeSlotFullNotificationDisableTime']),
    }),
    dispatch => {
      return {
        navigate: bindActionCreators(NavigationActions.navigate, dispatch),
        loadCategories: bindActionCreators(fetchCategories, dispatch),
        setSelectedCategory: bindActionCreators(setSelectedCategory, dispatch),
        resetLogin: bindActionCreators(resetLogin, dispatch),
        logout: bindActionCreators(logout, dispatch),
        clearSessionState: bindActionCreators(initializeSessionState, dispatch),
        setSelectedAddress: bindActionCreators(setSelectedAddress, dispatch),
        refreshCart: bindActionCreators(refreshCart, dispatch),
        setHasLaunched: bindActionCreators(setHasLaunched, dispatch),
        productsUpdated: bindActionCreators(productsUpdated, dispatch),
        loadDeliveryTimeSlots: bindActionCreators(loadDeliveryTimeSlots, dispatch),
        setMinutesBeforeTimeSlotDeactivation: bindActionCreators(setMinutesBeforeTimeSlotDeactivation, dispatch),
        setTimeSlotFullNotificationDisableTime: bindActionCreators(setTimeSlotFullNotificationDisableTime, dispatch),
      };
    }
)(HomeView);
