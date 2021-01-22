import React, {Component} from "react";
import {Dimensions, FlatList, StyleSheet, Text, TextInput, View, KeyboardAvoidingView, ActivityIndicator} from "react-native";
import IconFa from "react-native-vector-icons/FontAwesome";
import PropTypes from "prop-types";
import {NavigationActions} from "react-navigation";
import {debounce} from "lodash";
import ProductListItem from "../../components/ProductListItem";
import NoInternetNotice from "../../components/NoInternetNotice";
import AppText from "../../components/AppText";
import AppStyles from "../../constants/styles";

const {width, height} = Dimensions.get("window");
const textWidth = width - 20;

class SearchView extends Component {
    static displayName = "product";
    drawer = {};
    static navigationOptions = ({navigation}) => {
        const {params = {}} = navigation.state;
        return {
            headerLeft: (
                <View
                    style={{
                        height: "100%",
                        flexDirection: "row",
                        alignItems: "center",
                        width: textWidth
                        // only for IOS to give StatusBar Space
                    }}
                >
                    <IconFa name="chevron-left" onPress={() => goBack()} style={{color: "white", padding: 10, marginLeft: 10, fontSize: 20}}/>
                    <TextInput
                        onChangeText={t => queryChange(t)}
                        autoFocus={true}
                        selectionColor={'#58B44B'}
                        placeholderTextColor="rgba(255,255,255,0.7)"
                        placeholder="Enter Search"
                        autoCorrect={false}
                        underlineColorAndroid="rgba(0,0,0,0)"
                        style={{flex: 1, width: "100%", fontSize: 16, color: "white"}}
                    />
                </View>
            ),

            headerTitleStyle: {
                color: "#fff"
            },

            headerStyle: {
                backgroundColor: "#FEBC11",

                elevation: 0
            }
        };
    };

    static goBack;
    static queryChange;

    static propTypes = {
        loading: PropTypes.bool.isRequired,
        navigate: PropTypes.func.isRequired,
        doSearch: PropTypes.func.isRequired,
        changeQty: PropTypes.func.isRequired,
        clearSearch: PropTypes.func.isRequired,
        results: PropTypes.array.isRequired,
        cartItems: PropTypes.object.isRequired,
        wishlist: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            index: 0,
            hasTabs: false,
            thisProduct: {},
            tabsSet: false,
            routes: [],
            searchQuery: '',
            cat: ''
        };

        this.queryChanged = debounce(this.props.doSearch, 250);
    }

    _goBack = () => {
        this.props.navigation.dispatch(NavigationActions.back());
    }

    _queryChange = (query) => {
        this.setState({searchQuery: query});
        if (this.state.cat) {
            this.queryChanged({query: query, cat: this.state.cat.id});
        } else {
            this.queryChanged({query: query, cat: null});
        }
    }

    componentWillMount() {
        goBack = this._goBack;
        queryChange = this._queryChange;
        this.props.clearSearch();
        if (this.props.navigation.state.params) {
            let cat = this.props.navigation.state.params.cat;
            cat && this.setState({cat: cat});
        }
    }

    onRefreshList = () => {
        if (this.state.cat) {
            this.queryChanged(this.state.searchQuery);
        } else {
            this.queryChanged({query: query, cat: this.state.cat.id});
        }
    };

    _renderItem = ({item, index}) => {

        return (
            <ProductListItem id={item.id} index={index} type={'search'}/>
        );
    };
    _keyExtractor = (item, index) => item.id.toString();

    _onItemPress = (item) => {
        this.props.navigate({routeName: "Product", params: {product: item}});
    }

    render() {
        const {loading, results, error} = this.props;

        if (error) {
            return (
                <NoInternetNotice onRefresh={this.onRefreshList}/>
            )
        }

        if(loading){
          return (
            <KeyboardAvoidingView behavior={'padding'} style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large" color={AppStyles.color.secondary} />
            </KeyboardAvoidingView>
          );
        }

        if (!loading && (!results || results.length === 0)) {
            if (this.state.searchQuery) {
                return (
                    <KeyboardAvoidingView behavior={'padding'} style={{backgroundColor: 'white', flex: 1, flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: 'center', paddingLeft: 10, paddingRight: 10}}>
                        <AppText style={{fontSize: 14, textAlign: 'center', paddingBottom: 60}}> Sorry! We could not find any products matching '{this.state.searchQuery}' { this.state.cat && ' in ' + this.state.cat.name}</AppText>
                    </KeyboardAvoidingView>
                );
            } else {
                if (this.state.cat !== '') {
                    return (
                        <KeyboardAvoidingView keyboardVerticalOffset={50} behavior={'padding'} style={{backgroundColor: 'white', flex: 1, flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                            <AppText style={{fontSize: 14}}>Looking for something in {this.state.cat.name} ?</AppText>
                        </KeyboardAvoidingView>
                    );
                } else {
                    return (
                        <KeyboardAvoidingView keyboardVerticalOffset={50} behavior={'padding'} style={{backgroundColor: 'white', flex: 1, flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                            <AppText style={{fontSize: 14}}>Looking for something?</AppText>
                        </KeyboardAvoidingView>
                    );
                }

            }
        }

        return (
            <KeyboardAvoidingView behavior={'padding'} style={{flex: 1, flexDirection: "column", backgroundColor: 'white'}}>
                <FlatList
                    data={results}
                    numColumns={1}
                    keyExtractor={this._keyExtractor}
                    renderItem={this._renderItem}
                    refreshing={loading}
                />
            </KeyboardAvoidingView>
        );
    }
}

const initialLayout = {
    height: 0,
    width: Dimensions.get("window").width
};

const styles = StyleSheet.create({
    container: {
        flex: 0.5
    }
});

export default SearchView;
