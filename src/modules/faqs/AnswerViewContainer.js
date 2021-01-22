import React, {Component} from "react";
import {Dimensions, FlatList, StyleSheet, Text, View} from "react-native";
import IconFa from "react-native-vector-icons/FontAwesome";
import PropTypes from "prop-types";
import {NavigationActions} from "react-navigation";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import HTMLView from 'react-native-htmlview';
import AppText from "../../components/AppText";
import HeaderText from "../../components/HeaderText";

const {width, height} = Dimensions.get('window');
const equalWidth = (width / 2 ) - 2;

class AnswersView extends Component {
  static displayName = '';
  drawer = {};
  static navigationOptions = ({navigation, screenProps}) => {
    const {params = {}} = navigation.state;
    return {
      title: (<HeaderText>{params.topic.title}</HeaderText>),
      headerLeft: (<IconFa name='chevron-left' onPress={() => {
        goBack()
      }} style={{color: 'white', padding: 10, marginLeft: 10, fontSize: 20}}/>),
      headerTitleStyle: {
        width: '100%',
        color: '#fff',
      },
      headerStyle: {
        backgroundColor: '#FEBC11',
        elevation: 0
      },
    };
  };

  static goBack;

  constructor(props) {
    super(props);
    this.state = {};
  }

  static propTypes = {
    navigate: PropTypes.func.isRequired,
  };

  _goBack = () => {
    this.props.navigation.dispatch(NavigationActions.back())
  }

  componentDidMount() {
    goBack = this._goBack;
  }

  render() {
    return (
        <View style={{flex: 1, flexDirection: 'column', backgroundColor: 'white', paddingHorizontal:15}}>
           <AppText style={{fontSize:19, fontWeight:'600', marginTop:20, marginBottom:30, color:'black'}}>{this.props.navigation.state.params.question.title}</AppText>
           <HTMLView value={this.props.navigation.state.params.question.answer} stylesheet={styles}/>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  p: {
    fontSize: 16
  },
});

export default connect(
    state => ({}),
    dispatch => {
      return {
        navigate: bindActionCreators(NavigationActions.navigate, dispatch)
      }
    }
)(AnswersView);
