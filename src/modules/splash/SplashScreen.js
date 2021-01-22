import React, {Component} from "react";
import {ImageBackground, StyleSheet, View} from "react-native";
import {expireSplash} from "../session/Actions";
import PropTypes from "prop-types";

class SplashScreen extends Component {
    static propTypes = {
        expireSplash: PropTypes.func.isRequired
    };

    componentDidMount() {
        setTimeout(() => {
          this.props.expireSplash()
        }, 3000);

        setTimeout(() => {
          this.props.loadCategories();
        });

        setTimeout(()=>{
          this.props.loadDeliveryTimeSlots();
        })

    }

    render() {
        return (<View style={styles.container}>
            <ImageBackground source={require('./splash.gif')} style={styles.splashBackground} resizeMode='contain'>
            </ImageBackground>
        </View>);
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    splashBackground: {
        width: '75%',
        height: '100%',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    appName: {
        fontSize: 25,
        color: 'white',
        fontWeight: '600',
        textAlign: 'center',
        backgroundColor: 'transparent'
    }
});

export default SplashScreen;
