import {connect} from "react-redux";
import SplashScreen from "./SplashScreen";
import {bindActionCreators} from "redux";
import {expireSplash} from "./Reducer";
import {fetchCategories} from "../home/Actions";
import {loadDeliveryTimeSlots} from "../checkout/Actions";

export default connect(
    null,
    dispatch => {
        return {
            expireSplash: bindActionCreators(expireSplash, dispatch),
            loadCategories: bindActionCreators(fetchCategories, dispatch),
            loadDeliveryTimeSlots: bindActionCreators(loadDeliveryTimeSlots, dispatch),
        };
    }
)(SplashScreen);
