import React, {Component} from "react";
import {FlatList, InteractionManager, Platform, StyleSheet, Text, View} from "react-native";
import IconFa from "react-native-vector-icons/FontAwesome";
import PropTypes from "prop-types";
import {NavigationActions} from "react-navigation";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Button from "../../components/Button";
import AddressItem from "../../components/AddressItem";
import {setSelectedAddress, deleteAddress} from "../address/Actions";
import {fromJS} from 'immutable'
import {saveAddress} from "./Actions";
import AppText from "../../components/AppText";
import HeaderText from "../../components/HeaderText";

class AddressListView extends Component {
  static displayName = 'addresses';
  drawer = {};
  static navigationOptions = ({navigation, screenProps}) => {
    const {params = {}} = navigation.state;
    return {
      title: (<HeaderText>My Addresses</HeaderText>),
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
      }
    };
  };

  static goBack;

  constructor(props) {
    super(props);
    this.state = {
      selectMode: false
    }
  }

  static propTypes = {
    navigate: PropTypes.func.isRequired,
    addresses: PropTypes.object.isRequired,
    setSelectedAddress: PropTypes.func.isRequired
  };

  _goBack = () => {
    this.props.navigation.dispatch(NavigationActions.back())
  }

  componentDidMount() {
    goBack = this._goBack;
    if (this.props.navigation.state.params) {
      let selectMode = this.props.navigation.state.params.selectMode;
      this.setState({selectMode});
    }
  }

  _onItemPress = async (item) => {
    await this.props.setSelectedAddress(fromJS(item));
    if (this.state.selectMode) {
      setTimeout(() => {
        this.props.navigation.dispatch(NavigationActions.back())
      })
    }
  }

  _onPressEditItem = (item) => {
    this.props.navigate({routeName: 'NewAddress', params: {address: item}});
  }

  _onPressDeleteItem = (item) => {
    this.props.deleteAddress(fromJS(item));
  }

  onItemSetDefaultAddress = (item) => {
    item.isDefaultAddress = true;
    this.props.saveAddress(fromJS(item));
  }

  _renderItem = ({item}) => {
    item = item.toJS();
    return (
        <AddressItem
            item={item}
            title={item.title}
            street={item.street}
            city={item.city}
            district={item.district}
            postcode={item.postcode}
            building={item.building}
            onPressEditItem={this._onPressEditItem}
            onPressDeleteItem={this._onPressDeleteItem}
            onPressItem={this._onItemPress}
            onSetDefaultAddressItem={this.onItemSetDefaultAddress}
        />
    );
  };

  _keyExtractor = (item, index) => item.toJS().title;

  render() {
    const {addresses} = this.props;
    let dataArray = addresses.toIndexedSeq().toArray();
    return (
        <View style={{flex: 1, flexDirection: 'column', backgroundColor: 'white'}}>
          <FlatList
              data={dataArray}
              numColumns={1}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}

          />
          <Button disabled={this.props.submitting} onPress={() => {
            this.props.navigate({routeName: 'NewAddress'});
          }} style={{padding: 10, backgroundColor: 'white'}}>
              <View style={{flexDirection: 'row', height: 45, backgroundColor: '#FEBC11', alignItems: 'center', justifyContent: 'center'}}>
                <AppText style={{color: 'white', fontWeight: '800', fontSize: 16, flex: 1, textAlign: 'center'}}>Add New Address</AppText>
              </View>
          </Button>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  formInput: {
    borderRadius: 3,
    fontSize: 16,
    borderWidth: Platform.OS === 'ios' ? 1 : 0,
    borderColor: '#DAE3E3',
    color: 'black',
    marginRight: 10,
    marginLeft: 10
  },
  formLabel: {
    fontSize: 12,
    color: 'grey',
    width: '100%',
    paddingLeft: 15,
    paddingRight: 15,
  },
  button: {
    width: 150,
    height: 40,
    backgroundColor: '#006ecb',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'center'
  }
});


export default connect(
    state => ({
      addresses: state.getIn(['address', 'addresses']),
    }),
    dispatch => {
      return {
        navigate: bindActionCreators(NavigationActions.navigate, dispatch),
        saveAddress: bindActionCreators(saveAddress, dispatch),
        setSelectedAddress: bindActionCreators(setSelectedAddress, dispatch),
        deleteAddress: bindActionCreators(deleteAddress, dispatch)
      }
    }
)(AddressListView);
