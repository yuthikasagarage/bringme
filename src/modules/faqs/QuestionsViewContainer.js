import React, {Component} from "react";
import {Dimensions, FlatList, StyleSheet, Text, View} from "react-native";
import IconFa from "react-native-vector-icons/FontAwesome";
import PropTypes from "prop-types";
import {NavigationActions} from "react-navigation";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Button from "../../components/Button";
import {FaqsData} from "./Data";
import AppText from "../../components/AppText";
import HeaderText from "../../components/HeaderText";

const {width, height} = Dimensions.get('window');
const equalWidth = (width / 2 ) - 2;

class QuestionsView extends Component {
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

  _keyExtractor = (item, index) => index.toString();

  _renderItem = ({item}) => {

    return (
        <Button onPress={() => this.props.navigate({routeName: 'Answers', params: {topic: this.props.navigation.state.params.topic, question: item}})}>
          <View style={{flexDirection: 'column', marginHorizontal:10,  paddingHorizontal: 15, paddingVertical: 10 , borderBottomColor: '#d5d5d5', borderBottomWidth:1 }}>
            <AppText style={{fontSize:18}}>{item.title}</AppText>
          </View>
        </Button>
    );
  };

  render() {
    return (
        <View style={{flex: 1, flexDirection: 'column', backgroundColor: 'white'}}>
          <FlatList
              data={ this.props.navigation.state.params.topic.questions}
              numColumns={1}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}
          />
        </View>
    );
  }

}


const styles = StyleSheet.create({});

export default connect(
    state => ({}),
    dispatch => {
      return {
        navigate: bindActionCreators(NavigationActions.navigate, dispatch)
      }
    }
)(QuestionsView);
