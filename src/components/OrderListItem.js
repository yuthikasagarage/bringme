import {Text, View, Dimensions, PixelRatio} from "react-native";
import React from "react";
import Button from "./Button";
import AppText from "./AppText";
import moment from 'moment-timezone';

const isSmallScreen = Dimensions.get("window").width * PixelRatio.get() <= 640

export  default class OrderListItem extends React.PureComponent {

    _onPress = () => {
        this.props.onPressItem(this.props.item);
    };



    render() {

        const {item} = this.props;
        let dateCreated = moment.tz(item.created_at, 'Etc/UTC').local();

        let color = ['#7b7b7b', '#7b7b7b', '#7b7b7b', '#7b7b7b'];
        let order = item;
        switch (item.status) {
            case  'pending':
                color[0] = '#37ee4a';
                break;
            case  'processing':
            case  'holded':
                color[0] = '#37ee4a';
                color[1] = '#37ee4a';
                break;
            case  'complete':
                color[0] = '#37ee4a';
                color[1] = '#37ee4a';
                color[2] = '#37ee4a';
                break;
            case  'delivered':
                color[0] = '#37ee4a';
                color[1] = '#37ee4a';
                color[2] = '#37ee4a';
                color[3] = '#37ee4a';
                break;
            case  'canceled':
                color[0] = '#EE2312';
                color[1] = '#EE2312';
                break;
        }
        //const textColor = this.props.selected ? "red" : "black";
        return (
            <Button onPress={this._onPress}>
                <View style={{flex: 1, flexDirection: 'column', backgroundColor: '#ffffff', borderBottomColor: '#EEE', borderBottomWidth: 1, padding: 8, margin: 7, marginBottom: 7}}>
                    <View style={{flexDirection: 'row'}}>
                        <View style={{flex: 1, flexDirection: 'column'}}>
                            <AppText style={{color: '#7b7b7b'}}>ORDER ID</AppText>
                            <AppText style={{color: '#000'}}>{item.increment_id}</AppText>
                        </View>
                        <View style={{flex: 1, flexDirection: 'column'}}>
                            <AppText style={{color: '#7b7b7b', textAlign: 'center'}}>ORDER DATE</AppText>
                            <AppText style={{color: '#000', textAlign: 'center'}}>{dateCreated.format('DD MMM YYYY')}</AppText>
                            <AppText style={{color: '#000', textAlign: 'center'}}>{dateCreated.format('hh:mm a')}</AppText>
                        </View>
                        <View style={{flex: 1, flexDirection: 'column'}}>
                            <AppText style={{color: '#7b7b7b', textAlign: 'right'}}>AMOUNT</AppText>
                            <AppText style={{color: '#000', textAlign: 'right'}}>Rs. {item.grand_total}</AppText>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', marginTop: 20, borderTopColor: '#eeeeee', borderTopWidth: 1, paddingTop: 10, paddingBottom: 10}}>
                      <View style={{flex: 1, flexDirection: 'column', margin: 1}}>
                          <AppText style={{fontSize: isSmallScreen ? 12 : 14, color: '#7b7b7b', alignSelf: 'center', marginBottom: 4}} >Accepted</AppText>
                          <View style={{height: 12, backgroundColor: color[0], borderBottomLeftRadius: 7, borderTopLeftRadius: 7}}/>
                      </View>
                      <View style={{flex: 1, flexDirection: 'column', margin: 1}}>
                          <AppText style={{fontSize: isSmallScreen ? 12 : 14, color: '#7b7b7b', alignSelf: 'center', marginBottom: 4}}>{order.status === 'canceled' ? 'Canceled' : 'Processing'}</AppText>
                          <View style={{height: 12, backgroundColor: color[1]}}/>
                      </View>
                      <View style={{flex: 1, flexDirection: 'column', margin: 1}}>
                          <AppText style={{fontSize: isSmallScreen ? 12 : 14, color: '#7b7b7b', alignSelf: 'center', marginBottom: 4}}>{order.status !== 'canceled' ? 'Dispatched' : ' '}</AppText>
                          <View style={{height: 12, backgroundColor: color[2]}}/>
                      </View>
                      <View style={{flex: 1, flexDirection: 'column', margin: 1}}>
                          <AppText style={{fontSize: isSmallScreen ? 12 : 14, color: '#7b7b7b', alignSelf: 'center', marginBottom: 4}}>{order.status !== 'canceled' ? 'Delivered' : ' '}</AppText>
                          <View style={{height: 12, backgroundColor: color[3], borderTopRightRadius: 7, borderBottomRightRadius: 7}}/>
                      </View>
                    </View>
                </View>
            </Button>
        );
    }
}
