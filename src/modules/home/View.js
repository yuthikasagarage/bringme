import React, { Component } from "react";
import {
  Animated,
  FlatList,
  NativeEventEmitter,
  NativeModules,
  Platform,
  StyleSheet,
  Text,
  View,
  Alert,
  Image,
  StatusBar,
  Dimensions,
  PixelRatio,
  ActivityIndicator,
  AppState
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import IconE from "react-native-vector-icons/Entypo";
import IconEv from "react-native-vector-icons/EvilIcons";
import IconM from "react-native-vector-icons/Ionicons";
import IconFa from "react-native-vector-icons/FontAwesome";
import { BringMeIcon } from "../../utils/bring-me-icons";
import Rate from "react-native-rate";
import CategoryItem from "../../components/CategoryItem";
import PropTypes from "prop-types";
import Button from "../../components/Button";
import Modal from "react-native-modalbox";
import NoInternetNotice from "../../components/NoInternetNotice";
import CartButton from "../../components/CartButton";
import {
  NavigationActions,
  SafeAreaView,
  addNavigationHelpers
} from "react-navigation";
import { fromJS } from "immutable";
import moment from "moment";
import { getStatusBarHeight } from "react-native-status-bar-height";
import AppText from "../../components/AppText";
import AppMeta from "../../constants/appMeta";
import RNRestart from 'react-native-restart';
import DeviceInfo from "react-native-device-info";
import { getStoreInfo, versionCompare } from "../../services/updateService";
import { getDayName } from "../../services/checkoutService";
import AppLink from "react-native-app-link";
import debounce from "lodash.debounce";
import Carousel from "react-native-snap-carousel";

const { DrawerManager, DrawerEventManager } = NativeModules;
const { width, height } = Dimensions.get("window");
const physicalWidth = width / PixelRatio.get();
let subscription = null;

class HomeView extends Component {
  static displayName = "Home";
  drawer = {};
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      header: (
        <View
          style={{
            flexDirection: "row",
            paddingTop: Platform.OS === "ios" ? getStatusBarHeight(true) : 0,
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#FEBC11",
            paddingLeft: 20,
            paddingRight: 20
          }}
        >
          <Button
            hitSlop={{ top: 50, bottom: 50, left: 50, right: 50 }}
            onPress={() => openDrawer()}
          >
            <View>
              <BringMeIcon
                name="bringme-menu"
                style={{ color: "#fff", fontSize: 17 }}
              />
            </View>
          </Button>
          <AppText
            style={{ fontSize: 18, color: "#fff", fontFamily: "Gotham-Book" }}
          >
            HOME
          </AppText>
          <Button
            hitSlop={{ top: 10, bottom: 10, left: 15, right: 15 }}
            onPress={() => showBaseSearch()}
          >
            <View>
              <BringMeIcon
                name="bringme-search"
                style={{ color: "#fff", fontSize: 18 }}
              />
            </View>
          </Button>
          <CartButton />
        </View>
      )
    };
  };

  static propTypes = {
    loading: PropTypes.bool.isRequired,
    categories: PropTypes.array,
    cartItems: PropTypes.object,
    navigate: PropTypes.func.isRequired,
    loadCategories: PropTypes.func.isRequired,
    setSelectedCategory: PropTypes.func.isRequired
  };

  static openDrawer;
  static showBaseSearch;

  constructor(props) {
    super(props);
    this.state = {
      tweenRatio: 0,
      drawerSlideOutput: { offset: 0 },
      openValue: new Animated.Value(0),
      closeValue: new Animated.Value(1),
      drawerOpened: false,
      animationOpen: false,
      changeWasDone: false, //prevents animation during init
      moviesList: [],
      appState: AppState.currentState,
      modalStyle: {},
      updatePrompted: false
    };
  }

  _openDrawer = () => {
    if (Platform.OS === "android") {
      this.props.screenProps.openDrawer();
    } else if (Platform.OS === "ios") {
      DrawerManager.toggleDrawer();
    }
  };

  _showBaseSearch = () => {
    this.props.navigate({ routeName: "Search" });
  };

  componentDidMount() {
    openDrawer = this._openDrawer;
    showBaseSearch = this._showBaseSearch;
    this.props.setSelectedAddress(fromJS({}));
    const drawerEventManagerEmitter = new NativeEventEmitter(
      DrawerEventManager
    );
    subscription = drawerEventManagerEmitter.addListener(
      "DrawerItemClicked",
      async payload => {
        const routeName = payload.item;
        if (routeName === "Home") {
          return;
        }
        if (routeName === "Rate") {
          Rate.rate(AppMeta, success => {
            if (!success) {
            }
          });
          return;
        }
        if (routeName === "Logout") {
          await this.props.resetLogin();
          await this.props.logout();
          this.props.navigation.dispatch(
            NavigationActions.reset({
              index: 0,
              key: null,
              actions: [NavigationActions.navigate({ routeName: "Home" })]
            })
          );
        }
        this.props.navigate({ routeName: routeName });
        console.log("Native Drawer clicked -" + routeName);
      }
    );
    this.refreshCart();
    AppState.addEventListener("change", this._handleAppStateChange);
    setTimeout(() => {
      if (!this.props.hasLaunched) {
        this.refs.welcomeModal.open();
      }
    }, 250);
    this.checkForUpdate();
  }

  _handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      this.refreshCart();
      this.loadCategories(true);
      if (!this.state.updatePrompted) {
        this.checkForUpdate();
      }
    }
    this.setState({ appState: nextAppState });
  };

  checkForUpdate = async () => {
    let storeInfo = await getStoreInfo();
    this.props.setMinutesBeforeTimeSlotDeactivation(
      storeInfo.minutes_before_time_slot_deactivation
    );
    this.props.setTimeSlotFullNotificationDisableTime(
      storeInfo.time_slot_full_notification_disable_time
    );
    let latestVersion =
      Platform.OS === "ios" ? storeInfo.ios_version : storeInfo.android_version;
    let appStoreName = Platform.OS === "ios" ? "App Store" : "Google Play";
    let currentVersion = DeviceInfo.getVersion();
    if (versionCompare(currentVersion, latestVersion) == -1) {
      Alert.alert(
        "App requires an update",
        "Please update your app on " + appStoreName,
        [
          {
            text: "Update",
            onPress: async () => {
              this.setState({ updatePrompted: false });
              AppLink.openInStore(
                "id" + AppMeta.AppleAppID,
                AppMeta.GooglePackageName
              )
                .then(() => {})
                .catch(err => {});
            }
          }
        ],
        { cancelable: false }
      );
      this.setState({ updatePrompted: true });
    }
  };

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.loading !== nextProps.loading ||
      this.props.categories !== nextProps.categories ||
      this.props.products !== nextProps.products ||
      this.props.error !== nextProps.error ||
      this.props.version !== nextProps.version ||
      this.props.timeSlots !== nextProps.timeSlots ||
      this.state.modalStyle !== nextState.modalStyle ||
      this.props.timeSlotFullNotificationDisableTime !==
        nextProps.timeSlotFullNotificationDisableTime
    );
  }

  componentDidUpdate(prevProps) {
    this.refreshCart();
    if (this.props.products !== prevProps.products) {
      this.onProductsUpdated();
    }
  }

  onProductsUpdated = debounce(() => {
    let allProducts = [];
    if (this.props.products) {
      this.props.products.forEach(productCategory => {
        if (productCategory) {
          productsArray = productCategory.toArray();
          if (productsArray.length > 0) {
            allProducts = allProducts.concat(productsArray);
          }
        }
      });
      this.props.productsUpdated(
        allProducts,
        this.props.productsLoading,
        this.props.productsError
      );
    }
  }, 5000);

  loadCategories = (isFromBackground) => {
    let timeThreshold = new Date();
    timeThreshold.setMinutes(timeThreshold.getMinutes() - 10);
    if (new Date(this.props.categoryListUpdatedDate) < timeThreshold) {
      if (isFromBackground) {
        RNRestart.Restart();
      } else {
        this.props.loadCategories(true);
      }
    }
  };

  refreshCart = () => {
    let todayMorning = new Date();
    todayMorning.setHours(0, 0, 0);
    if (new Date(this.props.cartModifiedDate) < todayMorning) {
      this.props.refreshCart();
    }
  };

  componentWillUnmount() {
    subscription.remove();
    AppState.removeEventListener("change", this._handleAppStateChange);
  }

  _keyExtractor = (item, index) => item.id;

  _renderItem = ({ item, index }) => (
    <CategoryItem
      index={index}
      id={item.id}
      title={item.name}
      description={item.description}
      imageUrl={item.image_url}
      item={item}
      onPressItem={this.itemWasPressed}
    />
  );

  _renderHeaderSliderItem = ({ item, index }) => {
    return (
      <View>
        <Image
          source={{ uri: item }}
          style={{
            borderRadius: 5,
            width: width - 16,
            height: ((width - 16) / 711) * 301,
            marginTop: 8,
            marginLeft: 8,
            marginRight: 8
          }}
          resizeMode="contain"
        />
      </View>
    );
  };

  _renderHeader = () => {
    return <View>{this._renderCarousel()}</View>;
  };

  _renderMainNotification = () => {
    let day = new Date();
    let dayName = getDayName(day);
    let tomorrow = day.setDate(day.getDate() + 1);
    let dayNameTomorrow = getDayName(tomorrow);
    let slotsTaken = false;
    let slotsTakenTomorrow = false;
    if (
      this.props.timeSlots &&
      this.props.timeSlots[dayName] &&
      this.props.timeSlots[dayNameTomorrow]
    ) {
      let todaySlot = this.props.timeSlots[dayName];
      let tomorrowSlot = this.props.timeSlots[dayNameTomorrow];
      let availableSlots = 0;
      let availableSlotsTomorrow = 0;
      let filledSlots = 0;
      let filledSlotsTomorrow = 0;
      let now = new Date();
      todaySlot.forEach(deliverySlot => {
        if (
          moment(deliverySlot.timeLabel.substr(0, 8), "hh:mm a").isAfter(
            moment(now.getHours() + ":" + now.getMinutes(), "HH:mm")
          )
        ) {
          availableSlots += Number(deliverySlot.quota);
          filledSlots += Number(deliverySlot.order_count);
        }
      });
      tomorrowSlot.forEach(deliverySlot => {
        availableSlotsTomorrow += Number(deliverySlot.quota);
        filledSlotsTomorrow += Number(deliverySlot.order_count);
      });
      slotsTaken = availableSlots <= filledSlots;
      slotsTakenTomorrow = availableSlotsTomorrow <= filledSlotsTomorrow;
    }
    let today = new Date();
    let isBeforeTime = moment(
      today.getHours() + ":" + today.getMinutes(),
      "HH:mm"
    ).isBefore(moment(this.props.timeSlotFullNotificationDisableTime, "HH:mm"));
    let message = "";

    if (slotsTaken && !slotsTakenTomorrow && isBeforeTime) {
      message =
        "Delivery slots are full for today, tomorrow slots are available";
    } else if (!isBeforeTime && !slotsTakenTomorrow) {
      message =
        "Delivery slots are full for today, tomorrow slots are available";
    } else if (slotsTaken && slotsTakenTomorrow && isBeforeTime) {
      message = "Delivery slots are full for today and tomorrow";
    } else if (!isBeforeTime && slotsTakenTomorrow) {
      message = "Delivery slots are full for today and tomorrow";
    } else if (isBeforeTime && !slotsTaken && slotsTakenTomorrow) {
      message =
        "Delivery slots are full for tomorrow. Today slots are available";
    }
    if (message) {
      return (
        <View
          style={{
            backgroundColor: AppStyles.color.danger,
            width: "100%",
            paddingVertical: 10,
            paddingHorizontal: 15
          }}
        >
          <Text style={{ color: AppStyles.color.textAccent }}>{message}</Text>
        </View>
      );
    } else {
      return <View />;
    }

    return (
      <View
        style={{
          backgroundColor: AppStyles.color.danger,
          width: "100%",
          paddingVertical: 10,
          paddingHorizontal: 15
        }}
      >
        <Text style={{ color: AppStyles.color.textAccent }}>
          {slotsTakenTomorrow
            ? "All delivery slots are full for today and tomorrow"
            : "All delivery slots are full for today."}
        </Text>
      </View>
    );
  };

  _renderCarousel = () => {
    let bannerRootCategory = this.props.bannerCategory;
    let bannerArray = [];

    if (bannerRootCategory.is_active) {
      bannerArray.push(bannerRootCategory.image_url);
    }

    if (bannerRootCategory.children_data) {
      bannerRootCategory.children_data.forEach(category => {
        if (category.is_active) {
          bannerArray.push(category.image_url);
        }
      });
    }

    if (bannerArray.length === 0) {
      return <View />;
    } else {
      return (
        <Carousel
          autoplay={true}
          autoplayDelay={3000}
          autoplayInterval={3000}
          ref={c => {
            this._carousel = c;
          }}
          data={bannerArray}
          loop={true}
          renderItem={this._renderHeaderSliderItem}
          sliderWidth={width}
          itemWidth={width}
        />
      );
    }
  };

  itemWasPressed = item => {
    this.props.setSelectedCategory(item);
    this.props.navigate({
      routeName: "SubCategories",
      params: { category: item }
    });
  };

  onRefreshList = () => {
    this.props.loadDeliveryTimeSlots();
    this.props.loadCategories();
  };

  render() {
    const { loading, categories, error } = this.props;
    let animatedDrawerStyles = {};
    let filteredCategories = categories.filter(category => category.is_active);

    if (loading) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={AppStyles.color.secondary} />
        </View>
      );
    }

    if (error) {
      alert(error);
      return <NoInternetNotice onRefresh={this.onRefreshList} />;
    }

    if (Platform.OS === "android") {
      return (
        <View style={[styles.rootContainer]}>
          <View style={[styles.animatedContainer, animatedDrawerStyles]}>
            {this._renderMainNotification()}
            <FlatList
              data={filteredCategories}
              numColumns={DeviceInfo.isTablet() ? 3 : 2}
              ListHeaderComponent={this._renderHeader}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}
              onRefresh={this.onRefreshList}
              refreshing={loading}
            />
            {this.getWelcomeModal()}
          </View>
        </View>
      );
    } else if (Platform.OS === "ios") {
      return (
        <SafeAreaView style={[styles.rootContainer]}>
          <Animated.View
            style={[styles.animatedContainer, animatedDrawerStyles]}
          >
            {this._renderMainNotification()}
            <FlatList
              data={filteredCategories}
              numColumns={DeviceInfo.isTablet() ? 3 : 2}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}
              ListHeaderComponent={this._renderHeader}
              onRefresh={this.onRefreshList}
              refreshing={loading}
            />
            {this.getWelcomeModal()}
          </Animated.View>
        </SafeAreaView>
      );
    }
  }

  resizeModal = ev => {
    this.setState({
      modalStyle: { height: ev.nativeEvent.layout.height + 10 }
    });
  };

  getWelcomeModal = () => {
    return (
      <Modal
        position={"center"}
        onClosed={() => {
          this.props.setHasLaunched();
        }}
        ref={"welcomeModal"}
        style={[
          { height: 500, width: "90%", padding: 15 },
          this.state.modalStyle
        ]}
      >
        <View
          onLayout={ev => {
            this.resizeModal(ev);
          }}
        >
          <View>
            <AppText
              style={{
                fontSize: 18,
                fontWeight: "500",
                textAlign: "center",
                marginBottom: 10
              }}
            >
              Hello! Thank you for Choosing BringMe!
            </AppText>

            <AppText
              style={{
                fontSize: 14,
                fontWeight: "500",
                textAlign: "center",
                marginBottom: 15
              }}
            >
              We are increasing our delivery range everyday.
            </AppText>

            <AppText
              style={{
                fontSize: 14,
                fontWeight: "500",
                textAlign: "center",
                marginBottom: 15
              }}
            >
              Please click
              <AppText
                onPress={() => {
                  this.refs.welcomeModal.close();
                  this.props.navigate({ routeName: "DeliveryArea" });
                }}
                style={{ fontSize: 14, fontWeight: "500", color: "blue" }}
              >
                {" "}
                here{" "}
              </AppText>
              to find out if you are within our delivery zones.
            </AppText>
          </View>
        </View>
      </Modal>
    );
  };
}

const drawerStyles = {
  drawer: { shadowColor: "#000000", shadowOpacity: 0.8, shadowRadius: 3 },
  main: { paddingLeft: 3 }
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#1a1a1a"
  },
  animatedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e6e7e8"
  },
  drawerContainer: {
    flex: 1,

    alignItems: "center"
  },
  welcome: {
    textAlign: "center",
    color: "black",
    marginBottom: 5,
    padding: 5
  }
});

export default HomeView;
