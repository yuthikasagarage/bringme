import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import ProfileView from "./View";
import {NavigationActions} from "react-navigation";
import {saveProfile} from "./Actions";
import {resetLogin} from "../login/Actions";
import {logout} from "../session/Actions";

export default connect(
    state => ({
      initialValues: state.getIn(['profile', 'personalInfo']),
      mobileNumber: state.getIn(['session', 'mobileNumber']),
      isLocal: state.getIn(['session', 'isLocal']),
    }),
    dispatch => {
        return {
            navigate: bindActionCreators(NavigationActions.navigate, dispatch),
            saveProfile: bindActionCreators(saveProfile, dispatch),
            resetLogin: bindActionCreators(resetLogin, dispatch),
            logout: bindActionCreators(logout, dispatch)
        }
    }
)(ProfileView);
