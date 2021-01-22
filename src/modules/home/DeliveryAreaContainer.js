import React, {Component} from "react";
import {Dimensions, FlatList, StyleSheet, Text, View, Image, ScrollView} from "react-native";
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

const coverageImageRatio = (width - 30)/546;

class DeliveryAreaView extends Component {
  static displayName = '';
  drawer = {};
  static navigationOptions = ({navigation, screenProps}) => {
    const {params = {}} = navigation.state;
    return {
      title: (<HeaderText>Delivery Areas</HeaderText>),
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

  locations = [
   'Colombo 1 - 15',
   'Moratuwa',
   'Mt. Lavinia',
   'Dehiwala',
   'Rathmalana',
   'Piliyandala',
   'Homagama',
   'Athurugiriya',
   'Malabe',
   'Battaramulla',
   'Kotte',
   'Rajagiriya',
   'Borella',
   'Nawala',
   'Nugegoda',
   'Kaduwela',
   'Peliyagoda',
   'Kiribathgoda',
  ]

  getLocationList = (isEven) => {
    let self = this;
    return this.locations.filter((item, index)=>{
      if(isEven){
        return index % 2 == 0;
      }else{
        return index % 2 == 1;
      }
    }).map(function(item, index) {
      return (
          <AppText style={{flex: 0.5}} key={index}>{isEven ? index+1 : (index + 1) + (self.locations.length / 2 )}. {item}</AppText>
      );
    });
  }

  render() {
    return (
        <ScrollView style={{backgroundColor: 'white', padding: 15}}>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={{flex: 1, flexDirection: 'column'}}>{this.getLocationList(true)}</View>
            <View style={{flex: 1, flexDirection: 'column'}}>{this.getLocationList(false)}</View>
          </View>

          <AppText style={{fontSize: 20, marginTop: 20, marginBottom: 20}}>Coverage Map</AppText>
          <Image style={{width: width - 30, height: 748 * coverageImageRatio, marginBottom: 20}} source={require('./coverage.jpg')}></Image>
        </ScrollView>
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
)(DeliveryAreaView);
