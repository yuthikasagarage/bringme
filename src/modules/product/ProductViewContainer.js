import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import ProductView from "./View";
import { NavigationActions } from "react-navigation";
import {changeQty, toggleToWishList} from "../cart/Actions";

export default connect(
  state => ({
    cartItems: state.getIn(["cart", "items"]),
    wishlist: state.getIn(["cart", "wishlist"])
  }),
  dispatch => {
    return {
      navigate: bindActionCreators(NavigationActions.navigate, dispatch),
      changeQty: bindActionCreators(changeQty, dispatch),
      toggleToWishList: bindActionCreators(toggleToWishList, dispatch)
    };
  }
)(ProductView);
