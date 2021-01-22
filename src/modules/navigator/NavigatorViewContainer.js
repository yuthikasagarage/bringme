import {connect} from "react-redux";
import NavigatorView from "./NavigatorView";
import {resetLogin} from "../login/Actions";
import {logout} from "../session/Actions";
import {bindActionCreators} from "redux";

export default connect(
    state => ({
      navigatorState: state.get('navigatorState').toJS()
    }),
  dispatch => {
      return {
        resetLogin: bindActionCreators(resetLogin, dispatch),
        logout: bindActionCreators(logout, dispatch),
        dispatch: dispatch,
      }
  }
)(NavigatorView);
