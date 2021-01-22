import React from "react";
import {TextInput} from "react-native";

export default function FormInput(props) {
  const {input: {onChange, onBlur, ...inputProps}, ...extraProps} = props;
  return (
      <TextInput
          {...extraProps}
          onChangeText={onChange}
          selectionColor= {'#58B44B'}
          onEndEditing={onBlur}

          {...inputProps}
      />
  );
}
