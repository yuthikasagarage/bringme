import { StackNavigator } from "react-navigation";
import { Easing, Animated, Platform } from "react-native";

import HomeViewContainer from "../home/HomeViewContainer";
import SubCategoriesViewContainer from "../subCategories/SubCategoriesViewContainer";
import ProductViewContainer from "../product/ProductViewContainer";
import SearchViewContainer from "../search/SearchViewContainer";
import ProfileViewContainer from "../profile/ProfileViewContainer";
import CartViewContainer from "../cart/CartViewContainer";
import WishListViewContainer from "../cart/WishListContainer";
import DeliveryDetailsContainer from "../checkout/DeliveryDetailsContainer";
import OrderListContainer from "../checkout/OrderListContainer";
import NewAddressViewContainer from "../address/NewAddressContainer";
import AddressListViewContainer from "../address/AddressListViewContainer";
import MapPickerViewContainer from "../address/MapPickerViewContainer";
import CheckoutConfirmContainer from "../checkout/CheckoutConfirmContainer";
import AnswersContainer from "../faqs/AnswerViewContainer";
import FaqsContainer from "../faqs/FaqHomeViewContainer";
import QuestionsContainer from "../faqs/QuestionsViewContainer";
import OrderDetailsContainer from "../checkout/OrderDetailsContainer";
import OnlinePaymentContainer from "../checkout/OnlinePaymentContainer";
import UPayPaymentContainer from "../checkout/UPayPaymentContainer";
import FriMiPaymentContainer from "../checkout/FriMiPaymentContainer";
import DeliveryAreaContainer from "../home/DeliveryAreaContainer";

// Root navigator is a StackNavigator
const AppNavigator = StackNavigator(
  {
    Home: { screen: HomeViewContainer },
    SubCategories: { screen: SubCategoriesViewContainer },
    Product: { screen: ProductViewContainer },
    Search: { screen: SearchViewContainer },
    Profile: { screen: ProfileViewContainer },
    Cart: { screen: CartViewContainer },
    WishList: { screen: WishListViewContainer },
    AddressList: { screen: AddressListViewContainer },
    Delivery: { screen: DeliveryDetailsContainer },
    NewAddress: { screen: NewAddressViewContainer },
    MapPicker: { screen: MapPickerViewContainer },
    Checkout: { screen: CheckoutConfirmContainer },
    Answers: { screen: AnswersContainer },
    DeliveryArea: { screen: DeliveryAreaContainer },
    Faqs: { screen: FaqsContainer },
    Questions: { screen: QuestionsContainer },
    OrderList: { screen: OrderListContainer },
    OrderDetails: { screen: OrderDetailsContainer },
    OnlinePayment: { screen: OnlinePaymentContainer },
    UPayPayment: { screen: UPayPaymentContainer },
    FriMiPayment: { screen: FriMiPaymentContainer }
  },
  {
    transitionConfig: () => ({
      transitionSpec:
        Platform.OS === "none"
          ? {
              duration: 500,
              easing: Easing.out(Easing.poly(4)),
              timing: Animated.timing
            }
          : {}
    })
  }
);

const defaultGetStateForAction = AppNavigator.router.getStateForAction;

AppNavigator.router.getStateForAction = (action, state) => {
  if (state && action.type === "ReplaceCurrentScreen") {
    const routes = state.routes.slice(0, state.routes.length - 1);
    routes.push(action);
    return {
      ...state,
      routes,
      index: routes.length - 1
    };
  }

  if (action.type.startsWith("Navigation/")) {
    const { type, routeName } = action;
    const lastRoute = state.routes[state.routes.length - 1];
    if (routeName == lastRoute.routeName) return state;
  }

  return defaultGetStateForAction(action, state);
};

export default AppNavigator;
