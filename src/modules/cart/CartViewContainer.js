import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import CartView from "./View";
import {NavigationActions} from "react-navigation";
import {changeQty, toggleToWishList, setQuoteCreated, setQuoteDeleted, createQuote, clearError} from "./Actions";
import {setScreenKey} from "../home/Actions";

export default connect(
    state => ({
      items: state.getIn(['cart', 'items']),
      wishlist: state.getIn(['cart', 'wishlist']),
      quoteCreating: state.getIn(['cart', 'quoteCreating']),
      error: state.getIn(['cart', 'error']),
      errorCode: state.getIn(['cart', 'errorCode'])
    }),
    dispatch => {
      return {
        navigate: bindActionCreators(NavigationActions.navigate, dispatch),
        changeQty: bindActionCreators(changeQty, dispatch),
        toggleToWishList: bindActionCreators(toggleToWishList, dispatch),
        setQuoteDeleted: bindActionCreators(setQuoteDeleted, dispatch),
        createQuote: bindActionCreators(createQuote, dispatch),
        clearError: bindActionCreators(clearError, dispatch)
       };
    }
)(CartView);
