import React from 'react';
import FastImage from 'react-native-fast-image'
import ProgressIndicator from 'react-native-progress/Circle';
import AppStyles from '../constants/styles';

export default class CachedImage extends React.PureComponent {

  render() {
    let {...props} = this.props;
    return(
    <FastImage
      {...props}
    />
    );
}
}
