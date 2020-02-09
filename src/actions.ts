import {
  ActionType,
  RemoveInputAction,
  SetValidationAction,
  SetValueAction,
  ValidationState,
} from './types';

export const setValue = (payload: {
  name: string;
  value: any;
  fromInitial?: boolean;
  validating: boolean;
}): SetValueAction => ({
  payload,
  type: ActionType.SET_VALUE,
});

export const setValidation = (payload: {
  fieldName: string;
  validation: ValidationState;
  fromInitial?: boolean;
  isFinal: boolean;
}): SetValidationAction => {
  return {
    payload,
    type: ActionType.SET_VALIDATION,
  };
};

export const removeField = (name: string): RemoveInputAction => ({
  payload: {
    name,
  },
  type: ActionType.REMOVE_FIELD,
});
