import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import SearchView from "./View";
import {NavigationActions} from "react-navigation";
import {clearSearch, doSearch} from "./Actions";
import {changeQty, toggleToWishList} from "../cart/Actions";

export default connect(
    state => ({
      loading: state.getIn(['search', 'loading']),
      error: state.getIn(['search', 'error']),
      results: state.getIn(['search', 'results']),
      cartItems: state.getIn(['cart', 'items']),
      wishlist: state.getIn(['cart', 'wishlist']),
    }),
    dispatch => {
      return {
        navigate: bindActionCreators(NavigationActions.navigate, dispatch),
        doSearch: bindActionCreators(doSearch, dispatch),
        changeQty: bindActionCreators(changeQty, dispatch),
        clearSearch: bindActionCreators(clearSearch, dispatch),
        toggleToWishList: bindActionCreators(toggleToWishList, dispatch),
      };
    }
)(SearchView);
