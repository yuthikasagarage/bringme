import React, {Component} from "react";
import {StyleSheet, Text, TextInput, View, Alert, Platform, ScrollView, KeyboardAvoidingView} from "react-native";
import IconFa from "react-native-vector-icons/FontAwesome";
import PropTypes from "prop-types";
import {NavigationActions} from "react-navigation";
import { Field, reduxForm } from 'redux-form/immutable'
import FormInput from '../../components/FormInput'
import Button from '../../components/Button'
import Toast from "react-native-easy-toast";
import {validateEmail} from "../../services/userService";
import AppText from "../../components/AppText";
import HeaderText from "../../components/HeaderText";
import KeyboardHandler from "../../components/KeyboardHandler";

class ProfileView extends Component {
    static displayName = 'profile';
    drawer = {};
    static navigationOptions = ({navigation, screenProps}) => {
        const {params = {}} = navigation.state;
        return {
          title: (<HeaderText>Profile</HeaderText>),
          headerLeft: (<IconFa name='chevron-left' onPress={() => {goBack()}} style={{color: 'white', padding: 10, marginLeft: 10, fontSize: 20}}/>),
          headerRight: (<Button disabled={params.saveButtonDisabled} onPress={()=>{submitForm()}}><AppText style={[{color: 'white', fontSize: 16, paddingRight: 20}, params.saveButtonDisabled && {color: '#E7EEEE'}]}>Save</AppText></Button>),
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
    static submitForm;

    static propTypes = {
    };

    _goBack = () => {
        this.props.navigation.dispatch(NavigationActions.back())
    }

    submitForm = () => {
        this.props.handleSubmit(this.submit)();
    }

    componentDidMount() {
      goBack = this._goBack,
      submitForm = this.submitForm
    }

    render() {
       const { handleSubmit, pristine, mobileNumber, isLocal } = this.props;
        return (
            <KeyboardHandler ref='kh' offset={75} style={{flexDirection: 'column', backgroundColor: 'white'}}>
              <View style={{padding: 20}}>
              <AppText style={styles.formLabel}>First Name *</AppText>
              <Field name={'firstName'} component={FormInput} style={styles.formInput} autoCorrect={false}/>
              <AppText style={styles.formLabel}>Last Name *</AppText>
              <Field name={'lastName'} component={FormInput} style={styles.formInput} autoCorrect={false}/>
              <AppText style={styles.formLabel}>Phone *</AppText>
              <View style={{flexDirection: 'row', width:'100%'}}>
                <TextInput style={[styles.formInput, {width: '80%'}]} editable={false} value={ ((isLocal ? '+94' : '') + mobileNumber)}/>
                <Button onPress={this.changeNumber} style={{width: '20%', flexDirection: 'row', justifyContent:'center', alignItems: 'center', marginBottom: 15, marginTop:5}}>
                  <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <AppText style={{color: '#58B44B'}}>Change</AppText>
                  </View>
                </Button>
              </View>
              { !isLocal && (<View>
                <AppText style={styles.formLabel}>SL Phone *</AppText>
                <Field name={'localMobileNumber'} component={FormInput} style={styles.formInput} autoCorrect={false}/>
            </View>)}
              <AppText style={styles.formLabel}>E-Mail *</AppText>
              <Field name={'email'} component={FormInput} style={styles.formInput}
                ref='email' onFocus={()=>this.refs.kh.inputFocused(this,'email')}
                keyboardType={'email-address'} autoCapitalize={'none'} autoCorrect={false}/>
              <Toast ref="profileNotifications"/>
            </View>
            </KeyboardHandler>
        );
    }

    changeNumber = () => {
      Alert.alert(
        'Are you sure you want to change number?',
        'This will prompt you to verify a new number',
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'OK', onPress: async () => {
              await this.props.resetLogin();
              await this.props.logout();
              this.props.navigation.dispatch(NavigationActions.reset({
                index: 0,
                key: null,
                actions: [
                    NavigationActions.navigate({ routeName: 'Home'})
                ]
              }));
          }},
        ],
        { cancelable: false }
      )
    }

    submit = values => {
      let profileInfo = values.toJS();
      if(profileInfo.firstName && profileInfo.lastName && profileInfo.email){
        if(validateEmail(profileInfo.email)){
          this.props.saveProfile(profileInfo);
          Alert.alert('Success!', 'Profile Updated')
          this._goBack();
        }else{
          Alert.alert('Hold On!', 'Invalid Email Address')
        }
      }else{
        Alert.alert('Hold On!', 'You need to fill all the fields')
      }
    }

}



const styles = StyleSheet.create({
  formInput: {
    backgroundColor: 'white',
    marginBottom: 17,
    marginTop: 5,
    borderRadius: 3,
    padding: 10,
    fontSize: 16,
    borderWidth: Platform.OS === 'ios' ? 1 : 0,
    borderColor: '#DAE3E3',
    color: 'grey'
  },
  formLabel: {
    fontSize: 16,
    color: 'grey'
  },
  button: {
    width: 200,
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

ProfileView = reduxForm({form: 'profile'})(ProfileView);
export default ProfileView;
