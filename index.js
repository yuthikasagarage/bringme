import {Provider} from 'react-redux';
import store from './src/redux/store';
import AppViewContainer from './src/modules/AppViewContainer';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';

import React, {Component} from 'react';
import {AppRegistry} from 'react-native';

class BringMe extends Component {
  render() {
    return (
      <ActionSheetProvider>
        <Provider store={store}>
            <AppViewContainer />
        </Provider>
      </ActionSheetProvider>
    );
  }
}

AppRegistry.registerComponent('BringMe', () => BringMe);
