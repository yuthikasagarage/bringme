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

class FaqsHomeView extends Component {
  static displayName = 'FAQs';
  drawer = {};
  static navigationOptions = ({navigation, screenProps}) => {
    const {params = {}} = navigation.state;
    return {
      title: (<HeaderText>Contact Us</HeaderText>),
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

  _keyExtractor = (item, index) => index;

  _renderItem = ({item}) => {

    return (
        <Button onPress={()=>this.props.navigate({routeName: 'Questions', params: {topic: item}})} style={{borderWidth: 1, borderColor: '#EEE'}}>
          <View style={{flexDirection: 'column', width: equalWidth, margin: 1, height: 150, justifyContent: 'center', alignItems: 'center'}}>
            <IconFa name={item.iconName} style={{fontSize: 35, marginBottom:10, color: '#FEBC11'}}/>
            <AppText>{item.title}</AppText>
          </View>
        </Button>
    );
  };

  render() {
    return (
        <View style={{flex: 1, flexDirection: 'column', backgroundColor:'white'}}>
          <FlatList
              data={FaqsData}
              numColumns={2}
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
)(FaqsHomeView);
