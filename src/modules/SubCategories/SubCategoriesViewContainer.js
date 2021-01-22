import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import SubCategoriesView from "./View";
import { NavigationActions } from "react-navigation";
import { setScreenKey } from "../home/Actions";
import {setTabIndex} from "./Actions";

export default connect(
  state => ({
    loading: state.getIn(["subCategories", "loading"]),
    cartItems: state.getIn(["cart", "items"]),
    wishlist: state.getIn(["cart", "wishlist"])
  }),
  dispatch => {
    return {
      navigate: bindActionCreators(NavigationActions.navigate, dispatch),
      setTabIndex: bindActionCreators(setTabIndex, dispatch),

    };
  }
)(SubCategoriesView);
