import React, {Component} from "react";
import {Animated, Dimensions, StyleSheet, Text, View, Platform, InteractionManager, ActivityIndicator} from "react-native";
import IconFa from "react-native-vector-icons/FontAwesome";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import PropTypes from "prop-types";
import ProductsList from "./ProductsListContainer";
import {SceneMap, TabBar, TabViewAnimated} from "react-native-tab-view";
import {NavigationActions} from "react-navigation";
import {getCartTotal} from "../../services/productService";
import Button from "../../components/Button";
import AppStyles from "../../constants/styles";
import IconM from "react-native-vector-icons/Ionicons";
import {setTabIndex} from "./Actions";
import AppText from "../../components/AppText";
import HeaderText from "../../components/HeaderText";
import {BringMeIcon} from "../../utils/bring-me-icons";

import DeviceInfo from 'react-native-device-info';
class SubCategoriesView extends Component {
  static displayName = 'subCategories';
  static showSearch;
  drawer = {};
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      title: (<HeaderText>{params.category.name}</HeaderText>),
      headerLeft: (<IconFa name='chevron-left' onPress={() => navigation.goBack()} style={{color: 'white', padding: 10, marginLeft: 10, fontSize: 20}}/>),
      headerTitleStyle: {
        width: '100%',
        color: '#fff',
      },
      headerRight: (
        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          <BringMeIcon name='bringme-search' onPress={() => showSearch()}
            style={{color: '#fff', fontSize: 18, marginRight: 20}}/>
        </View>
      ),
      headerStyle: {
        backgroundColor: '#FEBC11',
        elevation: 0
      }
    };
  };

  static navigationProps = {
    header: ({state}) => {
      return {
        title: (<AppText>{state.category.name}</AppText>),
      }
    }
  };


  static propTypes = {
    loading: PropTypes.bool.isRequired,
    navigate: PropTypes.func.isRequired,
    setTabIndex: PropTypes.func.isRequired,
    cartItems: PropTypes.object.isRequired

  };

  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      tabsSet: false,
      routes: [],
    }
  }

  // shouldComponentUpdate(nextProps, nextState){
  //   return nextState.tabsSet !== this.state.tabsSet;
  // }

  _showSearch = () => {
    let sCats = this.props.navigation.state.params.category;
    this.props.navigate({routeName: 'Search', params: {cat: this.props.navigation.state.params.category}});
  };

  componentWillMount() {
    showSearch = this._showSearch;
    this.props.setTabIndex(0);

    let cat = this.props.navigation.state.params.category;
    let scenes = {};
    var ind = 0;
    let childrenData = cat.children_data.filter((category)=>category.is_active);
    InteractionManager.runAfterInteractions(() => {
      childrenData.map((subCat) => {
        scenes ['s' + subCat.id] = () => <ProductsList onItemPress={this.itemWasPressed} categoryId={subCat.id} listTabIndex={ind++} />
      });

      let routes = childrenData.map(function (subCat) {
        return {key: 's' + subCat.id, title: subCat.name}
      });

      this._renderScene = SceneMap(scenes);
      this.setState({routes, tabsSet: true});
    });

  };

  _handleIndexChange = (index) => {
    this.setState({index});
    this.props.setTabIndex(index);
  };

  _renderLabel = props => ({route, index}) => {
    const inputRange = props.navigationState.routes.map((x, i) => i);
    const outputRange = inputRange.map(
      inputIndex => (inputIndex === index ? '#FFF' : '#222')
    );

    let color = null;

    if (inputRange.length > 1) {
      color = props.position.interpolate({
        inputRange,
        outputRange,
      });
    } else {
      color = '#FFF';
    }

    return (
      <Animated.Text style={[styles.label, {color}]}>
        {route.title}
      </Animated.Text>
    );
  };

  _renderHeader = props => <TabBar scrollEnabled={true} renderLabel={this._renderLabel(props)} getLabelText={(scene) => scene.route.title} {...props} onTabPress={(x) => {
  }} style={{backgroundColor: '#FEBC11', minHeight: 40, margin: 0}} labelStyle={{marginTop: 3}} indicatorStyle={{backgroundColor: 'white'}}/>;

  _renderScene = SceneMap({});

  itemWasPressed = (item) => {
    // this.props.setSelectedCategory(item);
    this.props.navigate({routeName: 'Product', params: {product: item}});
  }

  _goBack() {
      this.props.navigation.dispatch(NavigationActions.back())
  }


  render() {
    const {loading, cartItems, navigation: {state: {params: {category}}}} = this.props;
    const {tabsSet} = this.state;


    let cartTotal = getCartTotal(cartItems);

    return (
      <View style={{flex: 1, flexDirection: 'column', backgroundColor: 'white'}}>
        { (loading || !tabsSet) ?
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator size="large" color={AppStyles.color.secondary}/>
            </View>
           :
        <TabViewAnimated
          style={styles.container}
          onRequestChangeTab={(index) => {
            this.setState({index});
            this.props.setTabIndex(index);
          }}
          navigationState={this.state}
          renderScene={(options) => {
            if (Math.abs(this.state.index - this.state.routes.indexOf(options.route)) > 2) {
              return <View />;
            }
            return this._renderScene(options);
          }}
          renderHeader={this._renderHeader}
          onIndexChange={this._handleIndexChange}
          initialLayout={initialLayout}
        />
        }
        <Button onPress={() => {
          this.props.navigate({routeName: 'Cart'})
        }}>
          <View style={{flexDirection: 'row', height: 45, backgroundColor: '#FEBC11', alignItems: 'center', justifyContent: 'space-between'}}>
            <AppText style={{color: 'white', fontWeight: '700', fontSize: DeviceInfo.isTablet() ? 18 : 14, marginLeft: 15, flex: 0.5}}>View Cart</AppText>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <AppText style={{color: 'white', fontSize: DeviceInfo.isTablet() ? 18 : 14, fontWeight: '700', marginLeft: 15}}>Rs. {cartTotal} </AppText>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 10, height: 45, backgroundColor: 'rgba(0, 0, 0, 0.4)'}}>
                <EvilIcons name="chevron-right" size={50} color="#fff"/>
              </View>
            </View>
          </View>
        </Button>

      </View>
    );
  }
}
const initialLayout = {
  height: 0,
  width: Dimensions.get('window').width,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    alignItems: 'center',
    justifyContent: 'center',
    fontSize : DeviceInfo.isTablet() ? 18 : 12
  }
});

export default SubCategoriesView;
