import {connect} from "react-redux";
import AppView from "./AppView";
import {doLogin, setMobileNumber} from "./session/Actions";
import {bindActionCreators} from "redux";

export default connect(
    state => ({
      isReady: state.getIn(['session', 'isReady']),
      splashExpired: state.getIn(['splash', 'splashExpired']),
      mobileSet: state.getIn(['session', 'mobileSet']),
      mobileNumber: state.getIn(['session', 'mobileNumber']),
      token: state.getIn(['session', 'token']),
    }),
    dispatch => {
      return {
        setMobile: bindActionCreators(setMobileNumber, dispatch),
        doLogin: bindActionCreators(doLogin, dispatch),
        dispatch: dispatch,
      };
    }
)(AppView);
