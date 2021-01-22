import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import LoginView from "./LoginView";
import {NavigationActions} from "react-navigation";
import {setMobileNumber} from "../session/Actions";
import {register, verifyReceivedCode} from "./Actions";

export default connect(
    state => ({
      verificationCode: state.getIn(['login', 'otp_code']),
      verified: state.getIn(['login', 'verified']),
      errorMessage: state.getIn(['login', 'error_message']),
    }),
    dispatch => {
      return {
        navigate: bindActionCreators(NavigationActions.navigate, dispatch),
        setMobile: bindActionCreators(setMobileNumber, dispatch),
        verifyReceivedCode: bindActionCreators(verifyReceivedCode, dispatch),
        register: bindActionCreators(register, dispatch),
      };
    }
)(LoginView);
