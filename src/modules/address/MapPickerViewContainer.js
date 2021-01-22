import React, {Component} from "react";
import {Dimensions, InteractionManager, StyleSheet, Text, View, Platform, Alert} from "react-native";
import IconFa from "react-native-vector-icons/FontAwesome";
import PropTypes from "prop-types";
import {NavigationActions} from "react-navigation";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import MapView, {Polygon} from "react-native-maps";
import Geocoder from "react-native-geocoding";
import {GooglePlacesAutocomplete} from "../../components/GooglePlacesAutocomplete";
import Button from "../../components/Button";
import AppText from "../../components/AppText";
import AppStyles from "../../constants/styles";
import HeaderText from "../../components/HeaderText";
import {setAddress} from "./Actions";
import {change} from "redux-form";
import {mapBoundingBox, mapBoundingBoxInLatLon, mapBoundingBox2, mapBoundingBox2InLatLon, isPointInsidePolygon, getShippingCost} from '../../services/addressService'
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";

import Icon from "react-native-vector-icons/MaterialIcons";

const {width} = Dimensions.get('window');
const searchBarWidth = (width   ) - 20;
let locationInterval = null;
class MapPickerView extends Component {
  static displayName = 'MapPicker';

  drawer = {};
  static navigationOptions = ({navigation, screenProps}) => {
    const {params = {}} = navigation.state;
    return {
      title: (<HeaderText>Pick Location</HeaderText>),
      headerLeft: (<IconFa name='arrow-left' onPress={() => {
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
      mapRegion: null,
      lastLat: null,
      lastLong: null,
      formattedAddress: null,
      addressComponents: null,
      query: '',
      region: {},
      postcode: '',
      city: '',
      district: '',
      street: '',
        submitDisabled:true
    }
  }

  static propTypes = {
    navigate: PropTypes.func.isRequired,
    setAddress: PropTypes.func.isRequired,
  };

  _goBack = () => {
    this.props.navigation.dispatch(NavigationActions.back())
  };

  changeRegion(region, lastLat, lastLong) {
    this.setState({
      mapRegion: region,
      // If there are no new values set use the the current ones
      lastLat: lastLat,
      lastLong: lastLong
    });

  }

  getAddressComponent = (addressComponents, componentName) => {
    return addressComponents.filter((addressComponent)=>{return addressComponent.types.indexOf(componentName) != -1})[0]
  };

  onRegionChange = (e) => {
    //this.setState({selectedCoord: e});
    Geocoder.getFromLatLng(e.latitude, e.longitude).then(
        json => {

          let postcodeComponent = this.getAddressComponent(json.results[0].address_components, 'postal_code');
          let postcode = postcodeComponent ? postcodeComponent.long_name : "00000";

          let streetComponent = this.getAddressComponent(json.results[0].address_components, 'route');
          let street = streetComponent ? streetComponent.long_name : "Unknown Street";

          let cityComponent = this.getAddressComponent(json.results[0].address_components, 'locality');
          let city = cityComponent ? cityComponent.long_name : "Unknown City";

          let districtComponent = this.getAddressComponent(json.results[0].address_components, 'administrative_area_level_2');
          let district = districtComponent ? districtComponent.long_name : "Unknown District";

          let formattedAddress = json.results[0].formatted_address;
          let addressComponents = json.results[0].address_components;

          let region = {
            latitude: e.latitude,
            longitude: e.longitude,
            latitudeDelta: 0.00922 * 0.5,
            longitudeDelta: 0.00421 * 0.5
          };
          this.setState({formattedAddress, addressComponents, region, postcode, street, city, district});
          if (!this.autoCompleteMove)
            this.changeRegion(region, region.latitude, region.longitude);
        },
        error => {
          console.log(error);
        }
    );
  }

  autoCompleteMove = false;

  componentDidMount() {

    goBack = this._goBack;

    Geocoder.setApiKey('AIzaSyC48dVPsLILHymDyHrT8l1T8_UjUqcCVaU');

    if(Platform.OS === 'ios') {

      this.watchID = navigator.geolocation.watchPosition((position) => {
        // Create the object to update this.state.mapRegion through the changeRegion function
        let region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.00922 * 0.5,
          longitudeDelta: 0.00421 * 0.5
        };
        this.setState({
          submitDisabled: false,
        });

        this.mapView.animateToRegion(region, 1000);
        navigator.geolocation.clearWatch(this.watchID);
      }, () => {
      }, {enableHighAccuracy: true});

    }

    if(Platform.OS === 'android') {

      LocationServicesDialogBox.checkLocationServicesIsEnabled({
        message: "Please turn on location services to auto detect current location",
        ok: "TURN ON",
        cancel: "DISMISS",
        enableHighAccuracy: true, // true => GPS AND NETWORK PROVIDER, false => GPS OR NETWORK PROVIDER
        showDialog: true, // false => Opens the Location access page directly
        openLocationServices: true, // false => Directly catch method is called if location services are turned off
        preventOutSideTouch: false, //true => To prevent the location services window from closing when it is clicked outside
        preventBackClick: false //true => To prevent the location services popup from closing when it is clicked back button
      }).then(function(success) {
        console.log(success); // success => {alreadyEnabled: false, enabled: true, status: "enabled"}
      }).catch((error) => {
        console.log(error.message); // error.message => "disabled"
      });


      locationInterval = setInterval(()=>{
        if(!this.state.submitDisabled){
          return;
        }
        try {
          navigator.geolocation.getCurrentPosition((position) => {
            let region = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: 0.00922 * 0.5,
              longitudeDelta: 0.00421 * 0.5
            };
            this.setState({
              submitDisabled: false,
            });

            this.mapView.animateToRegion(region, 1000);
            clearInterval(locationInterval);
          });
        }catch (e){

        }
      }, 2000);

    }

  }

  zoomToMyLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      let region = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.00922 * 0.5,
        longitudeDelta: 0.00421 * 0.5
      };
      this.setState({
        submitDisabled: false,
      });

      this.mapView.animateToRegion(region, 1000);
    });
  };

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
      this.setState({
          submitDisabled: true,
      });
    if(Platform.OS === 'android') {
      clearInterval(locationInterval);
    }
  }

  renderAutoComplete() {
    const data = [];
    const {query} = this.state;
    return (
        <View style={styles.autocompleteContainer}>
          <GooglePlacesAutocomplete
              ref={(ref) => {
                this.autoComplete = ref
              }}
              placeholder='Search'
              minLength={2} // minimum length of text to search
              autoFocus={false}
              returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
              listViewDisplayed={false}
              fetchDetails={true}
              renderDescription={row => row.description} // custom description render
              onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                let region = {
                  latitude: details['geometry'].location.lat,
                  longitude: details['geometry'].location.lng,
                  latitudeDelta: 0.00922 * 0.5,
                  longitudeDelta: 0.00421 * 0.5
                };
                let formattedAddress = details['formatted_address'];
                this.setState({formattedAddress, region});
                this.autoCompleteMove = true;
                this.mapView.animateToRegion(region, 500);
                setTimeout(function () {
                  this.autoCompleteMove = false;
                }, 1000)

              }}
              enablePoweredByContainer={false}
              getDefaultValue={() => ''}

              query={{
                // available options: https://developers.google.com/places/web-service/autocomplete
                key: 'AIzaSyDnZmJgGs4pKn1wO3wqTP_GIYzSH11CgYk',
                language: 'en', // language of the results
              }}

              styles={{

                textInputContainer: {
                  width: '100%'
                },
                description: {
                  fontWeight: 'bold'
                },
                predefinedPlacesDescription: {
                  color: '#1faadb'
                },
                container: {
                  backgroundColor: 'rgba(0,0,0,0)',

                }, loader: {
                  backgroundColor: 'rgba(0,0,0,0)'
                },
                listView: {
                  backgroundColor: 'rgba(255,255,255,1)'
                }
              }}
              nearbyPlacesAPI='GoogleReverseGeocoding' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
              debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.

          />
        </View>)
  }

  _done = async () => {
    let details = this.state.addressComponents;
    if (details) {

      let selectedPoint = {x: this.state.region.latitude, y: this.state.region.longitude}
      if (!isPointInsidePolygon(selectedPoint, mapBoundingBox2)) {
        alert('This delivery location is still not covered! Delivery is available only for the area marked with light and dark green.');
        this.setState({text: ''});
      } else {
        if (!isPointInsidePolygon(selectedPoint, mapBoundingBox)) {
          let result = await getShippingCost(selectedPoint);
          if(result.error){
            this.pickAddress();
          }else{
            let shippingCost = result.response;
            if(shippingCost > 0){
              Alert.alert('Alert', `This area requires a delivery fee of ${shippingCost}. Do you want to continue ?`,
                [
                  {text: 'OK', onPress: () => {this.pickAddress()} },
                  {text: 'Cancel', onPress: () => {}, style: 'cancel' }
                ]
              )
            }else{
              this.pickAddress();
            }
          }
        }else{
          this.pickAddress();
        }
      }
    }
  }

  pickAddress = () => {
    this.props.setAddress({
      city: this.state.city,
      district: this.state.district,
      postcode: this.state.postcode,
      coordinates: this.state.region
    });
    setTimeout(() => {
      this.props.navigation.dispatch(NavigationActions.back())
    })
  }

  render() {
    let address = "";
    const formattedAddress = this.state.formattedAddress;

    address = formattedAddress || 'Drag the map to set the location.';
    const {query} = this.state;
    //
    return (
        <View style={styles.container}>
          {this.renderAutoComplete()}
          <View style={{position: 'relative', flex: 1, width: '100%', height: '100%', marginTop: 40, flexDirection: 'column'}}>
            <MapView
                style={styles.map}
                ref={(ref) => {
                  this.mapView = ref
                }}
                cacheEnabled={false}
                showsUserLocation={true}
                showsMyLocationButton={true}
                followUserLocation={true}
                onRegionChangeComplete={this.onRegionChange}
                //onPress={this.onMapPress}
            >
              <Polygon coordinates={mapBoundingBoxInLatLon} fillColor={'rgba(0,100,0,0.25)'}/>
              <Polygon coordinates={mapBoundingBox2InLatLon} fillColor={'rgba(0,100,0,0.1)'}/>
            </MapView>
            <View pointerEvents="none" style={{backgroundColor: 'transparent', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, width: '100%', height: '100%', flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <IconFa name="map-marker" style={{fontSize: 30, backgroundColor: 'transparent', color: 'red', marginBottom: 90}}/>
            </View>
            <View style={{
              position: 'absolute',
              alignSelf: 'center',
              padding: 5,
              borderRadius: 2,
              top: 20,
              left: 10,
              backgroundColor: AppStyles.color.backgroundAccent,
              alignItems: 'center',
              justifyContent : 'center',
              marginLeft: 10,
              marginRight: 10,
            }}>
              <View style={{flexDirection: 'row'}}>
                <Icon name="lens" style={{fontSize: 15, color: 'darkgreen', marginRight: 10}}/>
                <AppText>Delivery Level 1</AppText>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Icon name="lens" style={{fontSize: 15, color: 'lightgreen', marginRight: 10}}/>
                <AppText>Delivery Level 2</AppText>
              </View>
            </View>
            <View style={{
              position: 'absolute',
              alignSelf: 'center',
              padding: 10,
              borderRadius: 23,
              top: 20,
              right: 10,
              backgroundColor: AppStyles.color.secondary,
              alignItems: 'center',
              justifyContent : 'center',
              marginLeft: 10,
              marginRight: 10,
              shadowOffset:{  width: 2,  height: 2,  },
              shadowColor: 'black',
              shadowOpacity: 0.5,
            }}>
              <Button onPress={this.zoomToMyLocation}>
                <Icon name="my-location" style={{fontSize: 25, color: 'white'}}/>
              </Button>

            </View>
            <View style={{padding: 10, backgroundColor: 'transparent'}}>
              <Button onPress={this._done}>
                  <View style={{flexDirection: 'row', height: 45, backgroundColor: '#FEBC11', alignItems: 'center', justifyContent: 'center'}}>
                    <AppText style={{color: 'white', fontWeight: '800'}}>{'Done'} </AppText>
                  </View>
              </Button>
            </View>
          </View>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: 'white',
  },

  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  autocompleteContainer: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0)',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1
  },

  autoComplete: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
    width: searchBarWidth,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 2
  }
});

export default connect(
    state => ({}),
    dispatch => {
      return {
        navigate: bindActionCreators(NavigationActions.navigate, dispatch),
        setAddress: bindActionCreators(setAddress, dispatch),
        changeAddressFormValue: function (field, value) {
          dispatch(change('newAddress', field, value))
        }
      }
    }
)(MapPickerView);
