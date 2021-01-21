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
  validationMessage?: any;
}): SetValidationAction => {
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

export const removeField = (name: string): RemoveInputAction => ({
  payload: {
    name,
  },
  type: ActionType.REMOVE_FIELD,
});
