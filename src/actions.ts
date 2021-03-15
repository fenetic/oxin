import {
  ActionType,
  RemoveInputAction,
  SetValidationAction,
  SetValueAction,
  ValidationState,
} from './types';

export const setValue = <K, T>(payload: {
  name: K;
  value: T;
  fromInitial?: boolean;
  validating: boolean;
}): SetValueAction<K, T> => ({
  payload,
  type: ActionType.SET_VALUE,
});

export const setValidation = <K>(payload: {
  fieldName: K;
  validation: ValidationState;
  fromInitial?: boolean;
  validationMessage?: any;
}): SetValidationAction<K> => {
  return {
    payload: {
      fieldName: payload.fieldName,
      validation: payload.validationMessage
        ? Object.entries(payload.validation).reduce<ValidationState>(
            (acc, curr) => ({
              ...acc,
              [curr[0]]: {
                ...curr[1],
                message: payload.validationMessage,
              },
            }),
            {},
          )
        : payload.validation,
    },
    type: ActionType.SET_VALIDATION,
  };
};

export const removeField = <K>(name: K): RemoveInputAction<K> => ({
  payload: {
    name,
  },
  type: ActionType.REMOVE_FIELD,
});
